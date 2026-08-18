import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { getCurrentUser } from "./auth";

function RequireAuth() {
  return getCurrentUser() ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener('aura:session-changed', handler);
    window.addEventListener('aura:fx-updated', handler);
    return () => {
      window.removeEventListener('aura:session-changed', handler);
      window.removeEventListener('aura:fx-updated', handler);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="invest" element={<InvestmentsPage />} />
            <Route path="advisor" element={<AIAdvisorPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
