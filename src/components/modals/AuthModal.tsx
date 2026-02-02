import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2, ArrowRight, AlertCircle, Phone } from 'lucide-react';
import { api } from '../../api/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados dos formulários
  const [emailOrWhatsapp, setEmailOrWhatsapp] = useState(''); // Login flexível
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // Obrigatório no cadastro
  const [email, setEmail] = useState(''); // E-mail separado no cadastro

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      
      // Ajuste do Payload conforme as regras de negócio
      const payload = isLogin 
        ? { 
            login: emailOrWhatsapp, // Backend deve tratar 'login' como email ou whatsapp
            password 
          } 
        : { 
            name, 
            email, 
            whatsapp, 
            password, 
            role: 'driver' // Role padrão
          };

      const res = await api.post(endpoint, payload);

      if (res.data?.success || res.data?.token) {
        localStorage.setItem('@ChamaFrete:token', res.data.token);
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(res.data.user));
        onSuccess(); 
      } else {
        setError(res.data?.message || 'Dados incorretos. Verifique e tente novamente.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Erro ao conectar com o servidor. Verifique os campos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all">
      <div 
        className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-10 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-[1000] uppercase italic text-slate-900 tracking-tighter leading-none">
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
            </h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-3">
              {isLogin ? 'Entre com E-mail ou WhatsApp' : 'Obrigatório para contatos de frete'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-tight border border-red-100 flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* CAMPO NOME (Só Cadastro) */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nome Completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            {/* CAMPO LOGIN (E-mail ou Whats no Login / Só E-mail no Cadastro) */}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={isLogin ? "text" : "email"} 
                placeholder={isLogin ? "E-mail ou WhatsApp" : "Seu E-mail"}
                required
                value={isLogin ? emailOrWhatsapp : email}
                onChange={(e) => isLogin ? setEmailOrWhatsapp(e.target.value) : setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* CAMPO WHATSAPP (Só Cadastro - OBRIGATÓRIO) */}
            {!isLogin && (
              <div className="relative animate-in slide-in-from-left-2">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel" 
                  placeholder="WhatsApp (ex: 11999999999)"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            {/* CAMPO SENHA */}
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Sua senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-[1000] uppercase italic text-sm shadow-xl shadow-blue-100 hover:bg-slate-900 hover:shadow-slate-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Entrar e Visualizar' : 'Criar Minha Conta'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}