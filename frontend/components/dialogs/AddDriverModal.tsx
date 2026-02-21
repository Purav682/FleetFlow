'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddDriverForm } from '@/components/forms/AddDriverForm';
import { Driver } from '@/lib/types';

interface AddDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverAdded: (driver: Driver) => void;
}

export function AddDriverModal({
  open,
  onOpenChange,
  onDriverAdded,
}: AddDriverModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newDriver: Driver = {
        id: `d${Date.now()}`,
        name: data.name,
        licenseType: data.licenseType,
        phone: data.phone,
        licenseExpiry: new Date(data.licenseExpiry),
        status: 'on_duty',
        totalTrips: 0,
        rating: 5.0,
      };

      onDriverAdded(newDriver);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Add a new driver to your fleet. Enter the driver details below.
          </DialogDescription>
        </DialogHeader>
        <AddDriverForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
