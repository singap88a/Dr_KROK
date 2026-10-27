import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";
import LoadingSpinner from "../../Common/LoadingSpinner";
import CouponInput from "../../Common/CouponInput";
import SubscriptionSuccess from "./SubscriptionSuccess";
import IncompleteProfileModal from "../../Modals/IncompleteProfileModal";
import SaveBeforeLoginModal from "../../Modals/SaveBeforeLoginModal";
import CourseAlreadyEnrolled from "./components/CourseAlreadyEnrolled";
import CourseSubscriptionHeader from "./components/CourseSubscriptionHeader";
import CourseSubscriptionDetails from "./components/CourseSubscriptionDetails";
import CourseSubscriptionSummary from "./components/CourseSubscriptionSummary";
import CourseSubscriptionModals from "./components/CourseSubscriptionModals";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPlay,
  FaClock,
  FaUsers,
  FaBookOpen,
  FaStar,
  FaRegStar,
  FaGraduationCap,
  FaLanguage,
  FaLevelUpAlt,
  FaCertificate,
  FaCheck,
  FaLock,
  FaShoppingCart,
  FaBookmark,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCcVisa,
  FaApplePay,
  FaGooglePay,
  FaUser,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
  FaExclamationTriangle,
  FaInfoCircle,
  FaGem,
} from "react-icons/fa";

