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
} from "react-icons/fa";

const normalizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => {
    if (o && typeof o === "object" && "order_id" in o) {
      let type = "book";
      const lowerType = (o.type || "").toLowerCase();
      if (lowerType === "video_course") {
        type = "course";
      } else if (lowerType === "pdf" || lowerType === "delivery") {
        type = lowerType;
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
    };
  });
};

const mapBackendStatus = (status) => status || "";

const MyOrders = ({ orders }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("all");

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "payment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="w-3 h-3" />;
      case "processing":
        return <FaExclamationTriangle className="w-3 h-3" />;
      case "shipped":
        return <FaTruck className="w-3 h-3" />;
      case "delivered":
      case "completed":
      case "paid":
        return <FaCheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaExclamationTriangle className="w-3 h-3" />;
    }
  };

  const filteredOrders =
    filterType === "all"
      ? orders
      : orders.filter((order) => {
          if (filterType === "book") return order.type === "book";
          if (filterType === "course") return order.type === "course";
          return true;
        });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aId = parseInt(a.order_id || a.id) || 0;
    const bId = parseInt(b.order_id || b.id) || 0;
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
                  {t("orders.number")}
                </th>
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
                const statusKey = `orders.statuses.${normalizedStatus}`;
                const translatedStatus =
                  t(statusKey) !== statusKey ? t(statusKey) : normalizedStatus;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 font-medium">{order.rowNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.type === "course" ? (
                          <FaPlay className="text-primary" />
                        ) : order.type === "pdf" ? (
                          <FaFilePdf className="text-primary" />
                        ) : order.type === "delivery" ? (
                          <FaTruck className="text-primary" />
                        ) : (
                          <FaBook className="text-primary" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm">{order.item}</span>
                          {(order.type === "pdf" || order.type === "delivery") &&
                            order.file && (
                              <a
                                href={order.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                View PDF
                              </a>
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
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          normalizedStatus
                        )}`}
                      >
                        {getStatusIcon(normalizedStatus)}
                        <span className="capitalize">{translatedStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
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
          const translatedStatus =
            t(`orders.statuses.${normalizedStatus}`) ||
            normalizedStatus ||
            "N/A";

          return (
            <div
              key={order.id}
              className="p-4 bg-white border rounded-lg shadow-sm border-border dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  #{order.rowNumber}
                </span>
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${getStatusColor(
                    normalizedStatus
                  )}`}
                >
                  {getStatusIcon(normalizedStatus)}
                  <span>{translatedStatus}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {order.type === "course" ? (
                  <FaPlay className="text-lg text-primary" />
                ) : order.type === "pdf" ? (
                  <FaFilePdf className="text-lg text-primary" />
                ) : order.type === "delivery" ? (
                  <FaTruck className="text-lg text-primary" />
                ) : (
                  <FaBook className="text-lg text-primary" />
                )}
                <div>
                  <p className="font-medium">{order.item}</p>
                  {(order.type === "pdf" || order.type === "delivery") &&
                    order.file && (
                      <a
                        href={order.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View PDF
                      </a>
                    )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">{t("orders.type")}:</span>{" "}
                  {order.type}
                </p>
                <p>
                  <span className="font-medium">{t("orders.price")}:</span> $
                  {Number(order.price).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">{t("orders.date")}:</span>{" "}
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
