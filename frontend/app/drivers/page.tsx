'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DriversTable } from '@/components/tables/DriversTable';
import { AddDriverModal } from '@/components/dialogs/AddDriverModal';
import { Button } from '@/components/ui/button';
import { mockDrivers as initialDrivers } from '@/lib/mock-data';
import { Driver } from '@/lib/types';
import { Plus, AlertTriangle } from 'lucide-react';
import { addDays, isBefore } from 'date-fns';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDriverAdded = (newDriver: Driver) => {
    setDrivers([...drivers, newDriver]);
  };

  const driversWithExpiringLicenses = drivers.filter((d) => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return isBefore(d.licenseExpiry, thirtyDaysFromNow);
  });

  return (
    <AppLayout title="Drivers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Drivers</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your drivers
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        </div>

        {/* Alerts */}
        {driversWithExpiringLicenses.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                License Expiry Warnings
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                {driversWithExpiringLicenses.length} driver
                {driversWithExpiringLicenses.length !== 1 ? 's' : ''}{' '}
                {driversWithExpiringLicenses.length !== 1
                  ? 'have'
                  : 'has'} licenses expiring within 30 days.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Total Drivers</div>
            <div className="text-3xl font-bold mt-2">{drivers.length}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">On Duty</div>
            <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
              {drivers.filter((d) => d.status === 'on_duty').length}
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">License Warnings</div>
            <div className="text-3xl font-bold mt-2 text-amber-600 dark:text-amber-400">
              {driversWithExpiringLicenses.length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <DriversTable drivers={drivers} />
        </div>
      </div>

      {/* Modal */}
      <AddDriverModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDriverAdded={handleDriverAdded}
      />
    </AppLayout>
  );
}
