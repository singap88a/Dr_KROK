import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import { useApi } from "../../../context/ApiContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { toast } from "react-toastify";
import he from "he";
import { GoogleIcon, AppleIcon } from "../SocialIcons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getDeviceInfo } from "../../../utils/device";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { register: userRegister } = useUser();
  const { register: apiRegister, request, sendOtp } = useApi();
  const [step, setStep] = useState("send-otp"); // "send-otp" or "register"
  const [form, setForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirm: "",
    university: "",
    role: "student",
  });
  const isUniversityRep = form.role === "university_rep";
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
    if (!form.otp.trim()) e.otp = "OTP is required";
    if (form.password.length < 6)
      e.password = t('auth.register.errors.password');
    if (!form.confirm) e.confirm = t('auth.register.errors.confirm');
    if (!agree) e.agree = t('auth.register.errors.agree');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!form.email.includes("@")) {
      setErrors({ email: t('auth.register.errors.email') });
      return;
    }

    try {
      setLoading(true);
      const data = await sendOtp(form.email);
      if (data.success) {
        toast.success("OTP sent to your email!");
        setStep("register");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
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
      const data = await apiRegister(
        form.name,
        form.email,
        form.otp,
      form.password,
      form.confirm,
      form.university,
      form.role === "university_representative" ? "university_rep" : form.role
      );

      if (data.success) {
        userRegister(data.data.token, data.data);
        localStorage.setItem('DR_KROK_show_completion_modal', 'true');
        localStorage.setItem('DR_KROK_selected_role', form.role === "university_representative" ? "university_rep" : form.role);
        toast.success("🎉 Account created successfully!", {
          position: "top-right",
        });
        setTimeout(() => {
        navigate(form.role === "university_rep" || form.role === "university_representative" ? "/university-representative" : "/profile", { replace: true });
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
    if (location.state?.from) {
      localStorage.setItem('DR_KROK_return_url', location.state.from);
    }
    
    // Build callback URL dynamically for environment compatibility
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const deviceData = getDeviceInfo();
    const queryParams = new URLSearchParams({
      callback: callbackUrl,
      register: 'true',
      device_id: deviceData.device_id,
      device_type: deviceData.device_type,
      device_name: deviceData.device_name
    }).toString();
    
    const googleAuthUrl = `https://admin.dr-krok.com/api/auth/google/redirect?${queryParams}`;
    
    console.log("Redirecting to Google OAuth for registration:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
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

            {step === "send-otp" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Email Only for OTP */}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
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

                {/* Email (Read-only or Pre-filled) */}
                <div>
                  <label className="text-sm font-medium">{t('auth.register.email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="text-sm font-medium">{t('auth.register.account_type', 'Account Type')}</label>
                  <div className="flex flex-col gap-2 mt-2 sm:flex-row">
                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition flex-1 ${form.role === 'student' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-background'}`}>
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={form.role === 'student'}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="shrink-0"
                      />
                      <span>
                        <span className="block text-sm font-semibold leading-tight">{t('auth.register.student', 'Student')}</span>
                        <span className="block text-[11px] text-gray-500 leading-tight">{t('auth.register.student_hint', 'Regular student account')}</span>
                      </span>
                    </label>

                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition flex-1 ${form.role === 'university_representative' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-background'}`}>
                      <input
                        type="radio"
                        name="role"
                      value="university_rep"
                      checked={isUniversityRep}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="shrink-0"
                    />
                      <span>
                        <span className="block text-sm font-semibold leading-tight">{t('auth.register.university_rep', 'University Rep')}</span>
                        <span className="block text-[11px] text-gray-500 leading-tight">{t('auth.register.university_rep_hint', 'Can submit a request')}</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* OTP Code */}
                <div>
                  <label className="text-sm font-medium">OTP Code</label>
                  <input
                    type="text"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                    placeholder="Enter the code sent to your email"
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-500">{errors.otp}</p>
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
                
                <button
                  type="button"
                  onClick={() => setStep("send-otp")}
                  className="w-full text-sm text-gray-500 hover:underline"
                >
                  Change Email
                </button>
              </form>
            )}

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
                onClick={() => {
                  localStorage.setItem('DR_KROK_auth_flow', 'register');
                  if (location.state?.from) {
                    localStorage.setItem('DR_KROK_return_url', location.state.from);
                  }
                  
                  const callbackUrl = `${window.location.origin}/auth/callback`;
                  const deviceData = getDeviceInfo();
                  const queryParams = new URLSearchParams({
                    callback: callbackUrl,
                    register: 'true',
                    device_id: deviceData.device_id,
                    device_type: deviceData.device_type,
                    device_name: deviceData.device_name
                  }).toString();
                  const appleAuthUrl = `https://admin.dr-krok.com/api/auth/apple?${queryParams}`;
                  
                  console.log("Redirecting to Apple OAuth for registration:", appleAuthUrl);
                  window.location.href = appleAuthUrl;
                }}
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
                state={location.state}
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
