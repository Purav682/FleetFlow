"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useDrivers, useEligibleDrivers } from "@/hooks/use-fleet-resources";
import { usePermissions } from "@/hooks/use-permissions";
import { Driver, driversApi, readError } from "@/lib/api-client";

const DRIVER_STATUSES: Driver["status"][] = ["OnDuty", "OffDuty", "Suspended"];
const PAGE_SIZE = 8;

const driverSchema = z.object({
  name: z.string().min(2, "Name is required"),
  license_type: z.string().min(2, "License type is required"),
  license_expiry_date: z.string().min(1, "License expiry date is required"),
  safety_score: z.coerce.number().min(0, "Minimum 0").max(100, "Maximum 100"),
  status: z.enum(["OnDuty", "OffDuty", "Suspended"]),
});

type DriverForm = z.infer<typeof driverSchema>;

export default function DriversPage() {
  const { data: drivers, isLoading, refresh } = useDrivers();
  const { data: eligibleDrivers } = useEligibleDrivers();
  const { can } = usePermissions();
  const canWrite = can("drivers.write");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Driver["status"]>("All");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      license_type: "Heavy",
      license_expiry_date: "",
      safety_score: 100,
      status: "OnDuty",
    },
  });

  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesSearch =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.license_type.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onCreate = async (values: DriverForm) => {
    if (!canWrite) return;

    try {
      await driversApi.create({
        name: values.name,
        license_type: values.license_type,
        license_expiry_date: values.license_expiry_date,
        safety_score: values.safety_score,
        status: values.status,
      });
      reset({ name: "", license_type: "Heavy", license_expiry_date: "", safety_score: 100, status: "OnDuty" });
      await Promise.all([refresh()]);
      toast.success("Driver created");
    } catch (err) {
      toast.error(readError(err, "Failed to create driver"));
    }
  };

  const onStatusChange = async (id: number, status: Driver["status"]) => {
    if (!canWrite) return;

    try {
      await driversApi.updateStatus(id, status);
      await refresh();
      toast.success("Driver status updated");
    } catch (err) {
      toast.error(readError(err, "Failed to update driver status"));
    }
  };

  return (
    <AppLayout title="Drivers">
      <div className="mb-3 text-sm text-muted-foreground">Eligible drivers for dispatch: {eligibleDrivers.length}</div>

      {canWrite ? (
        <form onSubmit={handleSubmit(onCreate)} className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="border rounded px-3 py-2 bg-background" placeholder="Name" {...register("name")} />
          <input className="border rounded px-3 py-2 bg-background" placeholder="License Type" {...register("license_type")} />
          <input className="border rounded px-3 py-2 bg-background" type="date" {...register("license_expiry_date")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Safety Score" {...register("safety_score")} />
          <select className="border rounded px-3 py-2 bg-background" {...register("status")}>
            {DRIVER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="bg-primary text-primary-foreground rounded px-3 py-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Driver"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-3 border rounded text-sm text-muted-foreground">
          Read-only: your role cannot create/update drivers.
        </div>
      )}

      {(errors.name || errors.license_type || errors.license_expiry_date || errors.safety_score || errors.status) && (
        <div className="mb-4 text-sm text-red-600">
          {errors.name?.message ||
            errors.license_type?.message ||
            errors.license_expiry_date?.message ||
            errors.safety_score?.message ||
            errors.status?.message}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2 bg-background"
          placeholder="Search by name or license"
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
            setStatusFilter(e.target.value as "All" | Driver["status"]);
            setPage(1);
          }}
        >
          <option value="All">All statuses</option>
          {DRIVER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="text-sm text-muted-foreground flex items-center">
          Showing {paginatedDrivers.length} of {filteredDrivers.length}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading drivers...</div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-sm text-muted-foreground">No drivers found.</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">License</th>
                  <th className="text-left p-3">Expiry</th>
                  <th className="text-left p-3">Safety</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrivers.map((driver) => (
                  <tr key={driver.id} className="border-t">
                    <td className="p-3">{driver.id}</td>
                    <td className="p-3">{driver.name}</td>
                    <td className="p-3">{driver.license_type}</td>
                    <td className="p-3">{driver.license_expiry_date}</td>
                    <td className="p-3">{driver.safety_score}</td>
                    <td className="p-3">
                      <select
                        className="border rounded px-2 py-1 bg-background"
                        value={driver.status}
                        onChange={(e) => onStatusChange(driver.id, e.target.value as Driver["status"])}
                        disabled={!canWrite}
                      >
                        {DRIVER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
