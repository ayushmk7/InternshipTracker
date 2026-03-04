"use client";

import { useState, useEffect, useCallback } from "react";
import { StatsCards } from "@/components/StatsCards";
import { Filters } from "@/components/Filters";
import { SpreadsheetTable } from "@/components/SpreadsheetTable";
import type { Application, ApplicationStatus } from "@/types";

interface Stats {
  offered: number;
  oa: number;
  interviewing: number;
}

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    offered: 0,
    oa: 0,
    interviewing: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications ?? []);
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    void fetchStats();
    void fetchApplications();
  }, [fetchStats, fetchApplications]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchStats();
      void fetchApplications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchApplications]);

  const handleUpdateStatus = useCallback(
    (id: string, status: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      setStats((prev) => {
        const next = { ...prev };
        const app = applications.find((a) => a.id === id);
        if (app) {
          const oldStatus = app.status as keyof Stats;
          if (next[oldStatus] > 0) next[oldStatus]--;
          next[status]++;
        }
        return next;
      });
    },
    [applications]
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Internship Tracker
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Forward company emails to your AgentMail inbox to track applications.
        </p>

        <div className="mt-6">
          <StatsCards
            offered={stats.offered}
            oa={stats.oa}
            interviewing={stats.interviewing}
          />
        </div>

        <Filters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            Loading…
          </div>
        ) : (
          <SpreadsheetTable
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </main>
  );
}
