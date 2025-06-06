import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MonitorPlay } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm z-[999]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
            <MonitorPlay className="h-6 w-6" />
            <span>COURSE-IT</span>
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} CoursePlayer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;