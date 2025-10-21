import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  FaPaypal,
  FaCcVisa,
  FaCcMastercard,
  FaUser,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

export default function LiveCourseSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getLiveCourseById, getCourseAccess, subscribeToLiveCourse } = useApi();
  const { isLoggedIn } = useUser();

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

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load course details
        const courseData = await getLiveCourseById(id);
        if (!mounted) return;
        setCourse(courseData);

        // Check access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id);
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
  }, [id, getLiveCourseById, getCourseAccess, isLoggedIn]);

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

  const handleSubscription = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setIsSubscribing(true);
    setError("");

    try {
      console.log('Starting subscription with:', {
        courseId: id,
        paymentMethod: selectedPayment,
        amount: discountedPrice,
        couponId,
        userData: JSON.parse(localStorage.getItem("user") || "{}")
      });

      const response = await subscribeToLiveCourse(id, selectedPayment, discountedPrice, couponId);

      console.log('Subscription response:', response);

      if (response && (response.success || response.code === 200)) {
        setOrderData(response.data);
        setSubscriptionSuccess(true);
      } else {
        throw new Error(response?.message || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || t('courses.subscription_failed') || 'Subscription failed');
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
        <Link to="/live-courses" className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary">
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  // Calculate pricing (match CourseDetails): discount is an amount, not percent
  const priceNumber = Number(course.price) || 0;
  const discountAmount = Number(course.discount) || 0; // absolute amount
  const discountPercent = priceNumber > 0 ? Math.round((discountAmount / priceNumber) * 100) : 0;
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
              to={`/live-courses/${id}/lessons`}
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
            to={`/live-courses/${id}`}
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
                  <p className="mb-4 text-text-secondary line-clamp-3">{course.description}</p>

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
                  type="live_course"
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
                    <span className="text-lg font-semibold">${priceNumber.toFixed(2)}</span>
                  </div>

                  {/* Platform discount as amount with percent badge */}
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-text-secondary">
                        {t('courses.discount', 'Discount')}
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">{discountPercent}%</span>
                      </span>
                      <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Subtotal after platform discount */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary">{t('courses.subtotal', 'Subtotal')}</span>
                    <span className="font-semibold">${subtotalAfterDiscount.toFixed(2)}</span>
                  </div>

                  {/* Coupon discount */}
                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">{t('courses.couponDiscount', 'Coupon Discount')}</span>
                      <span className="text-green-600">-${couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-lg font-bold text-text">{t('courses.total', 'Total')}</span>
                    <span className={`text-2xl font-bold ${couponDiscount > 0 ? 'text-green-600' : 'text-primary'}`}>
                      ${discountedPrice.toFixed(2)}
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
                        { id: 'visa', name: 'Visa', icon: FaCcVisa, color: 'text-blue-600' },
                        { id: 'mastercard', name: 'Mastercard', icon: FaCcMastercard, color: 'text-red-500' },
                        { id: 'paypal', name: 'PayPal', icon: FaPaypal, color: 'text-sky-500' }
                      ].map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <div
                            key={method.id}
                            className="flex items-center w-full gap-3 p-3 border rounded-lg border-border bg-surface"
                          >
                            <IconComponent className={`text-xl ${method.color}`} />
                            <span className="font-medium">{method.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={handleSubscription}
                  disabled={isSubscribing || !isLoggedIn}
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
                      {t('courses.subscribeNow', 'Subscribe Now')}
                    </div>
                  )}
                </button>

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
                      <span>{t('courses.lifetimeAccess', 'Lifetime access to all content')}</span>
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
    </section>
  );
}
