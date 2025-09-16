import React, { useState } from "react";
import Lottie from "lottie-react";
import loginAnimation from "../../../components/animations/Login_animation.json";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    console.log("Login submit", form);
    alert("Sign in successful (demo)");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">

          {/* Left: Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">Welcome Back</h2>
              <p className="mt-2 text-sm opacity-90">Sign in to continue learning.</p>
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
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Enter your password"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="flex justify-between text-sm">
                <a href="#" className="text-primary hover:underline">Forgot password?</a>
              </div>

              <button type="submit" className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark">
                Sign in
              </button>
            </form>

            <div className="mt-6 text-sm text-center text-text-muted">
              <p>Or continue with</p>
              <div className="flex justify-center gap-3 mt-3">
                <button className="px-4 py-2 border rounded-lg hover:bg-surface">Google</button>
                <button className="px-4 py-2 border rounded-lg hover:bg-surface">GitHub</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
