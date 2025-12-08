import { useState } from "react";
import CountrySection from "../components/CountrySection";
import WorldometerSection from "../components/WorldometerSection";
import DayWiseSection from "../components/DayWiseSection";
import CovidDataSection from "../components/CovidDataSection";

export default function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("country");

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Covid Counter</p>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-400">Switch between tables using the tabs below.</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { id: "country", label: "Country" },
            { id: "worldometer", label: "Worldometer" },
            { id: "daywise", label: "Day Wise" },
            { id: "coviddata", label: "Covid Data" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-lg border transition ${
                  active
                    ? "bg-indigo-600 border-indigo-500 text-white shadow"
                    : "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-indigo-500/60"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
          <button
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {activeTab === "country" && <CountrySection token={token} />}
      {activeTab === "worldometer" && <WorldometerSection token={token} />}
      {activeTab === "daywise" && <DayWiseSection token={token} />}
      {activeTab === "coviddata" && <CovidDataSection />}
    </div>
  );
}
