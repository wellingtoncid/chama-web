import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2, ArrowRight, AlertCircle, Phone, Truck, Building2, FileText, Building } from 'lucide-react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'driver' | 'company'>('driver');
  const { login: authLogin } = useAuth();

  const [emailOrWhatsapp, setEmailOrWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [nameFantasy, setNameFantasy] = useState('');

  if (!isOpen) return null;

  const clearFields = () => {
    setName('');
    setDocument('');
    setOwnerName('');
    setNameFantasy('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';

      const payload: Record<string, any> = isLogin
        ? { login: emailOrWhatsapp, password }
        : {
            name,
            email,
            whatsapp: whatsapp.replace(/\D/g, ''),
            document: document.replace(/\D/g, ''),
            password,
            role,
          };

      if (!isLogin && role === 'company') {
        payload.owner_name = ownerName;
        payload.name_fantasy = nameFantasy;
      }

      const res = await api.post(endpoint, payload);

      if (res.data?.success || res.data?.token) {
        authLogin(res.data.user, res.data.token);
        onSuccess?.();
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
        className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={22} />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-[1000] uppercase italic text-slate-900 tracking-tighter leading-none">
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
            </h2>
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] mt-2">
              {isLogin ? 'Entre com E-mail ou WhatsApp' : 'Junte-se à maior rede de fretes'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cadastrar
            </button>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setRole('driver'); clearFields(); }}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  role === 'driver'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Truck size={22} strokeWidth={2.5} />
                <span className="font-black mt-1 text-[8px] uppercase tracking-widest">Motorista</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('company'); clearFields(); }}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  role === 'company'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Building2 size={22} strokeWidth={2.5} />
                <span className="font-black mt-1 text-[8px] uppercase tracking-widest">Empresa</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[10px] font-black uppercase tracking-tight border border-red-100 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && role === 'company' && (
              <div className="bg-blue-50 p-3 rounded-2xl space-y-2">
                <p className="text-[8px] font-black uppercase text-blue-600 tracking-wider">Dados da Empresa</p>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                  <input
                    type="text"
                    placeholder="Razão Social"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 pl-10 pr-3 text-xs font-bold focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                  <input
                    type="text"
                    placeholder="Nome Fantasia (opcional)"
                    value={nameFantasy}
                    onChange={(e) => setNameFantasy(e.target.value)}
                    className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 pl-10 pr-3 text-xs font-bold focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                  <input
                    type="text"
                    placeholder="CNPJ (apenas números)"
                    required
                    value={document}
                    onChange={(e) => setDocument(e.target.value.replace(/\D/g, ''))}
                    maxLength={14}
                    className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 pl-10 pr-3 text-xs font-bold focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {!isLogin && role === 'company' && (
              <div className="bg-green-50 p-3 rounded-2xl space-y-2">
                <p className="text-[8px] font-black uppercase text-green-600 tracking-wider">Dados do Responsável</p>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={14} />
                  <input
                    type="text"
                    placeholder="Nome Completo do Responsável"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-white border-2 border-green-100 rounded-xl py-3 pl-10 pr-3 text-xs font-bold focus:border-green-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {!isLogin && role === 'driver' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Seu Nome Completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-xs font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            {!isLogin && role === 'driver' && (
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Seu CPF (apenas números)"
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-xs font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={isLogin ? "text" : "email"}
                placeholder={isLogin ? "E-mail ou WhatsApp" : "Seu E-mail"}
                required
                value={isLogin ? emailOrWhatsapp : email}
                onChange={(e) => isLogin ? setEmailOrWhatsapp(e.target.value) : setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-xs font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {!isLogin && (
              <div className="relative animate-in slide-in-from-left-2">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  placeholder="WhatsApp (ex: 11999999999)"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-xs font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                placeholder="Sua senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-xs font-bold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-[1000] uppercase italic text-xs shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2 ${
                !isLogin && role === 'driver'
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100'
                  : 'bg-blue-600 text-white hover:bg-slate-900 hover:shadow-slate-200 shadow-blue-100'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? 'Entrar e Visualizar' : `Criar Conta como ${role === 'driver' ? 'Motorista' : 'Empresa'}`}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
