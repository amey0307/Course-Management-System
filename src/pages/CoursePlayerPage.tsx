import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import Sidebar from '../components/CoursePlayer/Sidebar';
import VideoPlayer from '../components/CoursePlayer/VideoPlayer';
import { ArrowLeft } from 'lucide-react';
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
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-full overflow-hidden">
        <Sidebar 
          course={currentCourse} 
          currentVideoId={currentVideo?.id || null}
          onVideoSelect={handleVideoSelect}
        />
      </div>
      
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
    </div>
  );
};

export default CoursePlayerPage;