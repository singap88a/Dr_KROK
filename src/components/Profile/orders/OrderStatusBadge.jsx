import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaClock,
  FaExclamationTriangle,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return <FaClock className="w-4 h-4 text-yellow-500" />;
    case "processing":
      return <FaExclamationTriangle className="w-4 h-4 text-blue-500" />;
    case "shipped":
      return <FaTruck className="w-4 h-4 text-purple-500" />;
    case "delivered":
    case "completed":
    case "paid":
      return <FaCheckCircle className="w-4 h-4 text-green-500" />;
    case "cancelled":
      return <FaTimesCircle className="w-4 h-4 text-red-500" />;
    default:
      return <FaExclamationTriangle className="w-4 h-4 text-gray-500" />;
  }
};

export default function OrderStatusBadge({ status, onClick }) {
  const { t } = useTranslation();

  const getStatusConfig = (st) => {
    const statusConfigs = {
      pending: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        icon: <FaClock className="w-4 h-4 text-yellow-500" />,
        label: t("orders.statuses.pending") || "Pending",
      },
      processing: {
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
        icon: <FaExclamationTriangle className="w-4 h-4 text-blue-500" />,
        label: t("orders.statuses.processing") || "Processing",
      },
      shipped: {
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
        icon: <FaTruck className="w-4 h-4 text-purple-500" />,
        label: t("orders.statuses.shipped") || "Shipped",
      },
      delivered: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.delivered") || "Delivered",
      },
      completed: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.completed") || "Completed",
      },
      paid: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.paid") || "Paid",
      },
      cancelled: {
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200",
        icon: <FaTimesCircle className="w-4 h-4 text-red-500" />,
        label: t("orders.statuses.cancelled") || "Cancelled",
      },
      payment: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        icon: <FaClock className="w-4 h-4 text-yellow-500" />,
        label: t("orders.statuses.payment") || "Payment Processing",
      },
    };

    return (
      statusConfigs[st] || {
        bgColor: "bg-gray-50",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
        icon: <FaExclamationTriangle className="w-4 h-4 text-gray-500" />,
        label: st || t("orders.statuses.unknown", "Unknown"),
      }
    );
  };

  const config = getStatusConfig(status);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.icon}
      <span className="text-sm font-medium capitalize">{config.label}</span>
    </div>
  );
}
