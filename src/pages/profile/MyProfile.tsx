import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Truck, Building2, 
  Megaphone, ShieldCheck, Save, Loader2, Camera 
} from 'lucide-react';
import { api } from '../../api/api';

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  // Sincroniza o formulário caso o objeto 'user' mude externamente
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Usando o padrão de endpoint que você definiu no sistema
      const response = await api.post('/', {
        endpoint: 'update-user-profile',
        ...formData
      });

      if (response.data.success) {
        // Chama a função da DashboardPage para buscar os dados frescos do banco
        await refreshUser();
        alert("Perfil atualizado com sucesso!");
      } else {
        throw new Error();
      }
    } catch (error) {
      alert("Erro ao salvar alterações. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DO PERFIL */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-lg transition-transform group-hover:scale-105">
            <img 
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-3 rounded-2xl shadow-xl hover:bg-orange-600 transition-all cursor-pointer">
            <Camera size={18} />
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter text-slate-800 leading-none mb-2">
            {user.name || 'Usuário'}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest italic">
              ID: #{user.id}
            </span>
            {user.role === 'driver' && <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1"><Truck size={12}/> Motorista</span>}
            {(user.role === 'company' || user.role === 'shipper') && <span className="px-4 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1"><Building2 size={12}/> Empresa</span>}
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange-500 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Salvar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* COLUNA 1: DADOS BÁSICOS */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-slate-800">
             Informações de Contato
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Nome Completo</label>
              <input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500/20 focus:bg-white outline-none font-bold transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">WhatsApp</label>
              <input 
                placeholder="(00) 00000-0000"
                value={formData.phone || ''} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500/20 focus:bg-white outline-none font-bold transition-all text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* COLUNA 2: DADOS ESPECÍFICOS */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          {user.role === 'driver' ? (
            <>
              <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-slate-800">
                Veículo & Documentação
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Placa</label>
                    <input 
                      value={formData.plate || ''} 
                      onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                      className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">ANTT</label>
                    <input 
                      value={formData.antt || ''} 
                      onChange={(e) => setFormData({...formData, antt: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" 
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-slate-800">
                Dados da Empresa
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">CNPJ / CPF</label>
                  <input 
                    value={formData.cnpj || formData.document || ''} 
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Cidade/UF</label>
                  <input 
                    value={formData.location || ''} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ex: Balneário Camboriú / SC"
                    className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FOOTER: SELO DE VERIFICAÇÃO */}
      {user.is_verified && (
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-xl font-[1000] uppercase italic flex items-center gap-2 tracking-tighter">
              <ShieldCheck className="text-orange-500" /> Perfil Verificado
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sua conta possui selo de confiança Chama Frete</p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
             <ShieldCheck size={150} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;