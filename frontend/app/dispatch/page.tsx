'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DispatchForm } from '@/components/forms/DispatchForm';
import { TripsTable } from '@/components/tables/TripsTable';
import { mockTrips as initialTrips } from '@/lib/mock-data';
import { Trip } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

export default function DispatchPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize trips on client side only to prevent hydration mismatch
  useEffect(() => {
    setTrips(initialTrips);
    setMounted(true);
  }, []);

  const handleCreateTrip = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newTrip: Trip = {
        id: `trip-${String(trips.length + 1).padStart(3, '0')}`,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cargoWeight: data.cargoWeight,
        destination: data.destination,
        pickupLocation: data.pickupLocation,
        status: 'dispatched',
        createdAt: new Date(),
      };

      setTrips([newTrip, ...trips]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = (tripId: string) => {
    setTrips(
      trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, status: 'completed' as const, completedAt: new Date() }
          : trip
      )
    );
  };

  const activeTrips = trips.filter(
    (t) => t.status === 'dispatched' || t.status === 'draft'
  );
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const completedTodayCount = completedTrips.filter((t) => {
    if (!t.completedAt) return false;
    const today = new Date();
    const completedDate = new Date(t.completedAt);
    return completedDate.toDateString() === today.toDateString();
  }).length;

  if (!mounted) {
    return (
      <AppLayout title="Dispatch">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dispatch">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Trip Dispatch</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage trip assignments
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-6">Create New Trip</h2>
              <DispatchForm
                onSubmit={handleCreateTrip}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Trips List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Active Trips</div>
                <div className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                  {activeTrips.length}
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Completed Today</div>
                <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                  {completedTodayCount}
                </div>
              </div>
            </div>

            {/* All Trips Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  All Trips
                </h2>
              </div>
              <div className="overflow-x-auto">
                <TripsTable
                  trips={trips}
                  onMarkCompleted={handleMarkCompleted}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
