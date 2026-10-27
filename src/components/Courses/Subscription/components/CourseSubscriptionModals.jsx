import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import IncompleteProfileModal from "../../../Modals/IncompleteProfileModal";
import SaveBeforeLoginModal from "../../../Modals/SaveBeforeLoginModal";

export default function CourseSubscriptionModals({
  showNoInstallmentPopup,
  setShowNoInstallmentPopup,
  showInstallmentModal,
  handleCloseInstallmentModal,
  course,
  discountedPrice,
  installmentAmount,
  setInstallmentAmount,
  installmentError,
  handleApplyInstallment,
  showTerms,
  setShowTerms,
  termsLoading,
  termsText,
  showSaveWarning,
  setShowSaveWarning,
  handleSaveAndLogin,
  handleContinueToLogin,
  showProfileModal,
  setShowProfileModal,
  cartItems,
  isLiveCourse,
  handleAddToCart,
  t,
}) {
  return (
    <>
      {/* No Installment Available Popup */}
      {showNoInstallmentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg dark:bg-surface">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FaInfoCircle className="text-3xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-text">
                {t(
                  "installments.notAvailable.title",
                  "Installments Not Available"
                )}
              </h3>
              <p className="text-text-secondary">
                {t(
                  "installments.notAvailable.message",
                  "This course does not support installment payments. Full payment is required to enroll."
                )}
              </p>
              <button
                onClick={() => setShowNoInstallmentPopup(false)}
                className="w-full px-6 py-2 text-white rounded-lg bg-primary hover:bg-secondary"
              >
                {t("common.understood", "Understood")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installment Modal */}
      {showInstallmentModal && (() => {
        const monthly = Number(course?.installment_monthly_amount || 0);
        const months = Number(course?.installment_months || 0);
        const total = Number(course?.installment_total_price || 0);
        const downPay = Number(course?.installment_down_payment || monthly);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg dark:bg-surface">
              <h3 className="mb-3 text-xl font-bold text-text">
                {t("installments.installmentModal.title", "Pay in Installments")}
              </h3>

              {/* Installment summary */}
              <div className="p-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                  <span>{t("installments.payToday", "Amount to pay today (1st installment):")}</span>
                  <span className="text-lg font-black">₴{downPay.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{t("installments.monthlyAmount", "Monthly installment:")}</span>
                  <span className="font-semibold text-text">₴{monthly.toFixed(2)} / {t("installments.month", "month")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{t("installments.months", "Months:")}</span>
                  <span className="font-semibold text-text">{months} {t("installments.months", "months")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                  <span>{t("installments.totalAmount", "Total installment price:")}</span>
                  <span className="font-black text-text">₴{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyInstallment}
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                >
                  {t("installments.installmentModal.apply", "Apply Installment")}
                </button>
                <button
                  onClick={handleCloseInstallmentModal}
                  className="flex-1 px-4 py-2 transition-colors border rounded-lg border-border text-text hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("installments.installmentModal.cancel", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[80vh] p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-surface dark:text-text">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-text">
                {t("courses.purchasePolicy.title", "Purchase Policy")}
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] text-gray-700 dark:text-text-secondary">
              {termsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: termsText }} />
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-text dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t("courses.purchasePolicy.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Warning Modal */}
      <SaveBeforeLoginModal
        isOpen={showSaveWarning}
        onClose={() => setShowSaveWarning(false)}
        onSave={handleSaveAndLogin}
        onContinueToLogin={handleContinueToLogin}
      />

      {/* Incomplete Profile Modal */}
      <IncompleteProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        showSaveOption={
          !cartItems?.some(
            (i) =>
              i.id === course?.id &&
              i.type === (isLiveCourse ? "live_course" : "course")
          )
        }
        onSave={handleAddToCart}
      />
    </>
  );
}
