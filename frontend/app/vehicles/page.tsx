"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { usePermissions } from "@/hooks/use-permissions";
import { useVehicles } from "@/hooks/use-fleet-resources";
import { Vehicle, vehiclesApi, readError } from "@/lib/api-client";

const STATUSES: Vehicle["status"][] = ["Available", "OnTrip", "InShop", "Retired"];
const PAGE_SIZE = 8;

const vehicleSchema = z.object({
  model: z.string().min(2, "Model is required"),
  license_plate: z.string().min(4, "License plate is required"),
  max_capacity: z.coerce.number().positive("Capacity must be positive"),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative"),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

export default function VehiclesPage() {
  const { data: vehicles, isLoading, refresh } = useVehicles();
  const { can } = usePermissions();
  const canWrite = can("vehicles.write");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Vehicle["status"]>("All");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { model: "", license_plate: "", max_capacity: 0, odometer: 0 },
  });

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch = !q || v.model.toLowerCase().includes(q) || v.license_plate.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onCreate = async (values: VehicleForm) => {
    if (!canWrite) return;

    try {
      await vehiclesApi.create({
        model: values.model,
        license_plate: values.license_plate,
        max_capacity: values.max_capacity,
        odometer: values.odometer,
      });
      reset();
      await refresh();
      toast.success("Vehicle created");
    } catch (err) {
      toast.error(readError(err, "Failed to create vehicle"));
    }
  };

  const onStatusChange = async (id: number, status: Vehicle["status"]) => {
    if (!canWrite) return;

    try {
      await vehiclesApi.updateStatus(id, status);
      await refresh();
      toast.success("Vehicle status updated");
    } catch (err) {
      toast.error(readError(err, "Failed to update status"));
    }
  };

  return (
    <AppLayout title="Vehicles">
      {canWrite ? (
        <form onSubmit={handleSubmit(onCreate)} className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2 bg-background" placeholder="Model" {...register("model")} />
          <input className="border rounded px-3 py-2 bg-background" placeholder="License Plate" {...register("license_plate")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Max Capacity" {...register("max_capacity")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Odometer" {...register("odometer")} />
          <button className="bg-primary text-primary-foreground rounded px-3 py-2" type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Vehicle"}</button>
        </form>
      ) : (
        <div className="mb-4 p-3 border rounded text-sm text-muted-foreground">Read-only: your role cannot create/update vehicles.</div>
      )}

      {(errors.model || errors.license_plate || errors.max_capacity || errors.odometer) && (
        <div className="mb-4 text-sm text-red-600">
          {errors.model?.message || errors.license_plate?.message || errors.max_capacity?.message || errors.odometer?.message}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2 bg-background"
          placeholder="Search model or plate"
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
            setStatusFilter(e.target.value as "All" | Vehicle["status"]);
            setPage(1);
          }}
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="text-sm text-muted-foreground flex items-center">Showing {paginatedVehicles.length} of {filteredVehicles.length}</div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading vehicles...</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-sm text-muted-foreground">No vehicles found.</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Model</th>
                  <th className="text-left p-3">Plate</th>
                  <th className="text-left p-3">Capacity</th>
                  <th className="text-left p-3">Odometer</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="p-3">{v.id}</td>
                    <td className="p-3">{v.model}</td>
                    <td className="p-3">{v.license_plate}</td>
                    <td className="p-3">{v.max_capacity}</td>
                    <td className="p-3">{v.odometer}</td>
                    <td className="p-3">
                      <select
                        className="border rounded px-2 py-1 bg-background"
                        value={v.status}
                        onChange={(e) => onStatusChange(v.id, e.target.value as Vehicle["status"])}
                        disabled={!canWrite}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
