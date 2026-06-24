import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiUser, FiPhone, FiMapPin, FiHome, FiCreditCard, FiRefreshCw } from "react-icons/fi";
import { FaCcVisa, FaApplePay, FaGooglePay, FaBookmark } from "react-icons/fa";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";
import { useTranslation } from 'react-i18next';
import { toast } from "react-toastify";
import CitySelector from "../../../components/Common/CitySelector";
import CouponInput from "../../../components/Common/CouponInput";
import IncompleteProfileModal from "../../../components/Modals/IncompleteProfileModal";
import SaveBeforeLoginModal from "../../../components/Modals/SaveBeforeLoginModal";

import he from "he";

export default function StoreCheckout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { request, invalidateCache } = useApi();
  const { userData, isLoggedIn } = useUser();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { t } = useTranslation();

  const invalidateOrdersCache = useCallback(() => {
    if (typeof invalidateCache === "function") {
      try {
        invalidateCache(["orders", "profile/get-my-profile"]);
      } catch (cacheError) {
        console.warn("Failed to invalidate order caches:", cacheError);
      }
    }
  }, [invalidateCache]);

  const item = state?.item || state?.book || state?.tool || state?.clothes;
  const productType = state?.productType || 'book';
  const idKey = (productType === 'book' || productType === 'booklet') ? 'book_id' : (productType === 'medical_tool' ? 'tool_id' : 'apparel_id');
  const isBookType = productType === 'book' || productType === 'booklet';
  const itemType = item?.type?.toLowerCase() === "delivery" ? 1 : (isBookType ? 2 : 1);
  const checkoutApi = isBookType ? 'place_order_book' : (productType === 'medical_tool' ? 'place_medical_tool_order' : 'place_apparel_order');
  
  const selectedColor = state?.color || '';
  const selectedSize = state?.size || '';

  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data for delivery books
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    phone1: "",
    phone2: "",
    city: "",
    city_id: "",
    branch_id: "",
    item_id: ""
  });

  // Branches data
  const [branches, setBranches] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // Paint order data
  const [loadingPaintData, setLoadingPaintData] = useState(false);

  // Coupon states
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Terms and conditions states
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Profile missing modal state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Save before login modal state
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  useEffect(() => {
    if (item?.images) {
      const images = Object.values(item.images);
      setMainImage(images[0]?.url || images[0]?.original_url || item.main_image || item.image || null);
    } else if (item) {
      setMainImage(item.main_image || item.image || null);
    }
  }, [item]);

  // Set client_id and item_id from user data and item
  useEffect(() => {
    if (userData?.id) {
      setFormData(prev => ({
        ...prev,
        client_id: userData.id.toString()
      }));
    }
    if (item?.id) {
      setFormData(prev => ({
        ...prev,
        item_id: item.id.toString()
      }));
    }
  }, [userData, item]);

  // Handle city selection and populate branches
  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      city_id: city.id.toString(),
      branch_id: "" // Reset branch selection when city changes
    }));

    // Fetch branches for the selected city
    try {
      const response = await request(`cities/${city.id}/branches`);
      if (response && response.data) {
        setBranches(response.data);
      } else {
        setBranches([]);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    }
  };



  // Fetch purchase policy when modal is opened
  useEffect(() => {
    if (showTerms) {
      setTermsLoading(true);
      request("purchase_policy")
        .then((result) => {
          if (result.data && result.data.length > 0) {
            const decoded = he.decode(result.data[0].description);
            setTermsText(decoded);
          } else {
            setTermsText(t('books.purchasePolicy.unable_to_load'));
          }
        })
        .catch(() => {
          setTermsText(t('books.purchasePolicy.error_fetching'));
        })
        .finally(() => setTermsLoading(false));
    }
  }, [showTerms, request, t]);

  // Fetch paint order data
  const fetchPaintOrderData = async () => {
    setLoadingPaintData(true);
    setError("");
    try {
      const response = await request('paint_order_data');
      if (response && response.data) {
        // Populate form with paint order data
        setFormData(prev => ({
          ...prev,
          client_name: response.data.client_name || prev.client_name,
          phone1: response.data.phone1 || prev.phone1,
          phone2: response.data.phone2 || prev.phone2,
          city: response.data.city || prev.city,
          region_id: response.data.region_id || prev.region_id
        }));
      }
    } catch (err) {
      // Handle 404 error gracefully - this endpoint may not exist
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setError(t('books.paint_data_unavailable'));
      } else {
        setError(err.message || t('books.failed_to_load_paint_data'));
      }
      console.error('Error fetching paint order data:', err);
    } finally {
      setLoadingPaintData(false);
    }
  };

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <p className="text-lg text-red-500">{t('books.no_book_selected')}</p>
          <button
            onClick={() => navigate("/books")}
            className="px-6 py-2 mt-4 text-white rounded-lg bg-primary"
          >
            {t('books.back_to_books')}
          </button>
        </div>
      </div>
    );
  }

  const images = Object.values(item.images || {});
  const priceNumber = parseFloat(item.price) || 0;
  const discountPercent = parseFloat(item.discount) || 0;
  const discountAmount = discountPercent > 0 ? (priceNumber * discountPercent / 100) : 0;
  const finalPrice = priceNumber - discountAmount;

  // Calculate coupon discount amount
  const couponDiscountAmount = finalPrice * (couponDiscount / 100);
  const discountedPrice = finalPrice - couponDiscountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    addToCart({
      id: item.id,
      type: "item",
      name: item.name,
      image: mainImage || "/logo.png",
      price: discountedPrice.toFixed(2),
      url: "/store/checkout",
      stateData: { item: item, itemType: itemType, productType: productType }
    });
  };

  const handleLoginClick = (e) => {
    e?.preventDefault();
    const isItemInCart = cartItems?.some(i => i.id === item.id && i.type === "item");
    if (!isItemInCart) {
      setShowSaveWarning(true);
    } else {
      const returnPath = item?.id ? `/item/${item.id}` : location.pathname;
      navigate('/login', { state: { from: returnPath } });
    }
  };

  const handleSaveAndLogin = () => {
    handleAddToCart();
    setShowSaveWarning(false);
    const returnPath = item?.id ? `/item/${item.id}` : location.pathname;
    navigate('/login', { state: { from: returnPath } });
  };

  const handleContinueToLogin = () => {
    setShowSaveWarning(false);
    const returnPath = item?.id ? `/item/${item.id}` : location.pathname;
    navigate('/login', { state: { from: returnPath } });
  };





const handleDeliveryOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.client_name.trim()) {
      setError(t('books.enter_name_error'));
      setLoading(false);
      return;
    }

    if (!formData.phone1.trim()) {
      setError(t('books.enter_phone_error'));
      setLoading(false);
      return;
    }

    // Validate phone number format (+ optional, digits 1 to 15, no spaces or other characters)
    const phoneRegex = /^\+?\d{1,15}$/;
    if (!phoneRegex.test(formData.phone1)) {
      setError(t('books.invalid_phone_error') || "The phone number is invalid; it must be between 1 and 15 digits only, without spaces or other symbols, and only a + sign is allowed at the beginning.");
      setLoading(false);
      return;
    }

    if (!formData.city_id || !formData.city.trim()) {
      setError(t('books.select_city_error'));
      setLoading(false);
      return;
    }

    if (selectedCity && branches.length > 0 && !formData.branch_id) {
      setError(t('books.select_branch_error'));
      setLoading(false);
      return;
    }

    try {
      // Require authentication to place an order
      // Use the token from request context or parse from tokenData instead of relying on 'token' or 'userToken' keys directly
      let token = null;
      try {
        const tokenData = localStorage.getItem("DR_KROK_tokenData");
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          if (parsed.token) {
            token = parsed.token;
          }
        }
      } catch {
        token = null;
      }

      if (!isLoggedIn || !token) {
        setError(t('books.login_required'));
        setLoading(false);
        const returnPath = item?.id ? `/item/${item.id}` : location.pathname;
        setTimeout(() => navigate('/login', { state: { from: returnPath } }), 1200);
        return;
      }
      // Prepare form data for multipart/form-data
      const formDataToSend = new FormData();
      // Backend expects client_id as part of the payload
      if (formData.client_id) {
        formDataToSend.append('client_id', formData.client_id);
      }
      formDataToSend.append('client_name', formData.client_name);
      formDataToSend.append('phone1', formData.phone1);
      formDataToSend.append('phone2', formData.phone2 || '');
      formDataToSend.append('city', formData.city);
      formDataToSend.append(idKey, item.id);
      formDataToSend.append('city_id', formData.city_id);
      formDataToSend.append('region_id', formData.branch_id);
      if (couponId) {
        formDataToSend.append('coupon_id', couponId.toString());
      }

      console.log('Sending order data:', {
        client_name: formData.client_name,
        phone1: formData.phone1,
        phone2: formData.phone2,
        city: formData.city,
        [idKey]: item.id,
        city_id: formData.city_id,
        region_id: formData.branch_id
      });
      
      if (productType === 'medical_clothes') {
        formDataToSend.append('color', selectedColor);
        formDataToSend.append('size', selectedSize);
      }

      const response = await request(checkoutApi, {
        method: 'POST',
        body: formDataToSend,
        auth: true,
        isFormData: true,
        invalidateCacheOnSuccess: ['orders', 'profile/get-my-profile']
      });

      console.log('Order response:', response);

      if (response && response.success === false) {
          throw new Error(response.message || t('books.order_failed'));
      }

      if (response?.data?.payment_url) {
        removeFromCart(item.id, "item");
        setSuccess(t('books.order_placed_successfully_redirecting') || "Order created! Redirecting to payment...");
        setTimeout(() => {
          window.location.href = response.data.payment_url;
        }, 1500);
        return;
      }

      invalidateOrdersCache();
      setSuccess(t('books.order_placed_successfully'));
      // Redirect to order confirmation or profile
      setTimeout(() => {
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 2000);

    } catch (err) {
      console.error('Order error:', err);
      if (err.message && err.message.includes('Profile data is missing')) {
        setShowProfileModal(true);
      } else {
        let errorMessage = err.message || t('books.order_failed');

        if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } 

        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePdfPurchase = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Require authentication to place an order
      // Use the token from request context or parse from tokenData instead of relying on 'token' or 'userToken' keys directly
      let token = null;
      try {
        const tokenData = localStorage.getItem("DR_KROK_tokenData");
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          if (parsed.token) {
            token = parsed.token;
          }
        }
      } catch {
        token = null;
      }

      if (!isLoggedIn || !token) {
        setError(t('books.login_required'));
        setLoading(false);
        const returnPath = item?.id ? `/item/${item.id}` : location.pathname;
        setTimeout(() => navigate('/login', { state: { from: returnPath } }), 1200);
        return;
      }

      // جهز البيانات المطلوبة فقط
      const formDataToSend = new FormData();
      formDataToSend.append(idKey, item.id);
      formDataToSend.append('quantity', 1);
      formDataToSend.append('type', 'PDF');
      if (couponId) {
        formDataToSend.append('coupon_id', couponId.toString());
      }
      // أضف client_id لو متاح
      if (userData?.id) {
        formDataToSend.append('client_id', userData.id.toString());
      }

      const response = await request(checkoutApi, {
        method: 'POST',
        body: formDataToSend,
        auth: true,
        isFormData: true,
        invalidateCacheOnSuccess: ['orders', 'profile/get-my-profile']
      });

      if (response && response.success === false) {
          throw new Error(response.message || t('books.purchase_failed'));
      }

      if (response?.data?.payment_url) {
        removeFromCart(item.id, "item");
        setSuccess(t('books.purchase_successful_redirecting') || "Order created! Redirecting to payment...");
        setTimeout(() => {
          window.location.href = response.data.payment_url;
        }, 1500);
        return;
      }

      invalidateOrdersCache();
      setSuccess(t('books.purchase_successful'));
      setTimeout(() => {
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 2000);

    } catch (err) {
      console.error('Purchase error:', err);
      if (err.message && err.message.includes('Profile data is missing')) {
        setShowProfileModal(true);
      } else {
        let errorMessage = err.message || t('books.purchase_failed');

        if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } 

        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApply = (result) => {
    if (result.error) {
      setCouponError(result.error);
      setCouponMessage("");
      // Reset coupon data on error
      setCouponDiscount(0);
      setCouponId(null);
    } else {
      setCouponDiscount(result.discount);
      setCouponId(result.id);
      setCouponError("");
      setCouponMessage(t('books.coupon.applied') || 'Coupon applied successfully!');
      
      // Debug log to verify the discount is being set
      console.log('Coupon applied:', {
        discount: result.discount,
        id: result.id,
        finalPrice: finalPrice,
        discountAmount: finalPrice * (result.discount / 100),
        newTotal: finalPrice - (finalPrice * (result.discount / 100))
      });
    }
  };



  return (
    <section className="min-h-screen px-4 py-10 bg-background text-text md:px-8">
      <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2">
        {/* LEFT - Product summary */}
        <aside className="order-2 lg:order-1">
          <div className="sticky space-y-6 top-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 text-text-secondary hover:text-primary"
            >
              <FiChevronLeft /> {t('books.back')}
            </button>

            <div className="overflow-hidden border shadow-sm rounded-2xl border-border bg-surface">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={item.name}
                  className="object-cover w-full h-96"
                />
              ) : (
                <div className="flex items-center justify-center w-full text-gray-500 bg-gray-200 h-96">
                  <div className="text-center">
                    <FiCreditCard className="w-16 h-16 mx-auto mb-2" />
                    <p>{t('books.no_image_available')}</p>
                  </div>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img.url || img.original_url)}
                    className={`w-20 h-16 overflow-hidden rounded-lg border ${
                      mainImage === (img.url || img.original_url)
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={img.url || img.original_url}
                      className="object-cover w-full h-full"
                      alt={`thumb-${i}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 border rounded-2xl border-border bg-surface">
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <p className="mt-1 text-sm text-text-secondary">by {item.author}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="flex items-center gap-2">
                    {discountAmount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₴{priceNumber.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-primary">
                      ₴{finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {itemType === 1 ? t('books.delivery_included') : t('books.pdf_download')}
                  </div>
                </div>

                <div className="text-sm text-text-secondary">
                  {item.pages_count} {t('books.pages')}
                </div>
              </div>

              <div className="mt-4 text-sm text-text-secondary">
                <p><strong>{t('books.language')}:</strong> {item.language}</p>
                <p><strong>{t('books.category')}:</strong> {item.category?.name}</p>
                <p><strong>{t('books.type')}:</strong> {itemType === 1 ? t('books.delivery') : t('books.pdf_only')}</p>
              </div>

              <div 
                   className={`mt-4 leading-relaxed text-text-secondary ${!isExpanded ? 'line-clamp-4' : ''}`}
                   dangerouslySetInnerHTML={{ __html: item.description }} />
              {item.description && item.description.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 font-medium underline text-primary hover:text-primary/80"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>


          </div>
        </aside>

        {/* RIGHT - Order form or payment */}
        <main className="order-1 lg:order-2">
          <div className="p-6 border shadow-md rounded-2xl border-border bg-surface">
            <h2 className="text-2xl font-bold">
              {itemType === 1 ? t('books.delivery_order') : t('books.purchase_pdf')}
            </h2>
            <p className="mt-1 text-text-secondary">
              {itemType === 1 ? t('books.fill_delivery_info') : t('books.select_payment_method')}
            </p>

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
                  <FiRefreshCw className={loadingPaintData ? 'animate-spin' : ''} />
                  {loadingPaintData ? t('books.loading_paint_data') : t('books.load_paint_data')}
                </button>
                <p className="mt-1 text-xs text-text-secondary">
                  {t('books.optional_load_paint_data')}
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
                    <div>{t('books.coupon.discount_label', { percent: couponDiscount }) || `Coupon Discount (${couponDiscount}%)`}</div>
                    <div>-₴{couponDiscountAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                    <div>{t('books.original_total') || 'Original Total'}</div>
                    <div className="line-through">₴{finalPrice.toFixed(2)}</div>
                  </div>
                </>
              )}
              {itemType === 1 && (
                <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                  <div>{t('books.delivery')}</div>
                  <div>{t('books.free')}</div>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 text-lg font-semibold">
                <div>{t('books.total')}</div>
                <div className={couponDiscount > 0 ? "text-green-600" : ""}>₴{discountedPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* Delivery Form */}
            {itemType === 1 && (
              <form onSubmit={handleDeliveryOrder} className="mt-6 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiUser /> {t('books.client_name')} *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_client_name')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiPhone /> {t('books.phone_number')} *
                  </label>
                  <input
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_phone_number')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiPhone /> {t('books.phone_number_2')} ({t('books.optional')})
                  </label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('books.enter_phone_number_2')}
                  />
                </div>

                {/* <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FiMapPin /> Region *
                  </label>
                  <select
                    name="region_id"
                    value={formData.region_id}
                    onChange={handleRegionChange}
                    required
                    className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="mb-4">
                  <p className="text-sm text-text-secondary">
                    {t('books.select_city_branch_instruction')}
                  </p>
                </div>

                <CitySelector
                  value={formData.city}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      city: e.target.value,
                      city_id: e.target.city_id ? e.target.city_id.toString() : ""
                    }));
                  }}
                  onCitySelect={handleCitySelect}
                  required
                  placeholder={t('city_selector.select_city')}
                />

                {selectedCity && branches.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                      <FiHome /> Branch *
                    </label>
                    <select
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_id: e.target.value }))}
                      required
                      className="w-full p-3 mt-1 border rounded-lg border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{t('books.select_branch_placeholder')}</option>
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
                  <h3 className="mb-4 text-lg font-semibold">{t('books.select_payment_method')}</h3>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'apple-pay', name: 'Apple Pay', icon: FaApplePay, color: 'text-black dark:text-white' },
                      { id: 'google-pay', name: 'Google Pay', icon: FaGooglePay, color: 'text-gray-900 dark:text-gray-100' },
                      { id: 'visa', name: 'Visa', icon: FaCcVisa, color: 'text-blue-600' }
                    ].map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div
                          key={method.id}
                          className="flex flex-col items-center flex-1 min-w-[100px] p-4 border rounded-xl border-border bg-background/60"
                        >
                          <IconComponent className={`text-3xl mb-2 ${method.color}`} />
                          <span className="text-sm font-medium">{t(`books.${method.id}`)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>



                {/* Hidden client_id field */}
                <input
                  type="hidden"
                  name="client_id"
                  value={formData.client_id}
                />

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
                      {t('books.agree_to_terms_start')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-primary hover:underline"
                      >
                        {t('books.purchase_policy')}
                      </button>
                    </label>
                  </div>
                  {!agreeToTerms && (
                    <p className="mt-2 text-sm text-red-500">
                      {t('books.must_agree_to_terms')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !agreeToTerms}
                  className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('books.placing_order') : t('books.place_order')}
                </button>
                {/* Save Path Button */}
                {!isLoggedIn && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="text-sm font-medium text-primary hover:text-secondary hover:underline"
                    >
                      {t('courses.loginToSubscribe', 'Login to subscribe')}
                    </button>
                    <button 
                      type="button"
                      onClick={handleAddToCart}
                      className="flex justify-center items-center w-full gap-2 px-6 py-3 mt-4 font-medium transition-all duration-300 border rounded-lg text-primary border-primary hover:bg-primary hover:text-white hover:scale-[1.02] hover:shadow-lg active:scale-95"
                    >
                      <FaBookmark />
                      {t('cart.save_path', 'Save to wishlist to return later')}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* PDF Purchase */}
            {itemType === 2 && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold">{t('books.select_payment_method')}</h3>
                <div className="flex gap-4">
                  {[
                    { id: 'apple-pay', name: 'Apple Pay', icon: FaApplePay, color: 'text-black dark:text-white' },
                    { id: 'google-pay', name: 'Google Pay', icon: FaGooglePay, color: 'text-gray-900 dark:text-gray-100' },
                    { id: 'visa', name: 'Visa', icon: FaCcVisa, color: 'text-blue-600' }
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
                      {t('books.agree_to_terms_start')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-primary hover:underline"
                      >
                        {t('books.purchase_policy')}
                      </button>
                    </label>
                  </div>
                  {!agreeToTerms && (
                    <p className="mt-2 text-sm text-red-500">
                      {t('books.must_agree_to_terms')}
                    </p>
                  )}
                </div>

                <button
                  onClick={handlePdfPurchase}
                  disabled={loading || !agreeToTerms}
                  className="w-full px-6 py-3 mt-6 font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('books.processing') : t('books.purchase_now')}
                </button>
                {/* Save Path Button */}
                {!isLoggedIn && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="text-sm font-medium text-primary hover:text-secondary hover:underline"
                    >
                      {t('courses.loginToSubscribe', 'Login to subscribe')}
                    </button>
                    <button 
                      type="button"
                      onClick={handleAddToCart}
                      className="flex justify-center items-center w-full gap-2 px-6 py-3 mt-4 font-medium transition-all duration-300 border rounded-lg text-primary border-primary hover:bg-primary hover:text-white hover:scale-[1.02] hover:shadow-lg active:scale-95"
                    >
                      <FaBookmark />
                      {t('cart.save_path', 'Save to wishlist to return later')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[80vh] p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('books.purchasePolicy.title')}</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                {t('books.purchasePolicy.close')}
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

      {/* Profile Incomplete Modal */}
      <IncompleteProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        showSaveOption={!cartItems?.some(i => i.id === item?.id && i.type === "item")}
        onSave={handleAddToCart}
      />
    </section>
  );
}