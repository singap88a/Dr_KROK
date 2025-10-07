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
    // Handle API /api/orders shape
    if (o && typeof o === 'object' && 'order_id' in o) {
      let type = 'book';
      const lowerType = (o.type || '').toLowerCase();
      if (lowerType === 'video_course') {
        type = 'course';
      } else if (lowerType === 'pdf' || lowerType === 'delivery') {
        type = lowerType;
      }
      return {
        id: o.order_id,
        item: o.title || 'Order item',
        type,
        price: parseFloat(o.total_price) || 0,
        status: (o.status || '').toLowerCase(),
        date: o.created_at || new Date().toISOString(),
        image: o.image,
        file: o.file,
      };
    }
    // Backend order_books shape
    if (o && typeof o === 'object' && 'total_price' in o) {
      return {
        id: o.id,
        item: o.client_name || 'Book order',
        type: 'book',
        price: parseFloat(o.total_price) || 0,
        status: (o.status || '').toLowerCase(),
        date: o.created_at || new Date().toISOString(),
      };
    }
    // Fallback to existing shape
    return {
      id: o.id,
      item: o.item,
      type: o.type || 'book',
      price: o.price,
      status: (o.status || '').toLowerCase(),
      date: o.date,
    };
  });
};

const mapBackendStatus = (status) => {
  // Return the status exactly as received from backend without modification
  return status || '';
};

const MyOrders = ({ orders }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="w-3 h-3" />;
      case 'processing':
        return <FaExclamationTriangle className="w-3 h-3" />;
      case 'shipped':
        return <FaTruck className="w-3 h-3" />;
      case 'delivered':
        return <FaBoxOpen className="w-3 h-3" />;
      case 'completed':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <FaTimesCircle className="w-3 h-3" />;
      case 'paid':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'payment':
        return <FaClock className="w-3 h-3" />;
      default:
        return <FaExclamationTriangle className="w-3 h-3" />;
    }
  };

  const filteredOrders = filterType === 'all' ? orders : orders.filter(order => {
    if (filterType === 'books') {
      return order.type !== 'course';
    }
    if (filterType === 'courses') {
      return order.type === 'course';
    }
    return true;
  });

  // Sort orders by order_id in descending order (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aId = parseInt(a.order_id || a.id) || 0;
    const bId = parseInt(b.order_id || b.id) || 0;
    return bId - aId;
  });

  // Add row number for display as "Row No."
  const numberedOrders = sortedOrders.map((order, index) => ({
    ...order,
    rowNumber: index + 1,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('orders.title')}</h2>
        <span className="text-sm text-text-secondary">
          {t('orders.totalOrders', { count: filteredOrders.length })}
        </span>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          onClick={() => setFilterType('all')}
        >
          {t('orders.all')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'book' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          onClick={() => setFilterType('book')}
        >
          {t('orders.books')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'course' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          onClick={() => setFilterType('course')}
        >
          {t('orders.courses')}
        </button>
      </div>

      <div className="overflow-hidden border shadow-sm bg-surface border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.number')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.item')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.type')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.price')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.status')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                  {t('orders.date')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {normalizeOrders(numberedOrders).map((order) => {
                const normalizedStatus = mapBackendStatus(order.status);
                const statusKey = `orders.statuses.${normalizedStatus}`;
                const translatedStatus = t(statusKey) !== statusKey ? t(statusKey) : normalizedStatus;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium">{order.rowNumber}</td>
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
                          {(order.type === "pdf" || order.type === "delivery") && order.file && (
                            <a href={order.file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                              View PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.type === 'course' ? t('orders.courses') : order.type === 'book' ? t('orders.books') : t(`orders.${order.type}`) || order.type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${Number(order.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(normalizedStatus)}`}>
                        {getStatusIcon(normalizedStatus)}
                        <span className="capitalize">{translatedStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
