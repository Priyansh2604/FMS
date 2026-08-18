import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, initializeAuth, getCurrentUser } from "../auth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const handleCallback = async () => {
      if (error) {
        console.error("OAuth error:", error, errorDescription);
        navigate("/login?error=" + encodeURIComponent(errorDescription || error));
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          navigate("/login?error=" + encodeURIComponent(exchangeError.message));
          return;
        }
      }

      await initializeAuth();
      if (getCurrentUser()) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="h-full min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="animate-orb-1 absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-secondary-container-accent/25 blur-[120px] pointer-events-none" />
      <div className="animate-orb-2 absolute -bottom-40 -left-24 w-[520px] h-[520px] rounded-full bg-tertiary-fixed/25 blur-[130px] pointer-events-none" />
      <div className="animate-orb-3 absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center mb-5 shadow-2xl">
            <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
          </div>
          <h1 className="font-display text-display text-on-primary tracking-tight">Aura Finance</h1>
        </div>
        <div className="bg-surface rounded-3xl shadow-2xl p-8 border border-white/10 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6" />
          <p className="font-sans text-body-md text-on-surface-variant">Completing sign in...</p>
        </div>
      </div>
    </div>
  );
}