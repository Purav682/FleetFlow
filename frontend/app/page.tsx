"use client";

import { useEffect, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { reportsApi, readError, DashboardReport } from "@/lib/api-client";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    reportsApi
      .dashboard()
      .then(setData)
      .catch((err) => setError(readError(err, "Failed to load dashboard")));
  }, []);

  return (
    <AppLayout title="Dashboard">
      {error && <div className="mb-4 p-3 rounded border border-red-300 text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card label="Active Fleet" value={data?.active_fleet_count} />
        <Card label="In Maintenance" value={data?.vehicles_in_maintenance} />
        <Card label="Utilization %" value={data?.fleet_utilization_rate} />
        <Card label="Pending Trips" value={data?.pending_trips} />
        <Card label="Expired Licenses" value={data?.expired_licenses} />
      </div>
    </AppLayout>
  );
}

function Card({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold mt-2">{value ?? "-"}</div>
    </div>
  );
}
