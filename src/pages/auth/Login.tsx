import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Limpa resíduos de sessões anteriores ao abrir a tela
  useEffect(() => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Formata o login: se tiver @ trata como email, senão remove tudo que não for número (WhatsApp)
    const loginValue = identifier.includes('@') 
      ? identifier.trim().toLowerCase() 
      : identifier.replace(/\D/g, '');

    try {
      const res = await api.post('/login', { 
          login: loginValue, 
          password: password 
      });

      if (res?.data?.success && res?.data?.user) {
        const userData = res.data.user;
        const userToken = res.data.token;

        // 1. Salva os dados no Storage
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(userData));
        localStorage.setItem('@ChamaFrete:token', userToken);
        
        // 2. Configura o Token no Axios imediatamente para as próximas chamadas
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        // 3. Normaliza a Role para decidir o redirecionamento
        const role = String(userData.role || '').toLowerCase();
        
        // Redirecionamento baseado na hierarquia do AppRoutes
        const isStaff = ['admin', 'manager', 'analyst', 'assistant'].includes(role);

        if (isStaff) {
          navigate('/admin', { replace: true });
        } else if (role === 'advertiser') {
          navigate('/anunciante', { replace: true });
        } else {
          // PARA MOTORISTAS E EMPRESAS:
          // Enviamos para a rota base. O DashboardPage que você atualizou 
          // cuidará de mostrar CompanyCommandCenter ou DriverView.
          navigate('/dashboard', { replace: true });
        }

      } else {
        setErrorMsg(res?.data?.message || "Acesso negado. Verifique suas credenciais.");
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      
      if (backendMessage) {
        setErrorMsg(backendMessage);
      } else if (error.request) {
        setErrorMsg("Servidor offline. Tente novamente em instantes.");
      } else {
        setErrorMsg("Erro ao processar login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-orange-500/30">
            <LogIn className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Acessar</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Plataforma Chama Frete</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-black uppercase italic">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block">E-mail ou WhatsApp</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                {identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
              </div>
              <input 
                type="text" 
                required
                autoComplete="username"
                placeholder="Seu acesso..."
                className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                value={identifier} onChange={e => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block">Sua Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-[10px] font-black text-orange-500 uppercase hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Novo por aqui? <span onClick={() => navigate('/register')} className="text-orange-500 cursor-pointer ml-1 hover:underline">Criar conta</span>
          </p>
        </div>
      </div>
    </div>
  );
}