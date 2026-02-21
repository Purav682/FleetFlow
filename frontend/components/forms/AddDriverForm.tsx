'use client';

import { useForm } from 'react-hook-form';
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

const driverSchema = z.object({
  name: z.string().min(2, 'Driver name must be at least 2 characters'),
  licenseType: z.enum(['Class A', 'Class B', 'Class C']),
  phone: z.string().min(10, 'Valid phone number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface AddDriverFormProps {
  onSubmit: (data: DriverFormData) => void;
  isLoading?: boolean;
}

export function AddDriverForm({
  onSubmit,
  isLoading = false,
}: AddDriverFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Driver Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Martinez"
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
        <Label htmlFor="licenseType">License Type</Label>
        <Select onValueChange={(value) => setValue('licenseType', value as any)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select license type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Class A">Class A</SelectItem>
            <SelectItem value="Class B">Class B</SelectItem>
            <SelectItem value="Class C">Class C</SelectItem>
          </SelectContent>
        </Select>
        {errors.licenseType && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.licenseType.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+1 (555) 123-4567"
          className="mt-1"
        />
        {errors.phone && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.phone.message}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="licenseExpiry">License Expiry Date</Label>
        <Input
          id="licenseExpiry"
          type="date"
          {...register('licenseExpiry')}
          className="mt-1"
        />
        {errors.licenseExpiry && (
          <div className="flex items-center gap-2 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {errors.licenseExpiry.message}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Adding...' : 'Add Driver'}
      </Button>
    </form>
  );
}
