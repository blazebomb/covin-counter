import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LoginPage, RegisterPage, OtpPage } from "./AuthViews";
import Dashboard from "./pages/Dashboard";
import { usePersistedToken } from "./hooks/usePersistedToken";
import { API_BASE, parseJsonSafe } from "./utils/api";

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [token, setToken] = usePersistedToken();
  const [pendingOtpEmail, setPendingOtpEmail] = useState(
    () => localStorage.getItem("otp_email") || ""
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setPendingOtpEmail("");
    localStorage.removeItem("otp_email");
    navigate("/login", { replace: true });
  };

  const handleOtpRequired = (challenge) => {
    const email = challenge?.email || "";
    setPendingOtpEmail(email);
    if (email) localStorage.setItem("otp_email", email);
    navigate("/otp", { replace: true });
  };

  const handleTokenReady = (tok) => {
    setPendingOtpEmail("");
    localStorage.removeItem("otp_email");
    setToken(tok || "");
    navigate("/dashboard", { replace: true });
  };

  const handleOtpReset = () => {
    setPendingOtpEmail("");
    localStorage.removeItem("otp_email");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <LoginPage
              apiBase={API_BASE}
              parseJson={parseJsonSafe}
              onOtpRequired={handleOtpRequired}
              onAuthSuccess={handleTokenReady}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              apiBase={API_BASE}
              parseJson={parseJsonSafe}
              onRegistered={() => navigate("/login", { replace: true })}
            />
          }
        />
        <Route
          path="/otp"
          element={
            <OtpPage
              apiBase={API_BASE}
              parseJson={parseJsonSafe}
              pendingEmail={pendingOtpEmail}
              onVerified={handleTokenReady}
              onReset={handleOtpReset}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <Dashboard token={token} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
