import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHeadset, FaExclamationTriangle } from "react-icons/fa";

const PurchaseModal = ({ show, onClose }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md border rounded-2xl shadow-xl bg-surface border-border">
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
              <FaExclamationTriangle className="text-3xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-text">
              {t("courses.courseClosedTitle", "Course Access Closed")}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {t(
                "courses.courseClosedMessage",
                "Access to this course has been closed by administration. Please contact support for assistance."
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/contact"
              onClick={onClose}
              className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors rounded-xl bg-primary hover:bg-secondary"
            >
              <FaHeadset />
              {t("courses.contactSupport", "Contact Support")}
            </Link>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 font-medium transition-colors bg-gray-200 rounded-xl text-text hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {t("common.close", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;