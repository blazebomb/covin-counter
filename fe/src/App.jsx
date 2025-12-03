import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const formatNumber = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "—");

function usePersistedToken() {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");
  const update = (next) => {
    setToken(next);
    if (next) localStorage.setItem("auth_token", next);
    else localStorage.removeItem("auth_token");
  };
  return [token, update];
}

function LoginPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      onAuth(data.token || "");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex gap-3 mb-6 text-sm font-semibold">
        <button className="flex-1 py-2 rounded-xl bg-indigo-600 text-white shadow" type="button">
          Login
        </button>
        <Link
          to="/register"
          className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-center border border-slate-700"
        >
          Register
        </Link>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Email</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Password</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
            required
          />
        </label>
        <button
          className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
      {error && (
        <div className="mt-4 rounded-lg border border-red-400/60 bg-red-900/40 text-red-100 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function RegisterPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      onAuth(data.token || "");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex gap-3 mb-6 text-sm font-semibold">
        <Link
          to="/login"
          className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-center border border-slate-700"
        >
          Login
        </Link>
        <button className="flex-1 py-2 rounded-xl bg-indigo-600 text-white shadow" type="button">
          Register
        </button>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Name</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Email</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Password</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
            required
          />
        </label>
        <button
          className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
      {error && (
        <div className="mt-4 rounded-lg border border-red-400/60 bg-red-900/40 text-red-100 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

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
        const data = await res.json();
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
          <p className="text-slate-300 text-sm">Protected data. You are signed in.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200">
          <span>API: {API_BASE}</span>
          <button
            className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        {c.whoRegion || "—"}
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

export default function App() {
  const [token, setToken] = usePersistedToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    navigate("/login", { replace: true });
  };

  const handleAuth = (tok) => setToken(tok || "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage onAuth={handleAuth} />} />
        <Route path="/register" element={<RegisterPage onAuth={handleAuth} />} />
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
