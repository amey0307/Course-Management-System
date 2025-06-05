import { Course, Topic } from '../types';

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const calculateTopicProgress = (topic: Topic): number => {
  if (topic.videos.length === 0) return 0;
  
  const completedVideos = topic.videos.filter(video => video.completed).length;
  return Math.round((completedVideos / topic.videos.length) * 100);
};

export const getTotalVideosCount = (course: Course): number => {
  return course.topics.reduce((total, topic) => total + topic.videos.length, 0);
};

export const getCompletedVideosCount = (course: Course): number => {
  return course.topics.reduce((total, topic) => {
    return total + topic.videos.filter(video => video.completed).length;
  }, 0);
};

export const parseSRT = (srtContent: string) => {
  const subtitles = [];
  const subtitleBlocks = srtContent.trim().split('\n\n');
  
  for (const block of subtitleBlocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    
    const index = parseInt(lines[0]);
    const timeCode = lines[1];
    const text = lines.slice(2).join(' ');
    
    // Parse time codes (00:00:00,000 --> 00:00:00,000)
    const [startTime, endTime] = timeCode.split(' --> ').map(time => {
      const [hours, minutes, secondsMs] = time.split(':');
      const [seconds, ms] = secondsMs.split(',');
      
      return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(seconds) +
        parseInt(ms) / 1000
      );
    });
    
    subtitles.push({
      index,
      startTime,
      endTime,
      text
    });
  }
  
  return subtitles;
};