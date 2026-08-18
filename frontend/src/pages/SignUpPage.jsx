import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { registerUser, getCurrentUser, initializeAuth, signInWithGoogle } from "../auth";
import { useEffect } from "react";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    currency: "INR"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeAuth();
    try { sessionStorage.removeItem('aura_pending_password'); } catch {}
    return () => { try { sessionStorage.removeItem('aura_pending_password'); } catch {} };
  }, []);

  if (getCurrentUser()) return <Navigate to="/" replace />;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError("");
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your full name";
    if (!form.email.trim()) next.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Please set a password";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setApiError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      currency: form.currency
    });
    setLoading(false);

    if (res.alreadyRegistered) {
      setApiError("This email is already registered. Please sign in instead.");
      return;
    }
    if (!res.ok) {
      setApiError(res.error);
      return;
    }
    if (res.pending) {
      navigate(`/verify?email=${encodeURIComponent(res.email)}`);
      return;
    }
    navigate("/");
  };

  const inputClass = "w-full bg-transparent border-b border-outline-variant focus:border-primary pl-8 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none";

  return (
    <div className="h-full min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient orbs */}
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-secondary-container-accent/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-24 w-[520px] h-[520px] rounded-full bg-tertiary-fixed/25 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center mb-5 shadow-2xl">
            <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
          </div>
          <h1 className="font-display text-display text-on-primary tracking-tight">Aura Finance</h1>
          <p className="font-sans text-body-md text-on-primary/60 mt-2 max-w-xs">
            Create your account in under a minute
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-3xl shadow-2xl p-8 border border-white/10">
          <h2 className="font-sans text-headline-md text-primary mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">person</span>
                <input id="name" type="text" value={form.name} onChange={update("name")} className={inputClass} placeholder="e.g. Priyansh Kumar" />
              </div>
              {errors.name && <p className="font-sans text-label-sm text-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">mail</span>
                <input id="email" type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="font-sans text-label-sm text-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">lock</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  className={inputClass + " pr-9"}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && <p className="font-sans text-label-sm text-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">lock</span>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={update("confirm")}
                  className={inputClass}
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirm && <p className="font-sans text-label-sm text-error">{errors.confirm}</p>}
            </div>

            {/* Preferred Currency */}
            <div className="space-y-2">
              <label htmlFor="currency" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Preferred Currency
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">payments</span>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={update("currency")}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary pl-8 py-2 font-sans text-body-md text-primary appearance-none outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {apiError && (
              <p className="font-sans text-label-md text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {apiError}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-on-surface-variant font-sans">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const { error } = await signInWithGoogle();
                if (error) {
                  setApiError(error.message);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="btn btn-outline btn-block flex items-center justify-center gap-3"
            >
              {loading && <div className="animate-spin w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full" />}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-center font-sans text-label-sm text-on-surface-variant -mt-2">
              We'll email you a 4-digit code to verify your address.
            </p>
          </form>

          <p className="text-center font-sans text-body-md text-on-surface-variant mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
