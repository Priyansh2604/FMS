import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import MarketPage from "./pages/MarketPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { initializeAuth, subscribeToAuthChanges } from "./auth";
import { refreshCurrencyRates } from "./utils/currencyRates";

function RequireAuth({ ready, authenticated }) {
  if (!ready) {
    return <div className="min-h-screen bg-primary flex items-center justify-center text-on-primary font-sans">Checking your session...</div>;
  }
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RedirectAuthenticatedUser({ authenticated, children }) {
  return authenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    refreshCurrencyRates();
    let mounted = true;
    let authDecisionMade = false;

    initializeAuth().then(() => {
      if (mounted && !authDecisionMade) {
        setAuthenticated(false);
        setAuthReady(true);
      }
    }).catch((error) => {
      console.error("Unable to initialize authentication:", error);
      if (mounted && !authDecisionMade) {
        setAuthenticated(false);
        setAuthReady(true);
      }
    });

    const handleLoginComplete = () => {
      authDecisionMade = true;
      if (mounted) {
        setAuthenticated(true);
        setAuthReady(true);
      }
    };
    const unsubscribe = subscribeToAuthChanges((event) => {
      if (event === "SIGNED_OUT") {
        authDecisionMade = true;
        if (mounted) {
          setAuthenticated(false);
          setAuthReady(true);
        }
      }
    });
    window.addEventListener("aura:login-completed", handleLoginComplete);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("aura:login-completed", handleLoginComplete);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectAuthenticatedUser authenticated={authenticated}><LoginPage /></RedirectAuthenticatedUser>} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route index element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<RequireAuth ready={authReady} authenticated={authenticated} />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="invest" element={<InvestmentsPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="advisor" element={<AIAdvisorPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
