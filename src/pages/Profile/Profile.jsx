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

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaStar,
  FaExclamationTriangle,
  FaTimes,
  FaGraduationCap,
  FaHeart,
  FaBell,
  FaBook,
  FaBuilding,
} from "react-icons/fa";

import MyProfile from "./MyProfile";
import { useUser } from "../../context/UserContext";
import MyOrders from "./MyOrders";
import MyCourses from "./MyCourses";
import MyFavorites from "./MyFavorites";
import MyRatings from "./MyRatings";
import MyNotifications from "./MyNotifications";
import MyMaterials from "./MyMaterials";
import UniversityStudents from "../UniversityRepresentative/UniversityStudents";
import LogoutConfirmModal from "../../components/Modals/LogoutConfirmModal";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ProfileCompletionModal from "./ProfileCompletionModal";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateUser, logout, userData } = useUser();
  const { getOrders, getMyCourses, getMyProfile, getNotifications, request } = useApi();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const selectedRole = user?.role || userData?.role || localStorage.getItem("DR_KROK_selected_role");
  const isRepRole = selectedRole === "university_rep" || selectedRole === "university_representative";

  // Fetch notifications count
  const updateNotificationsCount = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        const notifications = res.data.data || [];
        const savedReadIds = JSON.parse(localStorage.getItem("dr_krok_read_notifications") || "[]");
        const unreadCount = notifications.filter(n => !savedReadIds.includes(n.id)).length;
        setUnreadNotificationsCount(unreadCount);
      }
    } catch (e) {
      console.warn("Failed to fetch notification count", e);
    }
  }, [getNotifications]);

  useEffect(() => {
    updateNotificationsCount();
    
    // Listen for notification updates
    const handleUpdate = () => updateNotificationsCount();
    window.addEventListener('notifications-updated', handleUpdate);
    return () => window.removeEventListener('notifications-updated', handleUpdate);
  }, [updateNotificationsCount]);

  const isProfileIncomplete = (u) => {
    return !u?.phone || (!u?.university_id && !u?.university?.id) || !u?.college_year;
  };

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();

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
          
          const shouldShowModal = localStorage.getItem('DR_KROK_show_completion_modal') === 'true';
          if (shouldShowModal && isProfileIncomplete(full)) {
            setShowCompletionModal(true);
          }
          // Clear the flag immediately so it doesn't show again on refresh or revisit
          localStorage.removeItem('DR_KROK_show_completion_modal');
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
  }, [getMyProfile]);

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
        setOrders(ordersData.orders || ordersData);
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
    ...(selectedRole === "university_rep" || selectedRole === "university_representative" ? [
      {
        id: "university_students",
        label: t("universityRepresentative.studentsList", "My University Students"),
        icon: FaGraduationCap,
      }
    ] : []),
    { id: "materials", label: t('profile.sidebar.myMaterials', 'My Material'), icon: FaBook },
    { id: "orders", label: t('profile.sidebar.myOrders'), icon: FaShoppingCart },
    { id: "favorites", label: t('profile.sidebar.myFavorites'), icon: FaHeart },
    { id: "ratings", label: t('profile.sidebar.myRatings'), icon: FaStar },
    { id: "notifications", label: t('profile.sidebar.myNotifications', 'My Notifications'), icon: FaBell, badge: unreadNotificationsCount },
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
    <div className="h-full flex flex-col">
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (!e.currentTarget.src.includes('/user.png')) {
                    e.currentTarget.src = '/user.png';
                  }
                }}
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
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.id === "logout") {
                      handleLogout();
                      return;
                    }
                    if (item.id === "university_students") {
                      setActiveTab(item.id);
                      return;
                    }
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-lg"
                      : "hover:bg-surface text-text-secondary hover:text-text"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Stats Section */}
      <div className="p-4 mt-auto border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center justify-center p-2 transition-colors border rounded-lg bg-surface/40 border-border/50 hover:bg-surface">
            <div className="flex items-center gap-1.5 mb-1">
              <FaGraduationCap className="text-sm text-primary/80" />
              <span className="text-lg font-bold text-primary leading-none">{user?.stats?.courses || 0}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide font-medium text-text-secondary">{t('profile.stats.courses')}</div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 transition-colors border rounded-lg bg-surface/40 border-border/50 hover:bg-surface">
            <div className="flex items-center gap-1.5 mb-1">
              <FaShoppingCart className="text-sm text-primary/80" />
              <span className="text-lg font-bold text-primary leading-none">{user?.stats?.orders || 0}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide font-medium text-text-secondary">{t('profile.stats.orders')}</div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 transition-colors border rounded-lg bg-surface/40 border-border/50 hover:bg-surface">
            <div className="flex items-center gap-1.5 mb-1">
              <FaStar className="text-sm text-yellow-500/90" />
              <span className="text-lg font-bold text-primary leading-none">{user?.stats?.rating || 0}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide font-medium text-text-secondary">{t('profile.stats.rating')}</div>
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
            <p className="text-text-secondary">{t("profile.loading")}</p>
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
            <h3 className="mb-2 text-lg font-semibold">{t("profile.error_loading")}</h3>
            <p className="text-text-secondary">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              {t("common.retry")}
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
      case "materials":
        return <MyMaterials user={user} setActiveTab={setActiveTab} setForceEdit={setForceEdit} />;
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
      case "notifications":
        return <MyNotifications />;
      case "university_students":
        return <UniversityStudents />;
      case "profile":
        return <MyProfile user={user} initialIsEditing={forceEdit} onProfileUpdate={(updated)=>{
          const merged = {
            ...updated,
            stats: user?.stats || { courses: 0, orders: 0, rating: 0 },
          };
          setUser(merged);
          updateUser((prev)=>({ ...(prev||{}), ...merged }));
          setForceEdit(false);
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
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed left-0 z-30 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 shadow-lg top-20 rounded-br-2xl bg-gradient-to-r from-primary to-primary hover:scale-105 hover:shadow-2xl lg:hidden backdrop-blur-md bg-opacity-80"
      >
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
      <aside className="sticky top-0 flex-col hidden min-h-screen p-6 border-r shadow-xl rounded-br-xl lg:flex w-80 bg-surface border-border">
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

      <ProfileCompletionModal 
        isOpen={showCompletionModal}
        onEdit={() => {
          setForceEdit(true);
          setShowCompletionModal(false);
          setActiveTab("profile");
        }}
      />
    </div>
  );
}
