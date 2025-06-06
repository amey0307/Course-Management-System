import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, Circle, FileText, ExternalLink } from 'lucide-react';
import { Course, Topic, Resource } from '../../types';
import { calculateTopicProgress } from '../../utils/helpers';
import { videoStorage } from '../../utils/db';

interface SidebarProps {
  course: Course;
  currentVideoId: string | null;
  onVideoSelect: (topicId: string, videoId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ course, currentVideoId, onVideoSelect }) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {};
    course.topics.forEach(topic => {
      expanded[topic.id] = false;
    });
    return expanded;
  });

  // Initialize expanded state for topics
  useEffect(() => {
    if (!currentVideoId) return;
    const topicWithCurrentVideo = course.topics.find(topic =>
      topic.videos.some(video => video.id === currentVideoId)
    );
    if (topicWithCurrentVideo) {
      setExpandedTopics(prev => ({
        ...prev,
        [topicWithCurrentVideo.id]: true,
      }));
    }
  }, [currentVideoId, course.topics]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleResourceClick = async (resource: Resource) => {
    try {
      const resourceBlob = await videoStorage.getResource(resource.path);
      if (!resourceBlob) {
        alert('Resource not found');
        return;
      }

      const resourceUrl = videoStorage.createResourceUrl(resourceBlob);

      if (resource.type === 'pdf') {
        // Open PDF in new tab
        window.open(resourceUrl, '_blank');
      } else if (resource.type === 'html') {
        // Open HTML in new tab
        window.open(resourceUrl, '_blank');
      }

      // Clean up the URL after a delay to prevent memory leaks
      setTimeout(() => {
        videoStorage.revokeResourceUrl(resourceUrl);
      }, 5000);
    } catch (error) {
      console.error('Error opening resource:', error);
      alert('Failed to open resource');
    }
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
          .sort((a, b) => {
            const getLeadingNumber = (title: string) => {
              const match = title.match(/^(\d{1,2})/);
              return match ? parseInt(match[1], 10) : 0;
            };
            const numA = getLeadingNumber(a.title);
            const numB = getLeadingNumber(b.title);
            if (numA !== numB) {
              return numA - numB;
            }
            return a.title.localeCompare(b.title);
          })
          .map((topic) => (
            <div key={topic.id} className="mb-2">
              <div className="flex items-center justify-between">
                <button
                  className="flex-1 flex items-center justify-between p-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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

                {/* Resource Button */}
                {topic.resources && topic.resources.length > 0 && (
                  <div className="ml-2 relative group">
                    <button
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      title={`${topic.resources.length} resource(s) available`}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    
                    {/* Dropdown menu for resources */}
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        {topic.resources.map((resource) => (
                          <button
                            key={resource.id}
                            onClick={() => handleResourceClick(resource)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            {resource.type === 'pdf' ? (
                              <FileText className="h-4 w-4 mr-2 text-red-500" />
                            ) : (
                              <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                            )}
                            <span className="truncate">{resource.title}</span>
                            <span className="ml-2 text-xs text-gray-500 uppercase">
                              {resource.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {expandedTopics[topic.id] && (
                <div className="ml-6 mt-1 space-y-1">
                  {topic.videos
                    .sort((a, b) => {
                      const getLeadingNumber = (title: string) => {
                        const match = title.match(/^(\d{1,2})/);
                        return match ? parseInt(match[1], 10) : 0;
                      };
                      const numA = getLeadingNumber(a.title);
                      const numB = getLeadingNumber(b.title);
                      if (numA !== numB) {
                        return numA - numB;
                      }
                      return a.title.localeCompare(b.title);
                    })
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