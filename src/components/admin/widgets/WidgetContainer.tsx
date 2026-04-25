import { type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { GripVertical, X, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  colSpan?: number;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: () => void;
  onSettings?: () => void;
  isEditing?: boolean;
}

export function WidgetContainer({
  children,
  title,
  icon,
  colSpan = 1,
  className,
  dragHandleProps,
  onRemove,
  onSettings,
  isEditing = false
}: WidgetContainerProps) {
  const { isDark } = useTheme();
  
  const colSpanClass = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
    4: 'col-span-1 sm:col-span-2 lg:col-span-4'
  }[colSpan] || 'col-span-1';

  return (
    <div
      className={cn(
        `rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 relative group`,
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100',
        'border',
        colSpanClass,
        className
      )}
    >
      <div className={cn(isEditing && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}