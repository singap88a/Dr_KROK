import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import { useApi } from "../../../context/ApiContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { toast } from "react-toastify";
import { GoogleIcon, AppleIcon } from "../SocialIcons";
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import { getDeviceInfo, isInAppBrowser } from "../../../utils/device";
import DeviceErrorModal from "../../../components/auth/DeviceErrorModal";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar' || i18n?.language?.startsWith('ar');
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeviceError, setShowDeviceError] = useState(false);
  const [deviceErrorMessage, setDeviceErrorMessage] = useState("");
  const { login: userLogin } = useUser();
  const { login: apiLogin } = useApi();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorMsg = searchParams.get("deviceError");
    const code = searchParams.get("code");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setForm((prev) => ({ ...prev, email: emailParam }));
    }

    if (code === "DEVICE_MISMATCH" || errorMsg) {
      setDeviceErrorMessage(
        errorMsg ||
          (isRtl
            ? "هذا الحساب مسجل على جهاز آخر. يرجى تأكيد جهازك الجديد."
            : "This device is not registered for your account.")
      );
      setShowDeviceError(true);
    }
  }, [searchParams, isRtl]);

  function validate() {
    const e = {};
    if (!form.email.includes("@")) e.email = t('auth.login.errors.email');
    if (form.password.length < 6) e.password = t('auth.login.errors.password');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error(
        isRtl
          ? "يرجى تصحيح الأخطاء قبل المتابعة."
          : "Please fix the errors before submitting.",
        { position: "top-right" }
      );
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin(form.email, form.password);
      console.log("Login response:", data);

      if (data?.success || data?.status) {
        toast.success(isRtl ? "✅ تم تسجيل الدخول بنجاح!" : "✅ Login successful!", {
          position: "top-right",
        });
        const token = data?.data?.token || data?.token;
        const user = data?.data?.user || data?.data || data;
        const expiryData = {
          expires_in: data?.data?.expires_in ?? data?.expires_in ?? 604800,
          expires_at: data?.data?.expires_at ?? data?.expires_at ?? null,
          token_type: data?.data?.token_type ?? data?.token_type ?? "Bearer",
        };
        userLogin(token, user, expiryData);
        localStorage.setItem('DR_KROK_show_completion_modal', 'true');
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 1200);
      } else {
        if (
          data?.code === 'DEVICE_MISMATCH' ||
          (data?.message &&
            (data.message.toLowerCase().includes('device') ||
              data.message.toLowerCase().includes('mobile') ||
              data.message.toLowerCase().includes('laptop')))
        ) {
          setDeviceErrorMessage(data.message);
          setShowDeviceError(true);
        } else {
          toast.error(
            "❌ " + (data?.message || (isRtl ? "فشل تسجيل الدخول" : "Login failed")),
            { position: "top-right" }
          );
        }
      }
    } catch (err) {
      console.error("Login catch error:", err);
      const isDeviceErr =
        err?.data?.code === 'DEVICE_MISMATCH' ||
        err?.status === 403 ||
        (err?.message &&
          (err.message.toLowerCase().includes('device') ||
            err.message.toLowerCase().includes('mobile') ||
            err.message.toLowerCase().includes('laptop') ||
            err.message.toLowerCase().includes('registered on another')));

      if (isDeviceErr) {
        setDeviceErrorMessage(
          err?.data?.message ||
            err?.message ||
            (isRtl
              ? "هذا الحساب مسجل على جهاز آخر."
              : "This device is not registered for your account.")
        );
        setShowDeviceError(true);
      } else {
        toast.error(
          err?.message || (isRtl ? "⚠️ خطأ في الاتصال بالسيرفر!" : "⚠️ Server connection error!"),
          { position: "top-right" }
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    localStorage.setItem('DR_KROK_auth_flow', 'login');
    if (location.state?.from) {
      localStorage.setItem('DR_KROK_return_url', location.state.from);
    }

    const callbackUrl = `${window.location.origin}/auth/callback`;
    const deviceData = await getDeviceInfo();
    const queryParams = new URLSearchParams({
      callback: callbackUrl,
      device_id: deviceData.device_id,
      device_type: deviceData.device_type,
      device_name: deviceData.device_name,
    }).toString();

    const googleAuthUrl = `https://admin.dr-krok.com/api/auth/google/redirect?${queryParams}`;
    console.log("Redirecting to Google OAuth:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  const handleAppleLogin = async () => {
    localStorage.setItem('DR_KROK_auth_flow', 'login');
    if (location.state?.from) {
      localStorage.setItem('DR_KROK_return_url', location.state.from);
    }

    const callbackUrl = `${window.location.origin}/auth/callback`;
    const deviceData = await getDeviceInfo();
    const queryParams = new URLSearchParams({
      callback: callbackUrl,
      device_id: deviceData.device_id,
      device_type: deviceData.device_type,
      device_name: deviceData.device_name,
    }).toString();

    const appleAuthUrl = `https://admin.dr-krok.com/api/auth/apple?${queryParams}`;
    console.log("Redirecting to Apple OAuth:", appleAuthUrl);
    window.location.href = appleAuthUrl;
  };

  const inApp = isInAppBrowser();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <DeviceErrorModal
        isOpen={showDeviceError}
        onClose={() => setShowDeviceError(false)}
        errorMessage={deviceErrorMessage}
        defaultEmail={form.email}
      />
      <div className="container p-6 mx-auto">
        {/* In-app Browser Warning Alert */}
        {inApp && (
          <div className="max-w-5xl mx-auto mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3 shadow-sm">
            <FaExclamationTriangle className="text-xl flex-shrink-0 mt-0.5 text-amber-500" />
            <div className="text-sm">
              <span className="font-bold">
                {t('common.warning', 'Notice')}:{" "}
              </span>
              {t(
                'auth.inAppBrowserNotice',
                'You are currently viewing this page inside an in-app browser. To ensure your account remains securely bound to your device, please open this page in your primary browser (Chrome or Safari).'
              )}
            </div>
          </div>
        )}

        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">
          {/* Left: Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">{t('auth.login.title')}</h2>
              <p className="mt-2 text-sm opacity-90">
                {t('auth.login.subtitle')}
              </p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12">
            <h3 className="mb-6 text-xl font-semibold">{t('auth.login.title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('auth.login.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="user@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">{t('auth.login.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('auth.login.forgot_password', {
                    defaultValue: t('auth.login.forgot', 'Forgot password?'),
                  })}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 mx-auto border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  t('auth.login.sign_in', {
                    defaultValue: t('auth.login.submit', 'Sign in'),
                  })
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">
                {t('auth.login.or_continue_with', {
                  defaultValue: t('auth.login.or', 'Or continue with'),
                })}
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>


            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.sign_in_with_google')}</span>
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <AppleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.sign_in_with_apple')}</span>
              </button>
            </div>

            {/* Link to Register */}
            <div className="mt-6 text-sm text-center">
              {t('auth.login.no_account')}{" "}
              <Link
                to="/register"
                state={location.state}
                className="font-medium text-primary hover:underline"
              >
                {t('auth.login.register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}