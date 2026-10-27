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
import CheckoutProductSummary from "../../../components/Store/Checkout/CheckoutProductSummary";
import CheckoutPriceSummary from "../../../components/Store/Checkout/CheckoutPriceSummary";
import CheckoutDeliveryForm from "../../../components/Store/Checkout/CheckoutDeliveryForm";
import CheckoutDigitalPayment from "../../../components/Store/Checkout/CheckoutDigitalPayment";
import CheckoutTermsModal from "../../../components/Store/Checkout/CheckoutTermsModal";
import CheckoutInstallmentModal from "../../../components/Store/Checkout/CheckoutInstallmentModal";

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
  const isDelivery = item?.type?.toLowerCase().trim() === "delivery" || item?.type?.toLowerCase().trim() === t('books.delivery')?.toLowerCase().trim();
  const itemType = isDelivery ? 1 : (isBookType ? 2 : 1);
  const checkoutApi = isBookType ? 'place_order_book' : (productType === 'medical_tool' ? 'place_medical_tool_order' : 'place_apparel_order');
  
  const selectedColor = state?.color || '';
  const selectedSize = state?.size || '';
  const embroidery = state?.embroidery || { has_embroidery: false };
  const embroideryPrice = embroidery.has_embroidery ? (Number(embroidery.embroidery_price) || 0) : 0;

  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data for delivery books
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    second_client_name: "",
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

  // Installment states
  const [useInstallment, setUseInstallment] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentError, setInstallmentError] = useState("");
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showNoInstallmentPopup, setShowNoInstallmentPopup] = useState(false);
  
  const isPdfBook = isBookType && !isDelivery;

  // Points Logic
  const [usePoints, setUsePoints] = useState(false);
  const pointsBalance = Number(userData?.points_balance || 0);
  const minPointsToRedeem = Number(userData?.settings_min_points_to_redeem || 0);
  const pointsMonetaryValue = Number(userData?.points_monetary_value || 0);
  
  const isPointsEligible = pointsBalance > 0 && pointsBalance >= minPointsToRedeem;
  
  const isMerchantAllowed = (() => {
    if (!item || !userData?.allowed_points_merchants?.length) return false;
    const instructorId = item?.instructor?.id || item?.merchant_id;
    const instructorEmail = item?.instructor?.email || item?.merchant_email;
    return userData.allowed_points_merchants.some(
      m => (instructorId && m.id === instructorId) ||
           (instructorEmail && m.email === instructorEmail)
    );
  })();

  const canUsePoints = isPointsEligible && isMerchantAllowed;

  const handleOpenInstallmentModal = () => {
    const depositPct = Number(item?.course_deposit_percentage || 0);
    if (depositPct === 0) {
      setShowNoInstallmentPopup(true);
      return;
    }
    setShowInstallmentModal(true);
    setInstallmentAmount("");
    setInstallmentError("");
  };

  const handleCloseInstallmentModal = () => {
    setShowInstallmentModal(false);
    setInstallmentAmount("");
    setInstallmentError("");
    setUseInstallment(false);
  };

  const validateInstallmentAmount = (amount) => {
    // We need to calculate discountedPrice dynamically to validate properly
    // It's already calculated below as `discountedPrice`, but we'll recalculate here or use the state if we move it
    const priceNumber = parseFloat(item.price) || 0;
    const discountPercent = parseFloat(item.discount) || 0;
    const discountAmount = discountPercent > 0 ? (priceNumber * discountPercent / 100) : 0;
    const finalPrice = priceNumber - discountAmount;
    const couponDisc = finalPrice * (couponDiscount / 100);
    const dPrice = finalPrice - couponDisc;

    const depositPct = Number(item?.course_deposit_percentage || 50);
    const minAmount = dPrice * (depositPct / 100);
    const numericAmount = Number(amount);

    if (numericAmount < minAmount) {
      return t('installments.installmentModal.errorMin', { min: minAmount.toFixed(2) }, `Minimum installment amount is ₴${minAmount.toFixed(2)}`);
    }

    if (numericAmount > dPrice) {
      return t('installments.installmentModal.errorMax', { price: dPrice.toFixed(2) }, `Installment amount cannot exceed the total price (₴${dPrice.toFixed(2)})`);
    }

    return null;
  };

  const handleApplyInstallment = () => {
    const validationError = validateInstallmentAmount(installmentAmount);

    if (validationError) {
      setInstallmentError(validationError);
      return;
    }

    setUseInstallment(true);
    setShowInstallmentModal(false);
    setInstallmentError("");
  };

  const handleCancelInstallment = () => {
    setUseInstallment(false);
    setInstallmentAmount("");
    setInstallmentError("");
  };

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
      setFormData(prev => {
        let client_name = prev.client_name;
        let second_client_name = prev.second_client_name;

        // Auto-split user's name if form fields are empty and user has a full name
        if (!client_name && !second_client_name && userData?.name) {
          const parts = userData.name.trim().split(/\s+/).filter(Boolean);
          if (parts.length >= 3) {
            client_name = parts.slice(0, 2).join(' ');
            second_client_name = parts.slice(2).join(' ');
          } else if (parts.length === 2) {
            client_name = parts.join(' ');
          } else {
            client_name = userData.name;
          }
        }

        return {
          ...prev,
          client_id: userData.id.toString(),
          client_name,
          second_client_name,
          phone1: prev.phone1 || userData.phone || ""
        };
      });
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
        let fetchedClientName = response.data.client_name || "";
        let fetchedSecondName = response.data.second_client_name || "";

        if (!fetchedSecondName && fetchedClientName) {
          const parts = fetchedClientName.trim().split(/\s+/).filter(Boolean);
          if (parts.length >= 3) {
            fetchedClientName = parts.slice(0, 2).join(' ');
            fetchedSecondName = parts.slice(2).join(' ');
          }
        }

        // Populate form with paint order data
        setFormData(prev => ({
          ...prev,
          client_name: fetchedClientName || prev.client_name,
          second_client_name: fetchedSecondName || prev.second_client_name,
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
            onClick={() => navigate("/store/books")}
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
  const discountedPriceBeforeEmbroidery = finalPrice - couponDiscountAmount;
  // Add embroidery price on top after all other discounts
  const discountedPrice = discountedPriceBeforeEmbroidery + embroideryPrice;

  const pointsDiscountAmount = usePoints && canUsePoints ? Math.min(pointsMonetaryValue, discountedPrice) : 0;
  const finalDiscountedPrice = discountedPrice - pointsDiscountAmount;

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

  const finalAmountToPay = useInstallment ? installmentAmount : finalDiscountedPrice.toFixed(2);





const handleDeliveryOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    const firstNames = (formData.client_name || '').trim().split(/\s+/).filter(Boolean);
    if (firstNames.length === 0) {
      setError(t('books.enter_first_name_error', 'يرجى إدخال الاسم الأول واسم الأب في الحقل الأول.'));
      setLoading(false);
      return;
    }

    if (firstNames.length < 2) {
      setError(t('books.enter_two_names_error', 'متطلبات شركة الشحن: يجب إدخال اسمين على الأقل في حقل الاسم الأول (الاسم الأول واسم الأب).'));
      setLoading(false);
      return;
    }

    const secondNames = (formData.second_client_name || '').trim().split(/\s+/).filter(Boolean);
    if (secondNames.length === 0) {
      setError(t('books.enter_second_name_error', 'متطلبات شركة الشحن: يرجى إدخال الاسم الثالث أو اللقب (اسم العائلة) في الحقل الثاني.'));
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
      formDataToSend.append('client_name', formData.client_name.trim());
      formDataToSend.append('second_client_name', formData.second_client_name.trim());
      formDataToSend.append('phone1', formData.phone1);
      formDataToSend.append('phone2', formData.phone2 || '');
      formDataToSend.append('city', formData.city);
      formDataToSend.append(idKey, item.id);
      formDataToSend.append('city_id', formData.city_id);
      formDataToSend.append('region_id', formData.branch_id);
      if (couponId) {
        formDataToSend.append('coupon_id', couponId.toString());
      }
      
      // Add amount and deposit_amount for installments
      formDataToSend.append('amount', finalAmountToPay.toString());
      formDataToSend.append('deposit_amount', finalAmountToPay.toString());

      if (usePoints && canUsePoints) {
        formDataToSend.append('use_points', '1');
      }

      console.log('Sending order data:', {
        client_name: formData.client_name.trim(),
        second_client_name: formData.second_client_name.trim(),
        phone1: formData.phone1,
        phone2: formData.phone2,
        city: formData.city,
        [idKey]: item.id,
        city_id: formData.city_id,
        region_id: formData.branch_id
      });
      
      if (productType === 'medical_clothes') {
        formDataToSend.append('color', selectedColor);
        if (selectedSize) formDataToSend.append('size', selectedSize);
        // Embroidery fields
        formDataToSend.append('has_embroidery', embroidery.has_embroidery ? '1' : '0');
        if (embroidery.has_embroidery) {
          formDataToSend.append('embroidery_name', embroidery.embroidery_name || '');
          formDataToSend.append('embroidery_color', embroidery.embroidery_color || '');
          formDataToSend.append('embroidery_font', embroidery.embroidery_font || '');
        }
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
      if (usePoints && canUsePoints) {
        formDataToSend.append('use_points', '1');
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
        <CheckoutProductSummary
          item={item}
          mainImage={mainImage}
          setMainImage={setMainImage}
          images={images}
          priceNumber={priceNumber}
          discountAmount={discountAmount}
          finalPrice={finalPrice}
          itemType={itemType}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          navigate={navigate}
          t={t}
        />

        {/* RIGHT - Form and Payment */}
        <main className="order-1 lg:order-2">
          <div className="p-6 border shadow-md rounded-2xl border-border bg-surface">
            <h2 className="text-2xl font-bold">
              {itemType === 1 ? t('books.delivery_order') : t('books.purchase_pdf')}
            </h2>
            <p className="mt-1 text-text-secondary">
              {itemType === 1 ? t('books.fill_delivery_info') : t('books.select_payment_method')}
            </p>

            <CheckoutPriceSummary
              item={item}
              itemType={itemType}
              isBookType={isBookType}
              isPdfBook={isPdfBook}
              finalPrice={finalPrice}
              couponDiscount={couponDiscount}
              couponDiscountAmount={couponDiscountAmount}
              embroidery={embroidery}
              embroideryPrice={embroideryPrice}
              finalDiscountedPrice={finalDiscountedPrice}
              handleCouponApply={handleCouponApply}
              error={error}
              success={success}
              couponError={couponError}
              couponMessage={couponMessage}
              loadingPaintData={loadingPaintData}
              fetchPaintOrderData={fetchPaintOrderData}
              canUsePoints={canUsePoints}
              usePoints={usePoints}
              setUsePoints={setUsePoints}
              pointsBalance={pointsBalance}
              pointsMonetaryValue={pointsMonetaryValue}
              pointsDiscountAmount={pointsDiscountAmount}
              useInstallment={useInstallment}
              installmentAmount={installmentAmount}
              handleCancelInstallment={handleCancelInstallment}
              handleOpenInstallmentModal={handleOpenInstallmentModal}
              t={t}
            />

            {itemType === 1 ? (
              <CheckoutDeliveryForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleCitySelect={handleCitySelect}
                setFormData={setFormData}
                selectedCity={selectedCity}
                branches={branches}
                agreeToTerms={agreeToTerms}
                setAgreeToTerms={setAgreeToTerms}
                setShowTerms={setShowTerms}
                loading={loading}
                handleDeliveryOrder={handleDeliveryOrder}
                isLoggedIn={isLoggedIn}
                handleLoginClick={handleLoginClick}
                handleAddToCart={handleAddToCart}
                t={t}
              />
            ) : (
              <CheckoutDigitalPayment
                agreeToTerms={agreeToTerms}
                setAgreeToTerms={setAgreeToTerms}
                setShowTerms={setShowTerms}
                loading={loading}
                handlePdfPurchase={handlePdfPurchase}
                isLoggedIn={isLoggedIn}
                handleLoginClick={handleLoginClick}
                handleAddToCart={handleAddToCart}
                t={t}
              />
            )}
          </div>
        </main>
      </div>

      {/* Terms and Conditions Modal */}
      <CheckoutTermsModal
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        termsLoading={termsLoading}
        termsText={termsText}
        t={t}
      />

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
        showSaveOption={!cartItems?.some(i => i.id === item?.id && i.type === 'item')}
        onSave={handleAddToCart}
      />

      {/* Installment Modals */}
      <CheckoutInstallmentModal
        showInstallmentModal={showInstallmentModal}
        handleCloseInstallmentModal={handleCloseInstallmentModal}
        item={item}
        installmentAmount={installmentAmount}
        setInstallmentAmount={setInstallmentAmount}
        installmentError={installmentError}
        setInstallmentError={setInstallmentError}
        handleApplyInstallment={handleApplyInstallment}
        discountedPrice={discountedPrice}
        showNoInstallmentPopup={showNoInstallmentPopup}
        setShowNoInstallmentPopup={setShowNoInstallmentPopup}
        t={t}
      />
    </section>
  );
}
