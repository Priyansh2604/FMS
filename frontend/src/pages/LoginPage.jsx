import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser, initializeAuth } from "../auth";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (getCurrentUser()) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (!res.ok) {
      if (res.needsVerification) {
        navigate(`/verify?email=${encodeURIComponent(res.email)}`);
        return;
      }
      setError(res.error);
      return;
    }
    navigate("/");
  };

  return (
    <div className="h-full min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient orbs */}
      <div className="animate-orb-1 absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-secondary-container-accent/25 blur-[120px] pointer-events-none" />
      <div className="animate-orb-2 absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-tertiary-fixed/25 blur-[130px] pointer-events-none" />
      <div className="animate-orb-3 absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />
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
            Sign in to your financial command center
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-3xl shadow-2xl p-8 border border-white/10">
          <h2 className="font-sans text-headline-md text-primary mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary pl-8 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="font-sans text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary pl-8 pr-9 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                  placeholder="••••••••"
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
            </div>

            {error && (
              <p className="font-sans text-label-md text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center font-sans text-body-md text-on-surface-variant mt-8">
            New to Aura?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center font-sans text-label-sm text-on-primary/40 mt-6">
          Aura AI can make mistakes. Consider verifying important financial data.
        </p>
      </div>
    </div>
  );
}
