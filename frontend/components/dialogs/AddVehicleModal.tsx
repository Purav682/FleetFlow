'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddVehicleForm } from '@/components/forms/AddVehicleForm';
import { Vehicle } from '@/lib/types';

interface AddVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
}

export function AddVehicleModal({
  open,
  onOpenChange,
  onVehicleAdded,
}: AddVehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newVehicle: Vehicle = {
        id: `v${Date.now()}`,
        name: data.name,
        licensePlate: data.licensePlate,
        capacity: data.capacity,
        odometer: data.odometer,
        status: 'available',
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      };

      onVehicleAdded(newVehicle);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle to your fleet. Enter the vehicle details below.
          </DialogDescription>
        </DialogHeader>
        <AddVehicleForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
