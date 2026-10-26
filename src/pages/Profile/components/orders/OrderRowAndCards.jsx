import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlay,
  FaBook,
  FaTruck,
  FaFilePdf,
  FaVideo,
  FaDownload,
  FaCommentDots,
  FaGem,
} from "react-icons/fa";
import OrderStatusBadge from "./OrderStatusBadge";

export const CustomTooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 mb-2 text-sm text-white transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-lg bottom-full left-1/2 max-w-[90vw] overflow-wrap-break-word whitespace-normal max-h-32 overflow-y-auto">
          {text}
          <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-gray-800" />
        </div>
      )}
    </div>
  );
};

export const getOrderTypeIcon = (type) => {
  if (["video_course", "course", "center_course"].includes(type)) {
    return <FaPlay className="text-primary" />;
  }
  if (type === "live_course") {
    return <FaVideo className="text-primary" />;
  }
  if (type === "pdf") {
    return <FaFilePdf className="text-primary" />;
  }
  if (type === "delivery") {
    return <FaTruck className="text-primary" />;
  }
  return <FaBook className="text-primary" />;
};

export function OrderDesktopRow({
  order,
  truncateText,
  formatDate,
  handleDownload,
  handleStatusClick,
  handleMessagesClick,
  readMessageIds,
}) {
  const { t } = useTranslation();
  const unreadCount = (order.messages || []).filter((m) => !readMessageIds.includes(m.id)).length;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {getOrderTypeIcon(order.type)}
          <div className="flex flex-col">
            <CustomTooltip text={order.item}>
              <span className="text-sm font-medium">{truncateText(order.item)}</span>
            </CustomTooltip>
            {order.type === "pdf" && order.file && (
              <button
                onClick={() => handleDownload(order.file)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5"
              >
                <FaDownload className="w-3 h-3" />
                {t("common.download_file", "Download File")}
              </button>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 capitalize">{order.type.replace("_", " ")}</td>
      <td className="px-6 py-4 font-medium">
        <div className="flex flex-col gap-1">
          <span>₴{Number(order.price).toFixed(2)}</span>
          {Number(order.points_used) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
              <FaGem className="text-[9px]" />
              -{Number(order.points_discount).toFixed(2)}₴ ({order.points_used} {t("points.pts", "pts")})
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <OrderStatusBadge
            status={order.status}
            onClick={() => handleStatusClick(order)}
          />

          <div className="relative">
            <button
              onClick={() => handleMessagesClick(order)}
              className="p-2 transition-all rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 text-primary hover:scale-110 active:scale-95"
            >
              <FaCommentDots className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-bounce-slow">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(order.date)}</td>
    </tr>
  );
}

export function OrderMobileCard({
  order,
  truncateText,
  formatDate,
  handleDownload,
  handleStatusClick,
  handleMessagesClick,
  readMessageIds,
}) {
  const { t } = useTranslation();
  const unreadCount = (order.messages || []).filter((m) => !readMessageIds.includes(m.id)).length;

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm border-border dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <OrderStatusBadge
          status={order.status}
          onClick={() => handleStatusClick(order)}
        />

        <div className="relative">
          <button
            onClick={() => handleMessagesClick(order)}
            className="p-2.5 transition-all rounded-full bg-blue-50 dark:bg-gray-700 text-primary hover:scale-110 active:scale-95"
          >
            <FaCommentDots className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-bounce-slow">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {getOrderTypeIcon(order.type)}
        <div className="flex-1">
          <p className="font-semibold text-gray-800 dark:text-white">
            {truncateText(order.item, 6)}
          </p>
          {order.type === "pdf" && order.file && (
            <button
              onClick={() => handleDownload(order.file)}
              className="flex items-center gap-1 mt-1 text-sm text-blue-500 hover:underline"
            >
              <FaDownload className="w-3 h-3" />
              {t("common.download_file", "Download File")}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 text-sm border-t border-border">
        <div>
          <span className="font-semibold text-gray-800 dark:text-white">
            ₴{Number(order.price).toFixed(2)}
          </span>
          {Number(order.points_used) > 0 && (
            <span className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              -{Number(order.points_discount).toFixed(2)}₴ ({order.points_used} {t("points.pts", "pts")})
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">{formatDate(order.date)}</span>
      </div>
    </div>
  );
}
