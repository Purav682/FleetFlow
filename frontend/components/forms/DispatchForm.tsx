'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { mockVehicles, mockDrivers } from '@/lib/mock-data';

const tripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoWeight: z.coerce.number().min(1, 'Cargo weight must be greater than 0'),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  destination: z.string().min(3, 'Destination is required'),
});

type TripFormData = z.infer<typeof tripSchema>;

interface DispatchFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading?: boolean;
}

export function DispatchForm({
  onSubmit,
  isLoading = false,
}: DispatchFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      cargoWeight: undefined,
      pickupLocation: '',
      destination: '',
    },
  });

  const vehicleId = watch('vehicleId');
  const selectedVehicle = vehicleId
    ? mockVehicles.find((v) => v.id === vehicleId)
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="vehicleId">Vehicle</Label>
        <Controller
          name="vehicleId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {mockVehicles
                  .filter((v) => v.status !== 'in_shop' && v.status !== 'maintenance')
                  .map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.vehicleId && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.vehicleId.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="driverId">Driver</Label>
        <Controller
          name="driverId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {mockDrivers
                  .filter((d) => d.status !== 'suspended')
                  .map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.licenseType})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.driverId && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.driverId.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="cargoWeight">Cargo Weight (kg)</Label>
        <Input
          id="cargoWeight"
          type="number"
          {...register('cargoWeight')}
          placeholder="5000"
          className="mt-1"
        />
        {selectedVehicle && (
          <p className="text-xs text-muted-foreground mt-1">
            Vehicle capacity: {selectedVehicle.capacity.toLocaleString()} kg
          </p>
        )}
        {errors.cargoWeight && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.cargoWeight.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <Input
          id="pickupLocation"
          {...register('pickupLocation')}
          placeholder="San Francisco, CA"
          className="mt-1"
        />
        {errors.pickupLocation && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.pickupLocation.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          {...register('destination')}
          placeholder="Los Angeles, CA"
          className="mt-1"
        />
        {errors.destination && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.destination.message}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating...' : 'Create Trip'}
      </Button>
    </form>
  );
}
