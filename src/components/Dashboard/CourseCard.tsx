import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { Play, Clock, CheckCircle, Users, Trash2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onDelete: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when delete button is clicked
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate progress
  const totalVideos = course.topics.reduce((total, topic) => total + topic.videos.length, 0);
  const completedVideos = course.topics.reduce(
    (total, topic) => total + topic.videos.filter(video => video.completed).length,
    0
  );
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  return (
    <div className="group relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg disabled:opacity-50"
        title="Delete course"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      {/* Card Content */}
      <div onClick={handleClick} className="p-6">
        {/* Course Title */}
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>

        {/* Course Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            <span>{course.topics.length} topics</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Play className="h-4 w-4 mr-2" />
            <span>{totalVideos} videos</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>{completedVideos} completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex items-center justify-center">
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            <Play className="h-4 w-4 mr-1" />
            {progress > 0 ? 'Continue Learning' : 'Start Course'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;