  import React, { useState, useEffect } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import { ArrowLeft, Package, ShieldCheck, UserCircle, DollarSign, FileText } from 'lucide-react';
  import { api } from '../../api/api';
  import { getStates, getCitiesByState } from '../../services/location';
  import { VEHICLE_TYPES, BODY_TYPES } from '../../constants/freightOptions';

  export default function CreateFreight() {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.editData;

    const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
    const [originCities, setOriginCities] = useState<string[]>([]);
    const [destCities, setDestCities] = useState<string[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. PADRONIZAÇÃO DA LEITURA (Conforme seu App.tsx)
    const storageUser = localStorage.getItem('@ChamaFrete:user');
    const currentUser = storageUser ? JSON.parse(storageUser) : null;
    
    const userRole = currentUser?.role?.toLowerCase().trim();
    const userStatus = currentUser?.status?.toLowerCase().trim();

    // 2. DEFINIÇÃO DE PERMISSÃO
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isCompany = userRole === 'company';
    
    // Liberado se for Admin OU se for Empresa Aprovada
    const canPublish = isAdminOrManager || (isCompany && userStatus === 'approved');

    const [formData, setFormData] = useState({
      id: editData?.id || null, 
      user_id: editData?.user_id || (isCompany ? currentUser?.id : ''),
      origin_state: editData?.origin_state || '',
      origin_city: editData?.origin_city || '', 
      dest_state: editData?.dest_state || '',
      dest_city: editData?.dest_city || '', 
      product: editData?.product || '',
      weight: editData?.weight || '',
      vehicle_type: editData?.vehicle_type || editData?.vehicle_type || '', 
      body_type: editData?.body_type || editData?.body_type || '',
      price: editData?.price || '',
      description: editData?.description || '' 
    });

    
    // 1. Carregamento Inicial (Apenas 1 vez ao montar)
    useEffect(() => {
      if (!currentUser || !canPublish) {
        if (currentUser) {
          alert("Acesso restrito. Conta precisa de aprovação.");
          navigate('/dashboard');
        }
        return;
      }

      // Busca dados básicos
      getStates().then(setStates);

      if (isAdminOrManager) {
        api.get('list-all-users')
          .then(res => {
            const list = res.data.success ? res.data.data : res.data;
            if (Array.isArray(list)) {
              setCompanies(list.filter((u: any) => u.role?.toLowerCase() === 'company'));
            }
          })
          .catch(err => console.error("Erro ao listar usuários:", err));
      }

      // Se for EDIÇÃO, carrega as cidades iniciais sem disparar o reset do formData
      if (editData) {
        if (editData.origin_state) getCitiesByState(editData.origin_state).then(setOriginCities);
        if (editData.dest_state) getCitiesByState(editData.dest_state).then(setDestCities);
      }
    }, []); // Dependência vazia garante que só rode ao abrir a página

    // 2. Sincronização de Cidades de Origem (Apenas quando o ESTADO muda)
    useEffect(() => {
      if (formData.origin_state) {
        getCitiesByState(formData.origin_state).then(cities => {
          setOriginCities(cities);
          // SÓ limpa a cidade se NÃO for o valor que já veio do editData ou se o estado mudou manualmente
          if (!editData && formData.origin_city !== '') {
            setFormData(prev => ({ ...prev, origin_city: '' }));
          }
        });
      }
    }, [formData.origin_state]); // REMOVIDO editData daqui para evitar loops

    // 3. Sincronização de Cidades de Destino
    useEffect(() => {
      if (formData.dest_state) {
        getCitiesByState(formData.dest_state).then(cities => {
          setDestCities(cities);
          if (!editData && formData.dest_city !== '') {
            setFormData(prev => ({ ...prev, dest_city: '' }));
          }
        });
      }
    }, [formData.dest_state]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.user_id) return alert("Por favor, selecione a empresa proprietária da carga.");
      
      setLoading(true);
      try {
        const endpoint = formData.id ? 'update-freight' : 'create-freight';
      
        const payload = {
          id: formData.id,
          user_id: formData.user_id,
          operator_id: currentUser.id, // Rastreabilidade de quem criou
          origin_city: formData.origin_city, // O PHP espera 'origin_city'
          origin_state: formData.origin_state,
          dest_city: formData.dest_city,     // O PHP espera 'dest_city'
          dest_state: formData.dest_state,
          product: formData.product,
          description: formData.description,
          weight: parseFloat(formData.weight?.toString() || '0'),
          price: parseFloat(formData.price?.toString() || '0'),
          vehicle_type: formData.vehicle_type, 
          body_type: formData.body_type,    
          // Opcional: Se o admin estiver criando, pode passar como destaque
          is_featured: formData.id ? undefined : false 
        };

        await api.post(`/${endpoint}`, payload);
        
        alert(formData.id ? "Anúncio atualizado com sucesso!" : "Carga publicada com sucesso!");
        navigate('/dashboard');
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar carga. Verifique os dados e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser || !canPublish) return null;

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </button>

          <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className={`p-10 text-white flex justify-between items-center relative overflow-hidden ${isAdminOrManager ? 'bg-blue-900' : 'bg-slate-900'}`}>
              <div className="relative z-10">
                <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                  <Package className="text-orange-500" size={32} /> 
                  {formData.id ? 'Editar Carga' : 'Nova Carga'}
                </h1>
                <p className="text-slate-400 mt-2 text-[10px] uppercase font-black tracking-widest">
                  {isAdminOrManager ? "Modo Administrativo / Agenciamento" : `Empresa: ${currentUser.company_name || currentUser.name}`}
                </p>
              </div>
              <ShieldCheck size={120} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
            </div>

            <div className="p-8 md:p-12 space-y-10">
              {isAdminOrManager && (
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <label className="block text-[10px] font-black text-blue-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <UserCircle size={16} /> Vincular frete à empresa proprietária:
                  </label>
                  <select 
                    required
                    className="w-full p-4 rounded-2xl border-none bg-white shadow-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.user_id}
                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                  >
                    <option value="">Selecione uma empresa da lista...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name?.toUpperCase() || c.name?.toUpperCase()} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* GRID DE ORIGEM E DESTINO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Origem</label>
                  <div className="flex gap-2">
                      <select required className="w-24 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:border-orange-500" value={formData.origin_state} onChange={e => setFormData({...formData, origin_state: e.target.value})}>
                          <option value="">UF</option>
                          {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                      </select>
                      <select required className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:border-orange-500" value={formData.origin_city} onChange={e => setFormData({...formData, origin_city: e.target.value})}>
                          <option value="">Cidade</option>
                          {originCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Destino</label>
                  <div className="flex gap-2">
                      <select required className="w-24 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:border-orange-500" value={formData.dest_state} onChange={e => setFormData({...formData, dest_state: e.target.value})}>
                          <option value="">UF</option>
                          {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                      </select>
                      <select required className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:border-orange-500" value={formData.dest_city} onChange={e => setFormData({...formData, dest_city: e.target.value})}>
                          <option value="">Cidade</option>
                          {destCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                </div>
              </div>

              {/* DETALHES DA CARGA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Produto</label>
                    <input type="text" required value={formData.product} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" onChange={e => setFormData({...formData, product: e.target.value})} placeholder="Ex: Milho ensacado" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Peso (Ton)</label>
                    <input type="number" step="0.1" required value={formData.weight} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Caminhão</label>
                    <select required value={formData.vehicle_type} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                      <option value="">Selecione...</option>
                      {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Carroceria</label>
                    <select required value={formData.body_type} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" onChange={e => setFormData({...formData, body_type: e.target.value})}>
                      <option value="">Selecione...</option>
                      {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex items-center gap-1"><DollarSign size={10}/> Preço (R$)</label>
                    <input type="number" required value={formData.price} className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black outline-none border border-emerald-100" onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FileText size={12}/> Observações</label>
                <textarea rows={3} value={formData.description} className="w-full p-5 bg-slate-50 rounded-[2rem] font-medium outline-none border border-slate-100 focus:ring-2 focus:ring-orange-500" onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalhes adicionais da carga..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-7 text-white rounded-[2.5rem] font-black text-xl transition-all shadow-2xl disabled:bg-slate-200 uppercase italic tracking-tighter flex items-center justify-center gap-3 ${isAdminOrManager ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-orange-600'}`}
              >
                {loading ? <span className="animate-spin mr-2">...</span> : <Package size={24} />}
                {formData.id ? 'Salvar Edição' : 'Publicar Frete Agora'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }