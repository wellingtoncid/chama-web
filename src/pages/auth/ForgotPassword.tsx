import React, { useState } from 'react';
import { api } from '../../api/api';
import { Mail, Phone, Lock, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [form, setForm] = useState({ email: '', whatsapp: '', token: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.replace(/\D/g, ''),
      step: 'request'
    };

    try {
      const res = await api.post('/reset-password', payload);
      
      if (res.data.success) {
        // REMOVIDO: res.data.dev_code. Agora o usuário depende do e-mail/SMS.
        alert("Se os dados estiverem corretos, você receberá um código de segurança em instantes.");
        setStep('verify');
      } else {
        // DICA DE SEGURANÇA: Em produção, o ideal é dizer "Verifique seu e-mail" 
        // mesmo que o usuário não exista, para evitar "User Enumeration".
        alert(res.data.message || "Erro ao processar solicitação.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      return alert("A nova senha deve ter pelo menos 6 caracteres.");
    }

    setLoading(true);
    try {
      const res = await api.post('/reset-password', { 
        email: form.email.trim().toLowerCase(), 
        token: form.token.trim(), 
        newPassword: form.newPassword,
        step: 'confirm' 
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        alert(res.data.message || "Código inválido ou expirado.");
      }
    } catch (err) {
      alert("Erro ao processar alteração.");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center">
          <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black">Senha Atualizada!</h2>
          <p className="text-slate-500 mt-2">Faça login com sua nova senha.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-orange-500 font-bold">
          <ArrowLeft size={18} /> Voltar
        </button>

        <h2 className="text-3xl font-black text-slate-800 mb-2">Recuperar Conta</h2>
        
        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="space-y-4 mt-6">
            <p className="text-slate-500 text-sm mb-4">Confirme seus dados para receber um código de segurança.</p>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                id="email" name="email" type="email" placeholder="Seu e-mail" required
                className="w-full bg-slate-50 h-14 pl-12 rounded-2xl font-bold"
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                id="whatsapp" name="whatsapp" type="text" placeholder="Seu WhatsApp" required
                className="w-full bg-slate-50 h-14 pl-12 rounded-2xl font-bold"
                onChange={e => setForm({...form, whatsapp: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
              {loading ? "Verificando..." : "Receber Código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4 mt-6">
            <p className="text-orange-600 text-sm font-bold mb-4 italic">Insira o código enviado e sua nova senha.</p>
            <div className="relative">
              <KeyRound className="absolute left-4 top-4 text-orange-500" size={20} />
              <input 
                id="token" name="token" type="text" placeholder="Código de 6 dígitos" required value={form.token} // garantir o controle do estado
                className="w-full bg-orange-50 border-2 border-orange-200 h-14 pl-12 rounded-2xl font-black text-center text-xl tracking-[0.5em]"
                onChange={e => setForm({...form, token: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                id="newPassword" name="newPassword" type="password" placeholder="Nova Senha" required
                className="w-full bg-slate-50 h-14 pl-12 rounded-2xl font-bold"
                onChange={e => setForm({...form, newPassword: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
              {loading ? "Processando..." : "Confirmar Alteração"}
            </button>
            <button type="button" onClick={() => setStep('request')} className="w-full text-slate-400 font-bold text-xs uppercase">Reenviar Código</button>
          </form>
        )}
      </div>
    </div>
  );
}