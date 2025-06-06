import React, { useEffect, useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import CourseGrid from '../components/Dashboard/CourseGrid';
import UploadArea from '../components/Dashboard/UploadArea';
import StorageLimitSettings from '../components/StorageLimit/StorageLimitSettings';
import { FolderPlus, Info, Folder, FileVideo, FileText, Plus, X, AlertTriangle, HardDrive, Trash2, Settings, ExternalLink } from 'lucide-react';
import StorageManager from '../components/StorageLimit/StorageManager';
import { videoStorage } from '../utils/db';
import { useStorageStore } from '../store/StorageStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"

const DashboardPage: React.FC = () => {
  const { courses, loadCourses } = useCourseStore();
  const { storageLimit } = useStorageStore();
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [showStorageAlert, setShowStorageAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    loadCourses();
    checkStorageLimit();
  }, [loadCourses, storageLimit]); // Re-check when limit changes

  const checkStorageLimit = async () => {
    try {
      const currentSize = await videoStorage.getStorageSize();
      setStorageSize(currentSize);

      if (currentSize > storageLimit) {
        setShowStorageAlert(true);
      }
    } catch (error) {
      console.error('Failed to check storage size:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearAllStorage = async () => {
    try {
      await videoStorage.clearAllVideos();
      localStorage.removeItem('courses');
      setStorageSize(0);
      setShowStorageAlert(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Storage Alert Popup */}
      {showStorageAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Storage Limit Exceeded
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <HardDrive className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Usage: <span className="font-semibold text-red-600">{formatBytes(storageSize)}</span>
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="h-5 w-5 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Limit: <span className="font-semibold">{formatBytes(storageLimit)}</span>
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  You've exceeded the {storageLimit / (1024 * 1024 * 1024)} GB storage limit. Please free up space by deleting some courses before uploading new ones.
                </p>

                {/* Progress bar showing storage usage */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((storageSize / storageLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={clearAllStorage}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Storage
                </button>
                <button
                  onClick={() => setShowStorageAlert(false)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex-1"
                >
                  Continue Anyway
                </button>
              </div>

              {/* Warning note */}
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> Continuing with exceeded storage may cause performance issues and prevent new uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={storageSize > storageLimit}
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
                  {storageSize > storageLimit && (
                    <span className="ml-2 text-xs bg-red-500 px-2 py-1 rounded">
                      Storage Full
                    </span>
                  )}
                </>
              )}
            </button>
            <StorageManager />
          </div>
        </div>

        {/* Storage Limit Settings */}
        {showSettings && <StorageLimitSettings />}

        {/* Storage warning bar (always visible if over limit) */}
        {storageSize > storageLimit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 dark:text-red-200 font-medium">
                  Storage limit exceeded: {formatBytes(storageSize)} / {formatBytes(storageLimit)}
                </span>
              </div>
              <button
                onClick={() => setShowStorageAlert(true)}
                className="text-red-600 hover:text-red-700 text-sm underline"
              >
                Manage Storage
              </button>
            </div>
          </div>
        )}

        {/* Upload Area - Only show when button is clicked and storage is not full */}
        {showUploadArea && storageSize <= storageLimit && (
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
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  <span>Course Notes.pdf</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Reference.html</span>
                </div>
                <div className="ml-6 flex items-center text-gray-600 dark:text-gray-400">
                  <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>02 Getting Started/</span>
                </div>
                <div className="ml-12 flex items-center text-gray-600 dark:text-gray-400">
                  <FileVideo className="mr-2 h-4 w-4 text-green-500" />
                  <span>01 Setup.mp4</span>
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