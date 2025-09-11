import React, { useState, useEffect } from 'react';
import { FaBars, FaMoon, FaSun, FaUser, FaBell, FaSearch } from 'react-icons/fa';

export default function TopNavbar({ setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-500 rounded-md lg:hidden hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        >
          <FaBars className="w-6 h-6" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-500 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
            <FaBell className="w-6 h-6" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            {darkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
