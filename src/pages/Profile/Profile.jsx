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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

import MyProfile from "./MyProfile";
import { useUser } from "../../context/UserContext";
import MyOrders from "./MyOrders";
import MyCourses from "./MyCourses";

export default function Profile() {
  const { updateUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("userToken");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await fetch("https://dr-krok.hudurly.com/api/profile/get-my-profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          const full = {
            ...data.data,
            stats: {
              courses: data.data.courses_count || 0,
              orders: data.data.orders_count || 0,
              rating: data.data.rating || 0,
            },
          };
          setUser(full);
          updateUser((prev) => ({ ...(prev || {}), ...full }));
        } else {
          setError(data.message || "Failed to load profile");
          toast.error(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Network error occurred");
        toast.error("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        { id: "profile", label: "My Profile", icon: FaUser },

    { id: "courses", label: "My Courses", icon: FaGraduationCap },
    { id: "orders", label: "My Orders", icon: FaShoppingCart },
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
      {/* Mobile Header - Not implemented */}
      {/* <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-surface"
        >
          <FaTimes className="text-xl" />
        </button>
      </div> */}

      {/* User Profile Section */}
      <div className="p-6 text-center border-b border-border">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-24 h-4 mx-auto mb-2 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-32 h-3 mx-auto bg-gray-300 rounded animate-pulse"></div>
          </div>
        ) : user ? (
          <>
            <div className="relative w-20 h-20 mx-auto mb-4">
              <img
                src={user.imageprofile || user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                alt={user.name}
                className="object-cover w-full h-full rounded-full shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-text-secondary">{user.email}</p>
 
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-full"></div>
            <div className="w-24 h-4 mx-auto mb-2 bg-gray-300 rounded"></div>
            <div className="w-32 h-3 mx-auto bg-gray-300 rounded"></div>
          </div>
        )}
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
              {user?.stats?.courses || 0}
            </div>
            <div className="text-xs text-text-secondary">Courses</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user?.stats?.orders || 0}
            </div>
            <div className="text-xs text-text-secondary">Orders</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user?.stats?.rating || 0}
            </div>
            <div className="text-xs text-text-secondary">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <FaExclamationTriangle className="w-full h-full" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Error Loading Profile</h3>
            <p className="text-text-secondary">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "courses":
        return <MyCourses enrolledCourses={enrolledCourses} renderStars={renderStars} />;
      case "orders":
        return <MyOrders orders={orders} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />;
      case "profile":
        return <MyProfile user={user} onProfileUpdate={(updated)=>{
          const merged = {
            ...updated,
            stats: user?.stats || { courses: 0, orders: 0, rating: 0 },
          };
          setUser(merged);
          updateUser((prev)=>({ ...(prev||{}), ...merged }));
        }} />;
      default:
        return <MyCourses enrolledCourses={enrolledCourses} renderStars={renderStars} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text">
      <ToastContainer />
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
