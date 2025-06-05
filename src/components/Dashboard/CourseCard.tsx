import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen } from 'lucide-react';
import { Course } from '../../types';
import Button from '../ui/Button';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };
  
  // Calculate total videos
  const totalVideos = course.topics.reduce((sum, topic) => {
    return sum + topic.videos.length;
  }, 0);
  
  // Calculate total topics
  const totalTopics = course.topics.length;
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 flex items-center justify-center p-4">
        <h3 className="text-xl font-bold text-white text-center">{course.title}</h3>
      </div>
      
      {/* Course Info */}
      <div className="p-5">
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="flex justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>{totalTopics} Topics</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalVideos} Videos
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {course.progress}% Complete
            </span>
            
            <Button 
              variant="primary"
              size="sm"
              icon={Play}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course/${course.id}`);
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;