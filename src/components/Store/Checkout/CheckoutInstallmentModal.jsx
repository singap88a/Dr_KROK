import React from "react";
import { FiRefreshCw } from "react-icons/fi";

export default function CheckoutInstallmentModal({
  showInstallmentModal,
  handleCloseInstallmentModal,
  item,
  installmentAmount,
  setInstallmentAmount,
  installmentError,
  setInstallmentError,
  handleApplyInstallment,
  discountedPrice,
  showNoInstallmentPopup,
  setShowNoInstallmentPopup,
  t,
}) {
  return (
    <>
      {showInstallmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-fadeIn">
            <button
              onClick={handleCloseInstallmentModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("installments.installmentModal.title", "Setup Installment")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "installments.installmentModal.subtitle",
                  { minPct: item?.course_deposit_percentage || 50 },
                  `Enter the amount you'd like to pay now. Minimum is ${
                    item?.course_deposit_percentage || 50
                  }% of the total price.`
                )}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(
                    "installments.installmentModal.amountLabel",
                    "Payment Amount (₴)"
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    ₴
                  </span>
                  <input
                    type="number"
                    value={installmentAmount}
                    onChange={(e) => {
                      setInstallmentAmount(e.target.value);
                      if (installmentError) setInstallmentError("");
                    }}
                    className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all ${
                      installmentError
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                        : "border-gray-200 focus:border-primary focus:bg-white"
                    }`}
                    placeholder={(
                      discountedPrice *
                      (Number(item?.course_deposit_percentage || 50) / 100)
                    ).toFixed(2)}
                  />
                </div>
                {installmentError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <FiRefreshCw className="w-4 h-4" /> {installmentError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseInstallmentModal}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleApplyInstallment}
                  className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all"
                >
                  {t("common.apply", "Apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNoInstallmentPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-fadeIn text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t(
                "installments.noInstallment.title",
                "Installments Unavailable"
              )}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                "installments.noInstallment.message",
                "This item does not support installment payments at the moment."
              )}
            </p>
            <button
              onClick={() => setShowNoInstallmentPopup(false)}
              className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
            >
              {t("common.close", "Close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
