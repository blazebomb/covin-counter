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

export default function DayWiseSection({ token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedDate, setDebouncedDate] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const next = (searchDate || searchText).trim();
    const t = setTimeout(() => setDebouncedDate(next), 300);
    return () => clearTimeout(t);
  }, [searchDate, searchText]);

  useEffect(() => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedDate) params.append("date", debouncedDate);
        const url = `${API_BASE}/day-wise${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await parseJsonSafe(res, []);
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setRows(data);
      } catch (err) {
        setError(err.message || "Failed to load day-wise data");
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedDate]);

  if (loading) return <div className="text-sm text-slate-300">Loading day-wise...</div>;
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
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Time Series</p>
          <h2 className="text-2xl font-bold text-slate-50">Day Wise</h2>
          <p className="text-sm text-slate-400">Search by date prefix (e.g., 2020-03).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <input
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Or type date prefix (YYYY-MM)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Day Wise</h3>
          <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {rows.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Confirmed</th>
                <th className="px-3 py-2 text-right">Deaths</th>
                <th className="px-3 py-2 text-right">Recovered</th>
                <th className="px-3 py-2 text-right">Active</th>
                <th className="px-3 py-2 text-right">New cases</th>
                <th className="px-3 py-2 text-right">New deaths</th>
                <th className="px-3 py-2 text-right">New recovered</th>
                <th className="px-3 py-2 text-right">Deaths / 100 Cases</th>
                <th className="px-3 py-2 text-right">Recovered / 100 Cases</th>
                <th className="px-3 py-2 text-right">Deaths / 100 Recovered</th>
                <th className="px-3 py-2 text-right">No. of countries</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date} className="hover:bg-slate-800/60">
                  <td className="px-3 py-2 font-semibold text-slate-100">
                    {row.date}
                    <button
                      className="ml-2 text-xs text-slate-300 hover:text-indigo-300"
                      onClick={() => {
                        setEditing(row.date);
                        setEditForm({ ...row });
                        setSaveError("");
                      }}
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.confirmed)}</td>
                  <td className="px-3 py-2 text-right text-red-200">{formatNumber(row.deaths)}</td>
                  <td className="px-3 py-2 text-right text-green-200">{formatNumber(row.recovered)}</td>
                  <td className="px-3 py-2 text-right text-blue-200">{formatNumber(row.active)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.newCases)}</td>
                  <td className="px-3 py-2 text-right text-red-200">{formatNumber(row.newDeaths)}</td>
                  <td className="px-3 py-2 text-right text-green-200">{formatNumber(row.newRecovered)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.deathsPer100Cases)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.recoveredPer100Cases)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.deathsPer100Recovered)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.numberOfCountries)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-100">Edit {editing}</h4>
              <button
                className="text-sm px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                label="Recovered"
                value={editForm.recovered}
                onChange={(val) => setEditForm({ ...editForm, recovered: val })}
              />
              <NumberInput
                label="Active"
                value={editForm.active}
                onChange={(val) => setEditForm({ ...editForm, active: val })}
              />
              <NumberInput
                label="New cases"
                value={editForm.newCases}
                onChange={(val) => setEditForm({ ...editForm, newCases: val })}
              />
              <NumberInput
                label="New deaths"
                value={editForm.newDeaths}
                onChange={(val) => setEditForm({ ...editForm, newDeaths: val })}
              />
              <NumberInput
                label="New recovered"
                value={editForm.newRecovered}
                onChange={(val) => setEditForm({ ...editForm, newRecovered: val })}
              />
              <NumberInput
                label="Deaths / 100 Cases"
                value={editForm.deathsPer100Cases}
                onChange={(val) => setEditForm({ ...editForm, deathsPer100Cases: val })}
              />
              <NumberInput
                label="Recovered / 100 Cases"
                value={editForm.recoveredPer100Cases}
                onChange={(val) => setEditForm({ ...editForm, recoveredPer100Cases: val })}
              />
              <NumberInput
                label="Deaths / 100 Recovered"
                value={editForm.deathsPer100Recovered}
                onChange={(val) => setEditForm({ ...editForm, deathsPer100Recovered: val })}
              />
              <NumberInput
                label="No. of countries"
                value={editForm.numberOfCountries}
                onChange={(val) => setEditForm({ ...editForm, numberOfCountries: val })}
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
                    const res = await fetch(`${API_BASE}/day-wise/${editing}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      credentials: "include",
                      body: JSON.stringify({ ...editForm, date: editing }),
                    });
                    const data = await parseJsonSafe(res, {});
                    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
                    setRows((prev) => prev.map((r) => (r.date === editing ? data : r)));
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
