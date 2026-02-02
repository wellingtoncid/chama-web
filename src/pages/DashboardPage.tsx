import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../api/api';

// LAYOUT E COMPONENTES
import DashboardLayout from '../components/layout/DashboardLayout';
import CompanyCommandCenter from '../components/company/CompanyCommandCenter';
import MyProfile from '../pages/profile/MyProfile';
import FreightManager from '../components/company/FreightManager';
import ChatList from './chat/ChatList';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import DriverView from '../components/driver/DriverView'; 

export default function DashboardPage() {
  const navigate = useNavigate();

  // AJUSTE 1: Inicializa o estado IMEDIATAMENTE com o que está no cache
  // Isso evita que o componente comece com user=null e dispare o redirecionamento para /login
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('@ChamaFrete:user');
    return saved ? JSON.parse(saved) : null;
  });

  // Só mostra o loading global se realmente não houver nada no localStorage
  const [loading, setLoading] = useState(!user);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get('/get-my-profile'); 
      if (response.data.success) {
        const userData = response.data.user || response.data.data;
        setUser(userData);
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(userData));
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('@ChamaFrete:token');
        localStorage.removeItem('@ChamaFrete:user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { 
    fetchUserData(); 
  }, [fetchUserData]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
        Sincronizando Terminal...
      </span>
    </div>
  );

  // AJUSTE 2: Se não houver usuário nem no storage após o fetch, aí sim expulsa
  if (!user) return <Navigate to="/login" replace />;

  // AJUSTE 3: Roles padronizadas (Case Insensitive)
  const role = String(user.role || '').toUpperCase();
  const isCompany = ['COMPANY', 'TRANSPORTADORA', 'SHIPPER', 'ADMIN'].includes(role);
  const isDriver = ['DRIVER', 'MOTORISTA'].includes(role);

  return (
    <Routes>
      <Route element={<DashboardLayout user={user} />}>
        
        {/* ROTA RAIZ: /dashboard */}
        <Route index element={
          isCompany 
            ? <CompanyCommandCenter user={user} refreshUser={fetchUserData} /> 
            : isDriver 
              ? <DriverView user={user} /> // Renderiza a visão do motorista
              : <Navigate to="profile" replace />
        } />

        {/* AJUSTE 4: Suporte para sub-rotas explícitas disparadas pelo Login */}
        {/* Isso evita erro se o navigate('/dashboard/company') for chamado */}
        <Route path="company" element={<CompanyCommandCenter user={user} refreshUser={fetchUserData} />} />
        <Route path="driver" element={isDriver ? <DriverView user={user} /> : <Navigate to="/dashboard" />} />

        {/* LOGÍSTICA: Exclusivo Empresa/Admin */}
        {isCompany && (
          <Route path="logistica" element={<FreightManager user={user} />} />
        )}

        {/* ANÚNCIOS */}
        {isCompany && (
          <>
            <Route path="anunciante/*" element={<AdvertiserPortal user={user} />} />
            <Route path="ads" element={<Navigate to="anunciante" replace />} />
          </>
        )}

        {/* PERFIL E CHAT */}
        <Route path="profile" element={<MyProfile user={user} refreshUser={fetchUserData} />} />
        <Route path="chat" element={<ChatList user={user} />} />
        
        {/* MÓDULOS EM CONSTRUÇÃO */}
        <Route path="vendas" element={<ModulePlaceholder title="Módulo de Vendas" />} />
        <Route path="financeiro" element={<ModulePlaceholder title="Módulo Financeiro" />} />

        {/* FALLBACK INTERNO: Se digitar algo errado dentro do dash, volta pra raiz do dash */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-16 border-[6px] border-dashed border-slate-100 rounded-[4rem] text-center">
        <h2 className="text-4xl font-black uppercase italic text-slate-200 mb-2">{title}</h2>
        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">Desenvolvimento Ativo 2026</p>
      </div>
    </div>
  );
}