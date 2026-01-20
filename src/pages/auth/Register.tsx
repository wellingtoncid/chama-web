import React, { useState } from 'react';
import { Truck, Building2, User, Mail, Lock, Phone } from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [role, setRole] = useState<'driver' | 'company'>('driver');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // Estado para o WhatsApp
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.replace(/\D/g, ''), // Remove tudo que não for número
      password,
      role
    };

    try {
      const response = await api.post('/register', payload);
      
      if (response.data.success) {
        alert("Cadastro realizado com sucesso! Agora faça seu login.");
        navigate('/login', { replace: true });
      } else {
        alert("Erro no cadastro: " + (response.data.message || response.data.error || "Tente novamente"));
      }
    } catch (error: any) {
      alert("Erro ao conectar com o servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Criar Conta</h1>
          <p className="text-slate-500 mt-2 font-medium">Junte-se à maior rede de fretes</p>
        </div>

        {/* Seletor de Tipo de Usuário com Estilo Moderno */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-300 ${
              role === 'driver' 
                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-inner' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <Truck size={36} strokeWidth={2.5} />
            <span className="font-black mt-2 text-xs uppercase tracking-widest">Motorista</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('company')}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-300 ${
              role === 'company' 
                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-inner' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <Building2 size={36} strokeWidth={2.5} />
            <span className="font-black mt-2 text-xs uppercase tracking-widest">Empresa</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Campo Nome */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text" placeholder="Nome ou Razão Social" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Campo E-mail */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="email" placeholder="Seu melhor e-mail" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* NOVO: Campo WhatsApp */}
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="tel" 
              placeholder="WhatsApp (ex: 11999999999)" 
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          {/* Campo Senha */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="password" placeholder="Crie uma senha forte" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-white text-lg transition-all shadow-xl shadow-slate-200 mt-4 active:scale-95 ${
              role === 'driver' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-slate-300`}
          >
            {loading ? 'CADASTRANDO...' : `CADASTRAR COMO ${role === 'driver' ? 'MOTORISTA' : 'EMPRESA'}`}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Já tem uma conta?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-900 font-black hover:underline underline-offset-4"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}