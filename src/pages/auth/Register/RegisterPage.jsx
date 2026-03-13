import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import { useApi } from "../../../context/ApiContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import he from "he";
import { GoogleIcon, AppleIcon } from "../SocialIcons";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: userRegister } = useUser();
  const { register: apiRegister, request } = useApi();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    university: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ إدارة الشروط والأحكام
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);

  // ✅ استدعاء API عند فتح البوباب
  useEffect(() => {
    if (showTerms) {
      setTermsLoading(true);
      request("termsandcondition")
        .then((result) => {
          if (result.data && result.data.length > 0) {
            const decoded = he.decode(result.data[0].description);
            setTermsText(decoded);
          } else {
            setTermsText("⚠️ Unable to load Terms and Conditions.");
          }
        })
        .catch(() => {
          setTermsText("⚠️ Error fetching Terms and Conditions.");
        })
        .finally(() => setTermsLoading(false));
    }
  }, [showTerms, request]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t('auth.register.errors.name');
    if (!form.email.includes("@")) e.email = t('auth.register.errors.email');
    if (form.password.length < 6)
      e.password = t('auth.register.errors.password');
    if (!form.confirm) e.confirm = t('auth.register.errors.confirm');
    if (form.password !== form.confirm)
      e.confirm = t('auth.register.errors.match');
    if (!agree) e.agree = t('auth.register.errors.agree');
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

    try {
      setLoading(true);
      const data = await apiRegister(form.name, form.email, form.password, form.confirm, form.university);

      if (data.success) {
        userRegister(data.data.token, data.data);
        localStorage.setItem('DR_KROK_show_completion_modal', 'true');
        toast.success("🎉 Account created successfully!", {
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        toast.error("❌ Registration failed: " + (data.message || "Please try again."), {
          position: "top-right",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("⚠️ Network error. Please try again later.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleRegister = () => {
    localStorage.setItem('DR_KROK_auth_flow', 'register');
    // استخدام الـ Vercel URL مباشرة للتسجيل بجوجل
    const callbackUrl = 'https://dr-krok.vercel.app/auth/callback';
    
    const googleAuthUrl = `https://admin.dr-krok.com/api/auth/google/redirect?callback=${encodeURIComponent(callbackUrl)}&register=true`;
    
    console.log("Redirecting to Google OAuth for registration:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />

      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">
          {/* Left Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">{t('auth.register.title')}</h2>
              <p className="mt-2 text-sm opacity-90">
                {t('auth.register.subtitle')}
              </p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right Form */}
          <div className="p-8 md:p-12">
            <h3 className="mb-6 text-xl font-semibold">{t('auth.register.title')}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium">{t('auth.register.full_name')}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder={t('auth.register.full_name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">{t('auth.register.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder={t('auth.register.email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">{t('auth.register.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                    placeholder={t('auth.register.password')}
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

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium">{t('auth.register.confirm_password')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                    placeholder={t('auth.register.confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {t('auth.register.agree_terms')}{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="underline text-primary"
                  >
                    {t('auth.register.terms_conditions')}
                  </button>
                </span>
              </div>
              {errors.agree && (
                <p className="mt-1 text-xs text-red-500">{errors.agree}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? t('auth.register.creating') : t('auth.register.create_account')}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-surface">{t('auth.register.or_continue_with')}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700">{t('auth.register.sign_up_with_google')}</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = 'https://admin.dr-krok.com/api/auth/apple?register=true'}
                className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <AppleIcon className="w-5 h-5 mr-3" />
                <span className="font-medium text-gray-700">{t('auth.register.sign_up_with_apple')}</span>
              </button>
            </div>

            {/* Link to Login */}
            <div className="mt-6 text-sm text-center">
              {t('auth.register.have_account')}{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                {t('auth.register.login')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Terms Popup */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">{t('auth.register.terms.title')}</h2>
            <div className="overflow-y-auto text-sm text-gray-700 max-h-64">
              {termsLoading ? (
                <p>{t('auth.register.terms.loading')}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: termsText }} />
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => setShowTerms(false)}
              >
                {t('auth.register.terms.close')}
              </button>
              <button
                className="px-4 py-2 text-sm text-white rounded bg-primary hover:bg-primary-dark"
                onClick={() => {
                  setAgree(true);
                  setShowTerms(false);
                }}
              >
                {t('auth.register.terms.agree')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}