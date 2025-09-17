import React from "react";
import {
  FaPlay,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

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
            {orders.map((order) => (
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
                  ${order.price}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {new Date(order.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MyOrders;
