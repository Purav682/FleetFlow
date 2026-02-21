'use client';

import { Vehicle } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

interface VehiclesTableProps {
  vehicles: Vehicle[];
}

const statusVariantMap: Record<Vehicle['status'], 'success' | 'info' | 'danger' | 'warning'> = {
  available: 'success',
  on_trip: 'info',
  in_shop: 'danger',
  maintenance: 'warning',
};

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Vehicle Name
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              License Plate
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Capacity
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Odometer
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Status
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Driver
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="font-medium">{vehicle.name}</span>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {vehicle.licensePlate}
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm">{vehicle.capacity.toLocaleString()} kg</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm">{vehicle.odometer.toLocaleString()} km</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={vehicle.status.replace('_', ' ')}
                  variant={statusVariantMap[vehicle.status]}
                />
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {vehicle.driver ? `Driver #${vehicle.driver}` : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
