"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useMaintenanceLogs, useVehicles } from "@/hooks/use-fleet-resources";
import { usePermissions } from "@/hooks/use-permissions";
import { maintenanceApi, readError } from "@/lib/api-client";

const PAGE_SIZE = 8;

const maintenanceSchema = z.object({
  vehicle_id: z.coerce.number().int().positive("Vehicle is required"),
  service_type: z.string().min(2, "Service type is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  service_date: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceForm = z.infer<typeof maintenanceSchema>;

export default function MaintenancePage() {
  const { data: logs, isLoading, refresh } = useMaintenanceLogs();
  const { data: vehicles, refresh: refreshVehicles } = useVehicles();
  const { can } = usePermissions();
  const canWrite = can("maintenance.write");

  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<"All" | number>("All");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle_id: 0,
      service_type: "",
      cost: 0,
      service_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (vehicles.length) {
      setValue("vehicle_id", vehicles[0].id, { shouldValidate: true });
    }
  }, [vehicles, setValue]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesVehicle = vehicleFilter === "All" || log.vehicle_id === vehicleFilter;
      const matchesSearch =
        !q ||
        String(log.id).includes(q) ||
        String(log.vehicle_id).includes(q) ||
        log.service_type.toLowerCase().includes(q) ||
        (log.notes || "").toLowerCase().includes(q);
      return matchesVehicle && matchesSearch;
    });
  }, [logs, search, vehicleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onSubmit = async (values: MaintenanceForm) => {
    if (!canWrite) return;

    try {
      await maintenanceApi.create({
        vehicle_id: values.vehicle_id,
        service_type: values.service_type,
        cost: values.cost,
        service_date: values.service_date || undefined,
        notes: values.notes || undefined,
      });
      reset({
        vehicle_id: vehicles[0]?.id ?? 0,
        service_type: "",
        cost: 0,
        service_date: "",
        notes: "",
      });
      await Promise.all([refresh(), refreshVehicles()]);
      toast.success("Maintenance log added");
    } catch (err) {
      toast.error(readError(err, "Failed to create maintenance log"));
    }
  };

  return (
    <AppLayout title="Maintenance">
      {canWrite ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <select className="border rounded px-3 py-2 bg-background" {...register("vehicle_id")}>
            <option value={0}>Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.license_plate}
              </option>
            ))}
          </select>
          <input className="border rounded px-3 py-2 bg-background" placeholder="Service Type" {...register("service_type")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Cost" {...register("cost")} />
          <input className="border rounded px-3 py-2 bg-background" type="date" {...register("service_date")} />
          <input className="border rounded px-3 py-2 bg-background" placeholder="Notes" {...register("notes")} />
          <button className="bg-primary text-primary-foreground rounded px-3 py-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Log"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-3 border rounded text-sm text-muted-foreground">
          Read-only: your role cannot create maintenance logs.
        </div>
      )}

      {(errors.vehicle_id || errors.service_type || errors.cost) && (
        <div className="mb-4 text-sm text-red-600">
          {errors.vehicle_id?.message || errors.service_type?.message || errors.cost?.message}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2 bg-background"
          placeholder="Search service, notes, IDs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="border rounded px-3 py-2 bg-background"
          value={vehicleFilter}
          onChange={(e) => {
            const value = e.target.value;
            setVehicleFilter(value === "All" ? "All" : Number(value));
            setPage(1);
          }}
        >
          <option value="All">All vehicles</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.license_plate}
            </option>
          ))}
        </select>
        <div className="text-sm text-muted-foreground flex items-center">
          Showing {paginatedLogs.length} of {filteredLogs.length}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading maintenance logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-sm text-muted-foreground">No maintenance logs found.</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Vehicle</th>
                  <th className="text-left p-3">Service</th>
                  <th className="text-left p-3">Cost</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3">{log.id}</td>
                    <td className="p-3">{log.vehicle_id}</td>
                    <td className="p-3">{log.service_type}</td>
                    <td className="p-3">{log.cost}</td>
                    <td className="p-3">{log.service_date}</td>
                    <td className="p-3">{log.notes || "-"}</td>
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
