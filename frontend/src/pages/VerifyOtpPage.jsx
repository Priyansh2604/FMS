import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifySignupOtp, resendSignupOtp, getCurrentUser } from "../auth";
import OtpCircle from "../components/ui/OtpCircle";

const OTP_LENGTH = 4;

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(60);
  const [info, setInfo] = useState("");
  const refs = useRef([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    const pending = searchParams.get("email") || sessionStorage.getItem("aura_pending_email") || "";
    if (!pending) {
      navigate("/signup", { replace: true });
      return;
    }
    setEmail(pending);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (getCurrentUser()) navigate("/", { replace: true });
    return () => { try { sessionStorage.removeItem('aura_pending_password'); } catch {} };
  }, [navigate]);

  const code = () => digits.join("");

  const focus = (i) => refs.current[i]?.focus();

  const handleChange = (i, value) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError("");
    if (clean && i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        focus(i - 1);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const raw = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!raw) return;
    const next = Array(OTP_LENGTH).fill("");
    raw.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    setError("");
    const nextEmpty = next.findIndex((d) => !d);
    focus(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);
  };

  const handleSubmit = async () => {
    if (submittedRef.current) return;
    if (status !== "idle") return;
    if (!email) return;

    const token = code();
    if (token.length !== OTP_LENGTH) {
      setError("Please enter the 4-digit code from your email.");
      return;
    }

    submittedRef.current = true;
    setStatus("verifying");
    setError("");

    const res = await verifySignupOtp(email, token);
    if (res.ok) {
      setStatus("success");
      setTimeout(() => navigate("/", { replace: true }), 2800);
      return;
    }

    // Clear pending password on verification error so user can retry signup
    try { sessionStorage.removeItem('aura_pending_password'); } catch {}

    submittedRef.current = false;
    setStatus("error");
    setError(res.error || "Verification failed. Please try again.");
    setDigits(Array(OTP_LENGTH).fill(""));
    setTimeout(() => setStatus("idle"), 500);
    focus(0);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setInfo("");
    setError("");
    const res = await resendSignupOtp(email);
    if (res.ok) {
      setResendIn(60);
      setInfo("A new code has been sent to your email.");
    } else {
      setError(res.error || "Unable to resend the code. Please try again.");
    }
  };

  useEffect(() => {
    if (status === "idle" && code().length === OTP_LENGTH) {
      const t = setTimeout(() => handleSubmit(), 350);
      return () => clearTimeout(t);
    }
  }, [digits]);

  return (
    <div className="h-full min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient orbs */}
      <div className="animate-orb-1 absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-secondary-container-accent/25 blur-[120px] pointer-events-none" />
      <div className="animate-orb-2 absolute -bottom-40 -left-24 w-[520px] h-[520px] rounded-full bg-tertiary-fixed/25 blur-[130px] pointer-events-none" />
      <div className="animate-orb-3 absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />
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
        </div>

        {/* Card */}
        <div className="bg-surface rounded-3xl shadow-2xl p-8 border border-white/10">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center py-4 animate-fade-in">
              <OtpCircle digits={digits} status="success" />
              <h2 className="font-sans text-headline-md text-primary mt-8">You're in!</h2>
              <p className="font-sans text-body-md text-on-surface-variant mt-2">
                Email verified — taking you to your dashboard…
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <OtpCircle digits={digits} status={status === "verifying" ? "verifying" : "idle"} />
              </div>

              <h2 className="font-sans text-headline-md text-primary text-center mb-2">Verify your email</h2>
              <p className="font-sans text-body-md text-on-surface-variant text-center mb-8">
                Enter the <span className="font-semibold text-primary">4-digit code</span> we sent to{" "}
                <span className="text-primary font-semibold break-all">{email || "your email"}</span>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-6"
                noValidate
              >
                <div className="flex justify-center gap-3">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (refs.current[i] = el)}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      onFocus={(e) => e.target.select()}
                      disabled={status === "verifying"}
                      aria-label={`Digit ${i + 1}`}
                      className={`w-14 h-14 rounded-xl bg-surface-container-high/60 border text-center font-mono font-bold text-headline-lg text-primary outline-none transition-all focus:border-primary focus:bg-surface-container-high focus:shadow-lg ${
                        error ? "border-error/70" : "border-outline-variant"
                      } ${status === "verifying" ? "opacity-50" : ""}`}
                    />
                  ))}
                </div>

                {error && (
                  <p className="font-sans text-label-md text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 text-center">
                    {error}
                  </p>
                )}
                {info && (
                  <p className="font-sans text-label-md text-primary bg-secondary-container-accent/15 border border-secondary-container-accent/30 rounded-lg px-3 py-2 text-center">
                    {info}
                  </p>
                )}

                <button type="submit" disabled={status === "verifying"} className="btn btn-primary btn-block">
                  {status === "verifying" ? "Verifying…" : "Verify & Sign In"}
                </button>
              </form>

              <div className="text-center mt-6">
                {resendIn > 0 ? (
                  <p className="font-sans text-label-sm text-on-surface-variant">
                    Resend code in <span className="font-mono text-primary font-semibold">{resendIn}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} className="font-sans text-label-md text-primary font-semibold hover:underline">
                    Resend code
                  </button>
                )}
              </div>

              <p className="text-center font-sans text-body-md text-on-surface-variant mt-6">
                Wrong email?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Use a different one
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center font-sans text-label-sm text-on-primary/40 mt-6">
          The code is also included in the confirmation email — check your inbox (and spam).
        </p>
      </div>
    </div>
  );
}
