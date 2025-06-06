import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CourseDB extends DBSchema {
  videos: {
    key: string;
    value: Blob;
  };
}

const DB_NAME = 'coursePlayerDB';
const STORE_NAME = 'videos';

class VideoStorage {
  private db: IDBPDatabase<CourseDB> | null = null;

  async init() {
    if (!this.db) {
      this.db = await openDB<CourseDB>(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
    }
    return this.db;
  }

  async storeVideo(id: string, blob: Blob): Promise<void> {
    const db = await this.init();
    await db.put(STORE_NAME, blob, id);
  }

  async getVideo(id: string): Promise<Blob | undefined> {
    const db = await this.init();
    return db.get(STORE_NAME, id);
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.init();
    await db.delete(STORE_NAME, id);
  }

  async clearAllVideos(): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
  }

  async getStorageSize(): Promise<number> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const keys = await store.getAllKeys();

    let totalSize = 0;
    for (const key of keys) {
      const blob = await store.get(key);
      if (blob) totalSize += blob.size;
    }
    return totalSize;
  }

  async deleteCourse(courseId: string): Promise<void> {
    // Delete all videos for a specific course
    const coursesData = localStorage.getItem('courses');
    const courses = coursesData ? JSON.parse(coursesData) : [];
    const course = courses.find((c: any) => c.id === courseId);

    if (course) {
      for (const topic of course.topics) {
        for (const video of topic.videos) {
          await this.deleteVideo(video.path);
          if (video.caption) {
            await this.deleteVideo(video.caption);
          }
        }
      }
    }
  }

  async getResource(resourceId: string): Promise<Blob | null> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const result = await store.get(resourceId);
      return result || null;
    } catch (error) {
      console.error('Error retrieving resource:', error);
      return null;
    }
  }

  createResourceUrl(resourceBlob: Blob): string {
    return URL.createObjectURL(resourceBlob);
  }

  revokeResourceUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const videoStorage = new VideoStorage();