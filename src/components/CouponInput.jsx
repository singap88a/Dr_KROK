import React, { useState } from "react";
import { useApi } from "../context/ApiContext";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

const CouponInput = ({ onApply, t, initialDiscount = 0, type = "book" }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { request } = useApi();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setLocalError(t(`${type}s.coupon.required`) || "Please enter a coupon code");
      return;
    }

    setLoading(true);
    setLocalError("");

    try {
      const response = await request("check_coupon", {
        method: "POST",
        body: { coupon: couponCode.trim(), type: type },
        auth: true
      });

      if (response.success) {
        onApply({
          discount: parseFloat(response.data.coupon_discount),
          id: response.data.id
        });
      } else {
        onApply({ error: response.message || (t(`${type}s.coupon.invalid`) || "The coupon is not valid") });
      }
    } catch (err) {
      const errorMsg = err.message || (t(`${type}s.coupon.invalid`) || "The coupon is not valid");
      onApply({ error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl border-border bg-surface">
      <label className="block mb-2 text-sm font-medium text-text-secondary">
        {t(`${type}s.coupon.label`) || "Coupon Code"}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder={t(`${type}s.coupon.placeholder`) || "Enter coupon code"}
          className="flex-1 p-3 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading || initialDiscount > 0}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={loading || !couponCode.trim() || initialDiscount > 0}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          {loading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            t(`${type}s.coupon.apply`) || "Apply"
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
          <FiCheck className="w-4 h-4" /> {t(`${type}s.coupon.applied`) || "Coupon applied!"} {t(`${type}s.coupon.discount`, { percent: initialDiscount }) || `Discount: ${initialDiscount}%`}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
