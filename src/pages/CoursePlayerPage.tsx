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
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Modern Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        
        <div className="relative z-10 flex justify-center items-center h-[calc(100vh-136px)]">
          <div className="text-center backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl">
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
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 flex h-[calc(100vh-100px)] p-6 gap-6 pt-10">
        {/* Main Content - Smaller video area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {currentVideo ? (
            <div className="relative h-full max-w-8xl mx-auto">
              <div className="backdrop-blur-sm bg-black/90 rounded-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl overflow-hidden h-full">
                <VideoPlayer
                  video={currentVideo}
                  onComplete={handleMarkComplete}
                  isCompleted={currentVideo.completed}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center p-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
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
          <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl h-full overflow-hidden">
            <Sidebar
              course={currentCourse}
              currentVideoId={currentVideo?.id || null}
              onVideoSelect={handleVideoSelect}
            />
          </div>
          {/* Drag handle with arrow icon */}
          <div
            className="absolute top-0 left-0 h-full w-2 cursor-col-resize z-10 bg-gray-300/80 dark:bg-gray-600/80 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center backdrop-blur-sm rounded-l-md"
            onMouseDown={handleDragStart}
          >
            <GripVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;