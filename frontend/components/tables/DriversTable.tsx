'use client';

import { Driver } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDistanceToNow, isBefore, addDays } from 'date-fns';

interface DriversTableProps {
  drivers: Driver[];
}

const statusVariantMap: Record<Driver['status'], 'success' | 'danger' | 'warning'> = {
  on_duty: 'success',
  off_duty: 'warning',
  suspended: 'danger',
};

export function DriversTable({ drivers }: DriversTableProps) {
  const isLicenseExpiringSoon = (expiryDate: Date) => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return isBefore(expiryDate, thirtyDaysFromNow);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Driver Name
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              License Type
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              License Expiry
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Status
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Trips
            </th>
            <th className="text-left px-4 py-3 font-semibold text-sm">
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => {
            const isExpiringSoon = isLicenseExpiringSoon(driver.licenseExpiry);

            return (
              <tr
                key={driver.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium">{driver.name}</span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {driver.licenseType}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatDistanceToNow(driver.licenseExpiry, {
                        addSuffix: true,
                      })}
                    </span>
                    {isExpiringSoon && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        ⚠️ Expiring
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={driver.status.replace('_', ' ')}
                    variant={statusVariantMap[driver.status]}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{driver.totalTrips}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">
                    ⭐ {driver.rating.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
