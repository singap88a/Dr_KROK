import React, { useState } from "react";
import Lottie from "lottie-react";
import { useUser } from "../../../context/UserContext"; // ✅ Context
import loginAnimation from "../../../components/animations/Login_animation.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useUser(); // ✅ Context login

  function validate() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Invalid email format";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
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
      const res = await fetch("https://dr-krok.hudurly.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (data.success) {
        toast.success("✅ Login successful!", { position: "top-right" });
        login(data.data.token, data.data);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      {/* ✅ Toast container */}
      <ToastContainer />

      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">
          {/* Left: Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">Welcome Back</h2>
              <p className="mt-2 text-sm opacity-90">
                Sign in to continue learning.
              </p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12">
            <h3 className="mb-6 text-xl font-semibold">Login</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