export default function CourseSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, getCenterCourseById, getCourseAccess, subscribeToCourse, subscribeToLiveCourse, subscribeToCenterCourse, request, getAuthToken } = useApi();
  const { isLoggedIn, userData } = useUser();
  const { addToCart, cartItems, removeFromCart } = useCart();

  const isLiveCourse = location.pathname.includes('live-courses');
  const isCenterCourse = location.pathname.includes('center-courses');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Coupon states
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Payment method (default to visa for informational display)
  const selectedPayment = "visa";

  // States الجديدة للتقسيط
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showNoInstallmentPopup, setShowNoInstallmentPopup] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [useInstallment, setUseInstallment] = useState(false);
  const [installmentError, setInstallmentError] = useState("");

  // States جديدة لسياسة الشراء
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);

  // Profile missing modal state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Save before login modal state
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  // Points state
  const [usePoints, setUsePoints] = useState(false);

  // Check if user is eligible to use points:
  // 1. Has enough points >= min required
  // 2. Course instructor is in allowed_points_merchants
  const isPointsEligible = (() => {
    if (!isLoggedIn || !userData) return false;
    const balance = Number(userData.points_balance || 0);
    const minRequired = Number(userData.settings_min_points_to_redeem || 0);
    if (balance < minRequired || minRequired === 0) return false;
    return true;
  })();

  // Check if instructor is whitelisted for points
  const isInstructorAllowed = (() => {
    if (!course || !userData?.allowed_points_merchants?.length) return false;
    const instructorId = course?.instructor?.id;
    const instructorEmail = course?.instructor?.email;
    return userData.allowed_points_merchants.some(
      m => (instructorId && m.id === instructorId) ||
           (instructorEmail && m.email === instructorEmail)
    );
  })();

  const canUsePoints = isPointsEligible && isInstructorAllowed;

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load course details
        const courseData = await (isCenterCourse ? getCenterCourseById(id) : isLiveCourse ? getLiveCourseById(id) : getVideoCourseById(id));
        if (!mounted) return;
        setCourse(courseData);

        // Check access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id, isCenterCourse ? 'center_course' : isLiveCourse ? 'live_course' : 'video_course');
            setHasAccess(access);
          } catch {
            // If access check fails, assume no access for paid content
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          // Not logged in, only free content accessible
          setHasAccess(false);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load course details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isLiveCourse, isCenterCourse, getVideoCourseById, getLiveCourseById, getCenterCourseById, getCourseAccess, isLoggedIn]);

  // Fetch purchase policy when modal is opened
  useEffect(() => {
    if (showTerms) {
      setTermsLoading(true);
      request("purchase_policy")
        .then((result) => {
          if (result.data && result.data.length > 0) {
            // Use he.decode if you have HTML entities, otherwise use directly
            const decoded = result.data[0].description;
            setTermsText(decoded);
          } else {
            setTermsText(t('courses.purchasePolicy.unable_to_load', 'Unable to load purchase policy.'));
          }
        })
        .catch(() => {
          setTermsText(t('courses.purchasePolicy.error_fetching', 'Error fetching purchase policy.'));
        })
        .finally(() => setTermsLoading(false));
    }
  }, [showTerms, request, t]);

  const handleCouponApply = (result) => {
    if (result.error) {
      setCouponError(result.error);
      setCouponMessage("");
      setCouponDiscount(0);
      setCouponId(null);
    } else {
      setCouponDiscount(result.discount);
      setCouponId(result.id);
      setCouponError("");
      setCouponMessage(t('courses.coupon.applied') || 'Coupon applied successfully!');
    }
  };

  // دالة لفتح وإغلاق المودال
  const handleOpenInstallmentModal = () => {
    // Check if this course supports installments
    const depositPct = Number(course?.course_deposit_percentage || 0);
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

  // دالة التحقق من مبلغ التقسيط
  // دالة التحقق من مبلغ التقسيط
  const validateInstallmentAmount = (amount) => {
    // Calculate minimum amount based on course_deposit_percentage
    const depositPct = Number(course?.course_deposit_percentage || 50);
    const minAmount = discountedPrice * (depositPct / 100);
    const numericAmount = Number(amount);

    if (numericAmount < minAmount) {
      return t('installments.installmentModal.errorMin', { min: minAmount.toFixed(2) }, `Minimum installment amount is ₴${minAmount.toFixed(2)}`);
    }

    if (numericAmount > discountedPrice) {
      return t('installments.installmentModal.errorMax', { price: discountedPrice.toFixed(2) }, `Installment amount cannot exceed the total price (₴${discountedPrice.toFixed(2)})`);
    }

    return null;
  };

  // دالة تطبيق التقسيط
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

  // دالة إلغاء التقسيط
  const handleCancelInstallment = () => {
    setUseInstallment(false);
    setInstallmentAmount("");
    setInstallmentError("");
  };

  const handleSubscription = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const isProfileIncomplete = (u) => {
      return !u?.phone || (!u?.university_id && !u?.university?.id) || !u?.college_year;
    };

    if (isProfileIncomplete(userData)) {
      setShowProfileModal(true);
      return;
    }

    // Check if user agreed to purchase policy
    if (!agreeToTerms) {
      setError(t('courses.must_agree_to_purchase_policy', 'You must agree to the purchase policy to subscribe.'));
      return;
    }

    setIsSubscribing(true);
    setError("");

    const finalAmount = useInstallment ? installmentAmount : discountedPrice;
    // getAuthToken is already destructured from useApi at the top of the component

    try {
      let response;

      if (isCenterCourse) {
        response = await subscribeToCenterCourse(id, selectedPayment, finalAmount, couponId, usePoints);
      } else if (isLiveCourse) {
        response = await subscribeToLiveCourse(id, selectedPayment, finalAmount, couponId, usePoints);
      } else {
        response = await subscribeToCourse(id, selectedPayment, finalAmount, couponId, usePoints);
      }

      console.log('Subscription response:', response);

      if (response && response.success) {
        if (response.data?.payment_url) {
          removeFromCart(id, isCenterCourse ? 'center_course' : isLiveCourse ? 'live_course' : 'course');
          // Redirect to the payment URL from the response
          window.location.href = response.data.payment_url;
        } else if (response.data?.invoice_url) {
          removeFromCart(id, isCenterCourse ? 'center_course' : isLiveCourse ? 'live_course' : 'course');
          // Fallback for invoice_url if that's still used in some cases
          window.location.href = response.data.invoice_url;
        } else {
          // If no payment URL, assume direct success (e.g. free course or 100% discount)
          const dataToSet = response.data || response;
          setOrderData(dataToSet);
          setSubscriptionSuccess(true);
          setUseInstallment(false);
        }
      } else {
        throw new Error(response?.message || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (err.message && err.message.includes("Profile data is missing")) {
        setShowProfileModal(true);
      } else {
        setError(err.message || t('courses.subscription_failed') || 'Payment initialization failed');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
      }
    }
    return stars;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">{t("common.error", "Error")}: {error || t("courses.courseNotFound", "Course not found.")}</div>
        <Link to={isCenterCourse ? "/center-courses" : isLiveCourse ? "/live-courses" : "/courses"} className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary">
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  // Calculate pricing (match CourseDetails): discount is a percentage
  const flashOffer = location.state?.flashOffer;
  const priceNumber = Number(course.price) || 0;
  const discountPercentage = flashOffer
    ? (Number(location.state?.discount ?? flashOffer.discount_percentage) || 0)
    : (Number(course.discount) || 0);
  const discountAmount = priceNumber * (discountPercentage / 100);
  const subtotalAfterDiscount = flashOffer && location.state?.price
    ? Number(location.state.price)
    : Math.max(0, priceNumber - discountAmount);
  const couponDiscountAmount = subtotalAfterDiscount * (couponDiscount / 100);
  const discountedPrice = Math.max(0, subtotalAfterDiscount - couponDiscountAmount);

  // Use course.image[0] if array, else image.
  const imageUrl = course?.image && Array.isArray(course.image) ? course.image[0] : course?.image || "/logo.png";

  const handleAddToCart = () => {
    if (!course) return;

    addToCart({
      id: course.id,
      name: course.title,
      price: discountedPrice,
      type: isCenterCourse ? 'center_course' : isLiveCourse ? 'live_course' : 'course',
      image: imageUrl,
      url: location.pathname
    });
    toast.success(t("courses.addedToCart", "Course added to cart"));
  };

  const handleLoginClick = (e) => {
    e?.preventDefault();
    const isItemInCart = cartItems?.some(i => i.id === course.id && i.type === (isLiveCourse ? "live_course" : "course"));
    if (!isItemInCart) {
      setShowSaveWarning(true);
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const handleSaveAndLogin = () => {
    handleAddToCart();
    setShowSaveWarning(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleContinueToLogin = () => {
    setShowSaveWarning(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  // Show success page if subscription was successful
  if (subscriptionSuccess) {
    return <SubscriptionSuccess course={course} orderData={orderData} totalPrice={discountedPrice} />;
  }

  // If user already has access, redirect to lessons
  if (hasAccess) {
    return (
      <CourseAlreadyEnrolled
        id={id}
        isCenterCourse={isCenterCourse}
        isLiveCourse={isLiveCourse}
        t={t}
      />
    );
  }

  return (
    <section className="min-h-screen py-10 bg-background text-text dark:bg-background dark:text-text">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <CourseSubscriptionHeader
          id={id}
          isCenterCourse={isCenterCourse}
          isLiveCourse={isLiveCourse}
          t={t}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CourseSubscriptionDetails
            course={course}
            isCenterCourse={isCenterCourse}
            isLiveCourse={isLiveCourse}
            handleCouponApply={handleCouponApply}
            couponDiscount={couponDiscount}
            t={t}
          />

          <CourseSubscriptionSummary
            course={course}
            flashOffer={flashOffer}
            discountPercentage={discountPercentage}
            priceNumber={priceNumber}
            discountAmount={discountAmount}
            subtotalAfterDiscount={subtotalAfterDiscount}
            couponDiscount={couponDiscount}
            couponDiscountAmount={couponDiscountAmount}
            discountedPrice={discountedPrice}
            error={error}
            couponError={couponError}
            couponMessage={couponMessage}
            isLoggedIn={isLoggedIn}
            agreeToTerms={agreeToTerms}
            setAgreeToTerms={setAgreeToTerms}
            setShowTerms={setShowTerms}
            canUsePoints={canUsePoints}
            usePoints={usePoints}
            setUsePoints={setUsePoints}
            userData={userData}
            handleSubscription={handleSubscription}
            isSubscribing={isSubscribing}
            useInstallment={useInstallment}
            installmentAmount={installmentAmount}
            handleOpenInstallmentModal={handleOpenInstallmentModal}
            handleCancelInstallment={handleCancelInstallment}
            handleLoginClick={handleLoginClick}
            handleAddToCart={handleAddToCart}
            t={t}
          />
        </div>
      </div>

      <CourseSubscriptionModals
        showNoInstallmentPopup={showNoInstallmentPopup}
        setShowNoInstallmentPopup={setShowNoInstallmentPopup}
        showInstallmentModal={showInstallmentModal}
        handleCloseInstallmentModal={handleCloseInstallmentModal}
        course={course}
        discountedPrice={discountedPrice}
        installmentAmount={installmentAmount}
        setInstallmentAmount={setInstallmentAmount}
        installmentError={installmentError}
        handleApplyInstallment={handleApplyInstallment}
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        termsLoading={termsLoading}
        termsText={termsText}
        showSaveWarning={showSaveWarning}
        setShowSaveWarning={setShowSaveWarning}
        handleSaveAndLogin={handleSaveAndLogin}
        handleContinueToLogin={handleContinueToLogin}
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        cartItems={cartItems}
        isLiveCourse={isLiveCourse}
        handleAddToCart={handleAddToCart}
        t={t}
      />
    </section>
  );
}
