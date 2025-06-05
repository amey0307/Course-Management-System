import { useState } from 'react';
import { Course, Topic, Video } from '../types';
import { generateId } from '../utils/helpers';
import { videoStorage } from '../utils/db';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processUploadedFolder = async (items: DataTransferItemList): Promise<Course | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

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

      await new Promise<void>((resolve) => {
        const dirReader = folderEntryAsDir.createReader();
        
        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
              return;
            }

            for (const entry of entries) {
              if (entry.isDirectory) {
                const topic: Topic = {
                  id: generateId(),
                  title: entry.name,
                  videos: []
                };

                await readTopicFolder(entry as FileSystemDirectoryEntry, topic);
                
                if (topic.videos.length > 0) {
                  topics.push(topic);
                }
              }
            }

            readEntries();
          }, (error) => {
            console.error('Error reading entries:', error);
            resolve();
          });
        };

        readEntries();
      });

      const course: Course = {
        id: courseId,
        title: courseName,
        topics,
        progress: 0
      };

      saveCourseData(course);

      setUploadProgress(100);
      setIsUploading(false);
      return course;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
      setIsUploading(false);
      return null;
    }
  };

  const readTopicFolder = async (dirEntry: FileSystemDirectoryEntry, topic: Topic): Promise<void> => {
    return new Promise<void>((resolve) => {
      const dirReader = dirEntry.createReader();
      
      const readEntries = () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve();
            return;
          }

          for (const entry of entries) {
            if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry;
              const fileName = fileEntry.name;
              
              if (fileName.match(/\.(mp4|webm|ogg|mov)$/i)) {
                const file = await getFileFromEntry(fileEntry);
                const videoId = generateId();
                
                // Store video file in IndexedDB
                await videoStorage.storeVideo(videoId, file);
                
                // Check for caption file
                const captionFileName = fileName.replace(/\.[^/.]+$/, "") + ".srt";
                let captionPath = undefined;
                
                for (const captionEntry of entries) {
                  if (captionEntry.isFile && captionEntry.name === captionFileName) {
                    const captionFile = await getFileFromEntry(captionEntry as FileSystemFileEntry);
                    const captionBlob = new Blob([captionFile], { type: 'text/srt' });
                    const captionId = `caption-${videoId}`;
                    await videoStorage.storeVideo(captionId, captionBlob);
                    captionPath = captionId;
                    break;
                  }
                }

                topic.videos.push({
                  id: videoId,
                  title: fileName.replace(/\.[^/.]+$/, ""),
                  path: videoId, // Store video ID instead of blob URL
                  caption: captionPath,
                  completed: false
                });
              }
            }
          }

          readEntries();
        }, (error) => {
          console.error('Error reading entries:', error);
          resolve();
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
    error
  };
};