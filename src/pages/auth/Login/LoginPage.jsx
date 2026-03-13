import React, { useState } from "react";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import { useApi } from "../../../context/ApiContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleIcon, AppleIcon } from "../SocialIcons";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: userLogin } = useUser();
  const { login: apiLogin } = useApi();

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
      toast.error("Please fix the errors before submitting.", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin(form.email, form.password);
      console.log("Response:", data);

      if (data.success) {
        toast.success("✅ Login successful!", { position: "top-right" });
        userLogin(data.data.token, data.data);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        toast.error("❌ Login failed: " + data.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Server connection error!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    localStorage.setItem('DR_KROK_auth_flow', 'login');
    // استخدام الـ Vercel URL مباشرة بدون localhost
    const callbackUrl = 'https://admin.dr-krok.com/api/auth/callback';
    
    const googleAuthUrl = `https://admin.dr-krok.com/api/auth/google/redirect?callback=${encodeURIComponent(callbackUrl)}`;
    
    console.log("Redirecting to Google OAuth:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />

      <div className="container p-6 mx-auto">
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
                  placeholder={t('auth.login.email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t('auth.login.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                    placeholder={t('auth.login.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* <div className="flex justify-between text-sm">
                <a href="#" className="text-primary hover:underline">
                  {t('auth.login.forgot_password')}
                </a>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? t('auth.login.signing_in') : t('auth.login.sign_in')}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-surface">{t('auth.login.or_continue_with')}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700">{t('auth.login.sign_in_with_google')}</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = 'https://admin.dr-krok.com/api/auth/apple'}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <AppleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700">{t('auth.login.sign_in_with_apple')}</span>
              </button>
            </div>

            {/* Link to Register */}
            <div className="mt-6 text-sm text-center">
              {t('auth.login.no_account')}{" "}
              <Link
                to="/register"
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