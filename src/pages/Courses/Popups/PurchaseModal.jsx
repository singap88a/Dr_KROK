import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaShoppingCart } from "react-icons/fa";

const PurchaseModal = ({ show, onClose, courseId, isLive = false }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md border rounded-lg shadow-xl bg-surface border-border">
        <div className="p-6">
          <div className="mb-6 text-center">
            <FaShoppingCart className="mx-auto mb-4 text-4xl text-primary" />
            <h3 className="mb-2 text-2xl font-semibold text-text">
              {t("courses.unlockPremium", "Unlock Premium Content")}
            </h3>
            <p className="text-text-muted">
              {t(
                "courses.purchaseToAccess",
                "Purchase this course to access all premium lessons and materials"
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to={isLive ? `/live-courses/${courseId}/subscribe` : `/courses/${courseId}/subscribe`}
              className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              <FaShoppingCart />
              {t("courses.purchaseNow", "Purchase Now")}
            </Link>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 transition-colors bg-gray-200 rounded-lg text-text hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;