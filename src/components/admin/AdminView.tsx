import { 
  Truck, Users, UserCog, Settings as SettingsIcon, 
  Megaphone, MessageCircle, Loader2, Mail, BarChart3 // Adicionado BarChart3 para o ícone de relatórios
} from 'lucide-react';

// 1. IMPORTAR OS COMPONENTES
import DashboardAdmin from '../admin/DashboardAdmin'; 
import FreightsManagerView from '../admin/FreightManagerView';
import UsersManager from '../admin/UsersManagerView';
import GroupsManager from '../admin/GroupsManagerView'; 
import AdsManager from '../admin/AdsManager'; 
import SettingsView from '../admin/SettingsView'; 
import AdminPortalRequests from '../admin/AdminPortalRequests';
import { AdsReports } from '../admin/AdsReports'; // Importado

interface AdminViewProps {
  role: string;
  activeTab: string;
  user: any;
}

export default function AdminView({ user, role, activeTab }: AdminViewProps) {

  // --- RENDERIZAÇÃO CONDICIONAL DE ABAS ---

  if (activeTab === 'users') {
    return <div className="p-4"><HeaderTab title="Controle de Acessos" icon={UserCog} /><UsersManager /></div>;
  }

  if (activeTab === 'groups') {
    return <div className="p-4"><HeaderTab title="Comunidades WhatsApp" icon={MessageCircle} /><GroupsManager /></div>;
  }

  // Aba Principal de Gestão de Anúncios (Tabela/Edição)
  if (activeTab === 'ads') {
    return <div className="p-4"><HeaderTab title="Publicidade Comercial" icon={Megaphone} /><AdsManager /></div>;
  }

  // NOVA ABA: Relatórios de Performance por Cliente
  if (activeTab === 'ads_reports') {
    return (
      <div className="p-4">
        <HeaderTab title="Relatórios de Performance" icon={BarChart3} />
        <AdsReports />
      </div>
    );
  }
  
  if (activeTab === 'portal_requests') {
    return (
      <div className="p-4">
        <HeaderTab title="Leads e Solicitações" icon={Mail} />
        <AdminPortalRequests />
      </div>
    );
  }
  
  if (activeTab === 'settings') {
    return <div className="p-4"><HeaderTab title="Configurações" icon={SettingsIcon} /><SettingsView /></div>;
  }

  if (activeTab === 'manage_freights') {
    return <div className="p-4"><HeaderTab title="Controle de Cargas" icon={Truck} /><FreightsManagerView /></div>;
  }

  // --- ABA PADRÃO (HOME / DASHBOARD) ---
  return (
    <div className="animate-in fade-in duration-500">
      <DashboardAdmin />
    </div>
  );
}

// Sub-componente de Header
function HeaderTab({ title, icon: Icon }: any) {
    return (
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-2xl font-black italic uppercase text-slate-800 tracking-tighter">{title}</h2>
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg">
            <Icon size={20} />
          </div>
        </div>
    );
}