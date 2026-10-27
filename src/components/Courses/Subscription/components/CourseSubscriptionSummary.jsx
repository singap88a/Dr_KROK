import React from "react";
import {
  FaCcVisa,
  FaApplePay,
  FaGooglePay,
  FaGem,
  FaShoppingCart,
  FaCreditCard,
  FaCheck,
  FaBookmark,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

export default function CourseSubscriptionSummary({
  course,
  flashOffer,
  discountPercentage,
  priceNumber,
  discountAmount,
  subtotalAfterDiscount,
  couponDiscount,
  couponDiscountAmount,
  discountedPrice,
  error,
  couponError,
  couponMessage,
  isLoggedIn,
  agreeToTerms,
  setAgreeToTerms,
  setShowTerms,
  canUsePoints,
  usePoints,
  setUsePoints,
  userData,
  handleSubscription,
  isSubscribing,
  useInstallment,
  installmentAmount,
  handleOpenInstallmentModal,
  handleCancelInstallment,
  handleLoginClick,
  handleAddToCart,
  t,
}) {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6">
        <div className="p-6 border rounded-2xl border-border bg-surface">
          <h3 className="mb-4 text-xl font-bold text-text">
            {t("courses.subscriptionDetails", "Subscription Details")}
          </h3>

          {flashOffer && (
            <div className="flex items-center gap-2 p-2.5 mb-4 text-xs font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                {t("flashOffers.offerBadge", "Flash Offer Applied")}:{" "}
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Price Display */}
          <div className="mb-6">
            {/* Original price */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary">
                {t("courses.coursePrice", "Course Price")}
              </span>
              <span className="text-lg font-semibold">
                ₴{priceNumber.toFixed(2)}
              </span>
            </div>

            {/* Platform discount as amount with percent badge */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-text-secondary">
                  {t("courses.discount", "Discount")}
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">
                    {discountPercentage.toFixed(2)}%
                  </span>
                </span>
                <span className="text-green-600">
                  -₴{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Subtotal after platform discount */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary">
                {t("courses.subtotal", "Subtotal")}
              </span>
              <span className="font-semibold">
                ₴{subtotalAfterDiscount.toFixed(2)}
              </span>
            </div>

            {/* Coupon discount */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">
                  {t("courses.couponDiscount", "Coupon Discount")}
                </span>
                <span className="text-green-600">
                  -₴{couponDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-lg font-bold text-text">
                {t("courses.total", "Total")}
              </span>
              <span
                className={`text-2xl font-bold ${
                  couponDiscount > 0 ? "text-green-600" : "text-primary"
                }`}
              >
                ₴{discountedPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-red-600 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <FaExclamationTriangle />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {couponError && (
            <div className="flex items-center gap-2 p-3 mb-4 text-red-600 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <FaExclamationTriangle />
              <span className="text-sm">{couponError}</span>
            </div>
          )}

          {couponMessage && (
            <div className="flex items-center gap-2 p-3 mb-4 text-green-600 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <FaCheck />
              <span className="text-sm">{couponMessage}</span>
            </div>
          )}

          {/* Authentication Check */}
          {!isLoggedIn && (
            <div className="flex items-center gap-2 p-3 mb-4 text-blue-600 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <FaInfoCircle />
              <span className="text-sm">
                {t(
                  "courses.loginRequired",
                  "Please login to subscribe to this course"
                )}
              </span>
            </div>
          )}

          {/* Payment Methods */}
          {isLoggedIn && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-text-secondary">
                {t(
                  "courses.availablePaymentMethods",
                  "Available Payment Methods"
                )}
              </h4>
              <div className="space-y-2">
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
                      className="flex items-center w-full gap-3 p-3 border rounded-lg border-border bg-surface"
                    >
                      <IconComponent className={`text-2xl ${method.color}`} />
                      <span className="font-medium">{method.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {isLoggedIn && (
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-text-secondary"
                >
                  {t("courses.agree_to_terms_start", "I agree to the")}{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline"
                  >
                    {t("courses.purchase_policy", "purchase policy")}
                  </button>
                </label>
              </div>
              {!agreeToTerms && (
                <p className="mt-2 text-sm text-red-500">
                  {t(
                    "courses.must_agree_to_purchase_policy",
                    "You must agree to the purchase policy to subscribe."
                  )}
                </p>
              )}
            </div>
          )}

          {/* Use Points Checkbox */}
          {isLoggedIn && canUsePoints && (
            <div className="mb-5 p-3 border rounded-lg border-purple-200 bg-purple-50/60 dark:bg-purple-900/10 dark:border-purple-800">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="usePoints"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <FaGem className="text-purple-500 text-xs" />
                    <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                      {t("points.use_points_label", "Use my points balance")}
                    </span>
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700 rounded">
                      {Number(userData?.points_balance || 0).toLocaleString()}{" "}
                      {t("points.pts", "pts")}
                    </span>
                  </div>
                  {usePoints && (
                    <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                      {t(
                        "points.points_applied",
                        "Points discount will be applied at checkout automatically"
                      )}
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscription}
            disabled={isSubscribing || !isLoggedIn || !agreeToTerms}
            className="w-full px-6 py-4 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubscribing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                {t("courses.subscribing", "Subscribing...")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaShoppingCart />
                {useInstallment
                  ? `Pay ₴${installmentAmount} Installment`
                  : t("courses.subscribeNow", "Subscribe Now")}
              </div>
            )}
          </button>

          {/* Installment Option */}
          {discountedPrice >= 100 && !useInstallment && (
            <button
              onClick={handleOpenInstallmentModal}
              disabled={!isLoggedIn || !agreeToTerms}
              className="w-full px-6 py-3 mt-3 font-medium transition-colors border rounded-lg text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <FaCreditCard />
                {t("courses.payInInstallments", "Pay in Installments")}
              </div>
            </button>
          )}

          {/* Installment Info */}
          {useInstallment && (
            <div className="p-3 mt-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Paying in installments: ₴{installmentAmount}
                  </span>
                </div>
                <button
                  onClick={handleCancelInstallment}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                Remaining balance: ₴
                {(discountedPrice - installmentAmount).toFixed(2)}
              </p>
            </div>
          )}

          {/* Login Link */}
          {!isLoggedIn && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoginClick}
                className="text-sm text-primary hover:text-secondary hover:underline"
              >
                {t("courses.loginToSubscribe", "Login to subscribe")}
              </button>

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-medium transition-all duration-300 border cursor-pointer text-primary rounded-xl border-primary hover:bg-primary hover:text-white hover:scale-[1.02] hover:shadow-lg active:scale-95"
              >
                <FaBookmark />
                {t("cart.save_path", "Save to wishlist to return later")}
              </button>
            </div>
          )}

          {/* Course Benefits */}
          <div className="p-4 mt-6 border rounded-lg border-border bg-background/50">
            <h4 className="mb-3 text-sm font-semibold text-text-secondary">
              {t("courses.whatYouGet", "What you get")}
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              {course.course_duration_days > 0 ? (
                <li className="flex items-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  <span>
                    {t("courses.accessFor", "Access for")}{" "}
                    <strong className="text-primary">
                      {course.course_duration_days} {t("courses.days", "days")}
                    </strong>{" "}
                    {t("courses.fromPurchaseDate", "from the date of purchase")}
                  </span>
                </li>
              ) : (
                <li className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>
                    {t(
                      "courses.lifetimeAccess",
                      "7 months access to all content"
                    )}
                  </span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-500" />
                <span>
                  {t("courses.mobileAccess", "Mobile and desktop access")}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-500" />
                <span>
                  {t("courses.certificate", "Certificate of completion")}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-500" />
                <span>{t("courses.support", "24/7 support")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
