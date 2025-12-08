import { useEffect, useState } from "react";
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

export default function CovidDataSection({ token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // only continent filter now
  const [continent, setContinent] = useState("");
  const [debouncedContinent, setDebouncedContinent] = useState("");

  // editing modal states
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // debounce continent filter
  useEffect(() => {
    const t = setTimeout(() => setDebouncedContinent(continent.trim()), 300);
    return () => clearTimeout(t);
  }, [continent]);

  // fetch data
  useEffect(() => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedContinent) params.append("continent", debouncedContinent);

        const url = `${API_BASE}/covid-data${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await parseJsonSafe(res, []);
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setRows(data);
      } catch (err) {
        setError(err.message || "Failed to load covid data");
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedContinent, token]);

  if (loading) return <div className="text-sm text-slate-300">Loading covid data...</div>;
  if (error)
    return (
      <div className="rounded-xl border border-red-400/60 bg-red-900/40 p-4 text-red-100">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Reference Data</p>
          <h2 className="text-2xl font-bold text-slate-50">Covid Data (1000 records)</h2>
          <p className="text-sm text-slate-400">
            Filter by continent. Row highlight: red ›10% fatality, green ‹0.5%.
          </p>
        </div>

        {/* Only continent filter */}
        <input
          className="rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Continent filter"
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Records</h3>
          <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {rows.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Country</th>
                <th className="px-3 py-2 text-left">Region</th>
                <th className="px-3 py-2 text-right">Total Cases</th>
                <th className="px-3 py-2 text-right">Total Deaths</th>
                <th className="px-3 py-2 text-right">Fatality %</th>
                <th className="px-3 py-2 text-right">Total Recovered</th>
                <th className="px-3 py-2 text-right">Active Cases</th>
                <th className="px-3 py-2 text-right">Cases per Million</th>
                <th className="px-3 py-2 text-right">Deaths per Million</th>
                <th className="px-3 py-2 text-right">Latitude</th>
                <th className="px-3 py-2 text-right">Longitude</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const fatalityRate = r.totalCases ? (r.totalDeaths || 0) / r.totalCases : 0;
                const rowColor =
                  fatalityRate > 0.10
                    ? "bg-red-900/40"
                    : fatalityRate < 0.005
                    ? "bg-green-900/30"
                    : "hover:bg-slate-800/60";

                return (
                  <tr key={r.recordId} className={rowColor}>
                    <td className="px-3 py-2 font-semibold text-slate-100">
                      {r.country}
                      <button
                        className="ml-2 text-xs text-slate-300 hover:text-indigo-300"
                        onClick={() => {
                          setEditing(r.recordId);
                          setEditForm({ ...r });
                          setSaveError("");
                        }}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-3 py-2">{r.region || "N/A"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(r.totalCases)}</td>
                    <td className="px-3 py-2 text-right text-red-200">{formatNumber(r.totalDeaths)}</td>
                    <td className="px-3 py-2 text-right">{((fatalityRate * 100) || 0).toFixed(2)}%</td>
                    <td className="px-3 py-2 text-right text-green-200">{formatNumber(r.totalRecovered)}</td>
                    <td className="px-3 py-2 text-right text-blue-200">{formatNumber(r.activeCases)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(r.casesPerMillion)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(r.deathsPerMillion)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(r.latitude)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(r.longitude)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL (unchanged) --- */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-100">Edit {editForm.country}</h4>
              <button
                className="text-sm px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ALL INPUTS KEPT AS ORIGINAL */}
              {Object.keys(editForm).map((key) =>
                typeof editForm[key] === "number" ? (
                  <NumberInput
                    key={key}
                    label={key}
                    value={editForm[key]}
                    onChange={(val) => setEditForm({ ...editForm, [key]: val })}
                  />
                ) : (
                  <label key={key} className="text-sm text-slate-200 space-y-1">
                    <span>{key}</span>
                    <input
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      type="text"
                      value={editForm[key] ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    />
                  </label>
                )
              )}
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
                    const res = await fetch(`${API_BASE}/covid-data/${editing}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      credentials: "include",
                      body: JSON.stringify({ ...editForm, recordId: editing }),
                    });
                    const data = await parseJsonSafe(res, {});
                    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
                    setRows((prev) => prev.map((r) => (r.recordId === editing ? data : r)));
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
