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

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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

        localStorage.setItem('@ChamaFrete:user', JSON.stringify(userData));
        localStorage.setItem('@ChamaFrete:token', userToken);
        
        // Atualiza o header para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        const role = userData.role?.toLowerCase();
        const isStaff = ['admin', 'manager', 'analyst', 'assistant'].includes(role);

        if (isStaff) {
          navigate('/admin', { replace: true });
        } else if (role === 'advertiser') {
          navigate('/anunciante', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }

      } else {
        // O backend novo retorna "message" em vez de "error" no login
        setErrorMsg(res?.data?.message || "E-mail/WhatsApp ou senha incorretos.");
      }
    } catch (error: any) {
      // Se cair aqui com erro de CORS, verifique se a baseURL no api.ts não tem "/" no final
      setErrorMsg("Servidor offline ou erro de conexão.");
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
          <div className="mb-6 bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-bounce">
            <AlertCircle size={20} />
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
            {/* CAMPO ESQUECI A SENHA REINSERIDO */}
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
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Novo por aqui? <span onClick={() => navigate('/register')} className="text-orange-500 cursor-pointer ml-1">Criar conta</span>
          </p>
        </div>
      </div>
    </div>
  );
}