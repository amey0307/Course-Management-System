import React, { useRef, useState } from 'react';
import { FolderUp, Check, AlertCircle, Loader } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useCourseStore } from '../../store/courseStore';
import Button from '../ui/Button';

const UploadArea: React.FC = () => {
  const { processUploadedFolder, isUploading, uploadProgress, error, currentTask } = useFileUpload();
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
          <Loader className="w-8 h-8 text-blue-500 mb-4 animate-spin" />
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 max-w-md">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(uploadProgress || 0, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {currentTask || 'Processing course folder...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(uploadProgress || 0)}% complete
          </p>
          
          {/* Progress indicator with steps */}
          <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${uploadProgress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span>Scan</span>
            <div className={`w-2 h-2 rounded-full ${uploadProgress > 10 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span>Process</span>
            <div className={`w-2 h-2 rounded-full ${uploadProgress > 90 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span>Save</span>
            <div className={`w-2 h-2 rounded-full ${uploadProgress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Complete</span>
          </div>
        </div>
      ) : uploadProgress >= 100 && !error ? (
        <div className="flex flex-col items-center text-green-600">
          <Check className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium mb-2">Upload Successful!</p>
          <p className="text-gray-600 dark:text-gray-400">Your course has been uploaded and is ready to use.</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium mb-2">Upload Error</p>
          <p className="mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
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