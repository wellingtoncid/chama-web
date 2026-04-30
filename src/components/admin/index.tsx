import type { ReactNode } from 'react';
import AdminHeader from './AdminHeader';
import StatsGrid, { StatCard } from './StatsGrid';
import FilterBar from './FilterBar';
import TimeFilter from './TimeFilter';
import DataTable, { type TableColumn, type TableAction } from './DataTable';
import StatusBadge from './StatusBadge';
import AdminCard from './AdminCard';

interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <>
      <AdminHeader 
        title={title} 
        description={description} 
        actions={actions} 
      />
      <div className="space-y-5 lg:space-y-6">
        {children}
      </div>
    </>
  );
}

export { AdminHeader, StatsGrid, StatCard, FilterBar, TimeFilter, DataTable, StatusBadge, AdminCard };
export type { TableColumn, TableAction };
export default PageShell;