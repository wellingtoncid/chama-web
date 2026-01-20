import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminPortal from '../components/admin/AdminView';
import UserDashboard from '../components/UserDashboard';
import WelcomeOnboarding from '../components/company/WelcomeOnboarding';

// Renomeado para MainRouter para refletir sua função de roteamento central
export default function MainRouter() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <p className="font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Sincronizando Acessos...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // --- TRAVA DE ONBOARDING ---
  const needsOnboarding = user.role === 'company' && (!user.company_name || !user.cnpj);
  if (needsOnboarding) {
    return <WelcomeOnboarding user={user} onComplete={refreshUser} />;
  }

  // --- ROTEAMENTO LÓGICO ---
  const role = user.role?.toLowerCase();

  switch (role) {
    case 'admin':
      return <AdminPortal user={user} role="admin" activeTab="dashboard" />;
    
    case 'advertiser':
      // Se o usuário for EXCLUSIVAMENTE anunciante, redirecionamos para a rota do portal
      return <Navigate to="/anunciante" replace />;

    case 'company':
    case 'driver':
    case 'partner':
      // Motoristas e Empresas usam o UserDashboard (o botão de Ads aparecerá lá se forem assinantes)
      return <UserDashboard user={user} />;
      
    default:
      // Fallback para segurança
      return <UserDashboard user={user} />;
  }
}