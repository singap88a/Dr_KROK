import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import CouponInput from "../../Common/CouponInput";

export default function CheckoutPriceSummary({
  item,
  itemType,
  isBookType,
  isPdfBook,
  finalPrice,
  couponDiscount,
  couponDiscountAmount,
  embroidery,
  embroideryPrice,
  finalDiscountedPrice,
  handleCouponApply,
  error,
  success,
  couponError,
  couponMessage,
  loadingPaintData,
  fetchPaintOrderData,
  canUsePoints,
  usePoints,
  setUsePoints,
  pointsBalance,
  pointsMonetaryValue,
  pointsDiscountAmount,
  useInstallment,
  installmentAmount,
  handleCancelInstallment,
  handleOpenInstallmentModal,
  t,
}) {
  return (
    <>
      {/* Coupon Input */}
      <div className="mt-4">
        <CouponInput
          onApply={handleCouponApply}
          t={t}
          initialDiscount={couponDiscount}
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 mt-4 text-red-600 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mt-4 text-green-600 border border-green-200 rounded-lg bg-green-50">
          {success}
        </div>
      )}

      {/* Coupon Messages */}
      {couponError && (
        <div className="p-4 mt-4 text-red-600 border border-red-200 rounded-lg bg-red-50">
          {couponError}
        </div>
      )}
      {couponMessage && (
        <div className="p-4 mt-4 text-green-600 border border-green-200 rounded-lg bg-green-50">
          {couponMessage}
        </div>
      )}

      {/* Fetch Paint Data Button */}
      {itemType === 1 && isBookType && (
        <div className="mt-4">
          <button
            onClick={fetchPaintOrderData}
            disabled={loadingPaintData}
            className="flex items-center gap-2 px-4 py-2 text-sm transition border rounded-lg text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loadingPaintData ? "animate-spin" : ""} />
            {loadingPaintData
              ? t("books.loading_paint_data")
              : t("books.load_paint_data")}
          </button>
          <p className="mt-1 text-xs text-text-secondary">
            {t("books.optional_load_paint_data")}
          </p>
        </div>
      )}

      {/* Order summary */}
      <div className="p-4 mt-6 border rounded-lg bg-background/60 border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">{item.name}</div>
          <div className="font-semibold">₴{finalPrice.toFixed(2)}</div>
        </div>
        {couponDiscount > 0 && (
          <>
            <div className="flex items-center justify-between mt-2 text-sm text-green-600">
              <div>
                {t("books.coupon.discount_label", { percent: couponDiscount }) ||
                  `Coupon Discount (${couponDiscount}%)`}
              </div>
              <div>-₴{couponDiscountAmount.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
              <div>{t("books.original_total") || "Original Total"}</div>
              <div className="line-through">₴{finalPrice.toFixed(2)}</div>
            </div>
          </>
        )}
        {itemType === 1 && (
          <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
            <div>{t("books.delivery")}</div>
            <div>{t("books.free")}</div>
          </div>
        )}
        {/* Embroidery line */}
        {embroidery.has_embroidery && embroideryPrice > 0 && (
          <div className="flex items-center justify-between mt-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span>✂️</span>
              <span>
                {t("embroidery.embroidery_fee", "Embroidery")}: «
                {embroidery.embroidery_name}»
              </span>
            </div>
            <div className="font-semibold">+₴{embroideryPrice.toFixed(2)}</div>
          </div>
        )}
        {/* Total Line */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">
            {t("books.total")}
          </span>
          <span className="text-xl font-black text-primary">
            ₴{finalDiscountedPrice.toFixed(2)}
          </span>
        </div>

        {/* Use Points Checkbox */}
        {canUsePoints && (
          <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-start gap-3 transition-all hover:shadow-sm">
            <input
              type="checkbox"
              id="usePoints"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              className="mt-1 w-5 h-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <div>
              <label
                htmlFor="usePoints"
                className="font-semibold text-emerald-800 cursor-pointer block"
              >
                {t("points.use_points_balance", "Use Points Balance")}
              </label>
              <p className="text-sm text-emerald-600 mt-1">
                {t(
                  "points.balance_available",
                  {
                    balance: pointsBalance,
                    value: pointsMonetaryValue.toFixed(2),
                  },
                  `You have ${pointsBalance} points worth ₴${pointsMonetaryValue.toFixed(
                    2
                  )}.`
                )}
              </p>
              {usePoints && (
                <div className="mt-2 text-sm font-bold text-emerald-700 bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">
                  {t("points.discount_applied", "Discount applied:")} -₴
                  {pointsDiscountAmount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Installment Options (if not PDF book) */}
        {!isPdfBook && (
          <div className="mt-6 border border-primary/20 rounded-xl p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-primary">
                {t("installments.payInInstallments", "Pay in Installments")}
              </h4>
              {useInstallment ? (
                <button
                  onClick={handleCancelInstallment}
                  className="text-sm text-red-500 hover:text-red-700 underline"
                >
                  {t("installments.cancelInstallment", "Cancel")}
                </button>
              ) : (
                <span className="text-sm text-gray-500">
                  {t("installments.optional", "Optional")}
                </span>
              )}
            </div>

            {useInstallment ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-primary/30">
                <span className="text-sm font-medium text-gray-700">
                  {t("installments.installmentAmount", "Installment Amount")}
                </span>
                <span className="font-bold text-primary">
                  ₴{Number(installmentAmount).toFixed(2)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleOpenInstallmentModal}
                className="w-full py-2 px-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors"
              >
                {t(
                  "installments.setupInstallment",
                  "Setup Installment Plan"
                )}
              </button>
            )}
          </div>
        )}

        {useInstallment && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 bg-orange-50 p-3 rounded-lg">
            <span className="font-bold text-orange-800">
              {t("installments.amountToPayNow", "Amount to Pay Now")}
            </span>
            <span className="text-xl font-black text-orange-600">
              ₴{Number(installmentAmount).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
