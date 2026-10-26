import React from "react";
import { useTranslation } from "react-i18next";
import { FaCommentDots, FaTimesCircle, FaShoppingCart } from "react-icons/fa";

export default function OrderMessagesModal({
  isOpen,
  onClose,
  order,
  readMessageIds,
}) {
  const { t } = useTranslation();
  if (!isOpen || !order) return null;

  const messages = [...(order.messages || [])].sort(
    (a, b) => new Date(b.sent_at) - new Date(a.sent_at)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg mx-4 transition-all duration-300 transform scale-100 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl animate-slideUp">
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
                    ? "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 animate-pulse-subtle"
                }`}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{msg.message}</p>
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
                      {t("orders.messages.pay_now", "Pay Now")}{" "}
                      {msg.payment_amount ? `(${msg.payment_amount} ₴)` : ""}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
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
              <FaCommentDots className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("orders.messages.no_messages", "No messages for this order yet.")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl">
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
}
