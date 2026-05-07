import React, { useState } from "react";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../context/ApiContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useApi();
  
  const [step, setStep] = useState("email"); // "email" or "reset"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    if (!form.email.includes("@")) {
      setErrors({ email: t('auth.login.errors.email') });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateReset = () => {
    const e = {};
    if (!form.otp.trim()) e.otp = "OTP is required";
    if (form.password.length < 6) e.password = t('auth.register.errors.password');
    if (form.password !== form.password_confirmation) e.password_confirmation = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const data = await forgotPassword(form.email);
      if (data.success) {
        toast.success("OTP sent to your email!");
        setStep("reset");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateReset()) return;

    setLoading(true);
    try {
      const data = await resetPassword(
        form.email,
        form.otp,
        form.password,
        form.password_confirmation
      );
      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        navigate("/login");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      toast.error("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">
          {/* Left: Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">{t('auth.login.forgot_password')}</h2>
              <p className="mt-2 text-sm opacity-90">
                Reset your password to access your account
              </p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12">
            <h3 className="mb-6 text-xl font-semibold">
              {step === "email" ? t('auth.login.forgot_password') : "Reset Password"}
            </h3>

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">OTP Code</label>
                  <input
                    type="text"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                    placeholder="Enter OTP"
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-500">{errors.otp}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                      placeholder="New Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                      className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background pr-10"
                      placeholder="Confirm Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <div className="mt-6 text-sm text-center">
              <Link to="/login" className="font-medium text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
