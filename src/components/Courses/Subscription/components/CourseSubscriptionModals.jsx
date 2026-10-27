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
        const depositPct = Number(course?.course_deposit_percentage || 50);
        const minAmount = discountedPrice * (depositPct / 100);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg dark:bg-surface">
              <h3 className="mb-3 text-xl font-bold text-text">
                {t("installments.installmentModal.title", "Pay in Installments")}
              </h3>

              {/* Percentage — primary info */}
              <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white text-xl font-extrabold flex-shrink-0">
                  {depositPct}%
                </div>
                <div>
                  <p className="font-bold text-text text-base">
                    {t(
                      "installments.installmentModal.depositPctRequired",
                      "Minimum deposit required"
                    )}
                    : <span className="text-primary">{depositPct}%</span>
                  </p>
                  <p className="text-sm text-text-muted mt-0.5">
                    {t("installments.installmentModal.equals", "equals")}{" "}
                    <strong className="text-text">
                      ₴{minAmount.toFixed(2)}
                    </strong>{" "}
                    {t("installments.installmentModal.outOf", "out of")} ₴
                    {discountedPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t(
                    "installments.installmentModal.amountLabel",
                    "Enter deposit amount (₴)"
                  )}
                </label>
                <div className="relative">
                  <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-muted dark:text-gray-400">
                    ₴
                  </span>
                  <input
                    type="number"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    placeholder={`${t(
                      "installments.installmentModal.minHint",
                      "Min"
                    )} ₴${minAmount.toFixed(2)}`}
                    className="w-full py-2 pl-8 pr-4 bg-white border rounded-lg border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    min={minAmount}
                    max={discountedPrice}
                  />
                </div>
                {installmentError && (
                  <p className="mt-2 text-sm text-red-600">{installmentError}</p>
                )}
                <p className="mt-2 text-xs text-text-muted dark:text-gray-400">
                  {t(
                    "installments.installmentModal.rangeHint",
                    "Amount must be between"
                  )}{" "}
                  ₴{minAmount.toFixed(2)} – ₴{discountedPrice.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyInstallment}
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                >
                  {t(
                    "installments.installmentModal.apply",
                    "Apply Installment"
                  )}
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
