"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import type { ExternalRaceResult } from "@/types";

export default function RaceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExternalRaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/races/search?q=${encodeURIComponent(query.trim())}`,
      );
      const data = (await response.json()) as ExternalRaceResult[] | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Search failed.");
      }
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function syncRace(race: ExternalRaceResult) {
    const id = race.external_id ?? race.name ?? "";
    setSyncingId(id);
    try {
      const response = await fetch("/api/admin/races/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(race),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Sync failed.");
      toast.success(data.message ?? "Race synced to database.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RunSignup races…"
          className="admin-input flex-1"
        />
        <button type="submit" disabled={loading} className="admin-btn-primary shrink-0">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {results.length > 0 ? (
        <div className="admin-card divide-y divide-light-brown/50 overflow-hidden">
          {results.map((race) => {
            const key = race.external_id ?? `${race.name}-${race.start_time}`;
            return (
              <div
                key={key}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brown">{race.name}</p>
                  <p className="text-sm text-brown/60">
                    {race.location_text} · {race.distance_label ?? `${race.distance_km} km`}
                  </p>
                  {race.start_time ? (
                    <p className="text-xs text-brown/50">{race.start_time}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => syncRace(race)}
                  disabled={syncingId === (race.external_id ?? race.name)}
                  className="admin-btn-secondary shrink-0 text-sm"
                >
                  {syncingId === (race.external_id ?? race.name) ? "Syncing…" : "Import to DB"}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
