import React, { useState, useEffect, useRef } from "react";
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
  FaCommentDots,
  FaBell,
  FaShoppingCart,
  FaList,
  FaMapMarkerAlt,
  FaFileAlt,
  FaTshirt,
  FaStethoscope,
  FaChevronDown,
  FaGem,
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
      label: status || t("orders.statuses.unknown", "Unknown")
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
  const { t } = useTranslation();
  if (!isOpen) return null;

  const getStatusMessage = () => {
    // Delivery book cases
    if (orderType === "delivery") {
      if (status === "paid") {
        return t("orders.messages.delivery_paid", "This order has been completed and will be delivered to the shipping company at the specified branch and city within 48 hours");
      } else if (status === "completed") {
        return t("orders.messages.delivery_completed", "Your order has reached the shipping company, you can go to receive it now");
      }
    }

    // PDF book case
    if (orderType === "pdf" && status === "completed") {
      return t("orders.messages.pdf_completed", "Your order has been completed successfully and you can now download the file as PDF");
    }

    // Course cases
    if (orderType === "course" || orderType === "live_course") {
      if (status === "completed") {
        return t("orders.messages.course_completed", "This course is now fully yours, you can watch it now");
      } else if (status === "pending") {
        return t("orders.messages.course_pending", "This course is now yours, but the remaining course amount is pending");
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
              {t("common.got_it", "Got it")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesModal = ({ isOpen, onClose, order, readMessageIds, setReadMessageIds }) => {
  const { t } = useTranslation();
  if (!isOpen || !order) return null;

  const messages = [...(order.messages || [])].sort((a, b) => 
    new Date(b.sent_at) - new Date(a.sent_at)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg mx-4 transition-all duration-300 transform scale-100 bg-white shadow-2xl rounded-2xl animate-slideUp">
        {/* Header */}
        <div className="relative p-6 text-white bg-primary rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-lg bg-opacity-20">
                <FaCommentDots className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t("orders.messages.title", "Order Messages")}</h3>
                <p className="text-sm opacity-90">{order.item}</p>
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
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-4 rounded-xl border-l-4 shadow-sm ${
                  readMessageIds.includes(msg.id) 
                    ? "bg-gray-50 border-gray-300" 
                    : "bg-blue-50 border-blue-500 animate-pulse-subtle"
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{msg.message}</p>
                {msg.payment_link && (
                  <div className="mt-3 mb-1">
                    <a
                      href={msg.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaShoppingCart />
                      {t("orders.messages.pay_now", "Pay Now")} {msg.payment_amount ? `(${msg.payment_amount} ₴)` : ""}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(msg.sent_at).toLocaleString()}
                  </span>
                  {!readMessageIds.includes(msg.id) && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full uppercase font-bold">
                      {t("common.new", "New")}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <FaCommentDots className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">{t("orders.messages.no_messages", "No messages for this order yet.")}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 font-semibold text-white transition-all duration-200 transform shadow-md bg-primary rounded-xl hover:shadow-lg hover:scale-[1.02]"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStatusFromBackend = (status) => {
  const s = String(status);
  // Map numeric statuses from backend to frontend string statuses
  if (s === "1") return "completed";
  if (s === "0") return "pending";
  return s.toLowerCase();
};

const normalizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => {
    if (o && typeof o === "object" && "order_id" in o) {
      const type = (o.type || "book").toLowerCase();
      return {
        id: o.order_id,
        item: o.title || "Order item",
        type,
        price: parseFloat(o.total_price) || 0,
        status: mapStatusFromBackend(o.status),
        date: o.created_at || new Date().toISOString(),
        image: o.image,
        file: o.file,
        city: o.city,
        branch: o.branch,
        messages: o.messages || [],
        points_used: o.points_used || 0,
        points_discount: o.points_discount || 0,
      };
    }
    if (o && typeof o === "object" && "total_price" in o) {
      return {
        id: o.id,
        item: o.client_name || "Book order",
        type: "book",
        price: parseFloat(o.total_price) || 0,
        status: mapStatusFromBackend(o.status),
        date: o.created_at || new Date().toISOString(),
        messages: o.messages || [],
        points_used: o.points_used || 0,
        points_discount: o.points_discount || 0,
      };
    }
    return {
      id: o.id,
      item: o.item,
      type: o.type || "book",
      price: o.price,
      status: mapStatusFromBackend(o.status),
      date: o.date,
      file: o.file,
      city: o.city,
      branch: o.branch,
      messages: o.messages || [],
      points_used: o.points_used || 0,
      points_discount: o.points_discount || 0,
    };
  });
};

const mapBackendStatus = (status) => status || "";

const MyOrders = ({ orders }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedOrderForMessages, setSelectedOrderForMessages] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const filterOptions = [
    { value: "all", label: t("orders.all", "All"), icon: <FaList className="text-gray-500 dark:text-gray-400" /> },
    { value: "video_course", label: t("orders.video_course", "Video Course"), icon: <FaPlay className="text-blue-500" /> },
    { value: "live_course", label: t("orders.live_course", "Live Course"), icon: <FaVideo className="text-red-500" /> },
    { value: "center_course", label: t("orders.center_course", "Center Course"), icon: <FaMapMarkerAlt className="text-teal-500" /> },
    { value: "book", label: t("orders.book", "Book"), icon: <FaBook className="text-purple-500" /> },
    { value: "booklet", label: t("orders.booklet", "Booklet"), icon: <FaFileAlt className="text-indigo-500" /> },
    { value: "medical_clothes", label: t("orders.medical_clothes", "Medical Clothes"), icon: <FaTshirt className="text-pink-500" /> },
    { value: "medical_tools", label: t("orders.medical_tools", "Medical Tools"), icon: <FaStethoscope className="text-emerald-500" /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [readMessageIds, setReadMessageIds] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_krok_read_messages");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dr_krok_read_messages", JSON.stringify(readMessageIds));
    window.dispatchEvent(new Event('orders-messages-updated'));
  }, [readMessageIds]);

  const truncateText = (text, maxWords = 4) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

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

  const handleMessagesClick = (order) => {
    setSelectedOrderForMessages(order);
    setIsMessagesModalOpen(true);
    
    // Mark messages as read
    const newMessageIds = order.messages
      .map(m => m.id)
      .filter(id => !readMessageIds.includes(id));
      
    if (newMessageIds.length > 0) {
      setReadMessageIds(prev => [...prev, ...newMessageIds]);
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const filteredOrders =
    filterType === "all"
      ? normalizedOrders
      : normalizedOrders.filter((order) => order.type === filterType);

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

      {/* Custom Filter Dropdown */}
      <div className="relative mb-6 z-20" ref={dropdownRef}>
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full sm:w-[280px] px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            {filterOptions.find(opt => opt.value === filterType)?.icon}
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {filterOptions.find(opt => opt.value === filterType)?.label}
            </span>
          </div>
          <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-0 mt-2 w-full sm:w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn origin-top">
            {filterOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  setFilterType(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                  filterType === option.value 
                    ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent"
                }`}
              >
                {option.icon}
                <span className={`font-semibold ${filterType === option.value ? "text-primary" : "text-gray-600 dark:text-gray-300"}`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
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
                        {["video_course", "course"].includes(order.type) ? (
                          <FaPlay className="text-primary" />
                        ) : order.type === "live_course" ? (
                          <FaVideo className="text-primary" />
                        ) : order.type === "center_course" ? (
                          <FaPlay className="text-primary" />
                        ) : order.type === "pdf" ? (
                          <FaFilePdf className="text-primary" />
                        ) : order.type === "delivery" ? (
                          <FaTruck className="text-primary" />
                        ) : (
                          <FaBook className="text-primary" />
                        )}
                        <div className="flex flex-col">
                          <CustomTooltip text={order.item}>
                            <span className="text-sm font-medium">
                              {truncateText(order.item)}
                            </span>
                          </CustomTooltip>
                          {order.type === "pdf" && order.file && (
                            <button
                              onClick={() => handleDownload(order.file)}
                              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                            >
                              <FaDownload className="w-3 h-3" />
                              {t("common.download_file", "Download File")}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {order.type.replace('_', ' ')}
                    </td>
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
                        <StatusBadge 
                          status={normalizedStatus} 
                          onClick={() => handleStatusClick(order)}
                        />
                        
                        {/* Messages Button */}
                        <div className="relative">
                          <button
                            onClick={() => handleMessagesClick(order)}
                            className="p-2 transition-all rounded-full bg-gray-50 hover:bg-blue-50 text-primary hover:scale-110 active:scale-95"
                          >
                            <FaCommentDots className="w-5 h-5" />
                            {order.messages?.filter(m => !readMessageIds.includes(m.id)).length > 0 && (
                              <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-bounce-slow">
                                {order.messages.filter(m => !readMessageIds.includes(m.id)).length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
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
              <div className="flex items-center justify-between mb-4">
                <StatusBadge
                  status={normalizedStatus}
                  onClick={() => handleStatusClick(order)}
                />
                
                {/* Mobile Messages Button */}
                <div className="relative">
                  <button
                    onClick={() => handleMessagesClick(order)}
                    className="p-2.5 transition-all rounded-full bg-blue-50 text-primary hover:scale-110 active:scale-95"
                  >
                    <FaCommentDots className="w-5 h-5" />
                    {order.messages?.filter(m => !readMessageIds.includes(m.id)).length > 0 && (
                      <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-bounce-slow">
                        {order.messages.filter(m => !readMessageIds.includes(m.id)).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {["video_course", "course"].includes(order.type) ? (
                  <FaPlay className="text-lg text-primary" />
                ) : order.type === "live_course" ? (
                  <FaVideo className="text-lg text-primary" />
                ) : order.type === "center_course" ? (
                  <FaPlay className="text-lg text-primary" />
                ) : order.type === "pdf" ? (
                  <FaFilePdf className="text-lg text-primary" />
                ) : order.type === "delivery" ? (
                  <FaTruck className="text-lg text-primary" />
                ) : (
                  <FaBook className="text-lg text-primary" />
                )}
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

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-medium">{t("orders.type")}:</span>{" "}
                    <span className="capitalize">{order.type.replace('_', ' ')}</span>
                  </p>
                  <p>
                    <span className="font-medium">{t("orders.price")}:</span> ₴
                    {Number(order.price).toFixed(2)}
                  </p>
                  {Number(order.points_used) > 0 && (
                    <p className="flex items-center gap-1">
                      <span className="font-medium">{t("points.points_discount", "Points Discount")}:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full dark:bg-purple-900/20 dark:text-purple-300">
                        <FaGem className="text-[9px]" />
                        -{Number(order.points_discount).toFixed(2)}₴ ({order.points_used} {t("points.pts", "pts")})
                      </span>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">{t("orders.date")}:</span>{" "}
                    {formatDate(order.date)}
                  </p>
                  {order.type === 'delivery' && order.city && order.branch && (
                    <p>
                      <span className="font-medium">{t("orders.delivery_to", "Delivery to")}:</span>{" "}
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
                    {t("common.download_file", "Download File")}
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

      {/* Messages Modal */}
      <MessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setIsMessagesModalOpen(false)}
        order={selectedOrderForMessages}
        readMessageIds={readMessageIds}
        setReadMessageIds={setReadMessageIds}
      />
    </div>
  );
};

export default MyOrders;