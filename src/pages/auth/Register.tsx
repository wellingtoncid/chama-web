import React, { useState } from 'react';
import { Truck, Building2, User, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [role, setRole] = useState<'driver' | 'company'>('driver');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    // Sanitização rigorosa do WhatsApp (apenas números)
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: cleanWhatsapp,
      password,
      role
    };

    try {
      const response = await api.post('/register', payload);
      
      if (response.data.success) {
        alert("Cadastro realizado com sucesso! Agora faça seu login.");
        navigate('/login', { replace: true });
      } else {
        // Tenta pegar a mensagem específica do erro vindo do backend
        const errorMsg = response.data.message || response.data.error || "Tente novamente";
        alert("Erro no cadastro: " + errorMsg);
      }
    } catch (error: any) {
      console.error("Erro no registro:", error.response?.data);
      const backendMessage = error.response?.data?.message;
      alert(backendMessage || "Erro interno no servidor (500). Verifique se o e-mail ou WhatsApp já estão cadastrados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight italic uppercase">Criar Conta</h1>
          <p className="text-slate-500 mt-2 font-medium">Junte-se à maior rede de fretes</p>
        </div>

        {/* Seletor de Tipo de Usuário */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-300 ${
              role === 'driver' 
                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <Truck size={36} strokeWidth={2.5} />
            <span className="font-black mt-2 text-[10px] uppercase tracking-widest">Motorista</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('company')}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-300 ${
              role === 'company' 
                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <Building2 size={36} strokeWidth={2.5} />
            <span className="font-black mt-2 text-[10px] uppercase tracking-widest">Empresa</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nome */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text" 
              placeholder="Nome ou Razão Social" 
              required
              autoComplete="name"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold text-slate-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* E-mail */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="email" 
              placeholder="Seu melhor e-mail" 
              required
              autoComplete="email"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold text-slate-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* WhatsApp */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="tel" 
              placeholder="WhatsApp (ex: 11999999999)" 
              required
              autoComplete="tel"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold text-slate-700"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="password" 
              placeholder="Crie uma senha" 
              required
              autoComplete="new-password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold text-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-[1000] italic text-white text-sm uppercase tracking-widest transition-all shadow-xl mt-4 active:scale-95 flex items-center justify-center gap-2 ${
              role === 'driver' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
            } disabled:bg-slate-300 disabled:shadow-none`}
          >
            {loading ? (
              <> <Loader2 className="animate-spin" size={20} /> PROCESSANDO... </>
            ) : (
              `Cadastrar como ${role === 'driver' ? 'Motorista' : 'Empresa'}`
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <p className="text-slate-500 font-medium text-sm">
            Já tem uma conta?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-900 font-black hover:underline underline-offset-4 uppercase text-xs"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}