// src/components/StorageManager.tsx
import React, { useState, useEffect } from 'react';
import { Trash2, HardDrive } from 'lucide-react';
import { videoStorage } from '../../utils/db';
import Button from '../ui/Button';
import { STORAGE_LIMIT } from '../../store/StorageStore';

const StorageManager: React.FC = () => {
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    loadStorageSize();
  }, []);

  const loadStorageSize = async () => {
    const size = await videoStorage.getStorageSize();
    setStorageSize(size);
  };

  const clearAllStorage = async () => {
    if (confirm('This will delete all videos. Are you sure?')) {
      await videoStorage.clearAllVideos();
      localStorage.removeItem('courses');
      setStorageSize(0);
      window.location.reload();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HardDrive className="mr-2 h-5 w-5 text-red-600" />
          <span>Storage Used: {formatBytes(storageSize)} / {STORAGE_LIMIT / 1024 / 1024 / 1024} GB</span>
        </div>
        <Button
          variant="outline"
          icon={Trash2}
          onClick={clearAllStorage}
          className="text-red-600 border-red-600 hover:bg-red-50 ml-4"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default StorageManager;