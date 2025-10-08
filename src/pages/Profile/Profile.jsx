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
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  FaHeart,
} from "react-icons/fa";

import MyProfile from "./MyProfile";
import { useUser } from "../../context/UserContext";
import MyOrders from "./MyOrders";
import MyCourses from "./MyCourses";
import MyFavorites from "./MyFavorites";
import MyRatings from "./MyRatings";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Profile() {
  const location = useLocation();
  const { t } = useTranslation();
  const { updateUser, logout } = useUser();
  const { getOrders, getMyCourses } = useApi();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        const response = await fetch("https://dr-krok.com/api/profile/get-my-profile", {
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

  // Fetch enrolled courses when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      const fetchEnrolledCourses = async () => {
        try {
          setCoursesLoading(true);
          const courses = await getMyCourses();
          setEnrolledCourses(courses);
        } catch (err) {
          console.error("Failed to fetch enrolled courses:", err);
          toast.error("Failed to load enrolled courses");
        } finally {
          setCoursesLoading(false);
        }
      };
      fetchEnrolledCourses();
    }
  }, [activeTab, getMyCourses]);

  // Load real orders for the logged-in user
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await getOrders();
        setOrders(ordersData.orders || ordersData); // handle response shape with orders array
      } catch (e) {
        console.warn("Failed to load orders", e);
      }
    };
    loadOrders();
  }, [getOrders]);

  // Set active tab from location state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const menuItems = [
    { id: "profile", label: t('profile.sidebar.myProfile'), icon: FaUser },
    { id: "courses", label: t('profile.sidebar.myCourses'), icon: FaGraduationCap },
    { id: "orders", label: t('profile.sidebar.myOrders'), icon: FaShoppingCart },
    { id: "favorites", label: t('profile.sidebar.myFavorites'), icon: FaHeart },
    { id: "ratings", label: t('profile.sidebar.myRatings'), icon: FaStar },
    { id: "logout", label: t('profile.sidebar.logout'), icon: FaSignOutAlt },
  ];

  const handleLogout = () => {
    setLogoutModalOpen(true);
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
      {/* Close Button for Mobile */}
      <div className="flex justify-end p-4 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-text-secondary hover:text-text"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>
      {/* User Profile Section */}
      <div className="px-6 pt-10 pb-6 text-center border-b border-border">
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
                src={user.imageprofile || user.avatar || "/user.png"}
                alt={user.name}
                className="object-cover w-full h-full rounded-full shadow-lg bg-primary"
                onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/user.png'; }}
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
                    setIsMobileMenuOpen(false);
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
            <div className="text-xs text-text-secondary">{t('profile.stats.courses')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user?.stats?.orders || 0}
            </div>
            <div className="text-xs text-text-secondary">{t('profile.stats.orders')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {user?.stats?.rating || 0}
            </div>
            <div className="text-xs text-text-secondary">{t('profile.stats.rating')}</div>
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
        return coursesLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <MyCourses enrolledCourses={enrolledCourses} renderStars={renderStars} />
        );
      case "orders":
        return <MyOrders orders={orders} />;
      case "favorites":
        return <MyFavorites />;
      case "ratings":
        return <MyRatings user={user} onRatingsUpdate={(updatedRatings) => {
          setUser(prev => ({
            ...prev,
            ratings: updatedRatings
          }));
        }} />;
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
        return coursesLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <MyCourses enrolledCourses={enrolledCourses} renderStars={renderStars} />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text">
      <ToastContainer />
      {/* Mobile Menu Button */}
<button
  onClick={() => setIsMobileMenuOpen(true)}
  className="fixed left-0 z-50 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 shadow-lg top-20 rounded-r-2xl bg-gradient-to-r from-primary to-primary hover:scale-105 hover:shadow-2xl lg:hidden backdrop-blur-md bg-opacity-80"
>
  {/* أيقونة تدل على القائمة الجانبية */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h10M4 18h16"
    />
  </svg>
</button>




      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 z-50 h-full border-r shadow-xl w-80 bg-surface border-border">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sticky top-0 flex-col hidden h-screen p-6 border-r shadow-xl lg:flex w-80 bg-surface border-border">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-14 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </main>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          window.location.href = "/";
        }}
      />
    </div>
  );
}
