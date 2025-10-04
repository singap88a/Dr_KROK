import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaCheck, 
  FaGraduationCap, 
  FaPlay, 
  FaStar, 
  FaGift,
  FaTrophy,
  FaHeart,
  FaArrowRight,
  FaUser
} from 'react-icons/fa';

export default function SubscriptionSuccess({ course, orderData }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti animation
    setShowConfetti(true);
  }, []);

  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 py-20 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {/* Beautiful Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 blur-3xl"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl"></div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                top: '-10px'
              }}
            >
              <div
                className="w-4 h-4 rounded-full shadow-lg"
                style={{
                  backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-20 w-full max-w-4xl">
        {/* Success Card */}
        <div className="overflow-hidden border shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl success-card border-white/20 dark:border-gray-700/50">
          {/* Header with gradient */}
          <div className="relative p-10 overflow-hidden text-center text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            </div>
            <div className="relative z-10">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 mb-6 border-4 rounded-full shadow-2xl bg-white/30 success-icon border-white/20">
                <FaCheck className="text-5xl drop-shadow-lg" />
              </div>
              
              <h1 className="mb-4 text-4xl font-bold md:text-5xl drop-shadow-lg">
                {t('subscription.congratulations', 'Congratulations!')} 🎉
              </h1>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed opacity-95">
                {t('subscription.successMessage', 'You have successfully enrolled in the course!')}
              </p>
            </div>
          </div>

          {/* Course Details */}
          <div className="p-8 md:p-10">
            {course && (
              <div className="mb-8">
                <div className="flex items-center gap-6 p-6 mb-6 border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-emerald-200/50 dark:border-emerald-700/30">
                  <img
                    src={course.image || '/logo.png'}
                    alt={course.title}
                    className="object-cover w-20 h-20 border-4 shadow-lg rounded-2xl border-emerald-200 dark:border-emerald-600"
                  />
                  <div className="flex-1">
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                      {course.title}
                    </h2>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">
                      {t('subscription.enrolledIn', 'Enrolled in')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            {orderData && (
              <div className="p-6 mb-8 border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-blue-200/50 dark:border-blue-700/30">
                <h3 className="flex items-center gap-3 mb-4 text-lg font-bold text-gray-800 dark:text-white">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <FaGift className="text-xl text-white" />
                  </div>
                  {t('subscription.orderDetails', 'Order Details')}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 border bg-white/60 dark:bg-gray-800/60 rounded-xl border-blue-200/30 dark:border-blue-700/30">
                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                      {t('subscription.orderId', 'Order ID')}
                    </p>
                    <p className="font-mono text-lg font-bold text-gray-800 dark:text-white">
                      #{orderData.id || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 border bg-white/60 dark:bg-gray-800/60 rounded-xl border-blue-200/30 dark:border-blue-700/30">
                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                      {t('subscription.clientName', 'Client Name')}
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {orderData.client_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="mb-8">
              <h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-gray-800 dark:text-white">
                <div className="p-2 bg-yellow-500 rounded-xl">
                  <FaTrophy className="text-xl text-white" />
                </div>
                {t('subscription.whatsNext', 'What\'s Next?')}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-6 text-center border bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-emerald-200/50 dark:border-emerald-700/30">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500">
                    <span className="text-lg font-bold text-white">1</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                    {t('subscription.step1', 'Access your course materials immediately')}
                  </h4>
                </div>
                <div className="p-6 text-center border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-blue-200/50 dark:border-blue-700/30">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full">
                    <span className="text-lg font-bold text-white">2</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                    {t('subscription.step2', 'Start learning at your own pace')}
                  </h4>
                </div>
                <div className="p-6 text-center border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-full">
                    <span className="text-lg font-bold text-white">3</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                    {t('subscription.step3', 'Get your certificate upon completion')}
                  </h4>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-6 mb-8 sm:flex-row">
              <Link
                to={`/courses/${id}/lessons`}
                className="flex items-center justify-center flex-1 gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform shadow-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 rounded-2xl hover:shadow-emerald-500/25 hover:scale-105 hover:-translate-y-1"
              >
                <FaPlay className="text-xl" />
                {t('subscription.startLearning', 'Start Learning Now')}
                <FaArrowRight className="text-xl" />
              </Link>
              
              <Link
                to="/courses"
                className="flex items-center justify-center flex-1 gap-3 px-8 py-4 text-lg font-bold transition-all duration-300 transform border-2 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
              >
                {t('subscription.browseMore', 'Browse More Courses')}
              </Link>
            </div>

            {/* Additional Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/profile"
                className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl hover:shadow-xl hover:scale-105"
              >
                <FaUser />
                {t('profile.title', 'My Profile')}
              </Link>
              
              <Link
                to="/dashboard"
                className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl hover:shadow-xl hover:scale-105"
              >
                <FaGraduationCap />
                {t('dashboard.title', 'Dashboard')}
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3 success-features">
          <div className="p-6 text-center transition-all duration-300 transform border shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 hover-lift">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
              <FaStar className="text-2xl text-white" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
              {t('subscription.lifetimeAccess', 'Lifetime Access')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('subscription.lifetimeAccessDesc', 'Access forever')}
            </p>
          </div>
          
          <div className="p-6 text-center transition-all duration-300 transform border shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 hover-lift">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
              {t('subscription.certificate', 'Certificate')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('subscription.certificateDesc', 'Get certified')}
            </p>
          </div>
          
          <div className="p-6 text-center transition-all duration-300 transform border shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 hover-lift">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-lg bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl">
              <FaHeart className="text-2xl text-white" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
              {t('subscription.support', '24/7 Support')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('subscription.supportDesc', 'Always here to help')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
