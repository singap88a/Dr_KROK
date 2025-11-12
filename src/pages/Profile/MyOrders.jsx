import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlay,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaTruck,
  FaBoxOpen,
  FaFilePdf,
  FaVideo,
  FaDownload,
} from "react-icons/fa";

// Custom Tooltip Component
const CustomTooltip = ({ text, children }) => {
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
          <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const getStatusIcon = (status) => {
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

// Professional Status Badge Component
const StatusBadge = ({ status, onClick }) => {
  const { t } = useTranslation();
  
  const getStatusConfig = (status) => {
    const statusConfigs = {
      pending: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        icon: <FaClock className="w-4 h-4 text-yellow-500" />,
        label: t("orders.statuses.pending") || "Pending"
      },
      processing: {
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
        icon: <FaExclamationTriangle className="w-4 h-4 text-blue-500" />,
        label: t("orders.statuses.processing") || "Processing"
      },
      shipped: {
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
        icon: <FaTruck className="w-4 h-4 text-purple-500" />,
        label: t("orders.statuses.shipped") || "Shipped"
      },
      delivered: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.delivered") || "Delivered"
      },
      completed: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.completed") || "Completed"
      },
      paid: {
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
        label: t("orders.statuses.paid") || "Paid"
      },
      cancelled: {
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200",
        icon: <FaTimesCircle className="w-4 h-4 text-red-500" />,
        label: t("orders.statuses.cancelled") || "Cancelled"
      },
      payment: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        icon: <FaClock className="w-4 h-4 text-yellow-500" />,
        label: t("orders.statuses.payment") || "Payment Processing"
      }
    };

    return statusConfigs[status] || {
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      icon: <FaExclamationTriangle className="w-4 h-4 text-gray-500" />,
      label: status || "Unknown"
    };
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
};

// Status Modal Component
const StatusModal = ({ isOpen, onClose, status, orderType, order }) => {
  if (!isOpen) return null;

  const getStatusMessage = () => {
    // Delivery book cases
    if (orderType === "delivery") {
      if (status === "paid") {
        return "This order has been completed and will be delivered to the shipping company at the specified branch and city within 48 hours";
      } else if (status === "completed") {
        return "Your order has reached the shipping company, you can go to receive it now";
      }
    }

    // PDF book case
    if (orderType === "pdf" && status === "completed") {
      return "Your order has been completed successfully and you can now download the file as PDF";
    }

    // Course cases
    if (orderType === "course" || orderType === "live_course") {
      if (status === "completed") {
        return "This course is now fully yours, you can watch it now";
      } else if (status === "pending") {
        return "This course is now yours, but the remaining course amount is pending";
      }
    }

    // Default cases
    switch (status) {
      case "pending":
        return "Your order has been received and is waiting for processing.";
      case "processing":
        return "Your order is being prepared for shipment.";
      case "shipped":
        return "Your order has been shipped and is on its way.";
      case "delivered":
      case "completed":
        return "Your order has been successfully delivered.";
      case "paid":
        return "Payment has been successfully processed.";
      case "cancelled":
        return "Your order has been cancelled.";
      case "payment":
        return "Payment is being processed.";
      default:
        return "Status information not available.";
    }
  };

  const getStatusConfig = (status) => {
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
    return configs[status] || { bg: "bg-gray-500", text: "text-white", iconColor: "text-white" };
  };

  const config = getStatusConfig(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg mx-4 transition-all duration-300 transform scale-100 bg-white shadow-2xl rounded-2xl animate-slideUp">
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
          {/* Status Message */}
          <div className="p-4 border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              {getStatusMessage()}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 font-semibold text-white transition-all duration-200 transform shadow-lg bg-primary rounded-xl hover:shadow-xl hover:scale-105"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const normalizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => {
    if (o && typeof o === "object" && "order_id" in o) {
      let type = "book";
      const lowerType = (o.type || "").toLowerCase();
      if (lowerType === "video_course") {
        type = "course";
      } else if (lowerType === "live_course") {
        type = "live_course";
      } else if (lowerType === "pdf") {
        type = "pdf";
      } else if (lowerType === "delivery") {
        type = "delivery";
      }
      return {
        id: o.order_id,
        item: o.title || "Order item",
        type,
        price: parseFloat(o.total_price) || 0,
        status: (o.status || "").toLowerCase(),
        date: o.created_at || new Date().toISOString(),
        image: o.image,
        file: o.file,
        city: o.city,
        branch: o.branch,
      };
    }
    if (o && typeof o === "object" && "total_price" in o) {
      return {
        id: o.id,
        item: o.client_name || "Book order",
        type: "book",
        price: parseFloat(o.total_price) || 0,
        status: (o.status || "").toLowerCase(),
        date: o.created_at || new Date().toISOString(),
      };
    }
    return {
      id: o.id,
      item: o.item,
      type: o.type || "book",
      price: o.price,
      status: (o.status || "").toLowerCase(),
      date: o.date,
      file: o.file,
      city: o.city,
      branch: o.branch,
    };
  });
};

