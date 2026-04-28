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
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
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