"use client";

import { useState, FormEvent } from "react";

interface Registration {
  id: string;
  name: string;
  email: string;
  companion: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [count, setCount] = useState(0);
  const [totalPersons, setTotalPersons] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setRegistrations(data.registrations);
      setCount(data.count);
      setTotalPersons(data.totalPersons);
      setAuthenticated(true);
      setLoading(false);
    } catch {
      setError("Verbindungsfehler.");
      setLoading(false);
    }
  }

  async function refresh() {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) {
      setRegistrations(data.registrations);
      setCount(data.count);
      setTotalPersons(data.totalPersons);
    }
  }

  function exportCSV() {
    const header = "Name,E-Mail,Begleitung,Angemeldet am\n";
    const rows = registrations
      .map(
        (r) =>
          `"${r.name}","${r.email}",${r.companion ? "Ja" : "Nein"},"${new Date(r.created_at).toLocaleDateString("de-DE")}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `h1a1-anmeldungen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-0 mb-2">
              <span className="font-serif italic text-2xl">H1</span>
              <span className="font-sans font-bold text-2xl">&ndash;A1</span>
            </div>
            <p className="font-sans text-gray text-sm">Admin-Bereich</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-dark/10 rounded-xl px-5 py-4 font-sans text-dark placeholder:text-gray/50 focus:outline-none focus:border-orange transition-colors"
              placeholder="Passwort"
            />
            {error && (
              <p className="font-sans text-sm text-orange">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark text-off-white font-sans font-medium py-4 rounded-xl hover:bg-orange transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Einloggen"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="bg-dark text-off-white px-6 md:px-10 py-5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-0">
              <span className="font-serif italic text-xl">H1</span>
              <span className="font-sans font-bold text-xl">&ndash;A1</span>
            </div>
            <span className="font-sans text-sm text-off-white/40">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="font-sans text-sm text-off-white/60 hover:text-off-white transition-colors"
            >
              Aktualisieren
            </button>
            <button
              onClick={exportCSV}
              className="font-sans text-sm bg-orange text-off-white px-4 py-2 rounded-lg hover:bg-off-white hover:text-dark transition-colors"
            >
              CSV Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-dark/5">
            <p className="font-sans text-3xl font-bold text-dark">{count}</p>
            <p className="font-sans text-sm text-gray">Anmeldungen</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-dark/5">
            <p className="font-sans text-3xl font-bold text-orange">
              {totalPersons}
            </p>
            <p className="font-sans text-sm text-gray">Personen gesamt</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-dark/5">
            <p className="font-sans text-3xl font-bold text-dark">
              {registrations.filter((r) => r.companion).length}
            </p>
            <p className="font-sans text-sm text-gray">Mit Begleitung</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-dark/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark/5">
                  <th className="font-sans text-xs text-gray uppercase tracking-wider text-left px-6 py-4">
                    Name
                  </th>
                  <th className="font-sans text-xs text-gray uppercase tracking-wider text-left px-6 py-4">
                    E-Mail
                  </th>
                  <th className="font-sans text-xs text-gray uppercase tracking-wider text-left px-6 py-4">
                    Begleitung
                  </th>
                  <th className="font-sans text-xs text-gray uppercase tracking-wider text-left px-6 py-4">
                    Angemeldet
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-dark/5 last:border-0 hover:bg-off-white/50 transition-colors"
                  >
                    <td className="font-sans text-sm px-6 py-4 font-medium">
                      {reg.name}
                    </td>
                    <td className="font-sans text-sm px-6 py-4 text-gray">
                      {reg.email}
                    </td>
                    <td className="font-sans text-sm px-6 py-4">
                      {reg.companion ? (
                        <span className="bg-orange/10 text-orange text-xs px-2.5 py-1 rounded-full">
                          +1
                        </span>
                      ) : (
                        <span className="text-gray text-xs">Alleine</span>
                      )}
                    </td>
                    <td className="font-sans text-sm px-6 py-4 text-gray">
                      {new Date(reg.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="font-sans text-sm text-gray text-center py-12"
                    >
                      Noch keine Anmeldungen.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
