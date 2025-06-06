import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useStorageStore } from '../../store/StorageStore';

const StorageLimitSettings: React.FC = () => {
  const { storageLimit, setStorageLimit } = useStorageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(storageLimit / (1024 * 1024 * 1024)); // Convert to GB for display
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    const newLimitInBytes = tempLimit * 1024 * 1024 * 1024; // Convert GB to bytes
    setStorageLimit(newLimitInBytes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempLimit(storageLimit / (1024 * 1024 * 1024));
    setIsEditing(false);
  };

  const handleReset = () => {
    const defaultLimit = 25; // 25GB
    setTempLimit(defaultLimit);
    const newLimitInBytes = defaultLimit * 1024 * 1024 * 1024;
    setStorageLimit(newLimitInBytes);
    setIsEditing(false);
  };

  const presetLimits = [5, 10, 20, 25, 50, 100]; // GB values

  return (
    <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Settings className="mr-2 h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Storage Limit Settings</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current storage limit: <span className="font-semibold text-blue-600">{formatBytes(storageLimit)}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Videos exceeding this limit will trigger storage warnings
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Limit (GB)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="1000"
                step="0.5"
                value={tempLimit}
                onChange={(e) => setTempLimit(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter limit in GB"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">GB</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  onClick={() => setTempLimit(limit)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    tempLimit === limit
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {limit}GB
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Preview:</span> New limit will be {formatBytes(tempLimit * 1024 * 1024 * 1024)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex-1"
            >
              Cancel
            </button>
          </div>

          {/* Warning */}
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            <strong>Note:</strong> Changing the storage limit only affects future warnings. Existing videos won't be automatically deleted.
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageLimitSettings;