# Course Management System (COURSE-IT)
    ~by Amey Tripathi
A modern, offline-first course management system built with React, TypeScript, and Vite. Upload video courses and track your learning progress with a beautiful, responsive interface.

## 🌟 Features

- **📁 Folder-based Course Upload**: Drag and drop entire course folders with automatic organization
- **🎥 Video Player**: Custom video player with progress tracking and completion marking
- **📊 Progress Tracking**: Visual progress bars and completion statistics
- **💾 Offline Storage**: All videos stored locally using IndexedDB for offline access
- **🗂️ Smart Organization**: Automatic course structure detection from folder hierarchy
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🌓 Dark/Light Mode**: Automatic theme detection with manual toggle
- **💾 Storage Management**: Configurable storage limits with real-time monitoring
- **🗑️ Course Management**: Easy course deletion with automatic cleanup
- **📋 Caption Support**: Optional VTT caption file support

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms_2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Course Structure Requirements

To upload courses, organize your files in this structure:

```
Course Name/
├── 01 Introduction/
│   ├── 01 Welcome.mp4
│   ├── 02 Course Overview.mp4
│   └── 01 Welcome.vtt (optional captions)
├── 02 Getting Started/
│   ├── 01 Setup.mp4
│   ├── 02 Configuration.mp4
│   └── 01 Setup.vtt (optional captions)
└── 03 Advanced Topics/
    ├── 01 Advanced Concepts.mp4
    └── 02 Best Practices.mp4
```

### Important Notes:
- **Numbered folders**: Use `01`, `02`, etc. for topics to maintain order
- **Numbered videos**: Use `01`, `02`, etc. for videos within each topic
- **Supported formats**: MP4, MOV, AVI, MKV
- **Caption files**: Optional VTT files with same name as video files

## 🎯 How to Use

### 1. Upload a Course
1. Click the **"Add Course"** button on the dashboard
2. Review the folder structure requirements
3. Drag and drop your course folder into the upload area
4. Wait for processing to complete

### 2. Watch Videos
1. Click on any course card to start learning
2. Select videos from the sidebar
3. Mark videos as complete using the checkbox
4. Track your progress with the visual progress bar

### 3. Manage Storage
1. Click the **"Settings"** button to configure storage limits
2. Use preset limits (5GB, 10GB, 20GB, etc.) or set custom limits
3. Monitor storage usage in real-time
4. Delete courses to free up space when needed

### 4. Delete Courses
1. Hover over any course card
2. Click the red trash icon that appears
3. Confirm deletion to remove the course and free up storage

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── CourseCard.tsx       # Individual course display
│   │   ├── CourseGrid.tsx       # Course grid layout
│   │   └── UploadArea.tsx       # Drag & drop upload
│   ├── CoursePlayer/
│   │   ├── Sidebar.tsx          # Course navigation
│   │   └── VideoPlayer.tsx      # Custom video player
│   ├── StorageLimit/
│   │   ├── StorageLimitSettings.tsx  # Storage configuration
│   │   └── StorageManager.tsx        # Storage monitoring
│   └── ui/
│       └── Button.tsx           # Reusable button component
├── hooks/
│   ├── useFileUpload.ts         # File upload logic
│   ├── useTheme.ts              # Theme management
│   └── useVideoPlayer.ts        # Video player controls
├── pages/
│   ├── DashboardPage.tsx        # Main dashboard
│   └── CoursePlayerPage.tsx     # Video viewing page
├── store/
│   ├── courseStore.ts           # Course state management
│   └── StorageStore.ts          # Storage settings
├── types/
│   └── index.ts                 # TypeScript definitions
└── utils/
    ├── db.ts                    # IndexedDB operations
    └── helpers.ts               # Utility functions
```

## 🛠️ Technical Details

### Technologies Used
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **IndexedDB** - Local storage for videos
- **React Router** - Navigation
- **Lucide React** - Icons

### Storage System
- **Videos**: Stored as Blobs in IndexedDB for offline access
- **Metadata**: Course information stored in localStorage
- **Captions**: VTT files stored alongside videos
- **Configurable Limits**: Default 25GB, customizable from 1GB to 1TB

### Browser Compatibility
- Chrome 58+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📊 Storage Management

### Default Limits
- **Default storage limit**: 25GB
- **Configurable range**: 1GB - 1TB
- **Storage monitoring**: Real-time usage tracking
- **Automatic warnings**: Alerts when approaching limits

### Storage Operations
```typescript
// Check storage usage
const storageSize = await videoStorage.getStorageSize();

// Clear all videos
await videoStorage.clearAllVideos();

// Delete specific course
await deleteCourse(courseId);
```

## 🎨 Customization

### Themes
The app supports both light and dark themes with automatic system preference detection.

### Storage Limits
Configure storage limits through the Settings panel:
- Quick presets: 5GB, 10GB, 20GB, 25GB, 50GB, 100GB
- Custom limits: Any value between 1GB and 1TB

### Styling
Built with Tailwind CSS for easy customization. Modify colors, spacing, and components in the source files.

## 🐛 Troubleshooting

### Common Issues

1. **Upload not working**
   - Ensure folder structure follows the required format
   - Check that video files are in supported formats
   - Verify sufficient storage space

2. **Videos not playing**
   - Check browser compatibility
   - Ensure IndexedDB is enabled
   - Try refreshing the page

3. **Storage full errors**
   - Use the storage manager to check usage
   - Delete unused courses
   - Increase storage limit in settings

### Browser Storage Locations
- **Chrome/Edge**: `~/Library/Application Support/Google/Chrome/Default/IndexedDB`
- **Firefox**: `~/Library/Application Support/Firefox/Profiles/*/storage`
- **Safari**: `~/Library/Safari/Databases`

## 🏃‍♂️ Performance Tips

1. **Optimize video files** before uploading (compress if needed)
2. **Delete unused courses** regularly to free up space
3. **Use reasonable storage limits** based on your device capacity
4. **Close unused browser tabs** when uploading large courses

## 📄 Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Look for similar issues in the project's issue tracker
3. Create a new issue with detailed information about your problem

---

**Happy Learning! 📚✨**