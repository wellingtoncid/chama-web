import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminHeader from './AdminHeader';
import StatsGrid, { StatCard } from './StatsGrid';
import FilterBar from './FilterBar';
import DataTable, { type TableColumn, type TableAction } from './DataTable';
import StatusBadge from './StatusBadge';
import AdminCard from './AdminCard';

interface AdminLayoutProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ title, description, icon, actions, children }: AdminLayoutProps) {
  return (
    <div className="p-6">
      <AdminHeader 
        title={title} 
        description={description} 
        icon={icon} 
        actions={actions} 
      />
      {children}
    </div>
  );
}

export { AdminHeader, StatsGrid, StatCard, FilterBar, DataTable, StatusBadge, AdminCard };
export type { TableColumn, TableAction };
export default AdminLayout;