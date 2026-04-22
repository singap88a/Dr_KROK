import React, { useState } from 'react';
import Lottie from 'lottie-react';
import loginAnimation from './animations/Login_animation.json';

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (mode === "register") {
      if (!form.name.trim()) e.name = "Required";
      if (!form.confirm) e.confirm = "Required";
      if (form.password !== form.confirm) e.confirm = "Passwords must match";
    }
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "At least 6 chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    // For demo: simply log the payload. Replace with real API call.
    const payload = { mode, ...form };
    console.log("submit", payload);
    alert((mode === "login" ? "Sign in" : "Create account") + " — demo: check console");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto bg-surface shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* Left: Animation */}
          <div className="relative hidden md:flex flex-col p-8 justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full text-center text-text mb-6">
              <h2 className="text-2xl font-semibold">Welcome to Dr KROK</h2>
              <p className="mt-2 text-sm opacity-90">Your gateway to professional medical education.</p>
            </div>

            {/* Lottie Animation */}
            <div className="w-3/4 max-w-sm mt-6">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>

 
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">ML</div>
                <div>
                  <h3 className="text-lg font-semibold text-text">{mode === "login" ? "Login" : "Register"}</h3>
                  <p className="text-xs text-text-muted">Secure access to your account</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-sm font-medium text-text">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`mt-1 block w-full rounded-lg border-border bg-background text-text px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Full Name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`mt-1 block w-full rounded-lg border-border bg-background text-text px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Email"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-text">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`mt-1 block w-full rounded-lg border-border bg-background text-text px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Password"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {mode === "register" && (
                <div>
                  <label className="text-sm font-medium text-text">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className={`mt-1 block w-full rounded-lg border-border bg-background text-text px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Confirm Password"
                  />
                  {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-text-muted">{mode === "login" ? <a href="#" className="hover:text-primary transition">Forgot password?</a> : null}</div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
                >
                  {mode === "login" ? "Sign in" : "Create account"}
                </button>
              </div>

              <div className="text-center text-sm text-text-muted">
                {mode === "login" ? (
                  <>
                    <span>Don't have an account? </span>
                    <button type="button" className="text-primary font-medium ml-2" onClick={() => setMode("register")}>Register</button>
                  </>
                ) : (
                  <>
                    <span>Already have an account? </span>
                    <button type="button" className="text-primary font-medium ml-2" onClick={() => setMode("login")}>Login</button>
                  </>
                )}
              </div>
            </form>

            <hr className="my-6 border-border" />

            <div className="text-center text-sm text-text-muted">
              <p>Or continue with</p>
              <div className="flex gap-3 justify-center mt-3">
                <button className="px-4 py-2 rounded-lg border border-border hover:bg-surface transition">Google</button>
                <button className="px-4 py-2 rounded-lg border border-border hover:bg-surface transition">GitHub</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
