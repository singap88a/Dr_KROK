import React from "react";
import { FaCcVisa, FaApplePay, FaGooglePay, FaBookmark } from "react-icons/fa";

export default function CheckoutDigitalPayment({
  agreeToTerms,
  setAgreeToTerms,
  setShowTerms,
  loading,
  handlePdfPurchase,
  isLoggedIn,
  handleLoginClick,
  handleAddToCart,
  t,
}) {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold">
        {t("books.select_payment_method")}
      </h3>
      <div className="flex gap-4">
        {[
          {
            id: "apple-pay",
            name: "Apple Pay",
            icon: FaApplePay,
            color: "text-black dark:text-white",
          },
          {
            id: "google-pay",
            name: "Google Pay",
            icon: FaGooglePay,
            color: "text-gray-900 dark:text-gray-100",
          },
          {
            id: "visa",
            name: "Visa",
            icon: FaCcVisa,
            color: "text-blue-600",
          },
        ].map((method) => {
          const IconComponent = method.icon;
          return (
            <div
              key={method.id}
              className="flex flex-col items-center p-4 border rounded-lg border-border bg-background/60"
            >
              <IconComponent className={`text-3xl mb-2 ${method.color}`} />
              <span className="font-medium">{t(`books.${method.id}`)}</span>
            </div>
          );
        })}
      </div>

      {/* Terms and Conditions */}
      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeToTermsPdf"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeToTermsPdf" className="text-sm text-text-secondary">
            {t("books.agree_to_terms_start")}{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-primary hover:underline"
            >
              {t("books.purchase_policy")}
            </button>
          </label>
        </div>
        {!agreeToTerms && (
          <p className="mt-2 text-sm text-red-500">
            {t("books.must_agree_to_terms")}
          </p>
        )}
      </div>

      <button
        onClick={handlePdfPurchase}
        disabled={loading || !agreeToTerms}
        className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("books.processing") : t("books.purchase_now")}
      </button>

      {/* Save Path Button */}
      {!isLoggedIn && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleLoginClick}
            className="text-sm font-medium text-primary hover:text-secondary hover:underline"
          >
            {t("courses.loginToSubscribe", "Login to subscribe")}
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex justify-center items-center w-full gap-2 px-6 py-3 mt-4 font-medium transition-all duration-300 border rounded-lg text-primary border-primary hover:bg-primary hover:text-white hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            <FaBookmark />
            {t("cart.save_path", "Save to wishlist to return later")}
          </button>
        </div>
      )}
    </div>
  );
}
