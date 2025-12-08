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

export default function WorldometerSection({ token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchContinent, setSearchContinent] = useState("");
  const [debouncedCountry, setDebouncedCountry] = useState("");
  const [debouncedContinent, setDebouncedContinent] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCountry(searchCountry.trim()), 300);
    return () => clearTimeout(t);
  }, [searchCountry]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedContinent(searchContinent.trim()), 300);
    return () => clearTimeout(t);
  }, [searchContinent]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedCountry) params.append("country", debouncedCountry);
        if (debouncedContinent) params.append("continent", debouncedContinent);
        const url = `${API_BASE}/worldometer${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await parseJsonSafe(res, []);
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setRows(data);
      } catch (err) {
        setError(err.message || "Failed to load worldometer data");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, debouncedCountry, debouncedContinent]);

  if (loading) return <div className="text-sm text-slate-300">Loading worldometer...</div>;
  if (error)
    return (
      <div className="rounded-xl border border-red-400/60 bg-red-900/40 p-4 text-red-100">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Worldometer</h3>
                <p className="text-xs text-slate-400">
                  Server-side filters by country or continent. Editable: TotalCases, TotalDeaths, ActiveCases, Continent.
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-red-600/80 border border-red-300/60"></span> Higher fatality 
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-green-600/80 border border-green-300/60"></span> Lower fatality 
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
              placeholder="Filter by country"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
            />
            <input
              className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="text"
              placeholder="Filter by continent"
              value={searchContinent}
              onChange={(e) => setSearchContinent(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Country/Region</th>
                <th className="px-3 py-2 text-left">Continent</th>
                <th className="px-3 py-2 text-right">TotalCases</th>
                <th className="px-3 py-2 text-right">NewCases</th>
                <th className="px-3 py-2 text-right">TotalDeaths</th>
                <th className="px-3 py-2 text-right">NewDeaths</th>
                <th className="px-3 py-2 text-right">Fatality %</th>
                <th className="px-3 py-2 text-right">ActiveCases</th>
                <th className="px-3 py-2 text-right">TotalRecovered</th>
                <th className="px-3 py-2 text-right">NewRecovered</th>
                <th className="px-3 py-2 text-right">Population</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => {
                const fatalityRate = w.totalCases ? (w.totalDeaths || 0) / w.totalCases : 0;
                const rowClass =
                  fatalityRate > 0.1
                    ? "bg-red-900/50"
                    : fatalityRate < 0.005
                    ? "bg-green-900/40"
                    : "hover:bg-slate-800/60";
                const fatalityPct = fatalityRate * 100;

                return (
                  <tr key={w.countryRegion} className={rowClass}>
                    <td className="px-3 py-2 font-semibold text-slate-100">
                      {w.countryRegion}
                      <button
                        className="ml-2 text-xs text-slate-300 hover:text-indigo-300"
                        onClick={() => {
                          setEditing(w.countryRegion);
                          setEditForm({ ...w });
                          setSaveError("");
                        }}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-3 py-2">{w.continent || "N/A"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(w.totalCases)}</td>
                    <td className="px-3 py-2 text-right text-yellow-200">{formatNumber(w.newCases)}</td>
                    <td className="px-3 py-2 text-right text-red-200">{formatNumber(w.totalDeaths)}</td>
                    <td className="px-3 py-2 text-right text-red-200">{formatNumber(w.newDeaths)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex items-center justify-end px-2 py-1 rounded-md text-xs font-semibold border ${
                          fatalityRate > 0.1
                            ? "bg-red-900/60 border-red-400/50 text-red-100"
                            : fatalityRate < 0.005
                            ? "bg-green-900/50 border-green-400/50 text-green-100"
                            : "bg-slate-800 border-slate-700 text-slate-200"
                        }`}
                      >
                        {Number.isFinite(fatalityPct) ? `${fatalityPct.toFixed(2)}%` : "--"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-blue-200">{formatNumber(w.activeCases)}</td>
                    <td className="px-3 py-2 text-right text-green-200">{formatNumber(w.totalRecovered)}</td>
                    <td className="px-3 py-2 text-right text-green-200">{formatNumber(w.newRecovered)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(w.population)}</td>
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
                label="Active Cases"
                value={editForm.activeCases}
                onChange={(val) => setEditForm({ ...editForm, activeCases: val })}
              />
              <label className="text-sm text-slate-200 space-y-1 sm:col-span-2">
                <span>Continent</span>
                <input
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="text"
                  value={editForm.continent || ""}
                  onChange={(e) => setEditForm({ ...editForm, continent: e.target.value })}
                />
              </label>
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
                    const res = await fetch(`${API_BASE}/worldometer/${editing}`, {
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
                    setRows((prev) => prev.map((row) => (row.countryRegion === editing ? data : row)));
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
