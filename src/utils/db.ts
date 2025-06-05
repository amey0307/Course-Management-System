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

  async getVideo(id: string): Promise<Blob | null> {
    const db = await this.init();
    return db.get(STORE_NAME, id);
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.init();
    await db.delete(STORE_NAME, id);
  }
}

export const videoStorage = new VideoStorage();