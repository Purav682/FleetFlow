"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { usePermissions } from "@/hooks/use-permissions";
import { DashboardReport, FuelEfficiencyReport, VehicleCostReport, readError, reportsApi } from "@/lib/api-client";

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const [vehicleCost, setVehicleCost] = useState<VehicleCostReport | null>(null);
  const [fuelEfficiency, setFuelEfficiency] = useState<FuelEfficiencyReport | null>(null);
  const [vehicleId, setVehicleId] = useState(1);
  const [loading, setLoading] = useState<"dashboard" | "vehicleCost" | "fuelEfficiency" | null>(null);
  const { can } = usePermissions();
  const canDashboard = can("reports.dashboard");
  const canAdvanced = can("reports.advanced");

  const loadDashboard = async () => {
    if (!canDashboard) return;
    try {
      setLoading("dashboard");
      setDashboard(await reportsApi.dashboard());
      toast.success("Dashboard report loaded");
    } catch (err) {
      toast.error(readError(err, "Failed to load dashboard report"));
    } finally {
      setLoading(null);
    }
  };

  const loadVehicleCost = async () => {
    if (!canAdvanced) return;
    try {
      setLoading("vehicleCost");
      setVehicleCost(await reportsApi.vehicleCost(vehicleId));
      toast.success("Vehicle cost loaded");
    } catch (err) {
      toast.error(readError(err, "Failed to load vehicle cost report"));
    } finally {
      setLoading(null);
    }
  };

  const loadFuelEfficiency = async () => {
    if (!canAdvanced) return;
    try {
      setLoading("fuelEfficiency");
      setFuelEfficiency(await reportsApi.fuelEfficiency(vehicleId));
      toast.success("Fuel efficiency loaded");
    } catch (err) {
      toast.error(readError(err, "Failed to load fuel efficiency report"));
    } finally {
      setLoading(null);
    }
  };

  const dashboardCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { key: "active", label: "Active Fleet", value: toNumber(dashboard.active_fleet_count) },
      { key: "maintenance", label: "In Maintenance", value: toNumber(dashboard.vehicles_in_maintenance) },
      { key: "utilization", label: "Utilization %", value: toNumber(dashboard.fleet_utilization_rate) },
      { key: "pending", label: "Pending Trips", value: toNumber(dashboard.pending_trips) },
      { key: "expired", label: "Expired Licenses", value: toNumber(dashboard.expired_licenses) },
    ];
  }, [dashboard]);

  const costChartData = useMemo(() => {
    if (!vehicleCost) return [];
    return [
      { name: "Fuel", value: toNumber(vehicleCost.total_fuel_cost) },
      { name: "Maintenance", value: toNumber(vehicleCost.total_maintenance_cost) },
      { name: "Operational", value: toNumber(vehicleCost.total_operational_cost) },
    ];
  }, [vehicleCost]);

  const efficiencyChartData = useMemo(() => {
    if (!fuelEfficiency) return [];
    return [
      { metric: "Distance", value: toNumber(fuelEfficiency.total_distance) },
      { metric: "Liters", value: toNumber(fuelEfficiency.total_liters) },
      { metric: "Distance/Liter", value: toNumber(fuelEfficiency.distance_per_liter) },
    ];
  }, [fuelEfficiency]);

  return (
    <AppLayout title="Reports">
      <div className="flex gap-3 mb-6 flex-wrap">
        <button className="border rounded px-3 py-2" onClick={loadDashboard} disabled={!canDashboard || loading !== null}>
          {loading === "dashboard" ? "Loading..." : "Load Dashboard"}
        </button>
        <input
          className="border rounded px-3 py-2 bg-background"
          type="number"
          min={1}
          value={vehicleId}
          onChange={(e) => setVehicleId(Math.max(1, Number(e.target.value) || 1))}
        />
        <button className="border rounded px-3 py-2" onClick={loadVehicleCost} disabled={!canAdvanced || loading !== null}>
          {loading === "vehicleCost" ? "Loading..." : "Vehicle Cost"}
        </button>
        <button className="border rounded px-3 py-2" onClick={loadFuelEfficiency} disabled={!canAdvanced || loading !== null}>
          {loading === "fuelEfficiency" ? "Loading..." : "Fuel Efficiency"}
        </button>
      </div>

      {!canDashboard && !canAdvanced && (
        <div className="mb-6 p-3 border rounded text-sm text-muted-foreground">Your role has no report access.</div>
      )}

      {dashboardCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {dashboardCards.map((item) => (
            <div key={item.key} className="border rounded p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {vehicleCost && (
        <div className="mb-6 border rounded p-4">
          <h2 className="font-semibold mb-3">Vehicle Cost Breakdown (Vehicle {vehicleCost.vehicle_id})</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costChartData} dataKey="value" nameKey="name" outerRadius={95} fill="hsl(var(--chart-1))" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {fuelEfficiency && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Fuel Efficiency Metrics (Vehicle {fuelEfficiency.vehicle_id})</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
