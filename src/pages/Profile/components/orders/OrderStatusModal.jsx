import React from "react";
import { useTranslation } from "react-i18next";
import { FaTimesCircle } from "react-icons/fa";
import { getStatusIcon } from "./OrderStatusBadge";

export default function OrderStatusModal({ isOpen, onClose, status, orderType, order }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const getStatusMessage = () => {
    // Delivery book cases
    if (orderType === "delivery") {
      if (status === "paid") {
        return t(
          "orders.messages.delivery_paid",
          "This order has been completed and will be delivered to the shipping company at the specified branch and city within 48 hours"
        );
      } else if (status === "completed") {
        return t(
          "orders.messages.delivery_completed",
          "Your order has reached the shipping company, you can go to receive it now"
        );
      }
    }

    // PDF book case
    if (orderType === "pdf" && status === "completed") {
      return t(
        "orders.messages.pdf_completed",
        "Your order has been completed successfully and you can now download the file as PDF"
      );
    }

    // Course cases
    if (orderType === "course" || orderType === "live_course") {
      if (status === "completed") {
        return t(
          "orders.messages.course_completed",
          "This course is now fully yours, you can watch it now"
        );
      } else if (status === "pending") {
        return t(
          "orders.messages.course_pending",
          "This course is now yours, but the remaining course amount is pending"
        );
      }
    }

    // Default cases
    switch (status) {
      case "pending":
        return t("orders.statuses.pending_desc", "Your order has been received and is waiting for processing.");
      case "processing":
        return t("orders.statuses.processing_desc", "Your order is being prepared for shipment.");
      case "shipped":
        return t("orders.statuses.shipped_desc", "Your order has been shipped and is on its way.");
      case "delivered":
      case "completed":
        return t("orders.statuses.delivered_desc", "Your order has been successfully delivered.");
      case "paid":
        return t("orders.statuses.paid_desc", "Payment has been successfully processed.");
      case "cancelled":
        return t("orders.statuses.cancelled_desc", "Your order has been cancelled.");
      case "payment":
        return t("orders.statuses.payment_desc", "Payment is being processed.");
      default:
        return t("orders.statuses.unavailable", "Status information not available.");
    }
  };

  const getStatusConfig = (st) => {
    const configs = {
      pending: { bg: "bg-yellow-500", text: "text-white", iconColor: "text-white" },
      processing: { bg: "bg-blue-500", text: "text-white", iconColor: "text-white" },
      shipped: { bg: "bg-purple-500", text: "text-white", iconColor: "text-white" },
      delivered: { bg: "bg-green-500", text: "text-white", iconColor: "text-white" },
      completed: { bg: "bg-green-500", text: "text-white", iconColor: "text-white" },
      paid: { bg: "bg-green-500", text: "text-white", iconColor: "text-white" },
      cancelled: { bg: "bg-red-500", text: "text-white", iconColor: "text-white" },
      payment: { bg: "bg-yellow-500", text: "text-white", iconColor: "text-white" },
    };
    return configs[st] || { bg: "bg-gray-500", text: "text-white", iconColor: "text-white" };
  };

  const config = getStatusConfig(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg mx-4 transition-all duration-300 transform scale-100 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl animate-slideUp">
        {/* Header with gradient */}
        <div className={`relative ${config.bg} rounded-t-2xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-lg bg-opacity-20">
                {React.cloneElement(getStatusIcon(status), { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <h3 className="text-xl font-bold capitalize">{status}</h3>
                <p className="text-sm opacity-90">{order?.item}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="p-4 border border-blue-200 dark:border-blue-900/40 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {getStatusMessage()}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 font-semibold text-white transition-all duration-200 transform shadow-lg bg-primary rounded-xl hover:shadow-xl hover:scale-105"
            >
              {t("common.got_it", "Got it")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
