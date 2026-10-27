import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaCheckDouble, FaEnvelope } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

// Modular Subcomponents
import PlatformNotificationCard from "../../components/Profile/notifications/PlatformNotificationCard";
import OrderMessageNotificationCard from "../../components/Profile/notifications/OrderMessageNotificationCard";

export default function MyNotifications() {
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
    } catch {
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
    } catch {
      return [];
    }
  });

  // Persist read states and emit events
  useEffect(() => {
    localStorage.setItem("dr_krok_read_notifications", JSON.stringify(readIds));
    window.dispatchEvent(new CustomEvent("notifications-updated"));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem("dr_krok_read_order_messages", JSON.stringify(readOrderIds));
    window.dispatchEvent(new CustomEvent("notifications-updated"));
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
      const allIds = notifications.map((n) => n.id);
      setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = orderMessages.map((n) => n.id);
      setReadOrderIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const markAsRead = (id) => {
    if (activeTab === "platform") {
      if (!readIds.includes(id)) setReadIds((prev) => [...prev, id]);
    } else {
      if (!readOrderIds.includes(id)) setReadOrderIds((prev) => [...prev, id]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const unreadPlatformCount = notifications.filter((n) => !readIds.includes(n.id)).length;
  const unreadOrdersCount = orderMessages.filter((n) => !readOrderIds.includes(n.id)).length;

  const currentUnreadCount = activeTab === "platform" ? unreadPlatformCount : unreadOrdersCount;
  const currentLoading = activeTab === "platform" ? loading : ordersLoading;

  return (
    <div className="pt-4 space-y-6 sm:p-6 animate-fadeIn pb-12">
      {/* Header and Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
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
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "platform" ? "bg-white/20" : "bg-primary text-white"
              }`}
            >
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
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "orders" ? "bg-white/20" : "bg-primary text-white"
              }`}
            >
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
        notifications.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {[...notifications]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((notification) => (
                <PlatformNotificationCard
                  key={notification.id}
                  notification={notification}
                  isRead={readIds.includes(notification.id)}
                  markAsRead={markAsRead}
                  formatDate={formatDate}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-gray-900/50 border-2 border-dashed rounded-[3rem] border-border/60">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative p-8 rounded-full bg-white dark:bg-gray-800 shadow-xl">
                <FaBell className="text-5xl text-gray-200 dark:text-gray-700" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-text mb-2">
              {t("profile.notifications.no_notifications")}
            </h3>
            <p className="text-text-secondary font-medium opacity-60">
              {t("profile.notifications.no_notifications_desc")}
            </p>
          </div>
        )
      ) : orderMessages.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {[...orderMessages]
            .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
            .map((msg) => (
              <OrderMessageNotificationCard
                key={msg.id}
                msg={msg}
                isRead={readOrderIds.includes(msg.id)}
                markAsRead={markAsRead}
                formatDate={formatDate}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-gray-900/50 border-2 border-dashed rounded-[3rem] border-border/60">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
            <div className="relative p-8 rounded-full bg-white dark:bg-gray-800 shadow-xl">
              <FaEnvelope className="text-5xl text-gray-200 dark:text-gray-700" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text mb-2">
            {t("profile.notifications.no_orders_messages", "No order messages")}
          </h3>
          <p className="text-text-secondary font-medium opacity-60">
            {t("profile.notifications.no_orders_messages_desc", "You haven't received any messages regarding your orders yet.")}
          </p>
        </div>
      )}
    </div>
  );
}
