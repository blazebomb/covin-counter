import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Login screen.
 * - If backend says OTP_REQUIRED, we redirect to the OTP page.
 * - If backend returns a token, we log in normally.
 */
export function LoginPage({ apiBase, parseJson, onOtpRequired, onAuthSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow cookies if backend sets one
        body: JSON.stringify(form),
      });
      const data = await parseJson(res, {});
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      // 2FA path: backend says OTP is required, so move to OTP step.
      if (data.status === "OTP_REQUIRED") {
        onOtpRequired(data);
        return;
      }

      // Non-2FA fallback: if token is present, accept it.
      if (data.token) {
        onAuthSuccess(data.token);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Unexpected login response. Try again.");
      }
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

/**
 * Registration screen.
 * - Saves user, then sends them to login to start the OTP flow.
 */
export function RegisterPage({ apiBase, parseJson, onRegistered }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await parseJson(res, {});
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      // Registration success: send user to login to do OTP.
      onRegistered?.();
      navigate("/login", { replace: true });
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

/**
 * OTP screen.
 * - Reads the email that needs verification (passed from login).
 * - Posts the code to /auth/verify-otp.
 * - On success, returns the token to the parent to finish login.
 */
export function OtpPage({ apiBase, parseJson, pendingEmail, onVerified, onReset }) {
  const [email, setEmail] = useState(pendingEmail || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep the email field synced with what parent passes.
  useEffect(() => {
    setEmail(pendingEmail || "");
  }, [pendingEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await parseJson(res, {});
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (!data.token) throw new Error("No token received. Please try again.");
      onVerified(data.token);
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex gap-3 mb-6 text-sm font-semibold">
        <button className="flex-1 py-2 rounded-xl bg-indigo-600 text-white shadow" type="button">
          Enter OTP
        </button>
        <Link
          to="/login"
          className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-center border border-slate-700"
        >
          Back to Login
        </Link>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>Email (where we sent the code)</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block text-sm text-slate-200 space-y-1">
          <span>OTP Code</span>
          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Checking..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            Start over
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-4 rounded-lg border border-red-400/60 bg-red-900/40 text-red-100 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
