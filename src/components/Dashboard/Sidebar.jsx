import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaBook,
  FaUsers,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaCog,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FaHome },
  { name: 'Books', href: '/dashboard/books', icon: FaBook },
  { name: 'Users', href: '/dashboard/users', icon: FaUsers },
  { name: 'Courses', href: '/dashboard/courses', icon: FaGraduationCap },
  { name: 'Instructors', href: '/dashboard/instructors', icon: FaChalkboardTeacher },
  { name: 'Settings', href: '/dashboard/settings', icon: FaCog },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 text-white bg-primary">
            <h1 className="text-xl font-bold">Dr KROK Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
