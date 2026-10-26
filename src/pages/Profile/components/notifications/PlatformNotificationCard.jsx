import React from "react";
import { FaBell, FaCalendarAlt, FaUserShield } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function PlatformNotificationCard({
  notification,
  isRead,
  markAsRead,
  formatDate,
}) {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => markAsRead(notification.id)}
      className={`relative group p-1 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.01] cursor-pointer ${
        isRead
          ? "bg-gray-100/50 dark:bg-gray-800/50"
          : "bg-gradient-to-r from-primary/30 via-primary/10 to-transparent p-[2px]"
      }`}
    >
      <div
        className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.4rem] h-full w-full transition-all duration-500 ${
          isRead
            ? "bg-white/80 dark:bg-gray-900/80 border border-border/50"
            : "bg-white dark:bg-gray-900 border-none shadow-xl shadow-primary/5"
        }`}
      >
        {!isRead && (
          <div className="absolute top-8 right-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          </div>
        )}

        <div
          className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-[10deg] ${
            isRead
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800"
              : "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20"
          }`}
        >
          <FaBell className="text-2xl" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4
              className={`text-xl font-black transition-colors ${
                isRead ? "text-text-secondary opacity-60" : "text-text"
              }`}
            >
              {notification.title}
            </h4>
            {!isRead && (
              <span className="self-start px-4 py-1.5 text-[10px] font-black uppercase bg-primary text-white rounded-full tracking-[0.1em] shadow-lg shadow-primary/20">
                {t("profile.notifications.new")}
              </span>
            )}
          </div>

          <p
            className={`text-base leading-relaxed font-medium ${
              isRead ? "text-text-muted/60" : "text-text-secondary"
            }`}
          >
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
                {notification.sent_by === "admin"
                  ? t("profile.notifications.admin")
                  : notification.sent_by}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
