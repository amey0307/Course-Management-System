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
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Continue learning or upload a new course
            </p>
          </div>
          
          {/* Add Course Button */}
          <button
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 mt-4 md:mt-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          <div className="mb-12 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <FolderPlus className="mr-2 h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Add New Course</h2>
            </div>
            
            {/* Folder Structure Information */}
            <div className="mb-6 p-4 bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60 rounded-lg backdrop-blur-sm">
              <div className="flex items-start mb-3">
                <Info className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Folder Structure</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Please organize your course files in the following structure before uploading:
                  </p>
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-md border border-blue-200/60 dark:border-blue-700/60 backdrop-blur-sm">
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
          <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Your Learning Journey</h2>
            <CourseGrid courses={courses} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;