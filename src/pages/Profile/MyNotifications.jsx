import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaCalendarAlt, FaUserShield, FaCheckDouble, FaEnvelope, FaShoppingCart, FaCheckCircle, FaClock } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const MyNotifications = () => {
  const { t } = useTranslation();
  const { getNotifications, getMyOrderMessages } = useApi();
  const [activeTab, setActiveTab] = useState("platform"); // "platform" | "orders"
  
  // Platform Notifications State
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

  // Order Messages State
  const [orderMessages, setOrderMessages] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [readOrderIds, setReadOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_krok_read_order_messages");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist read states and emit events
  useEffect(() => {
    localStorage.setItem("dr_krok_read_notifications", JSON.stringify(readIds));
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem("dr_krok_read_order_messages", JSON.stringify(readOrderIds));
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  }, [readOrderIds]);

  // Fetch Platform Notifications
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

  // Fetch Order Messages
  const fetchOrderMessages = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await getMyOrderMessages();
      if (res.success) {
        setOrderMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch order messages:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [getMyOrderMessages]);

  useEffect(() => {
    fetchNotifications();
    fetchOrderMessages();
  }, [fetchNotifications, fetchOrderMessages]);

  const markAllAsRead = () => {
    if (activeTab === "platform") {
      const allIds = notifications.map(n => n.id);
      setReadIds(prev => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = orderMessages.map(n => n.id);
      setReadOrderIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const markAsRead = (id) => {
    if (activeTab === "platform") {
      if (!readIds.includes(id)) setReadIds(prev => [...prev, id]);
    } else {
      if (!readOrderIds.includes(id)) setReadOrderIds(prev => [...prev, id]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const unreadPlatformCount = notifications.filter(n => !readIds.includes(n.id)).length;
  const unreadOrdersCount = orderMessages.filter(n => !readOrderIds.includes(n.id)).length;
  
  const currentUnreadCount = activeTab === "platform" ? unreadPlatformCount : unreadOrdersCount;
  const currentLoading = activeTab === "platform" ? loading : ordersLoading;

  return (
    <div className="pt-4 space-y-6 sm:p-6 animate-fadeIn">
      {/* Header and Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            {t("profile.notifications.title", "My Notifications")}
          </h2>
        </div>
        {currentUnreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl border border-primary/20 shadow-sm active:scale-95"
          >
            <FaCheckDouble />
            {t("profile.notifications.mark_as_read", "Mark all as read")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface/50 rounded-2xl border border-border w-full overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "platform"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          <FaBell />
          {t("profile.notifications.platform", "Platform Notifications")}
          {unreadPlatformCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "platform" ? "bg-white/20" : "bg-primary text-white"}`}>
              {unreadPlatformCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          <FaEnvelope />
          {t("profile.notifications.orders", "Order Messages")}
          {unreadOrdersCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "orders" ? "bg-white/20" : "bg-primary text-white"}`}>
              {unreadOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {currentLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : activeTab === "platform" ? (
        // PLATFORM NOTIFICATIONS TAB
        notifications.length > 0 ? (
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
                    
                    {!isRead && (
                      <div className="absolute top-8 right-8">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-[10deg] ${
                      isRead 
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                        : "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20"
                    }`}>
                      <FaBell className="text-2xl" />
                    </div>
                    
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
        )
      ) : (
        // ORDER MESSAGES TAB
        orderMessages.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {[...orderMessages].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at)).map((msg) => {
              const isRead = readOrderIds.includes(msg.id);
              return (
                <div
                  key={msg.id}
                  onClick={() => markAsRead(msg.id)}
                  className={`relative group p-1 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.01] cursor-pointer ${
                    isRead
                      ? "bg-gray-100/50 dark:bg-gray-800/50"
                      : "bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-transparent p-[2px]"
                  }`}
                >
                  <div className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.4rem] h-full w-full transition-all duration-500 ${
                    isRead
                      ? "bg-white/80 dark:bg-gray-900/80 border border-border/50"
                      : "bg-white dark:bg-gray-900 border-none shadow-xl shadow-orange-500/5"
                  }`}>
                    
                    {!isRead && (
                      <div className="absolute top-8 right-8">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-[10deg] ${
                      isRead 
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                        : "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                    }`}>
                      <FaEnvelope className="text-2xl" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Order Context Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border/40">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaShoppingCart className="text-orange-500" />
                            <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">Order #{msg.order?.order_id}</span>
                            <span className="px-2 py-0.5 text-[10px] bg-white dark:bg-gray-700 border border-border/50 rounded-full font-bold">
                              {msg.order?.order_type?.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className={`text-lg font-black transition-colors ${isRead ? "text-text-secondary opacity-80" : "text-text"}`}>
                            {msg.order?.title}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-lg text-primary">{msg.order?.total_price} ₴</span>
                          {msg.order?.payment_status === "success" || msg.order?.status === 1 ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                              <FaCheckCircle /> Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                              <FaClock /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Admin Message Content */}
                      <div className="pl-2 border-l-4 border-orange-500/40">
                        <p className={`text-base leading-relaxed font-bold ${
                          isRead ? "text-text-muted/60" : "text-text"
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                      
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border/40 text-xs font-bold text-text-secondary shadow-sm">
                          <FaCalendarAlt className="text-orange-500 opacity-70" />
                          {formatDate(msg.sent_at)}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/10 text-xs font-bold text-orange-600 shadow-sm">
                          <FaUserShield className="opacity-70" />
                          <span className="uppercase tracking-wider">
                            {msg.sender}
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
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
              <div className="relative p-8 rounded-full bg-white dark:bg-gray-800 shadow-xl">
                <FaEnvelope className="text-5xl text-gray-200 dark:text-gray-700" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-text mb-2">No Order Messages</h3>
            <p className="text-text-secondary font-medium opacity-60">You do not have any messages related to your orders.</p>
          </div>
        )
      )}
    </div>
  );
};

export default MyNotifications;
