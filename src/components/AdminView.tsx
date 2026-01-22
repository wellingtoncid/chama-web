import { 
  Truck, Users, UserCog, Settings as SettingsIcon, 
  Megaphone, MessageCircle, Mail, BarChart3,
  Wallet, BadgeDollarSign
} from 'lucide-react';

// 1. IMPORTAÇÃO DOS COMPONENTES
import DashboardAdmin from './admin/DashboardAdmin'; 
import FreightsManagerView from './admin/FreightManagerView';
import UsersManager from './admin/UsersManagerView';
import GroupsManager from './admin/GroupsManagerView'; 
import AdsManager from './admin/AdsManager'; 
import SettingsView from './admin/SettingsView'; 
import AdminPortalRequests from './admin/AdminPortalRequests';
import { AdsReports } from './admin/AdsReports';
import AdminFinancial from './admin/AdminFinancial'; 
import PlansManager from './admin/PlansManager';

interface AdminViewProps {
  role: string;
  activeTab: string;
  user: any;
}

export default function AdminView({ user, role, activeTab }: AdminViewProps) {

  /**
   * RENDERIZAÇÃO POR ABA
   * Cada bloco retorna o HeaderTab estilizado + o Componente funcional
   */

  // --- OPERAÇÃO ---
  if (activeTab === 'manage_freights') {
    return <div className="p-4"><HeaderTab title="Controle de Cargas" icon={Truck} /><FreightsManagerView /></div>;
  }

  if (activeTab === 'users') {
    return <div className="p-4"><HeaderTab title="Controle de Acessos" icon={UserCog} /><UsersManager /></div>;
  }

  if (activeTab === 'groups') {
    return <div className="p-4"><HeaderTab title="Comunidades WhatsApp" icon={MessageCircle} /><GroupsManager /></div>;
  }

  // --- COMERCIAL & ADS ---
  if (activeTab === 'portal_requests') {
    return (
      <div className="p-4">
        <HeaderTab title="Leads e Solicitações" icon={Mail} />
        <AdminPortalRequests />
      </div>
    );
  }

  if (activeTab === 'ads') {
    return <div className="p-4"><HeaderTab title="Publicidade Comercial" icon={Megaphone} /><AdsManager /></div>;
  }

  if (activeTab === 'ads_reports') {
    return (
      <div className="p-4">
        <HeaderTab title="Relatórios de Performance" icon={BarChart3} />
        <AdsReports />
      </div>
    );
  }
  
  // --- ESTRATÉGICO (SÓ ADMIN) ---
  if (activeTab === 'financial') {
    return (
      <div className="p-4">
        <HeaderTab title="Gestão Financeira e BI" icon={Wallet} />
        <AdminFinancial />
      </div>
    );
  }

  if (activeTab === 'manage_plans') {
    return (
      <div className="p-4">
        <HeaderTab title="Tabela de Preços e Planos" icon={BadgeDollarSign} />
        <PlansManager />
      </div>
    );
  }
  
  if (activeTab === 'settings') {
    return <div className="p-4"><HeaderTab title="Configurações do Sistema" icon={SettingsIcon} /><SettingsView /></div>;
  }

  // --- ABA PADRÃO (HOME / DASHBOARD) ---
  return (
    <div className="p-4 animate-in fade-in duration-500">
      <HeaderTab title="Painel de Controle" icon={BarChart3} />
      <DashboardAdmin />
    </div>
  );
}

/**
 * Sub-componente de Header estilizado para o topo das Views
 */
function HeaderTab({ title, icon: Icon }: any) {
    return (
        <div className="flex justify-between items-center mb-8 px-4 bg-white/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black italic uppercase text-slate-800 tracking-tighter leading-none">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-1 tracking-widest">Gerenciamento em tempo real</p>
          </div>
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl rotate-3">
            <Icon size={22} />
          </div>
        </div>
    );
}