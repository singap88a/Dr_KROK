import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MainContent from './MainContent';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
}
