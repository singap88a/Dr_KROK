import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import loginAnimation from "../../../components/animations/Login_animation.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    university: "",
  });

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
      fetch("https://dr-krok.hudurly.com/api/termsandcondition")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setTermsText(data.data[0].description);
          } else {
            setTermsText("⚠️ Unable to load Terms and Conditions.");
          }
        })
        .catch(() => {
          setTermsText("⚠️ Error fetching Terms and Conditions.");
        })
        .finally(() => setTermsLoading(false));
    }
  }, [showTerms]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Invalid email format";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    if (form.password !== form.confirm)
      e.confirm = "Passwords do not match";
    if (!agree) e.agree = "You must agree to the Terms and Conditions";
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
      const res = await fetch("https://dr-krok.hudurly.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.confirm,
          university: form.university,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        register(data.data.token, data.data);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />

      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">
          {/* Left Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">Create an Account</h2>
              <p className="mt-2 text-sm opacity-90">
                Start your journey with us today.
              </p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right Form */}
          <div className="p-8 md:p-12">
            <h3 className="mb-6 text-xl font-semibold">Register</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Confirm password"
                />
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
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="underline text-primary"
                  >
                    Terms and Conditions
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
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Terms Popup */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Terms and Conditions</h2>
            <div className="overflow-y-auto text-sm text-gray-700 max-h-64">
              {termsLoading ? (
                <p>Loading...</p>
              ) : (
                <p>{termsText}</p>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => setShowTerms(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm text-white rounded bg-primary hover:bg-primary-dark"
                onClick={() => {
                  setAgree(true);
                  setShowTerms(false);
                }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
