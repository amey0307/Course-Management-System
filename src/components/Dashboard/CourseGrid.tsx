import React from 'react';
import CourseCard from './CourseCard';
import { Course } from '../../types';
import { useCourseStore } from '../../store/courseStore';

interface CourseGridProps {
  courses: Course[];
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  const { deleteCourse } = useCourseStore();

  const handleDeleteCourse = async (courseId: string) => {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No courses available. Upload a course to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onDelete={() => handleDeleteCourse(course.id)}
        />
      ))}
    </div>
  );
};

export default CourseGrid;