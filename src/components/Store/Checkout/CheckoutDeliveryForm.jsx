import React from "react";
import { FiUser, FiPhone, FiHome } from "react-icons/fi";
import { FaCcVisa, FaApplePay, FaGooglePay, FaBookmark } from "react-icons/fa";
import CitySelector from "../../Common/CitySelector";

export default function CheckoutDeliveryForm({
  formData,
  handleInputChange,
  handleCitySelect,
  setFormData,
  selectedCity,
  branches,
  agreeToTerms,
  setAgreeToTerms,
  setShowTerms,
  loading,
  handleDeliveryOrder,
  isLoggedIn,
  handleLoginClick,
  handleAddToCart,
  t,
}) {
  return (
    <form onSubmit={handleDeliveryOrder} className="mt-6 space-y-4">
      {/* Shipping Full Name Notice */}
      <div className="p-3 border rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <FiUser className="text-primary text-sm flex-shrink-0" />
          <span>
            {t(
              "books.shipping_name_notice_title",
              "متطلبات شركة الشحن: الاسم ثلاثي بالكامل"
            )}
          </span>
        </div>
        <p className="text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
          {t(
            "books.shipping_name_notice_desc",
            "حرصاً على وصول شحنتك بدون تأخير، يُشترط إدخال الاسم الأول واسم الأب في الحقل الأول، والاسم الثالث (أو اللقب / اسم العائلة) في الحقل الثاني."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name & Father's Name */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-text-secondary mb-1">
            <span className="flex items-center gap-1.5">
              <FiUser /> {t("books.client_name", "الاسم الأول واسم الأب")} *
            </span>
            <span className="text-[11px] font-normal text-text-muted">
              ({t("books.min_two_names", "اسمان على الأقل")})
            </span>
          </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder={t(
              "books.enter_client_name",
              "الاسم الأول واسم الأب (مثال: أحمد محمد)"
            )}
          />
        </div>

        {/* Third Name / Surname / Family Name */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-text-secondary mb-1">
            <span className="flex items-center gap-1.5">
              <FiUser /> {t("books.second_client_name", "الاسم الثالث / اللقب")} *
            </span>
            <span className="text-[11px] font-normal text-text-muted">
              ({t("books.min_one_name", "اسم واحد على الأقل")})
            </span>
          </label>
          <input
            type="text"
            name="second_client_name"
            value={formData.second_client_name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder={t(
              "books.enter_second_client_name",
              "الاسم الثالث أو اللقب (مثال: الشامي)"
            )}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <FiPhone /> {t("books.phone_number")} *
        </label>
        <input
          type="tel"
          name="phone1"
          value={formData.phone1}
          onChange={handleInputChange}
          required
          className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t("books.enter_phone_number")}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <FiPhone /> {t("books.phone_number_2")} ({t("books.optional")})
        </label>
        <input
          type="tel"
          name="phone2"
          value={formData.phone2}
          onChange={handleInputChange}
          className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t("books.enter_phone_number_2")}
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-text-secondary">
          {t("books.select_city_branch_instruction")}
        </p>
      </div>

      <CitySelector
        value={formData.city}
        onChange={(e) => {
          setFormData((prev) => ({
            ...prev,
            city: e.target.value,
            city_id: e.target.city_id ? e.target.city_id.toString() : "",
          }));
        }}
        onCitySelect={handleCitySelect}
        required
        placeholder={t("city_selector.select_city")}
      />

      {selectedCity && branches.length > 0 && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <FiHome /> Branch *
          </label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, branch_id: e.target.value }))
            }
            required
            className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">{t("books.select_branch_placeholder")}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Payment Methods Style Selection */}
      <div className="mt-8 border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold">
          {t("books.select_payment_method")}
        </h3>
        <div className="flex flex-wrap gap-4">
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
                className="flex flex-col items-center flex-1 min-w-[100px] p-4 border rounded-xl border-border bg-background/60"
              >
                <IconComponent className={`text-3xl mb-2 ${method.color}`} />
                <span className="text-sm font-medium">
                  {t(`books.${method.id}`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden client_id field */}
      <input type="hidden" name="client_id" value={formData.client_id} />

      {/* Terms and Conditions */}
      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-text-secondary">
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
        type="submit"
        disabled={loading || !agreeToTerms}
        className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("books.placing_order") : t("books.place_order")}
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
    </form>
  );
}
