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
  const [region, setRegion] = useState("");
  const [continent, setContinent] = useState("");
  const [debouncedRegion, setDebouncedRegion] = useState("");
  const [debouncedContinent, setDebouncedContinent] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRegion(region.trim()), 300);
    return () => clearTimeout(t);
  }, [region]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedContinent(continent.trim()), 300);
    return () => clearTimeout(t);
  }, [continent]);

  useEffect(() => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedRegion) params.append("region", debouncedRegion);
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
  }, [debouncedRegion, debouncedContinent]);

  if (loading) return <div className="text-sm text-slate-300">Loading covid data...</div>;
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
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Reference Data</p>
          <h2 className="text-2xl font-bold text-slate-50">Covid Data (1000 records)</h2>
          <p className="text-sm text-slate-400">Filter by region or continent (mapped to Region column).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Region filter"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <input
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Continent filter"
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
          />
        </div>
      </div>

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
                const rowClass =
                  fatalityRate > 0.1
                    ? "bg-red-900/40"
                    : fatalityRate < 0.005
                    ? "bg-green-900/30"
                    : "hover:bg-slate-800/60";

                return (
                  <tr key={r.recordId} className={rowClass}>
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
              <label className="text-sm text-slate-200 space-y-1">
                <span>Country</span>
                <input
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={editForm.country || ""}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-200 space-y-1">
                <span>Region</span>
                <input
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={editForm.region || ""}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-200 space-y-1">
                <span>Continent (maps to Region)</span>
                <input
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={editForm.region || ""}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                />
              </label>
              <NumberInput
                label="Total Cases"
                value={editForm.totalCases}
                onChange={(val) => setEditForm({ ...editForm, totalCases: val })}
              />
              <NumberInput
                label="Total Deaths"
                value={editForm.totalDeaths}
                onChange={(val) => setEditForm({ ...editForm, totalDeaths: val })}
              />
              <NumberInput
                label="Total Recovered"
                value={editForm.totalRecovered}
                onChange={(val) => setEditForm({ ...editForm, totalRecovered: val })}
              />
              <NumberInput
                label="Active Cases"
                value={editForm.activeCases}
                onChange={(val) => setEditForm({ ...editForm, activeCases: val })}
              />
              <NumberInput
                label="Cases per Million"
                value={editForm.casesPerMillion}
                onChange={(val) => setEditForm({ ...editForm, casesPerMillion: val })}
              />
              <NumberInput
                label="Deaths per Million"
                value={editForm.deathsPerMillion}
                onChange={(val) => setEditForm({ ...editForm, deathsPerMillion: val })}
              />
              <NumberInput
                label="Latitude"
                value={editForm.latitude}
                onChange={(val) => setEditForm({ ...editForm, latitude: val })}
              />
              <NumberInput
                label="Longitude"
                value={editForm.longitude}
                onChange={(val) => setEditForm({ ...editForm, longitude: val })}
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
