"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { usePermissions } from "@/hooks/use-permissions";
import { FuelLog, fuelApi, readError } from "@/lib/api-client";

const PAGE_SIZE = 10;

const fuelCreateSchema = z.object({
  trip_id: z.coerce.number().int().positive("Trip ID is required"),
  liters: z.coerce.number().positive("Liters must be greater than 0"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  date: z.string().optional(),
});

const fuelLookupSchema = z.object({
  lookupType: z.enum(["vehicle", "trip"]),
  lookupId: z.coerce.number().int().positive("ID must be greater than 0"),
});

type FuelCreateForm = z.infer<typeof fuelCreateSchema>;
type FuelLookupForm = z.infer<typeof fuelLookupSchema>;

export default function FuelPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { can } = usePermissions();
  const canWrite = can("fuel.write");

  const createForm = useForm<FuelCreateForm>({
    resolver: zodResolver(fuelCreateSchema),
    defaultValues: { trip_id: 1, liters: 0, cost: 0, date: "" },
  });

  const lookupForm = useForm<FuelLookupForm>({
    resolver: zodResolver(fuelLookupSchema),
    defaultValues: { lookupType: "vehicle", lookupId: 1 },
  });

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (!q) return true;
      return (
        String(log.id).includes(q) ||
        String(log.trip_id).includes(q) ||
        String(log.liters).includes(q) ||
        String(log.cost).includes(q) ||
        log.date.toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const createFuelLog = async (values: FuelCreateForm) => {
    if (!canWrite) return;

    try {
      await fuelApi.create({
        trip_id: values.trip_id,
        liters: values.liters,
        cost: values.cost,
        date: values.date || undefined,
      });
      createForm.reset({ trip_id: values.trip_id, liters: 0, cost: 0, date: "" });
      toast.success("Fuel log created");
    } catch (err) {
      toast.error(readError(err, "Failed to create fuel log"));
    }
  };

  const lookup = async (values: FuelLookupForm) => {
    try {
      const rows =
        values.lookupType === "vehicle"
          ? await fuelApi.listByVehicle(values.lookupId)
          : await fuelApi.listByTrip(values.lookupId);
      setLogs(rows);
      setSearch("");
      setPage(1);
      if (rows.length === 0) {
        toast.info("No fuel logs found for this filter");
      } else {
        toast.success(`Loaded ${rows.length} fuel logs`);
      }
    } catch (err) {
      toast.error(readError(err, "Failed to fetch fuel logs"));
    }
  };

  return (
    <AppLayout title="Fuel">
      {canWrite ? (
        <form onSubmit={createForm.handleSubmit(createFuelLog)} className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Trip ID" {...createForm.register("trip_id")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Liters" {...createForm.register("liters")} />
          <input className="border rounded px-3 py-2 bg-background" type="number" placeholder="Cost" {...createForm.register("cost")} />
          <input className="border rounded px-3 py-2 bg-background" type="date" {...createForm.register("date")} />
          <button className="bg-primary text-primary-foreground rounded px-3 py-2" type="submit" disabled={createForm.formState.isSubmitting}>
            {createForm.formState.isSubmitting ? "Saving..." : "Log Fuel"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-3 border rounded text-sm text-muted-foreground">Read-only: your role cannot create fuel logs.</div>
      )}

      {(createForm.formState.errors.trip_id ||
        createForm.formState.errors.liters ||
        createForm.formState.errors.cost) && (
        <div className="mb-4 text-sm text-red-600">
          {createForm.formState.errors.trip_id?.message ||
            createForm.formState.errors.liters?.message ||
            createForm.formState.errors.cost?.message}
        </div>
      )}

      <form onSubmit={lookupForm.handleSubmit(lookup)} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select className="border rounded px-3 py-2 bg-background" {...lookupForm.register("lookupType")}>
          <option value="vehicle">By Vehicle</option>
          <option value="trip">By Trip</option>
        </select>
        <input className="border rounded px-3 py-2 bg-background" type="number" {...lookupForm.register("lookupId")} />
        <input
          className="border rounded px-3 py-2 bg-background"
          placeholder="Search loaded logs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button className="border rounded px-3 py-2" type="submit" disabled={lookupForm.formState.isSubmitting}>
          {lookupForm.formState.isSubmitting ? "Loading..." : "Load Logs"}
        </button>
      </form>

      {lookupForm.formState.errors.lookupId?.message && (
        <div className="mb-4 text-sm text-red-600">{lookupForm.formState.errors.lookupId.message}</div>
      )}

      <div className="mb-3 text-sm text-muted-foreground">
        Showing {paginatedLogs.length} of {filteredLogs.length}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-sm text-muted-foreground border rounded p-4">No fuel logs to display.</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Trip</th>
                  <th className="text-left p-3">Liters</th>
                  <th className="text-left p-3">Cost</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3">{log.id}</td>
                    <td className="p-3">{log.trip_id}</td>
                    <td className="p-3">{log.liters}</td>
                    <td className="p-3">{log.cost}</td>
                    <td className="p-3">{log.date}</td>
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
