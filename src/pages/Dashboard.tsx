import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminPortal from '../components/admin/AdminView';
import UserDashboard from '../components/UserDashboard';
import WelcomeOnboarding from '../components/company/WelcomeOnboarding';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Padronização da chave do LocalStorage para evitar conflitos
  const STORAGE_KEY = '@ChamaFrete:user';

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('user_data');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const refreshUser = (updatedData: any) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Iniciando Painel...</p>
      </div>
    );
  }

  // Se não houver usuário, as rotas (PrivateRoute) devem redirecionar, 
  // mas por segurança retornamos nulo aqui.
  if (!user) return null;

  // --- TRAVA DE ONBOARDING (DADOS REAIS) ---
  // Se for empresa e não tiver o nome da empresa ou CNPJ preenchido
  const needsOnboarding = user.role === 'company' && (!user.company_name || !user.cnpj);
  
  if (needsOnboarding) {
    return <WelcomeOnboarding user={user} onComplete={refreshUser} />;
  }

  // --- ROTEAMENTO POR CARGO (DIRECIONAMENTO POR COMPONENTE) ---
  switch (user.role?.toLowerCase()) {
    case 'admin':
      return <AdminPortal user={user} role="admin" activeTab="dashboard" />;
    
    case 'company':
      // Agora apontamos para o UserDashboard que contém o Layout com Sidebar
      // O UserDashboard, por sua vez, chamará o CompanyView internamente
      return <UserDashboard user={user} />;
      
    case 'driver':
    case 'partner':
      return <UserDashboard user={user} />;
      
    default:
      return <UserDashboard user={user} />;
  }
}