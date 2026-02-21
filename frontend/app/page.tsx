'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/cards/MetricCard';
import { ActivityItem } from '@/components/cards/ActivityItem';
import { mockVehicles, mockDrivers, mockTrips, mockActivity } from '@/lib/mock-data';
import {
  Truck,
  Users,
  Navigation,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  // Calculate metrics
  const availableVehicles = mockVehicles.filter(
    (v) => v.status === 'available'
  ).length;
  const activeTrips = mockTrips.filter((t) => t.status === 'dispatched').length;
  const vehiclesInShop = mockVehicles.filter((v) => v.status === 'in_shop').length;
  const driversOnDuty = mockDrivers.filter((d) => d.status === 'on_duty').length;
  const totalFleet = mockVehicles.length;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            icon={Truck}
            label="Total Fleet"
            value={totalFleet}
            subtext="All vehicles"
          />
          <MetricCard
            icon={Truck}
            label="Available"
            value={availableVehicles}
            subtext="Ready for dispatch"
            variant="success"
          />
          <MetricCard
            icon={AlertCircle}
            label="In Shop"
            value={vehiclesInShop}
            subtext="Maintenance"
            variant="danger"
          />
          <MetricCard
            icon={Navigation}
            label="Active Trips"
            value={activeTrips}
            subtext="Currently dispatched"
            variant="success"
          />
          <MetricCard
            icon={Users}
            label="Drivers On Duty"
            value={driversOnDuty}
            subtext="Active drivers"
            variant="success"
          />
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-0 divide-y divide-border">
              {mockActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-muted-foreground mb-1">
                  Total Completed Trips
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockTrips.filter((t) => t.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-xs text-muted-foreground mb-1">
                  License Warnings
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {mockActivity.filter((a) => a.type === 'driver_warning').length}
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-muted-foreground mb-1">
                  Fleet Utilization
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(
                    (mockVehicles.filter((v) => v.status !== 'available').length /
                      mockVehicles.length) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
