import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card text-foreground border-border',
  success: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
  danger: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
};

const iconVariantStyles = {
  default: 'text-primary',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-all duration-200 hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && (
            <p className="text-xs mt-2 opacity-60">{subtext}</p>
          )}
        </div>
        <Icon className={cn('w-8 h-8 opacity-50', iconVariantStyles[variant])} />
      </div>
    </div>
  );
}
