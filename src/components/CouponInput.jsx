import React, { useState } from "react";
import { useApi } from "../context/ApiContext";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

const CouponInput = ({ onApply, t, initialDiscount = 0 }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { request } = useApi();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setLocalError(t("books.coupon.required") || "Please enter a coupon code");
      return;
    }

    setLoading(true);
    setLocalError("");

    try {
      const response = await request("check_coupon", {
        method: "POST",
        body: { coupon: couponCode.trim(), type: "book" },
        auth: true
      });

      if (response.success) {
        onApply({
          discount: parseFloat(response.data.coupon_discount),
          id: response.data.id
        });
      } else {
        onApply({ error: response.message || (t("books.coupon.invalid") || "The coupon is not valid") });
      }
    } catch (err) {
      const errorMsg = err.message || (t("books.coupon.invalid") || "The coupon is not valid");
      onApply({ error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl border-border bg-surface">
      <label className="block mb-2 text-sm font-medium text-text-secondary">
        {t("books.coupon.label") || "Coupon Code"}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder={t("books.coupon.placeholder") || "Enter coupon code"}
          className="flex-1 p-3 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading || initialDiscount > 0}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={loading || !couponCode.trim() || initialDiscount > 0}
          className="flex items-center gap-2 px-4 py-3 text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            t("books.coupon.apply") || "Apply"
          )}
        </button>
      </div>
      {localError && (
        <p className="flex items-center gap-1 mt-2 text-sm text-red-500">
          <FiX className="w-4 h-4" /> {localError}
        </p>
      )}
      {initialDiscount > 0 && (
        <p className="flex items-center gap-1 mt-2 text-sm text-green-600">
          <FiCheck className="w-4 h-4" /> {t("books.coupon.applied") || "Coupon applied!"} {t("books.coupon.discount", { percent: initialDiscount }) || `Discount: ${initialDiscount}%`}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
