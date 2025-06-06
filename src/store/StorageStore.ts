import { create } from 'zustand';

type StorageStore = {
  storageLimit: number;
  setStorageLimit: (limit: number) => void;
  getStorageLimit: () => number;
};

// Default limit: 25GB
const DEFAULT_STORAGE_LIMIT = 25 * 1024 * 1024 * 1024;

// Load from localStorage or use default
const loadStorageLimit = (): number => {
  try {
    const saved = localStorage.getItem('storage_limit');
    return saved ? parseInt(saved) : DEFAULT_STORAGE_LIMIT;
  } catch {
    return DEFAULT_STORAGE_LIMIT;
  }
};

export const useStorageStore = create<StorageStore>((set, get) => ({
  storageLimit: loadStorageLimit(),
  
  setStorageLimit: (limit: number) => {
    set({ storageLimit: limit });
    localStorage.setItem('storage_limit', limit.toString());
  },
  
  getStorageLimit: () => get().storageLimit,
}));

// Export for backwards compatibility
export const STORAGE_LIMIT = loadStorageLimit();