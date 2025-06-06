// src/components/StorageManager.tsx
import React, { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { Trash2, HardDrive } from 'lucide-react';
import { videoStorage } from '../../utils/db';
import Button from '../ui/Button';
import { STORAGE_LIMIT } from '../../store/StorageStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { AlertDialogDemo } from '../AlertDialogDemo';

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
    await videoStorage.clearAllVideos();
    localStorage.removeItem('courses');
    setStorageSize(0);
    window.location.reload();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center mr-4">
          <HardDrive className="mr-2 h-5 w-5 text-red-600" />
          <span>Storage Used <br/> {formatBytes(storageSize)} / {STORAGE_LIMIT / 1024 / 1024 / 1024} GB</span>
        </div>
        <AlertDialogDemo title='Clear All' action={clearAllStorage} />
      </div>
    </div>
  );
};

export default StorageManager;