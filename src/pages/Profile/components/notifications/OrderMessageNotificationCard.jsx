import React from "react";
import {
  FaEnvelope,
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function OrderMessageNotificationCard({
  msg,
  isRead,
  markAsRead,
  formatDate,
}) {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => markAsRead(msg.id)}
      className={`relative group p-1 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.01] cursor-pointer ${
        isRead
          ? "bg-gray-100/50 dark:bg-gray-800/50"
          : "bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-transparent p-[2px]"
      }`}
    >
      <div
        className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.4rem] h-full w-full transition-all duration-500 ${
          isRead
            ? "bg-white/80 dark:bg-gray-900/80 border border-border/50"
            : "bg-white dark:bg-gray-900 border-none shadow-xl shadow-orange-500/5"
        }`}
      >
        {!isRead && (
          <div className="absolute top-8 right-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
            </span>
          </div>
        )}

        <div
          className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-[10deg] ${
            isRead
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800"
              : "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
          }`}
        >
          <FaEnvelope className="text-2xl" />
        </div>

        <div className="flex-1 space-y-4">
          {/* Order Context Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-orange-500" />
                <span className="text-xs font-bold tracking-wider text-text-secondary uppercase">
                  Order #{msg.order?.order_id}
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-white dark:bg-gray-700 border border-border/50 rounded-full font-bold">
                  {msg.order?.order_type?.replace("_", " ")}
                </span>
              </div>
              <h4
                className={`text-lg font-black transition-colors ${
                  isRead ? "text-text-secondary opacity-80" : "text-text"
                }`}
              >
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
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                  <FaClock /> Pending
                </span>
              )}
            </div>
          </div>

          <p className="text-base font-medium text-text leading-relaxed">{msg.message}</p>

          {/* Payment Link Button if available */}
          {msg.payment_link && (
            <div className="pt-1">
              <a
                href={msg.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <FaShoppingCart />
                <span>
                  {t("orders.messages.pay_now", "Pay Now")}{" "}
                  {msg.payment_amount ? `(${msg.payment_amount} ₴)` : ""}
                </span>
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
            <FaCalendarAlt className="opacity-70" />
            <span>{formatDate(msg.sent_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
