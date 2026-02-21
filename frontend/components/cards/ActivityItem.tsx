import { formatDistanceToNow } from 'date-fns';
import {
  Navigation,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';
import type { Activity } from '@/lib/types';

const iconMap: Record<Activity['type'], LucideIcon> = {
  trip_started: Navigation,
  trip_completed: CheckCircle2,
  vehicle_maintenance: Wrench,
  driver_warning: AlertTriangle,
};

const colorMap: Record<Activity['type'], string> = {
  trip_started: 'text-blue-500',
  trip_completed: 'text-green-500',
  vehicle_maintenance: 'text-orange-500',
  driver_warning: 'text-yellow-500',
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = iconMap[activity.type];

  return (
    <div className="flex gap-4 py-4">
      <div className={`flex-shrink-0 ${colorMap[activity.type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
