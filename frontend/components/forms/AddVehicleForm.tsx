'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const vehicleSchema = z.object({
  name: z.string().min(2, 'Vehicle name must be at least 2 characters'),
  licensePlate: z.string().min(4, 'License plate is required'),
  capacity: z.coerce.number().min(1000, 'Capacity must be at least 1000 kg'),
  odometer: z.coerce.number().min(0, 'Odometer cannot be negative'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface AddVehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  isLoading?: boolean;
}

export function AddVehicleForm({
  onSubmit,
  isLoading = false,
}: AddVehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Vehicle Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Semi Truck 1"
          className="mt-1"
        />
        {errors.name && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.name.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="licensePlate">License Plate</Label>
        <Input
          id="licensePlate"
          {...register('licensePlate')}
          placeholder="e.g., FX-2024-001"
          className="mt-1"
        />
        {errors.licensePlate && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.licensePlate.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="capacity">Capacity (kg)</Label>
        <Input
          id="capacity"
          type="number"
          {...register('capacity')}
          placeholder="25000"
          className="mt-1"
        />
        {errors.capacity && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.capacity.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="odometer">Odometer (km)</Label>
        <Input
          id="odometer"
          type="number"
          {...register('odometer')}
          placeholder="0"
          className="mt-1"
        />
        {errors.odometer && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.odometer.message}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Adding...' : 'Add Vehicle'}
      </Button>
    </form>
  );
}
