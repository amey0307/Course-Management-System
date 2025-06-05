import React, { useEffect, useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import CourseGrid from '../components/Dashboard/CourseGrid';
import UploadArea from '../components/Dashboard/UploadArea';
import { FolderPlus, Info, Folder, FileVideo, FileText, Plus, X } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { courses, loadCourses } = useCourseStore();
  const [showUploadArea, setShowUploadArea] = useState(false);
  
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue learning or upload a new course
          </p>
        </div>
        
        {/* Add Course Button */}
        <button
          onClick={() => setShowUploadArea(!showUploadArea)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 mt-4 md:mt-0"
        >
          {showUploadArea ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              Add Course
            </>
          )}
        </button>
      </div>
      
      {/* Upload Area - Only show when button is clicked */}
      {showUploadArea && (
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <FolderPlus className="mr-2 h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Add New Course</h2>
          </div>
          
          {/* Folder Structure Information */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start mb-3">
              <Info className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Folder Structure</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Please organize your course files in the following structure before uploading:
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="font-mono text-sm space-y-1">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Folder className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Course Name/</span>
                </div>
                <div className="ml-6 flex items-center text-gray-600 dark:text-gray-400">
                  <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>01 Introduction/</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <FileVideo className="mr-2 h-4 w-4 text-green-500" />
                  <span>01 Welcome.mp4</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <FileVideo className="mr-2 h-4 w-4 text-green-500" />
                  <span>02 Course Overview.mp4</span>
                </div>
                <div className="ml-6 flex items-center text-gray-600 dark:text-gray-400">
                  <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>02 Getting Started/</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <FileVideo className="mr-2 h-4 w-4 text-green-500" />
                  <span>01 Setup.mp4</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <FileText className="mr-2 h-4 w-4 text-purple-500" />
                  <span>01 Setup.vtt (optional captions)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>Use numbered folders (01, 02, etc.) for topics to maintain order</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>Use numbered video files (01, 02, etc.) within each topic folder</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>Supported video formats: MP4, MOV, AVI, MKV</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>Optional: Add .vtt caption files with the same name as your videos</span>
              </div>
            </div>
          </div>
          
          <UploadArea />
        </div>
      )}
      
      {courses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Learning Journey</h2>
          <CourseGrid courses={courses} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;