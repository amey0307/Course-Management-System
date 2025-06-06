export interface Video {
  id: string;
  title: string;
  path: string;
  caption?: string;
  duration?: number;
  completed: boolean;
}

// ...existing code...

export interface Resource {
  id: string;
  title: string;
  path: string;
  type: 'pdf' | 'html';
}

export interface Topic {
  id: string;
  title: string;
  videos: Video[];
  resources?: Resource[]; // Add this line
}

// ...existing code...

export interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  topics: Topic[];
  lastViewed?: {
    topicId: string;
    videoId: string;
  };
  progress: number;
}

export interface VideoPlayerSettings {
  volume: number;
  playbackRate: number;
  showCaptions: boolean;
}