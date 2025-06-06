import { create } from 'zustand';
import { Course, Topic, Video } from '../types';
import { videoStorage } from '../utils/db';

type CourseStore = {
  courses: Course[];
  currentCourse: Course | null;
  currentTopic: Topic | null;
  currentVideo: Video | null;

  // Actions
  loadCourses: () => void;
  selectCourse: (courseId: string) => void;
  selectVideo: (courseId: string, topicId: string, videoId: string) => void;
  toggleVideoCompletion: (courseId: string, topicId: string, videoId: string) => void;
  updateCourseProgress: (courseId: string) => void;
  addCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => Promise<void>;
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  currentCourse: null,
  currentTopic: null,
  currentVideo: null,

  loadCourses: () => {
    try {
      const coursesData = localStorage.getItem('courses');
      const courses = coursesData ? JSON.parse(coursesData) : [];
      set({ courses });
    } catch (error) {
      console.error('Error loading courses:', error);
      set({ courses: [] });
    }
  },

  selectCourse: (courseId) => {
    const { courses } = get();
    const course = courses.find(c => c.id === courseId) || null;

    if (course) {
      // Find last viewed video or default to first video
      let topic = null;
      let video = null;

      if (course.lastViewed) {
        topic = course.topics.find(t => t.id === course.lastViewed?.topicId) || null;
        if (topic) {
          video = topic.videos.find(v => v.id === course.lastViewed?.videoId) || null;
        }
      }

      // If no last viewed or it doesn't exist anymore, use first available
      if (!topic && course.topics.length > 0) {
        topic = course.topics[0];
        if (topic.videos.length > 0) {
          video = topic.videos[0];
        }
      }

      set({
        currentCourse: course,
        currentTopic: topic,
        currentVideo: video
      });
    } else {
      set({
        currentCourse: null,
        currentTopic: null,
        currentVideo: null
      });
    }
  },

  selectVideo: (courseId, topicId, videoId) => {
    const { courses } = get();
    const course = courses.find(c => c.id === courseId);

    if (!course) return;

    const topic = course.topics.find(t => t.id === topicId);
    if (!topic) return;

    const video = topic.videos.find(v => v.id === videoId);
    if (!video) return;

    // Update last viewed
    const updatedCourse = {
      ...course,
      lastViewed: { topicId, videoId }
    };

    // Update courses array
    const updatedCourses = courses.map(c =>
      c.id === courseId ? updatedCourse : c
    );

    // Save to localStorage
    localStorage.setItem('courses', JSON.stringify(updatedCourses));

    set({
      courses: updatedCourses,
      currentCourse: updatedCourse,
      currentTopic: topic,
      currentVideo: video
    });
  },

  toggleVideoCompletion: (courseId, topicId, videoId) => {
    const { courses } = get();
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) return;

    // Create a deep copy of the courses array
    const updatedCourses = JSON.parse(JSON.stringify(courses));
    const course = updatedCourses[courseIndex];

    // Find the topic and video
    const topicIndex = course.topics.findIndex((t: { id: string; }) => t.id === topicId);
    if (topicIndex === -1) return;

    const videoIndex = course.topics[topicIndex].videos.findIndex((v: { id: string; }) => v.id === videoId);
    if (videoIndex === -1) return;

    // Toggle completion status
    course.topics[topicIndex].videos[videoIndex].completed =
      !course.topics[topicIndex].videos[videoIndex].completed;

    // Count total videos and completed videos for progress calculation
    let totalVideos = 0;
    let completedVideos = 0;

    course.topics.forEach((topic: { videos: { length: number; filter: (arg0: (v: any) => any) => { (): any; new(): any; length: number; }; }; }) => {
      totalVideos += topic.videos.length;
      completedVideos += topic.videos.filter((v: { completed: boolean; }) => v.completed).length;
    });

    // Calculate and update progress percentage
    const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    course.progress = progress;

    // Update state and localStorage
    set({
      courses: updatedCourses,
      currentCourse: course
    });

    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  },

  updateCourseProgress: (courseId) => {
    const { courses } = get();
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) return;

    // Create a deep copy of the courses array
    const updatedCourses = JSON.parse(JSON.stringify(courses));
    const course = updatedCourses[courseIndex];

    // Count total videos and completed videos
    let totalVideos = 0;
    let completedVideos = 0;

    course.topics.forEach((topic: { videos: { length: number; filter: (arg0: (v: any) => any) => { (): any; new(): any; length: number; }; }; }) => {
      totalVideos += topic.videos.length;
      completedVideos += topic.videos.filter((v: { completed: boolean; }) => v.completed).length;
    });

    // Calculate progress percentage
    const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    course.progress = progress;

    // Update state and localStorage
    set({ courses: updatedCourses });
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  },

  addCourse: (course) => {
    const { courses } = get();

    // Check if course already exists
    const existingCourse = courses.find(c => c.id === course.id);
    if (existingCourse) return;

    // Add new course
    const updatedCourses = [...courses, course];

    // Update state and localStorage
    set({ courses: updatedCourses });
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  },

  deleteCourse: async (courseId: string) => {
    const { courses, currentCourse } = get();

    try {
      const courseToDelete = courses.find(c => c.id === courseId);

      if (courseToDelete) {
        // Delete all video files and resources for this course from IndexedDB
        for (const topic of courseToDelete.topics) {
          // Delete videos
          for (const video of topic.videos) {
            try {
              await videoStorage.deleteVideo(video.path);

              if (video.caption) {
                await videoStorage.deleteVideo(video.caption);
              }
            } catch (error) {
              console.warn(`Failed to delete video: ${video.path}`, error);
            }
          }

          // Delete resources
          if (topic.resources) {
            for (const resource of topic.resources) {
              try {
                await videoStorage.deleteVideo(resource.path);
              } catch (error) {
                console.warn(`Failed to delete resource: ${resource.path}`, error);
              }
            }
          }
        }
      }

      // Remove course from state
      const updatedCourses = courses.filter(c => c.id !== courseId);

      // Clear current course if it's the one being deleted
      const newCurrentCourse = currentCourse?.id === courseId ? null : currentCourse;
      const newCurrentTopic = currentCourse?.id === courseId ? null : get().currentTopic;
      const newCurrentVideo = currentCourse?.id === courseId ? null : get().currentVideo;

      // Update state and localStorage
      set({
        courses: updatedCourses,
        currentCourse: newCurrentCourse,
        currentTopic: newCurrentTopic,
        currentVideo: newCurrentVideo
      });

      localStorage.setItem('courses', JSON.stringify(updatedCourses));

    } catch (error) {
      console.error('Failed to delete course:', error);
      throw new Error('Failed to delete course. Please try again.');
    }
  }
}));