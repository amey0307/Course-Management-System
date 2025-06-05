import React, { useRef, useState } from 'react';
import { FolderUp, Check, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useCourseStore } from '../../store/courseStore';
import Button from '../ui/Button';

const UploadArea: React.FC = () => {
  const { processUploadedFolder, isUploading, uploadProgress, error } = useFileUpload();
  const { addCourse } = useCourseStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.items) {
      const course = await processUploadedFolder(e.dataTransfer.items);
      if (course) {
        addCourse(course);
      }
    }
  };

  const handleBrowseClick = () => {
    // Create a temporary file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        // Convert FileList to DataTransferItemList-like structure
        const items = {
          length: target.files.length,
          [Symbol.iterator]: function* () {
            for (let i = 0; i < this.length; i++) {
              yield {
                kind: 'file',
                webkitGetAsEntry: () => ({
                  isDirectory: target.files![i].webkitRelativePath.split('/').length > 2,
                  name: target.files![i].webkitRelativePath.split('/')[0],
                  createReader: () => ({
                    readEntries: (callback: (entries: any[]) => void) => {
                      const folderEntries = Array.from(target.files as FileList)
                        .filter(file => file.webkitRelativePath.startsWith(target.files![i].webkitRelativePath.split('/')[0]))
                        .map(file => ({
                          isDirectory: file.webkitRelativePath.split('/').length > 2,
                          name: file.webkitRelativePath.split('/')[1],
                          createReader: () => ({
                            readEntries: (cb: (entries: any[]) => void) => cb([])
                          })
                        }));
                      callback(folderEntries);
                    }
                  })
                })
              };
            }
          }
        };
        
        // This is a simplified approach for demonstration purposes
        // In a real implementation, you would need to properly handle the folder structure
        alert("The file input method has limitations in the browser. Please use drag and drop for full functionality.");
      }
    };
    
    input.click();
  };

  return (
    <div 
      ref={uploadRef}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-700'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Processing course folder... {uploadProgress}%
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium mb-2">Upload Error</p>
          <p className="mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => uploadRef.current?.click()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <FolderUp className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Course Folder</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Drag and drop a course folder here. The folder should contain topic subfolders with video files.
          </p>
          <Button 
            variant="outline" 
            onClick={handleBrowseClick}
          >
            Browse Folders
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadArea;