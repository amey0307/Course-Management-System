import React, { useEffect } from 'react';
import { useCourseStore } from '../store/courseStore';
import CourseGrid from '../components/Dashboard/CourseGrid';
import UploadArea from '../components/Dashboard/UploadArea';
import { FolderPlus } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { courses, loadCourses } = useCourseStore();
  
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
      </div>
      
      <div className="mb-12">
        <div className="flex items-center mb-4">
          <FolderPlus className="mr-2 h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Add New Course</h2>
        </div>
        <UploadArea />
      </div>
      
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