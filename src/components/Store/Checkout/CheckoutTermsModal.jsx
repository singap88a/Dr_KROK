import React from "react";

export default function CheckoutTermsModal({
  showTerms,
  setShowTerms,
  termsLoading,
  termsText,
  t,
}) {
  if (!showTerms) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[80vh] p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {t("books.purchasePolicy.title")}
          </h3>
          <button
            onClick={() => setShowTerms(false)}
            className="text-gray-400 hover:text-gray-600"
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
        <div className="overflow-y-auto max-h-[60vh] text-gray-700">
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
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t("books.purchasePolicy.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
