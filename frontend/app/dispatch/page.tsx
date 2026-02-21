"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAvailableVehicles, useEligibleDrivers, useTrips } from "@/hooks/use-fleet-resources";
import { usePermissions } from "@/hooks/use-permissions";
import { Trip, Vehicle, readError, tripsApi } from "@/lib/api-client";

const PAGE_SIZE = 8;

const tripSchema = z.object({
  vehicle_id: z.coerce.number().int().positive("Select a vehicle"),
  driver_id: z.coerce.number().int().positive("Select a driver"),
  cargo_weight: z.coerce.number().positive("Cargo must be greater than 0"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  odometer_start: z.coerce.number().min(0, "Odometer cannot be negative"),
});

type TripForm = z.infer<typeof tripSchema>;

const tripStatuses: Array<"All" | Trip["status"]> = ["All", "Draft", "Dispatched", "Completed", "Cancelled"];

export default function DispatchPage() {
  const { data: trips, isLoading, refresh } = useTrips();
  const { data: vehicles, refresh: refreshVehicles } = useAvailableVehicles();
  const { data: drivers, refresh: refreshDrivers } = useEligibleDrivers();
  const { can } = usePermissions();
  const canWrite = can("trips.write");

    

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Trip["status"]>("All");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      vehicle_id: 0,
      driver_id: 0,
      cargo_weight: 0,
      origin: "",
      destination: "",
      odometer_start: 0,
    },
  });

  useEffect(() => {
    console.log("Vehicles:", vehicles);
    console.log("Drivers:", drivers);
  },[]);
  useEffect(() => {
    if (vehicles.length) {
      setValue("vehicle_id", vehicles[0].id, { shouldValidate: true });
    }
    if (drivers.length) {
      setValue("driver_id", drivers[0].id, { shouldValidate: true });
      console.log("Drivers:", drivers);
    }
  }, [vehicles, drivers, setValue]);

  const vehicleById = useMemo(() => {
    const map = new Map<number, Vehicle>();
    vehicles.forEach((vehicle) => map.set(vehicle.id, vehicle));
    return map;
  }, [vehicles]);

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trips.filter((trip) => {
      const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
      const matchesSearch =
        !q ||
        String(trip.id).includes(q) ||
        String(trip.vehicle_id).includes(q) ||
        String(trip.driver_id).includes(q) ||
        trip.origin.toLowerCase().includes(q) ||
        trip.destination.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [trips, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onDispatch = async (values: TripForm) => {
    if (!canWrite) return;

    try {
      await tripsApi.dispatch({
        vehicle_id: values.vehicle_id,
        driver_id: values.driver_id,
        cargo_weight: values.cargo_weight,
        origin: values.origin,
        destination: values.destination,
        odometer_start: values.odometer_start,
      });
      reset({
        vehicle_id: vehicles[0]?.id ?? 0,
        driver_id: drivers[0]?.id ?? 0,
        cargo_weight: 0,
        origin: "",
        destination: "",
        odometer_start: 0,
      });
      await Promise.all([refresh(), refreshVehicles(), refreshDrivers()]);
      toast.success("Trip dispatched");
    } catch (err) {
      toast.error(readError(err, "Dispatch failed"));
    }
  };

  const completeTrip = async (id: number) => {
    if (!canWrite) return;

    try {
      await tripsApi.complete(id);
      await Promise.all([refresh(), refreshVehicles()]);
      toast.success("Trip completed");
    } catch (err) {
      toast.error(readError(err, "Complete failed"));
    }
  };

  const cancelTrip = async (id: number) => {
    if (!canWrite) return;

    try {
      await tripsApi.cancel(id);
      await Promise.all([refresh(), refreshVehicles()]);
      toast.success("Trip cancelled");
    } catch (err) {
      toast.error(readError(err, "Cancel failed"));
    }
  };

  return (
    <AppLayout title="Trips / Dispatch">
      {canWrite ? (
        <form onSubmit={handleSubmit(onDispatch)} className="mb-4 grid grid-cols-1 md:grid-cols-7 gap-3">
          <select className="border rounded px-3 py-2 bg-background" {...register("vehicle_id")}>
            <option value={0}>Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.license_plate} ({vehicle.model})
              </option>
            ))}
          </select>
          <select className="border rounded px-3 py-2 bg-background" {...register("driver_id")}>
            <option value={0}>Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Cargo" {...register("cargo_weight")} />
          <input className="border rounded px-3 py-2 bg-background" placeholder="Origin" {...register("origin")} />
          <input className="border rounded px-3 py-2 bg-background" placeholder="Destination" {...register("destination")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Odo Start" {...register("odometer_start")} />
          <button className="bg-primary text-primary-foreground rounded px-3 py-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Dispatching..." : "Dispatch"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-3 border rounded text-sm text-muted-foreground">
          Read-only: your role cannot dispatch/update trips.
        </div>
      )}

      {(errors.vehicle_id ||
        errors.driver_id ||
        errors.cargo_weight ||
        errors.origin ||
        errors.destination ||
        errors.odometer_start) && (
        <div className="mb-4 text-sm text-red-600">
          {errors.vehicle_id?.message ||
            errors.driver_id?.message ||
            errors.cargo_weight?.message ||
            errors.origin?.message ||
            errors.destination?.message ||
            errors.odometer_start?.message}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2 bg-background"
          placeholder="Search by ID, route, vehicle, or driver"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="border rounded px-3 py-2 bg-background"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "All" | Trip["status"]);
            setPage(1);
          }}
        >
          {tripStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "All statuses" : status}
            </option>
          ))}
        </select>
        <div className="text-sm text-muted-foreground flex items-center">
          Showing {paginatedTrips.length} of {filteredTrips.length}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading trips...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-sm text-muted-foreground">No trips found.</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Vehicle</th>
                  <th className="text-left p-3">Driver</th>
                  <th className="text-left p-3">Origin</th>
                  <th className="text-left p-3">Destination</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrips.map((trip) => (
                  <tr key={trip.id} className="border-t">
                    <td className="p-3">{trip.id}</td>
                    <td className="p-3">
                      {trip.vehicle_id}
                      {vehicleById.get(trip.vehicle_id)?.license_plate
                        ? ` (${vehicleById.get(trip.vehicle_id)?.license_plate})`
                        : ""}
                    </td>
                    <td className="p-3">{trip.driver_id}</td>
                    <td className="p-3">{trip.origin}</td>
                    <td className="p-3">{trip.destination}</td>
                    <td className="p-3">{trip.status}</td>
                    <td className="p-3 space-x-2">
                      <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        disabled={!canWrite || trip.status !== "Dispatched"}
                        onClick={() => completeTrip(trip.id)}
                      >
                        Complete
                      </button>
                      <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        disabled={!canWrite || trip.status === "Completed" || trip.status === "Cancelled"}
                        onClick={() => cancelTrip(trip.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
