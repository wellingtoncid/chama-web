import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  linkClassName?: string;
}

export function Breadcrumb({ items, className = '', linkClassName = 'hover:text-emerald-600' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 min-w-0">
          {i > 0 && <ChevronRight size={10} className="shrink-0" />}
          {item.href ? (
            <Link to={item.href} className={`${linkClassName} transition-colors shrink-0`}>
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 truncate min-w-0">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
