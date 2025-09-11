/**
 * Profile Dashboard - Professional Modern UI
 * React + TailwindCSS + react-icons
 * Features:
 *   • Two-column dashboard layout (Sidebar + Main Content)
 *   • Dynamic content based on selected menu item
 *   • My Courses, My Orders, My Profile, Logout pages
 *   • Premium design with glassmorphism effects
 *   • Full responsive design with mobile drawer
 *   • Light/Dark mode support
 */

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaBook,
  FaShoppingCart,
  FaSignOutAlt,
  FaPlay,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBars,
  FaTimes,
  FaEdit,
  FaSave,
  FaCamera,
  FaSun,
  FaMoon,
  FaGraduationCap,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("courses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  // Mock user data
  const user = {
    name: "Ahmed Krok",
    email: "ahmed.krok@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "Frontend Developer",
    bio: "Passionate frontend developer building beautiful and high-performance web apps.",
    phone: "+20 100 123 4567",
    country: "Egypt",
    city: "Cairo",
    address: "Zamalek, Cairo, Egypt",
    website: "https://example.com",
    joined: "2022-05-12",
    stats: {
      courses: 12,
      orders: 8,
      rating: 4.8,
    },
  };

  // Mock courses data
  const enrolledCourses = [
    {
      id: 1,
      title: "Mastering React.js From Zero to Hero",
      instructor: "John Doe",
      image: "https://images.unsplash.com/photo-1581091012184-5c8a0a27f8d4",
      progress: 75,
      duration: "8 weeks",
      rating: 4.5,
      lastAccessed: "2024-01-15",
    },
    {
      id: 2,
      title: "Advanced JavaScript Concepts",
      instructor: "Jane Smith",
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a",
      progress: 45,
      duration: "6 weeks",
      rating: 4.8,
      lastAccessed: "2024-01-12",
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      instructor: "Mike Johnson",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      progress: 90,
      duration: "10 weeks",
      rating: 4.7,
      lastAccessed: "2024-01-10",
    },
  ];

  // Mock orders data
  const orders = [
    {
      id: "ORD-001",
      item: "Mastering React.js From Zero to Hero",
      type: "course",
      price: 49.99,
      status: "completed",
      date: "2024-01-05",
    },
    {
      id: "ORD-002",
      item: "JavaScript Fundamentals",
      type: "book",
      price: 29.99,
      status: "completed",
      date: "2024-01-03",
    },
    {
      id: "ORD-003",
      item: "Advanced CSS Techniques",
      type: "course",
      price: 39.99,
      status: "pending",
      date: "2024-01-08",
    },
    {
      id: "ORD-004",
      item: "React Design Patterns",
      type: "book",
      price: 34.99,
      status: "cancelled",
      date: "2024-01-06",
    },
  ];

  const menuItems = [
    { id: "courses", label: "My Courses", icon: FaGraduationCap },
    { id: "orders", label: "My Orders", icon: FaShoppingCart },
    { id: "profile", label: "My Profile", icon: FaUser },
    { id: "logout", label: "Logout", icon: FaSignOutAlt },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Handle logout logic here
      console.log("User logged out");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-600" />;
      case "pending":
        return <FaExclamationTriangle className="text-yellow-600" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const Sidebar = () => (
    <div className="h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-surface"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 text-center border-b border-border">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="object-cover w-full h-full rounded-full shadow-lg"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="text-sm text-text-secondary">{user.email}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {renderStars(user.stats.rating)}
          <span className="ml-1 text-sm text-text-secondary">
            ({user.stats.rating})
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                    if (item.id === "logout") handleLogout();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-lg"
                      : "hover:bg-surface text-text-secondary hover:text-text"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Stats Section */}
      <div className="p-4 mt-auto border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-primary">
              {user.stats.courses}
            </div>
            <div className="text-xs text-text-secondary">Courses</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user.stats.orders}
            </div>
            <div className="text-xs text-text-secondary">Orders</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user.stats.rating}
            </div>
            <div className="text-xs text-text-secondary">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );

  const MyCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Courses</h2>
        <span className="text-sm text-text-secondary">
          {enrolledCourses.length} courses enrolled
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="overflow-hidden transition-shadow duration-200 border shadow-sm bg-surface border-border rounded-xl hover:shadow-lg"
          >
            <div className="relative">
              <img
                src={course.image}
                alt={course.title}
                className="object-cover w-full h-48"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/20 hover:opacity-100">
                <button className="px-4 py-2 font-medium transition-colors rounded-lg bg-white/90 text-text hover:bg-white">
                  <FaPlay className="inline mr-2" />
                  Continue Learning
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <FaUser className="text-sm text-primary" />
                <span className="text-sm text-text-secondary">
                  {course.instructor}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FaClock className="text-sm text-primary" />
                <span className="text-sm text-text-secondary">
                  {course.duration}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 transition-all duration-300 rounded-full bg-primary"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                  <span className="ml-1 text-sm text-text-secondary">
                    {course.rating}
                  </span>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary">
                  Continue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MyOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <span className="text-sm text-text-secondary">
          {orders.length} total orders
        </span>
      </div>

      <div className="overflow-hidden border shadow-sm bg-surface border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  Order ID
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  Item
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  Price
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.type === "course" ? (
                        <FaPlay className="text-primary" />
                      ) : (
                        <FaBook className="text-primary" />
                      )}
                      <span className="text-sm">{order.item}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${order.price}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MyProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary">
          <FaEdit className="text-sm" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Picture Section */}
        <div className="p-6 text-center border bg-surface border-border rounded-xl">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="object-cover w-full h-full rounded-full shadow-lg"
            />
            <button className="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full bg-primary hover:bg-secondary">
              <FaCamera className="text-sm" />
            </button>
          </div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-text-secondary">{user.role}</p>
          <p className="mt-2 text-sm text-text-secondary">
            Member since {new Date(user.joined).toLocaleDateString()}
          </p>
        </div>

        {/* Profile Details */}
        <div className="p-6 border lg:col-span-2 bg-surface border-border rounded-xl">
          <h3 className="mb-6 text-lg font-semibold">Profile Information</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Full Name
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaUser className="text-primary" />
                  <span>{user.name}</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaEnvelope className="text-primary" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaPhone className="text-primary" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Country
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{user.country}</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  City
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{user.city}</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Website
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaGlobe className="text-primary" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              Bio
            </label>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm">{user.bio}</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              Address
            </label>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <FaMapMarkerAlt className="text-primary" />
              <span>{user.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return <MyCourses />;
      case "orders":
        return <MyOrders />;
      case "profile":
        return <MyProfile />;
      default:
        return <MyCourses />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <aside className="sticky top-0 flex flex-col h-screen p-6 border-r shadow-xl w-80 bg-surface border-border">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </main>
    </div>
  );
}
