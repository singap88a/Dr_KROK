import React, { useState } from "react";
import Lottie from "lottie-react";
import { useApi } from "../../../context/ApiContext"; // ✅ استدعاء الكونتكست
import loginAnimation from "../../../components/animations/Login_animation.json";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    university: "",
  });
  const [errors, setErrors] = useState({});
  const { universities, loading, error } = useApi(); // ✅ بيانات الجامعات من الكونتكست

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (!form.confirm) e.confirm = "Required";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.university) e.university = "Please select a university";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    console.log("Register submit", form);
    alert("Account created (demo)");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <div className="container p-6 mx-auto">
        <div className="grid max-w-5xl grid-cols-1 mx-auto overflow-hidden shadow-xl bg-surface rounded-2xl md:grid-cols-2">

          {/* Left: Animation */}
          <div className="relative flex-col items-center justify-center hidden p-8 md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full mb-6 text-center text-text">
              <h2 className="text-2xl font-semibold">Create an Account</h2>
              <p className="mt-2 text-sm opacity-90">Start your journey with us today.</p>
            </div>
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
          </div>

          {/* Right: Form */}
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
                  placeholder="Your name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Password"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                  placeholder="Confirm Password"
                />
                {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
              </div>

              {/* Select University */}
              <div>
                <label className="text-sm font-medium">University</label>
                <select
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="block w-full px-4 py-2 mt-1 border rounded-lg bg-background"
                >
                  <option value="">Select your university</option>
                  {loading ? (
                    <option disabled>Loading...</option>
                  ) : error ? (
                    <option disabled>Error loading universities</option>
                  ) : (
                    universities.map((u, i) => (
                      <option key={i} value={u}>
                        {u}
                      </option>
                    ))
                  )}
                </select>
                {errors.university && <p className="mt-1 text-xs text-red-500">{errors.university}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-dark"
              >
                Create account
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </div>

            {/* Social Login */}
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
