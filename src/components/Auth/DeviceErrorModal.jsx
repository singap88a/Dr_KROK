import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExclamationCircle,
  FaTimes,
  FaMobileAlt,
  FaLaptop,
  FaEnvelope,
  FaKey,
  FaCheckCircle,
  FaRedo,
  FaShieldAlt,
  FaHeadset
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApi } from '../../context/ApiContext';
import { useUser } from '../../context/UserContext';
import { getDeviceInfo } from '../../utils/device';

export default function DeviceErrorModal({
  isOpen,
  onClose,
  errorMessage,
  defaultEmail = '',
  onSuccess,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar' || i18n?.language?.startsWith('ar');
  const navigate = useNavigate();
  const { sendDeviceVerifyOtp, confirmDevice } = useApi();
  const { login: userLogin } = useUser();

  const [email, setEmail] = useState(defaultEmail || '');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [remainingChanges, setRemainingChanges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  // Handle countdown cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setIsOtpSent(false);
      setActionError('');
      setLoading(false);
      setLimitReached(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMobileDetected =
    errorMessage?.toLowerCase().includes('mobile');
  const isLaptopDetected =
    errorMessage?.toLowerCase().includes('laptop');

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setActionError(
        isRtl ? 'يرجى كتابة بريد إلكتروني صالح' : 'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);
    setActionError('');

    try {
      const res = await sendDeviceVerifyOtp(email.trim());
      console.log('sendDeviceVerifyOtp response:', res);

      const rem =
        res?.data?.remaining_changes ??
        res?.remaining_changes ??
        null;
      setRemainingChanges(rem);
      setIsOtpSent(true);
      setCooldown(60);
      toast.success(
        res?.message ||
          (isRtl
            ? 'تم إرسال كود التأكيد إلى بريدك الإلكتروني.'
            : 'Verification code sent to your email.')
      );
    } catch (err) {
      console.error('Error sending device OTP:', err);
      const errMsg =
        err?.data?.message ||
        err?.message ||
        (isRtl ? 'تعذر إرسال كود التأكيد' : 'Failed to send verification code');
      setActionError(errMsg);

      if (err?.status === 403 || errMsg?.toLowerCase().includes('limit')) {
        setLimitReached(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDevice = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setActionError(
        isRtl ? 'يرجى إدخال رمز التحقق بشكل صحيح' : 'Please enter the verification code.'
      );
      return;
    }

    setLoading(true);
    setActionError('');

    try {
      const deviceData = await getDeviceInfo();
      const payload = {
        email: email.trim(),
        otp: otp.trim(),
        device_id: deviceData.device_id,
        device_type: deviceData.device_type,
        device_name: deviceData.device_name,
      };

      console.log('Confirming device replacement:', payload);
      const res = await confirmDevice(payload);
      console.log('confirmDevice response:', res);

      const token =
        res?.data?.token ||
        res?.token ||
        res?.data?.accessToken;
      const userData = res?.data || res;

      toast.success(
        res?.message ||
          (isRtl ? 'تم تأكيد الجهاز بنجاح!' : 'Device confirmed successfully!')
      );

      if (token) {
        userLogin(token, userData);
        localStorage.setItem('DR_KROK_show_completion_modal', 'true');
      }

      if (onSuccess) {
        onSuccess(userData);
      }

      onClose();
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Error confirming device:', err);
      const errMsg =
        err?.data?.message ||
        err?.message ||
        (isRtl ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired verification code');
      setActionError(errMsg);

      if (err?.status === 403 || errMsg?.toLowerCase().includes('limit')) {
        setLimitReached(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-3xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute p-2.5 text-gray-400 transition-colors rounded-full top-4 right-4 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <FaTimes size={18} />
          </button>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Animated Icon Container */}
              <div className="relative flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 shadow-inner">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute inset-0 rounded-2xl bg-red-500/10 dark:bg-red-500/5"
                />
                {isMobileDetected ? (
                  <FaMobileAlt className="text-3xl text-red-500" />
                ) : isLaptopDetected ? (
                  <FaLaptop className="text-3xl text-red-500" />
                ) : (
                  <FaShieldAlt className="text-3xl text-red-500" />
                )}

                <div className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-900 rounded-full shadow-md border border-gray-100 dark:border-gray-800">
                  <FaExclamationCircle className="text-base text-orange-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-2xl font-black text-gray-900 dark:text-white">
                {t('auth.deviceModal.title', isRtl ? 'تأكيد واستبدال الجهاز' : 'Device Verification & Replacement')}
              </h3>

              {/* Subtitle / Explanation */}
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mb-4 leading-relaxed">
                {errorMessage ||
                  t(
                    'auth.deviceModal.subtitle',
                    isRtl
                      ? 'هذا الحساب مسجل على جهاز آخر. يمكنك استبداله بجهازك الحالي عبر رمز تأكيد يُرسل لبريدك الإلكتروني (لك 4 استبدالات شهرياً).'
                      : 'This account is registered on another device. You can verify and link your current device via an OTP sent to your email (up to 4 changes monthly).'
                  )}
              </p>

              {/* Monthly Quota Badge */}
              {remainingChanges !== null && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <FaShieldAlt className="text-xs" />
                  <span>
                    {t('auth.deviceModal.remainingChanges', {
                      count: remainingChanges,
                      defaultValue: isRtl
                        ? `متبقي لك ${remainingChanges} تغييرات هذا الشهر من أصل 4`
                        : `You have ${remainingChanges} of 4 device changes remaining this month`,
                    })}
                  </span>
                </div>
              )}

              {/* Error Alert Box */}
              {actionError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-3 mb-4 text-xs font-medium text-red-700 rounded-xl bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 text-center"
                >
                  {actionError}
                </motion.div>
              )}

              {/* Main Body: Step 1 or Step 2 or Limit Reached */}
              {limitReached ? (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                    {t(
                      'auth.deviceModal.limitReached',
                      isRtl
                        ? 'لقد استنفدت الحد الأقصى لتغيير الأجهزة هذا الشهر (4 مرات). يرجى التواصل مع الدعم الفني لإعادة تعيين أجهزتك.'
                        : 'You have reached the monthly device change limit (4 times). Please contact support to reset your devices.'
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => navigate('/contact')}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg active:scale-95"
                    >
                      <FaHeadset />
                      <span>{t('auth.deviceModal.contactSupport', isRtl ? 'تواصل مع الدعم' : 'Contact Support')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {t('auth.deviceModal.close', isRtl ? 'إلغاء' : 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : !isOtpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="w-full space-y-4">
                  <div className="text-left w-full">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isRtl ? 'البريد الإلكتروني المسجل به الحساب' : 'Account Email'}
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <FaKey />
                          <span>{t('auth.deviceModal.sendOtp', isRtl ? 'إرسال رمز التأكيد (OTP)' : 'Send Verification OTP')}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {t('auth.deviceModal.close', isRtl ? 'إغلاق' : 'Close')}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter OTP & Confirm */
                <form onSubmit={handleConfirmDevice} className="w-full space-y-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 text-center">
                    {t('auth.deviceModal.otpSentTo', {
                      email,
                      defaultValue: isRtl
                        ? `تم إرسال رمز التحقق إلى: ${email}`
                        : `Verification code sent to: ${email}`,
                    })}
                  </div>

                  <div className="text-left w-full">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-center">
                      {isRtl ? 'أدخل رمز التحقق (OTP)' : 'Enter 6-Digit OTP Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full py-3 text-center tracking-[0.4em] text-xl font-mono font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Resend timer */}
                  <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    {cooldown > 0 ? (
                      <span>
                        {t('auth.deviceModal.resendIn', {
                          seconds: cooldown,
                          defaultValue: isRtl
                            ? `يمكنك إعادة طلب الرمز بعد ${cooldown} ثانية`
                            : `Resend code in ${cooldown}s`,
                        })}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                      >
                        <FaRedo className="text-[10px]" />
                        <span>{t('auth.deviceModal.resendOtp', isRtl ? 'إعادة إرسال الرمز' : 'Resend Code')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading || !otp}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>{t('auth.deviceModal.confirmDevice', isRtl ? 'تأكيد واستبدال الجهاز' : 'Confirm & Replace Device')}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="px-4 py-3 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {t('auth.deviceModal.back', isRtl ? 'رجوع' : 'Back')}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
