import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
};

export function StatusBadge({
  status,
  variant = 'default',
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {status}
    </span>
  );
}
