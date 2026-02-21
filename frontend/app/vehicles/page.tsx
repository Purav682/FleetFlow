'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { VehiclesTable } from '@/components/tables/VehiclesTable';
import { AddVehicleModal } from '@/components/dialogs/AddVehicleModal';
import { Button } from '@/components/ui/button';
import { mockVehicles as initialVehicles } from '@/lib/mock-data';
import { Vehicle } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [modalOpen, setModalOpen] = useState(false);

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles([...vehicles, newVehicle]);
  };

  return (
    <AppLayout title="Vehicles">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fleet Vehicles</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your vehicle fleet
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Total Vehicles</div>
            <div className="text-3xl font-bold mt-2">{vehicles.length}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
              {vehicles.filter((v) => v.status === 'available').length}
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">In Service</div>
            <div className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
              {vehicles.filter((v) => v.status === 'on_trip').length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <VehiclesTable vehicles={vehicles} />
        </div>
      </div>

      {/* Modal */}
      <AddVehicleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVehicleAdded={handleVehicleAdded}
      />
    </AppLayout>
  );
}
