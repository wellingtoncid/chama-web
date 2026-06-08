import { cn } from '@/lib/utils';

interface UserHeadlineProps {
  headline?: string | null;
  className?: string;
}

export function UserHeadline({ headline, className }: UserHeadlineProps) {
  if (!headline) return null;
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400 mt-0.5", className)}>
      {headline}
    </p>
  );
}
