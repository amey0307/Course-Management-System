import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, Circle } from 'lucide-react';
import { Course, Topic } from '../../types';
import { calculateTopicProgress } from '../../utils/helpers';

interface SidebarProps {
  course: Course;
  currentVideoId: string | null;
  onVideoSelect: (topicId: string, videoId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ course, currentVideoId, onVideoSelect }) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    // Initialize with all topics expanded
    const expanded: Record<string, boolean> = {};
    course.topics.forEach(topic => {
      expanded[topic.id] = false; // Set to false to start with all topics collapsed
    });
    return expanded;
  });

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold truncate">{course.title}</h2>
        <div className="mt-2 flex items-center">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm">{course.progress}%</span>
        </div>
      </div>


      <div className="p-2">
        {course.topics
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((topic) => (
            <div key={topic.id} className="mb-2">
              <button
                className="w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex items-center">
                  {expandedTopics[topic.id] ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                  )}
                  <span className="font-medium">{topic.title}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{calculateTopicProgress(topic)}%</span>
                </div>
              </button>

              {expandedTopics[topic.id] && (
                <div className="ml-6 mt-1 space-y-1">
                  {topic.videos
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((video) => (
                    <button
                      key={video.id}
                      className={`w-full flex items-center p-2 text-left rounded-md text-sm
                            ${video.id === currentVideoId
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => onVideoSelect(topic.id, video.id)}
                    >
                      <div className="flex-shrink-0 mr-2">
                        {video.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          video.id === currentVideoId ? (
                            <Play className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )
                        )}
                      </div>
                      <span className="truncate">{video.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;