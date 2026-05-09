import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaCalendarAlt, FaUserShield, FaCheckDouble } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const MyNotifications = () => {
  const { t } = useTranslation();
  const { getNotifications } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_krok_read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dr_krok_read_notifications", JSON.stringify(readIds));
    // Emit event for sidebar badge update
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  }, [readIds]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [getNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-6 sm:p-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            {t("profile.notifications.title")}
          </h2>
          <p className="text-sm font-medium text-text-secondary opacity-70 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            {notifications.length} {t("profile.notifications.total", { defaultValue: "notifications" })}
          </p>
        </div>
        {notifications.some(n => !readIds.includes(n.id)) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl border border-primary/20 shadow-sm active:scale-95"
          >
            <FaCheckDouble />
            {t("profile.notifications.mark_as_read")}
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {[...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((notification) => {
            const isRead = readIds.includes(notification.id);
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`relative group p-1 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.01] cursor-pointer ${
                  isRead
                    ? "bg-gray-100/50 dark:bg-gray-800/50"
                    : "bg-gradient-to-r from-primary/30 via-primary/10 to-transparent p-[2px]"
                }`}
              >
                <div className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.4rem] h-full w-full transition-all duration-500 ${
                  isRead
                    ? "bg-white/80 dark:bg-gray-900/80 border border-border/50"
                    : "bg-white dark:bg-gray-900 border-none shadow-xl shadow-primary/5"
                }`}>
                  
                  {/* Status Indicator */}
                  {!isRead && (
                    <div className="absolute top-8 right-8">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                  )}
                  
                  {/* Icon Section */}
                  <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-[10deg] ${
                    isRead 
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                      : "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20"
                  }`}>
                    <FaBell className="text-2xl" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className={`text-xl font-black transition-colors ${
                        isRead ? "text-text-secondary opacity-60" : "text-text"
                      }`}>
                        {notification.title}
                      </h4>
                      {!isRead && (
                        <span className="self-start px-4 py-1.5 text-[10px] font-black uppercase bg-primary text-white rounded-full tracking-[0.1em] shadow-lg shadow-primary/20">
                          {t("profile.notifications.new")}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-base leading-relaxed font-medium ${
                      isRead ? "text-text-muted/60" : "text-text-secondary"
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border/40 text-xs font-bold text-text-secondary shadow-sm">
                        <FaCalendarAlt className="text-primary opacity-70" />
                        {formatDate(notification.created_at)}
                      </div>
                      
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 text-xs font-bold text-primary shadow-sm">
                        <FaUserShield className="opacity-70" />
                        <span className="uppercase tracking-wider">
                          {notification.sent_by === "admin" ? t("profile.notifications.admin") : notification.sent_by}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-gray-900/50 border-2 border-dashed rounded-[3rem] border-border/60">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative p-8 rounded-full bg-white dark:bg-gray-800 shadow-xl">
              <FaBell className="text-5xl text-gray-200 dark:text-gray-700" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mb-2">{t("profile.notifications.no_notifications")}</h3>
          <p className="text-text-secondary font-medium opacity-60">{t("profile.notifications.no_notifications_desc")}</p>
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
