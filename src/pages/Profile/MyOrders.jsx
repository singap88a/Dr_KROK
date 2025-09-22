import React from "react";
import {
  FaPlay,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const normalizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => {
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
  if (!status) return 'pending';
  if (status === 'paymented' || status === 'paid' || status === 'completed') return 'completed';
  if (status === 'cancel' || status === 'cancelled' || status === 'rejected') return 'cancelled';
  return status;
};

const MyOrders = ({ orders, getStatusColor, getStatusIcon }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Orders</h2>
      <span className="text-sm text-text-secondary">
        {orders.length} total orders
      </span>
    </div>

    <div className="overflow-hidden border shadow-sm bg-surface border-border rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                Order ID
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                Item
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                Price
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-left text-text">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {normalizeOrders(orders).map((order) => {
              const normalizedStatus = mapBackendStatus(order.status);
              return (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {order.type === "course" ? (
                      <FaPlay className="text-primary" />
                    ) : (
                      <FaBook className="text-primary" />
                    )}
                    <span className="text-sm">{order.item}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  ${Number(order.price).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(normalizedStatus)}`}>
                    {getStatusIcon(normalizedStatus)}
                    <span className="capitalize">{normalizedStatus}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {new Date(order.date).toLocaleDateString()}
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MyOrders;
