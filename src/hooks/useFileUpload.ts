import { useCallback, useState } from 'react';
import { Course, Topic, Video, Resource } from '../types';
import { generateId } from '../utils/helpers';
import { videoStorage } from '../utils/db';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string>('');

  const processUploadedFolder = useCallback(async (items: DataTransferItemList): Promise<Course | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setCurrentTask('Analyzing folder structure...');

    try {
      const folderEntry = Array.from(items)
        .find(item => item.kind === 'file' && item.webkitGetAsEntry()?.isDirectory);

      if (!folderEntry) {
        throw new Error('Please upload a folder containing your course materials');
      }

      const folderEntryAsDir = folderEntry.webkitGetAsEntry() as FileSystemDirectoryEntry;
      const courseName = folderEntryAsDir.name;

      const topics: Topic[] = [];
      const courseId = generateId();

      // First pass: count total files for progress calculation
      setCurrentTask('Scanning files...');
      const { totalFiles, topicEntries } = await scanFolder(folderEntryAsDir);

      if (totalFiles === 0) {
        throw new Error('No supported files found in the course folder');
      }

      setUploadProgress(10); // 10% for folder scanning

      let processedFiles = 0;

      // Second pass: process files with progress tracking
      for (let i = 0; i < topicEntries.length; i++) {
        const entry = topicEntries[i];
        setCurrentTask(`Processing topic: ${entry.name}`);

        const topic: Topic = {
          id: generateId(),
          title: entry.name,
          videos: [],
          resources: []
        };

        const filesInTopic = await readTopicFolder(
          entry,
          topic,
          (progress) => {
            processedFiles++;
            // Progress from 10% to 90% for file processing
            const fileProgress = 10 + ((processedFiles / totalFiles) * 80);
            setUploadProgress(Math.min(fileProgress, 90));
            setCurrentTask(`Processing ${entry.name}: ${progress}`);
          }
        );

        if (topic.videos.length > 0 || (topic.resources && topic.resources.length > 0)) {
          topics.push(topic);
        }
      }

      setCurrentTask('Finalizing course...');
      setUploadProgress(95);

      const course: Course = {
        id: courseId,
        title: courseName,
        topics: topics.sort((a, b) => {
          const getLeadingNumber = (title: string) => {
            const match = title.match(/^(\d{1,2})/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getLeadingNumber(a.title) - getLeadingNumber(b.title);
        }),
        progress: 0
      };

      saveCourseData(course);
      setUploadProgress(100);
      setCurrentTask('Upload complete!');

      // Keep the success state visible for a moment
      setTimeout(() => {
        setIsUploading(false);
        setCurrentTask('');
      }, 1000);

      return course;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setCurrentTask('');
      return null;
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setCurrentTask('');
      }, 3000);
    }
  }, []);

  // New function to scan folder and count files
  const scanFolder = async (folderEntry: FileSystemDirectoryEntry): Promise<{
    totalFiles: number;
    topicEntries: FileSystemDirectoryEntry[];
  }> => {
    return new Promise((resolve) => {
      const dirReader = folderEntry.createReader();
      const topicEntries: FileSystemDirectoryEntry[] = [];
      let totalFiles = 0;

      const readEntries = () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve({ totalFiles, topicEntries });
            return;
          }

          for (const entry of entries) {
            if (entry.isDirectory) {
              topicEntries.push(entry as FileSystemDirectoryEntry);
              // Count files in this topic
              const filesInTopic = await countFilesInTopic(entry as FileSystemDirectoryEntry);
              totalFiles += filesInTopic;
            }
          }

          readEntries();
        }, (error) => {
          console.error('Error scanning folder:', error);
          resolve({ totalFiles: 0, topicEntries: [] });
        });
      };

      readEntries();
    });
  };

  // Count files in a topic folder
  const countFilesInTopic = async (dirEntry: FileSystemDirectoryEntry): Promise<number> => {
    return new Promise((resolve) => {
      const dirReader = dirEntry.createReader();
      let fileCount = 0;

      const readEntries = () => {
        dirReader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve(fileCount);
            return;
          }

          for (const entry of entries) {
            if (entry.isFile) {
              const fileName = entry.name;
              const fileExtension = fileName.split('.').pop()?.toLowerCase();

              // Count supported files
              if (fileExtension && [
                'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', // videos
                'pdf', 'html', // resources
                'vtt' // captions
              ].includes(fileExtension)) {
                fileCount++;
              }
            }
          }

          readEntries();
        }, (error) => {
          console.error('Error counting files:', error);
          resolve(0);
        });
      };

      readEntries();
    });
  };

  const readTopicFolder = async (
    dirEntry: FileSystemDirectoryEntry,
    topic: Topic,
    onProgress: (currentFile: string) => void
  ): Promise<number> => {
    return new Promise<number>((resolve) => {
      const dirReader = dirEntry.createReader();
      let processedCount = 0;

      const readEntries = () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve(processedCount);
            return;
          }

          // Sort entries to process videos first, then resources
          const sortedEntries = entries
            .filter(entry => entry.isFile)
            .sort((a, b) => {
              const aExt = a.name.split('.').pop()?.toLowerCase() || '';
              const bExt = b.name.split('.').pop()?.toLowerCase() || '';

              // Prioritize videos, then resources, then captions
              const getTypePriority = (ext: string) => {
                if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 1;
                if (['pdf', 'html'].includes(ext)) return 2;
                if (ext === 'vtt') return 3;
                return 4;
              };

              return getTypePriority(aExt) - getTypePriority(bExt);
            });

          for (const entry of sortedEntries) {
            if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry;
              const fileName = fileEntry.name;
              const fileExtension = fileName.split('.').pop()?.toLowerCase();

              onProgress(fileName);

              try {
                // Handle video files
                if (fileExtension && ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(fileExtension)) {
                  const file = await getFileFromEntry(fileEntry);
                  const videoId = generateId();

                  await videoStorage.storeVideo(videoId, file);

                  // Check for caption file
                  const captionFileName = fileName.replace(/\.[^/.]+$/, "") + ".vtt";
                  let captionPath = undefined;

                  for (const captionEntry of entries) {
                    if (captionEntry.isFile && captionEntry.name === captionFileName) {
                      const captionFile = await getFileFromEntry(captionEntry as FileSystemFileEntry);
                      const captionBlob = new Blob([captionFile], { type: 'text/vtt' });
                      const captionId = `caption-${videoId}`;
                      await videoStorage.storeVideo(captionId, captionBlob);
                      captionPath = captionId;
                      break;
                    }
                  }

                  topic.videos.push({
                    id: videoId,
                    title: fileName.replace(/\.[^/.]+$/, ""),
                    path: videoId,
                    caption: captionPath,
                    completed: false
                  });

                  processedCount++;
                }
                // Handle resource files
                else if (fileExtension && ['pdf', 'html'].includes(fileExtension)) {
                  const file = await getFileFromEntry(fileEntry);
                  const resourceId = generateId();

                  await videoStorage.storeVideo(resourceId, file);

                  if (!topic.resources) {
                    topic.resources = [];
                  }

                  topic.resources.push({
                    id: resourceId,
                    title: fileName.replace(/\.[^/.]+$/, ""),
                    path: resourceId,
                    type: fileExtension as 'pdf' | 'html'
                  });

                  processedCount++;
                }
              } catch (fileError) {
                console.error(`Error processing file ${fileName}:`, fileError);
              }

              // Small delay to allow UI updates
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }

          // Sort videos by number
          topic.videos.sort((a, b) => {
            const getLeadingNumber = (title: string) => {
              const match = title.match(/^(\d{1,2})/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getLeadingNumber(a.title) - getLeadingNumber(b.title);
          });

          readEntries();
        }, (error) => {
          console.error('Error reading topic entries:', error);
          resolve(processedCount);
        });
      };

      readEntries();
    });
  };

  const getFileFromEntry = (fileEntry: FileSystemFileEntry): Promise<File> => {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
  };

  const saveCourseData = (course: Course) => {
    try {
      const coursesData = localStorage.getItem('courses');
      const courses = coursesData ? JSON.parse(coursesData) : [];
      courses.push(course);
      localStorage.setItem('courses', JSON.stringify(courses));
    } catch (error) {
      console.error('Error saving course data:', error);
    }
  };

  return {
    processUploadedFolder,
    isUploading,
    uploadProgress,
    error,
    currentTask
  };
};