const mapBackendStatus = (status) => status || "";

const MyOrders = ({ orders }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to format date as YYYY/MM/DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}/${month}/${day}`;
  };

  // Normalize orders first
  const normalizedOrders = normalizeOrders(orders);

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const filteredOrders =
    filterType === "all"
      ? normalizedOrders
      : normalizedOrders.filter((order) => {
          if (filterType === "book") return order.type === "book" || order.type === "pdf" || order.type === "delivery";
          if (filterType === "course") return order.type === "course" || order.type === "live_course";
          return true;
        });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aId = parseInt(a.id) || 0;
    const bId = parseInt(b.id) || 0;
    return bId - aId;
  });

  const numberedOrders = sortedOrders.map((order, index) => ({
    ...order,
    rowNumber: index + 1,
  }));

  return (
    <div className="pt-4 space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{t("orders.title")}</h2>
        <span className="text-sm text-gray-500">
          {t("orders.totalOrders", { count: filteredOrders.length })}
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 sm:gap-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
            filterType === "all"
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilterType("all")}
        >
          {t("orders.all")}
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
            filterType === "book"
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilterType("book")}
        >
          {t("orders.books")}
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
            filterType === "course"
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilterType("course")}
        >
          {t("orders.courses")}
        </button>
      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden overflow-hidden border shadow-sm md:block bg-surface border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-semibold text-left">
                  {t("orders.item")}
                </th>
                <th className="px-6 py-3 font-semibold text-left">
                  {t("orders.type")}
                </th>
                <th className="px-6 py-3 font-semibold text-left">
                  {t("orders.price")}
                </th>
                <th className="px-6 py-3 font-semibold text-left">
                  {t("orders.status")}
                </th>
                <th className="px-6 py-3 font-semibold text-left">
                  {t("orders.date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {normalizeOrders(numberedOrders).map((order) => {
                const normalizedStatus = mapBackendStatus(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.type === "course" ? (
                          <FaPlay className="text-primary" />
                        ) : order.type === "live_course" ? (
                          <FaVideo className="text-primary" />
                        ) : order.type === "pdf" ? (
                          <FaFilePdf className="text-primary" />
                        ) : order.type === "delivery" ? (
                          <FaTruck className="text-primary" />
                        ) : (
                          <FaBook className="text-primary" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm">{order.item}</span>
                          {order.type === "pdf" && order.file && (
                            <button
                              onClick={() => handleDownload(order.file)}
                              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                            >
                              <FaDownload className="w-3 h-3" />
                              Download File
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {order.type === "course"
                        ? t("orders.courses")
                        : order.type === "book"
                        ? t("orders.books")
                        : t(`orders.${order.type}`) || order.type}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${Number(order.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={normalizedStatus} 
                        onClick={() => handleStatusClick(order)}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.date)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {normalizeOrders(numberedOrders).map((order) => {
          const normalizedStatus = mapBackendStatus(order.status);

          return (
            <div
              key={order.id}
              className="p-4 bg-white border rounded-lg shadow-sm border-border dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <StatusBadge
                  status={normalizedStatus}
                  onClick={() => handleStatusClick(order)}
                />
              </div>

              <div className="flex items-center gap-3 mb-3">
                {order.type === "course" ? (
                  <FaPlay className="text-lg text-primary" />
                ) : order.type === "live_course" ? (
                  <FaVideo className="text-lg text-primary" />
                ) : order.type === "pdf" ? (
                  <FaFilePdf className="text-lg text-primary" />
                ) : order.type === "delivery" ? (
                  <FaTruck className="text-lg text-primary" />
                ) : (
                  <FaBook className="text-lg text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{order.item}</p>
                  {order.type === "pdf" && order.file && (
                    <button
                      onClick={() => handleDownload(order.file)}
                      className="flex items-center gap-1 mt-1 text-sm text-blue-500 hover:underline"
                    >
                      <FaDownload className="w-3 h-3" />
                      Download File
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">{t("orders.type")}:</span>{" "}
                  {order.type === "course"
                    ? t("orders.courses")
                    : order.type === "book"
                    ? t("orders.books")
                    : t(`orders.${order.type}`) || order.type}
                </p>
                <p>
                  <span className="font-medium">{t("orders.price")}:</span> $
                  {Number(order.price).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">{t("orders.date")}:</span>{" "}
                  {formatDate(order.date)}
                </p>
                {order.type === 'delivery' && order.city && order.branch && (
                  <p>
                    <span className="font-medium">{t("orders.delivery_info") || "Delivery to"}:</span>{" "}
                    {order.city} - {order.branch}
                  </p>
                )}
              </div>

              {order.type === "pdf" && order.file && (
                <div className="mt-3">
                  <button
                    onClick={() => handleDownload(order.file)}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <FaDownload className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={selectedOrder?.status}
        orderType={selectedOrder?.type}
        order={selectedOrder}
      />
    </div>
  );
};

export default MyOrders;