import { useEffect, useMemo, useState } from "react";
import { API_BASE, parseJsonSafe } from "../utils/api";
import { formatNumber } from "../utils/format";

function NumberInput({ label, value, onChange }) {
  return (
    <label className="text-sm text-slate-200 space-y-1">
      <span>{label}</span>
      <input
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </label>
  );
}

export default function CountrySection({ token }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/countries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await parseJsonSafe(res, []);
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setCountries(data);
      } catch (err) {
        setError(err.message || "Failed to load countries");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredCountries = useMemo(() => {
    if (!debouncedSearch) return countries;
    return countries.filter((c) => (c.countryRegion || "").toLowerCase().startsWith(debouncedSearch));
  }, [countries, debouncedSearch]);

  const totals = useMemo(
    () =>
      filteredCountries.reduce(
        (acc, c) => {
          acc.confirmed += c.confirmed || 0;
          acc.active += c.active || 0;
          acc.deaths += c.deaths || 0;
          acc.recovered += c.recovered || 0;
          return acc;
        },
        { confirmed: 0, active: 0, deaths: 0, recovered: 0 }
      ),
    [filteredCountries]
  );

  const totalRecovered = totals.confirmed - (totals.active + totals.deaths);

  if (loading) return <div className="text-sm text-slate-300">Loading countries...</div>;
  if (error)
    return (
      <div className="rounded-xl border border-red-400/60 bg-red-900/40 p-4 text-red-100">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Country Wise Latest</p>
          <h2 className="text-2xl font-bold text-slate-50">Country Snapshot</h2>
          <p className="text-xs text-slate-400 mt-1">
            Row highlight: red &gt;10% fatality, green &lt;0.5% fatality.
          </p>
        </div>
        <input
          className="w-full sm:w-64 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search countries"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Countries</h3>
          <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {filteredCountries.length} records
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
              {filteredCountries.map((c) => {
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
                    <td className="px-3 py-2 font-semibold text-slate-100">
                      {c.countryRegion}
                      <button
                        className="ml-2 text-xs text-slate-300 hover:text-indigo-300"
                        onClick={() => {
                          setEditing(c.countryRegion);
                          setEditForm({ ...c });
                          setSaveError("");
                        }}
                      >
                        Edit
                      </button>
                    </td>
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

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-100">Edit {editing}</h4>
              <button
                className="text-sm px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberInput
                label="Confirmed"
                value={editForm.confirmed}
                onChange={(val) => setEditForm({ ...editForm, confirmed: val })}
              />
              <NumberInput
                label="Deaths"
                value={editForm.deaths}
                onChange={(val) => setEditForm({ ...editForm, deaths: val })}
              />
              <NumberInput
                label="Active"
                value={editForm.active}
                onChange={(val) => setEditForm({ ...editForm, active: val })}
              />
            </div>

            {saveError && (
              <div className="mt-3 rounded-lg border border-red-400/60 bg-red-900/40 text-red-100 px-3 py-2 text-sm">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 rounded bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 disabled:opacity-60"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  setSaveError("");
                  try {
                    const res = await fetch(`${API_BASE}/countries/${editing}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      credentials: "include",
                      body: JSON.stringify({ ...editForm, countryRegion: editing }),
                    });
                    const data = await parseJsonSafe(res, {});
                    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
                    setCountries((prev) =>
                      prev.map((c) => (c.countryRegion === editing ? data : c))
                    );
                    setEditing(null);
                  } catch (err) {
                    setSaveError(err.message || "Failed to save changes");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
