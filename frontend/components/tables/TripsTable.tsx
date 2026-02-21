'use client';

import { Trip } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockVehicles, mockDrivers } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

interface TripsTableProps {
  trips: Trip[];
  onMarkCompleted?: (tripId: string) => void;
}

const statusVariantMap: Record<Trip['status'], 'default' | 'info' | 'success' | 'danger'> = {
  draft: 'default',
  dispatched: 'info',
  completed: 'success',
  cancelled: 'danger',
};

export function TripsTable({ trips, onMarkCompleted }: TripsTableProps) {
  const getVehicleName = (vehicleId: string) => {
    return mockVehicles.find((v) => v.id === vehicleId)?.name || 'Unknown';
  };

  const getDriverName = (driverId: string) => {
    return mockDrivers.find((d) => d.id === driverId)?.name || 'Unknown';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Trip ID
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Vehicle
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Driver
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Cargo
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Route
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Status
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Created
            </th>
            {onMarkCompleted && (
              <th className="text-left px-4 py-3 font-semibold text-sm">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr
              key={trip.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {trip.id}
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium">
                  {getVehicleName(trip.vehicleId)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm">{getDriverName(trip.driverId)}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm">{trip.cargoWeight.toLocaleString()} kg</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-muted-foreground truncate max-w-xs">
                  {trip.pickupLocation} → {trip.destination}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={trip.status}
                  variant={statusVariantMap[trip.status]}
                />
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(trip.createdAt, { addSuffix: true })}
                </span>
              </td>
              {onMarkCompleted && (
                <td className="px-4 py-3">
                  {trip.status === 'dispatched' && (
                    <button
                      onClick={() => onMarkCompleted(trip.id)}
                      className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
