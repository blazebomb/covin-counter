import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { LoginPage, RegisterPage, OtpPage } from "./AuthViews";

// Base URL for your backend API.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8089";

// Safely read JSON; if the body is empty, return the fallback.
async function parseJsonSafe(res, fallbackValue) {
  const text = await res.text();
  if (!text) return fallbackValue;
  return JSON.parse(text);
}

// Keep token in state and localStorage so a refresh stays logged in.
function usePersistedToken() {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  const update = (next) => {
    setToken(next);
    if (next) localStorage.setItem("auth_token", next);
    else localStorage.removeItem("auth_token");
  };
  return [token, update];
}

// Dashboard stays mostly unchanged; it loads data with the token if present.
function Dashboard({ token, onLogout }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/countries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await parseJsonSafe(res, []);
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setCountries(data);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const totals = useMemo(() => {
    return countries.reduce(
      (acc, c) => {
        acc.confirmed += c.confirmed || 0;
        acc.active += c.active || 0;
        acc.deaths += c.deaths || 0;
        acc.recovered += c.recovered || 0;
        return acc;
      },
      { confirmed: 0, active: 0, deaths: 0, recovered: 0 }
    );
  }, [countries]);

  const totalRecovered = totals.confirmed - (totals.active + totals.deaths);

  if (!token) return null;
  if (loading) return <div className="max-w-3xl mx-auto text-center text-slate-200">Loading...</div>;
  if (error)
    return (
      <div className="max-w-3xl mx-auto text-center text-red-200 border border-red-400/60 bg-red-900/40 rounded-xl p-4">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">COVID Snapshot</p>
          <h1 className="text-3xl font-bold text-slate-50">Country Wise Latest</h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200">
          <button
            className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Confirmed</p>
          <p className="text-2xl font-bold text-blue-300">{formatNumber(totals.confirmed)}</p>
        </div>
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active</p>
          <p className="text-2xl font-bold text-yellow-300">{formatNumber(totals.active)}</p>
        </div>
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Deaths</p>
          <p className="text-2xl font-bold text-red-300">{formatNumber(totals.deaths)}</p>
        </div>
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Recovered</p>
          <p className="text-2xl font-bold text-green-300">{formatNumber(totalRecovered)}</p>
        </div>
      </section>

      <section className="flex gap-4 text-sm text-slate-200">
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-900/80 border border-red-500/50" />
          Fatality &gt; 10%
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-900/80 border border-green-500/50" />
          Fatality &lt; 0.5%
        </span>
      </section>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Countries</h2>
          <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {countries.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Country</th>
                <th className="px-3 py-2 text-right">Confirmed</th>
                <th className="px-3 py-2 text-right">Active</th>
                <th className="px-3 py-2 text-right">Recovered</th>
                <th className="px-3 py-2 text-right">Deaths</th>
                <th className="px-3 py-2 text-center">WHO Region</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => {
                const confirmed = c.confirmed || 0;
                const deaths = c.deaths || 0;
                const active = c.active || 0;
                const recoveredCalc = Math.max(0, confirmed - (active + deaths));
                const fatalityRate = confirmed > 0 ? deaths / confirmed : 0;
                const rowClass =
                  fatalityRate > 0.1
                    ? "bg-red-900/40"
                    : fatalityRate < 0.005
                    ? "bg-green-900/30"
                    : "hover:bg-slate-800/60";

                return (
                  <tr key={c.countryRegion} className={rowClass}>
                    <td className="px-3 py-2 font-semibold text-slate-100">{c.countryRegion}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(confirmed)}</td>
                    <td className="px-3 py-2 text-right text-yellow-200">{formatNumber(active)}</td>
                    <td className="px-3 py-2 text-right text-green-200">
                      {formatNumber(recoveredCalc)}
                    </td>
                    <td className="px-3 py-2 text-right text-red-200">{formatNumber(deaths)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex px-2 py-1 rounded-full bg-slate-800 text-slate-200 text-xs border border-slate-700">
                        {c.whoRegion || "N/A"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Format numbers nicely for the dashboard.
const formatNumber = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "N/A");

export default function App() {
  const [token, setToken] = usePersistedToken();
  // Track which email is expecting an OTP; keep it in localStorage so a refresh does not lose it.
  const [pendingOtpEmail, setPendingOtpEmail] = useState(() => localStorage.getItem("otp_email") || "");
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setPendingOtpEmail("");
    localStorage.removeItem("otp_email");
    navigate("/login", { replace: true });
  };

  // When login returns OTP_REQUIRED, remember the email and send user to OTP page.
  const handleOtpRequired = (challenge) => {
    const email = challenge?.email || "";
    setPendingOtpEmail(email);
    if (email) localStorage.setItem("otp_email", email);
    navigate("/otp", { replace: true });
  };

  // When OTP is verified or normal login returns a token, clear OTP state and go to dashboard.
  const handleTokenReady = (tok) => {
    setPendingOtpEmail("");
    localStorage.removeItem("otp_email");
    setToken(tok || "");
    navigate("/dashboard", { replace: true });
  };

  // If user wants to abandon OTP and start over.
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
