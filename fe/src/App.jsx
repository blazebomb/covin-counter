import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const formatNumber = (n) =>
  typeof n === "number" ? n.toLocaleString("en-US") : "—";

function usePersistedToken() {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");

  const updateToken = (next) => {
    setToken(next);
    if (next) {
      localStorage.setItem("auth_token", next);
    } else {
      localStorage.removeItem("auth_token");
    }
  };

  return [token, updateToken];
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
    <div className="auth-card">
      <div className="tab-row">
        <button className="tab active" type="button">
          Login
        </button>
        <Link className="tab" to="/register">
          Register
        </Link>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
            required
          />
        </label>
        <button className="submit" type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
      {error && <div className="notice error">{error}</div>}
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
    <div className="auth-card">
      <div className="tab-row">
        <Link className="tab" to="/login">
          Login
        </Link>
        <button className="tab active" type="button">
          Register
        </button>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
            required
          />
        </label>
        <button className="submit" type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
      {error && <div className="notice error">{error}</div>}
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }
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

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card error">Error: {error}</div>;

  return (
    <>
      <header className="hero">
        <div>
          <p className="eyebrow">COVID Snapshot</p>
          <h1>Country Wise Latest</h1>
          <p className="subtitle">Protected data. You are signed in.</p>
        </div>
        <div className="pill">
          <div>API: {API_BASE}</div>
          <button className="logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <p className="label">Confirmed</p>
          <p className="value">{formatNumber(totals.confirmed)}</p>
        </div>
        <div className="summary-card">
          <p className="label">Active</p>
          <p className="value">{formatNumber(totals.active)}</p>
        </div>
        <div className="summary-card">
          <p className="label">Deaths</p>
          <p className="value">{formatNumber(totals.deaths)}</p>
        </div>
      </section>

      <div className="table-card">
        <div className="table-header">
          <h2>Countries</h2>
          <span className="badge">{countries.length} records</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Confirmed</th>
                <th>Active</th>
                <th>Recovered</th>
                <th>Deaths</th>
                <th>WHO Region</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.countryRegion}>
                  <td className="country-cell">
                    <span className="country-name">{c.countryRegion}</span>
                  </td>
                  <td>{formatNumber(c.confirmed)}</td>
                  <td>{formatNumber(c.active)}</td>
                  <td>{formatNumber(c.recovered)}</td>
                  <td>{formatNumber(c.deaths)}</td>
                  <td>
                    <span className="chip">{c.whoRegion || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [token, setToken] = usePersistedToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    navigate("/login", { replace: true });
  };

  const handleAuth = (tok) => {
    setToken(tok || "");
  };

  return (
    <div className="page">
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
