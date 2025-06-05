import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import Sidebar from '../components/CoursePlayer/Sidebar';
import VideoPlayer from '../components/CoursePlayer/VideoPlayer';
import { ArrowLeft, GripVertical } from 'lucide-react';
import Button from '../components/ui/Button';

const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    selectCourse,
    selectVideo,
    currentCourse,
    currentTopic,
    currentVideo,
    toggleVideoCompletion
  } = useCourseStore();

  // Sidebar width state and drag logic
  const [sidebarWidth, setSidebarWidth] = React.useState<number>(500);
  const sidebarMinWidth = 200;
  const sidebarMaxWidth = 500;

  useEffect(() => {
    console.log("currentVideo: ", currentVideo)
  }, [currentVideo])

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
  
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(startWidth - (moveEvent.clientX - startX), sidebarMinWidth),
        sidebarMaxWidth
      );
      setSidebarWidth(newWidth);
    };
  
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (courseId) {
      selectCourse(courseId);
    }
  }, [courseId, selectCourse]);

  if (!currentCourse) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-136px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Course not found</h2>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleVideoSelect = (topicId: string, videoId: string) => {
    if (courseId) {
      selectVideo(courseId, topicId, videoId);
    }
  };

  const handleMarkComplete = () => {
    if (courseId && currentTopic && currentVideo) {
      toggleVideoCompletion(courseId, currentTopic.id, currentVideo.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-136px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentVideo ? (
          <div className="relative flex-1">
            <VideoPlayer
              video={currentVideo}
              onComplete={handleMarkComplete}
              isCompleted={currentVideo.completed}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Select a video to start learning</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a video from the sidebar to begin your learning journey
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Draggable Sidebar - now on the right */}
      <div
        className="relative flex-shrink-0 h-full overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <Sidebar
          course={currentCourse}
          currentVideoId={currentVideo?.id || null}
          onVideoSelect={handleVideoSelect}
        />
        {/* Drag handle with arrow icon */}
        <div
          className="absolute top-0 left-0 h-full w-2 cursor-col-resize z-10 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center"
          onMouseDown={handleDragStart}
        >
          <GripVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;