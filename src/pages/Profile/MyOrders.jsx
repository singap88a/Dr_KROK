import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlay,
  FaBook,
  FaTruck,
  FaFilePdf,
  FaVideo,
  FaList,
  FaMapMarkerAlt,
  FaFileAlt,
  FaTshirt,
  FaStethoscope,
} from "react-icons/fa";

// Modular Subcomponents
import OrderStatusModal from "../../components/Profile/orders/OrderStatusModal";
import OrderMessagesModal from "../../components/Profile/orders/OrderMessagesModal";
import OrderFilterDropdown from "../../components/Profile/orders/OrderFilterDropdown";
import { OrderDesktopRow, OrderMobileCard } from "../../components/Profile/orders/OrderRowAndCards";

// Status mapping helpers
const mapStatusFromBackend = (status) => {
  const s = String(status);
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
        client_name: o.client_name,
        second_client_name: o.second_client_name,
        messages: o.messages || [],
        points_used: o.points_used || 0,
        points_discount: o.points_discount || 0,
      };
    }
    if (o && typeof o === "object" && "total_price" in o) {
      return {
        id: o.id,
        item: [o.client_name, o.second_client_name].filter(Boolean).join(" ") || "Book order",
        client_name: o.client_name,
        second_client_name: o.second_client_name,
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

export default function MyOrders({ orders }) {
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
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dr_krok_read_messages", JSON.stringify(readMessageIds));
    window.dispatchEvent(new Event("orders-messages-updated"));
  }, [readMessageIds]);

  const truncateText = (text, maxWords = 4) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}/${month}/${day}`;
  };

  const normalizedOrders = normalizeOrders(orders);

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleMessagesClick = (order) => {
    setSelectedOrderForMessages(order);
    setIsMessagesModalOpen(true);

    const newMessageIds = (order.messages || [])
      .map((m) => m.id)
      .filter((id) => !readMessageIds.includes(id));

    if (newMessageIds.length > 0) {
      setReadMessageIds((prev) => [...prev, ...newMessageIds]);
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
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

  return (
    <div className="pt-4 space-y-6 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{t("orders.title")}</h2>
        <span className="text-sm text-text-secondary">
          {t("orders.totalOrders", { count: filteredOrders.length })}
        </span>
      </div>

      {/* Filter Dropdown */}
      <OrderFilterDropdown
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        dropdownRef={dropdownRef}
      />

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden border shadow-sm md:block bg-surface border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-semibold text-left">{t("orders.item")}</th>
                <th className="px-6 py-3 font-semibold text-left">{t("orders.type")}</th>
                <th className="px-6 py-3 font-semibold text-left">{t("orders.price")}</th>
                <th className="px-6 py-3 font-semibold text-left">{t("orders.status")}</th>
                <th className="px-6 py-3 font-semibold text-left">{t("orders.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.map((order) => (
                <OrderDesktopRow
                  key={order.id}
                  order={order}
                  truncateText={truncateText}
                  formatDate={formatDate}
                  handleDownload={handleDownload}
                  handleStatusClick={handleStatusClick}
                  handleMessagesClick={handleMessagesClick}
                  readMessageIds={readMessageIds}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sortedOrders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            truncateText={truncateText}
            formatDate={formatDate}
            handleDownload={handleDownload}
            handleStatusClick={handleStatusClick}
            handleMessagesClick={handleMessagesClick}
            readMessageIds={readMessageIds}
          />
        ))}
      </div>

      {/* Status Modal */}
      <OrderStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={selectedOrder?.status}
        orderType={selectedOrder?.type}
        order={selectedOrder}
      />

      {/* Messages Modal */}
      <OrderMessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setIsMessagesModalOpen(false)}
        order={selectedOrderForMessages}
        readMessageIds={readMessageIds}
      />
    </div>
  );
}