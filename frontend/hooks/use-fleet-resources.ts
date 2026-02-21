"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Driver,
  MaintenanceLog,
  Trip,
  Vehicle,
  driversApi,
  maintenanceApi,
  readError,
  tripsApi,
  vehiclesApi,
} from "@/lib/api-client";

function useAsyncList<T>(loader: () => Promise<T[]>, fallbackError: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await loader();
      setData(rows);
      return rows;
    } catch (error) {
      toast.error(readError(error, fallbackError));
      return [] as T[];
    } finally {
      setIsLoading(false);
    }
  }, [loader, fallbackError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, isLoading, refresh };
}

export function useVehicles() {
  return useAsyncList<Vehicle>(vehiclesApi.list, "Failed to load vehicles");
}

export function useAvailableVehicles() {
  return useAsyncList<Vehicle>(vehiclesApi.listAvailable, "Failed to load available vehicles");
}

export function useDrivers() {
  return useAsyncList<Driver>(driversApi.list, "Failed to load drivers");
}

export function useEligibleDrivers() {
  return useAsyncList<Driver>(driversApi.listEligible, "Failed to load eligible drivers");
}

export function useTrips() {
  return useAsyncList<Trip>(tripsApi.list, "Failed to load trips");
}

export function useMaintenanceLogs() {
  return useAsyncList<MaintenanceLog>(maintenanceApi.list, "Failed to load maintenance logs");
}
