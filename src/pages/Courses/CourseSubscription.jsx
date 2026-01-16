import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import CouponInput from "../../components/CouponInput";
import SubscriptionSuccess from "../../components/SubscriptionSuccess";
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
  FaCreditCard,
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
} from "react-icons/fa";

export default function CourseSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, getCourseAccess, subscribeToCourse, subscribeToLiveCourse, request, getAuthToken } = useApi();
  const { isLoggedIn } = useUser();

  const isLiveCourse = location.pathname.includes('live-courses');

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
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [useInstallment, setUseInstallment] = useState(false);
  const [installmentError, setInstallmentError] = useState("");

  // States جديدة لسياسة الشراء
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load course details
        const courseData = await (isLiveCourse ? getLiveCourseById(id) : getVideoCourseById(id));
        if (!mounted) return;
        setCourse(courseData);

        // Check access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id, isLiveCourse ? 'live_course' : 'video_course');
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
  }, [id, isLiveCourse, getVideoCourseById, getLiveCourseById, getCourseAccess, isLoggedIn]);

  // Fetch terms and conditions when modal is opened
  useEffect(() => {
    if (showTerms) {
      setTermsLoading(true);
      request("termsandcondition")
        .then((result) => {
          if (result.data && result.data.length > 0) {
            // Use he.decode if you have HTML entities, otherwise use directly
            const decoded = result.data[0].description;
            setTermsText(decoded);
          } else {
            setTermsText(t('courses.terms.unable_to_load', 'Unable to load terms and conditions.'));
          }
        })
        .catch(() => {
          setTermsText(t('courses.terms.error_fetching', 'Error fetching terms and conditions.'));
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
  const validateInstallmentAmount = (amount) => {
    const minAmount = 100; // أقل مبلغ 100 دولار
    const numericAmount = Number(amount);

    if (numericAmount < minAmount) {
      return t('installments.installmentModal.errorMin', 'Minimum installment amount is $100');
    }

    if (numericAmount > discountedPrice) {
      return t('installments.installmentModal.errorMax', { price: discountedPrice.toFixed(2) }, 'Installment amount cannot exceed the total price (${{price}})');
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
      navigate('/login');
      return;
    }

    // Check if user agreed to terms
    if (!agreeToTerms) {
      setError(t('courses.must_agree_to_terms', 'You must agree to the terms and conditions to subscribe.'));
      return;
    }

    setIsSubscribing(true);
    setError("");

    const finalAmount = useInstallment ? installmentAmount : discountedPrice;
    // getAuthToken is already destructured from useApi at the top of the component

    try {
      let response;
      
      if (isLiveCourse) {
        response = await subscribeToLiveCourse(id, selectedPayment, finalAmount, couponId);
      } else {
        response = await subscribeToCourse(id, selectedPayment, finalAmount, couponId);
      }

      console.log('Subscription response:', response);

      if (response && response.success) {
        if (response.data?.payment_url) {
          // Redirect to the payment URL from the response
          window.location.href = response.data.payment_url;
        } else if (response.data?.invoice_url) {
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
      setError(err.message || t('courses.subscription_failed') || 'Payment initialization failed');
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
        <Link to="/courses" className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary">
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  // Calculate pricing (match CourseDetails): discount is a percentage
  const priceNumber = Number(course.price) || 0;
  const discountPercentage = Number(course.discount) || 0;
  const discountAmount = priceNumber * (discountPercentage / 100);
  const subtotalAfterDiscount = Math.max(0, priceNumber - discountAmount);
  const couponDiscountAmount = subtotalAfterDiscount * (couponDiscount / 100);
  const discountedPrice = Math.max(0, subtotalAfterDiscount - couponDiscountAmount);

  // Show success page if subscription was successful
  if (subscriptionSuccess) {
    return <SubscriptionSuccess course={course} orderData={orderData} totalPrice={discountedPrice} />;
  }

  // If user already has access, redirect to lessons
  if (hasAccess) {
    return (
      <section className="min-h-screen py-10 bg-background text-text">
        <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="p-6 mx-auto mb-6 bg-green-100 border border-green-200 rounded-full w-fit dark:bg-green-900 dark:border-green-700">
              <FaCheck className="text-4xl text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-green-600 dark:text-green-400">
              {t('courses.already_enrolled', 'Already Enrolled!')}
            </h1>
            <p className="mb-6 text-lg text-text-secondary">
              {t('courses.already_enrolled_message', 'You are already enrolled in this course. You can start learning now!')}
            </p>
            <Link
              to={isLiveCourse ? `/live-courses/${id}/lessons` : `/courses/${id}/lessons`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              <FaPlay />
              {t('courses.start_learning', 'Start Learning')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-10 bg-background text-text dark:bg-background dark:text-text">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/courses/${id}`}
            className="inline-flex items-center gap-2 mb-6 transition-colors text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t('courses.backToCourse', 'Back to Course')}</span>
          </Link>

          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-text">
              {t('courses.subscribeToCourse', 'Subscribe to Course')}
            </h1>
            <p className="text-lg text-text-secondary">
              {t('courses.subscriptionDescription', 'Get full access to all course content and start your learning journey')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Course Details */}
          <div className="lg:col-span-2">
            <div className="p-6 border rounded-2xl border-border bg-surface">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Course Image */}
                <div className="flex-shrink-0">
                  <div className="relative overflow-hidden border rounded-xl border-border">
                    <img
                      src={course.image || '/logo.png'}
                      alt={course.title}
                      className="object-cover w-full h-48 md:w-64 md:h-40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <FaPlay className="text-4xl text-white" />
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex-1">
                  <h2 className="mb-3 text-2xl font-bold text-text">{course.title}</h2>
                  <div 
                    className="mb-4 text-text-secondary line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaBookOpen className="text-primary" />
                      <span>{course.lessons_count || 0} {t('courses.lessons', 'Lessons')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-primary" />
                      <span>{Math.max(1, Math.round((course.duration_minutes || 0) / 60))}h {t('courses.duration', 'Duration')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-primary" />
                      <span>{course.enrolled_count || 0} {t('courses.students', 'Students')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(course.avg_rating || 0)}
                      </div>
                      <span className="text-sm">
                        {(course.avg_rating || 0).toFixed(1)} ({course.ratings_count || 0})
                      </span>
                    </div>
                  </div>

                  {/* Course Level & Language */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-surface border-border">
                      {course.language}
                    </span>
                    {course.category && (
                      <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              {course.instructor && (
                <div className="p-4 mt-6 border rounded-lg border-border bg-background/50">
                  <h3 className="mb-3 text-lg font-semibold text-text">{t('courses.instructor', 'Instructor')}</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={course.instructor.image || '/user.png'}
                      alt={course.instructor.name}
                      className="object-cover w-12 h-12 border-2 rounded-full border-primary"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-text">{course.instructor.name}</h4>
                      <p className="text-sm text-primary">{course.instructor.job_title}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                        <div className="flex items-center gap-1">
                          <FaGraduationCap />
                          <span>{course.instructor.years_of_experience} {t('courses.yearsExp', 'years experience')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          <span>{(course.instructor.average_rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon Input */}
              <div className="mt-6">
                <CouponInput
                  onApply={handleCouponApply}
                  t={t}
                  initialDiscount={couponDiscount}
                  type="video_course"
                />
              </div>
            </div>
          </div>

          {/* Subscription Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="p-6 border rounded-2xl border-border bg-surface">
                <h3 className="mb-6 text-xl font-bold text-text">
                  {t('courses.subscriptionDetails', 'Subscription Details')}
                </h3>

                {/* Price Display */}
                <div className="mb-6">
                  {/* Original price */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary">{t('courses.coursePrice', 'Course Price')}</span>
                    <span className="text-lg font-semibold">₴{priceNumber.toFixed(2)}</span>
                  </div>

                  {/* Platform discount as amount with percent badge */}
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-text-secondary">
                        {t('courses.discount', 'Discount')}
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">{discountPercentage.toFixed(2)}%</span>
                      </span>
                      <span className="text-green-600">-₴{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Subtotal after platform discount */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary">{t('courses.subtotal', 'Subtotal')}</span>
                    <span className="font-semibold">₴{subtotalAfterDiscount.toFixed(2)}</span>
                  </div>

                  {/* Coupon discount */}
                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">{t('courses.couponDiscount', 'Coupon Discount')}</span>
                      <span className="text-green-600">-₴{couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-lg font-bold text-text">{t('courses.total', 'Total')}</span>
                    <span className={`text-2xl font-bold ${couponDiscount > 0 ? 'text-green-600' : 'text-primary'}`}>
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
                    <span className="text-sm">{t('courses.loginRequired', 'Please login to subscribe to this course')}</span>
                  </div>
                )}

                {/* Payment Methods */}
                {isLoggedIn && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-semibold text-text-secondary">
                      {t('courses.availablePaymentMethods', 'Available Payment Methods')}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { id: 'apple-pay', name: 'Apple Pay', icon: FaApplePay, color: 'text-black dark:text-white' },
                        { id: 'google-pay', name: 'Google Pay', icon: FaGooglePay, color: 'text-gray-900 dark:text-gray-100' },
                        { id: 'visa', name: 'Visa', icon: FaCcVisa, color: 'text-blue-600' }
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
                      <label htmlFor="agreeToTerms" className="text-sm text-text-secondary">
                        {t('courses.agree_to_terms_start', 'I agree to the')}{' '}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-primary hover:underline"
                        >
                          {t('courses.terms_conditions', 'terms and conditions')}
                        </button>
                      </label>
                    </div>
                    {!agreeToTerms && (
                      <p className="mt-2 text-sm text-red-500">
                        {t('courses.must_agree_to_terms', 'You must agree to the terms and conditions to subscribe.')}
                      </p>
                    )}
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
                      {t('courses.subscribing', 'Subscribing...')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaShoppingCart />
                      {useInstallment ?
                        `Pay ₴${installmentAmount} Installment` :
                        t('courses.subscribeNow', 'Subscribe Now')
                      }
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
                      {t('courses.payInInstallments', 'Pay in Installments')}
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
                      Remaining balance: ₴{(discountedPrice - installmentAmount).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Login Link */}
                {!isLoggedIn && (
                  <div className="mt-4 text-center">
                    <Link
                      to="/login"
                      className="text-sm text-primary hover:text-secondary"
                    >
                      {t('courses.loginToSubscribe', 'Login to subscribe')}
                    </Link>
                  </div>
                )}

                {/* Course Benefits */}
                <div className="p-4 mt-6 border rounded-lg border-border bg-background/50">
                  <h4 className="mb-3 text-sm font-semibold text-text-secondary">
                    {t('courses.whatYouGet', 'What you get')}
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>{t('courses.lifetimeAccess', '7 months access to all content')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>{t('courses.mobileAccess', 'Mobile and desktop access')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>{t('courses.certificate', 'Certificate of completion')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>{t('courses.support', '24/7 support')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installment Modal */}
      {showInstallmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg dark:bg-surface">
            <h3 className="mb-4 text-xl font-bold text-text">
              {t('installments.installmentModal.title', 'Pay in Installments')}
            </h3>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-text-secondary">
                {t('installments.installmentModal.amountLabel', 'Installment Amount')}
              </label>
              <div className="relative">
                <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-muted dark:text-gray-400">₴</span>
                <input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  placeholder={t('installments.installmentModal.amountPlaceholder', 'Enter installment amount')}
                  className="w-full py-2 pl-8 pr-4 bg-white border rounded-lg border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  min="100"
                  max={discountedPrice}
                />
              </div>
              {installmentError && (
                <p className="mt-2 text-sm text-red-600">{installmentError}</p>
              )}
              <p className="mt-2 text-xs text-text-muted dark:text-gray-400">
                {t('installments.installmentModal.helpText', { price: discountedPrice.toFixed(2) }, 'Minimum installment: $100 | Total price: ${{price}}')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyInstallment}
                className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
              >
                {t('installments.installmentModal.apply', 'Apply Installment')}
              </button>
              <button
                onClick={handleCloseInstallmentModal}
                className="flex-1 px-4 py-2 transition-colors border rounded-lg border-border text-text hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('installments.installmentModal.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[80vh] p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-surface dark:text-text">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-text">{t('courses.terms.title', 'Terms and Conditions')}</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] text-gray-700 dark:text-text-secondary">
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
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-text dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t('courses.terms.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}