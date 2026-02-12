import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, ShieldCheck, UserCircle, DollarSign, FileText, Phone } from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import { VEHICLE_TYPES, BODY_TYPES } from '../../constants/freightOptions';

export default function CreateFreight() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  console.log('Edit Data:', editData);

  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [originCities, setOriginCities] = useState<string[]>([]);
  const [destCities, setDestCities] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const storageUser = localStorage.getItem('@ChamaFrete:user');
  const currentUser = storageUser ? JSON.parse(storageUser) : null;
  const isAdminOrManager = ['admin', 'manager'].includes(currentUser?.role?.toLowerCase());

  const [formData, setFormData] = useState({
    id: null,
    user_id: '',
    origin_state: '',
    origin_city: '',
    dest_state: '',
    dest_city: '',
    product: '',
    weight: '',
    vehicle_type: '',
    body_type: '',
    price: '',
    description: '',
    whatsapp: ''
  });

  // 1. CARGA INICIAL: Estados e Usuários (se admin)
  useEffect(() => {
    getStates().then(setStates);

    if (isAdminOrManager) {
      api.get('list-all-users').then(res => {
        const list = res.data.success ? res.data.data : res.data;
        if (Array.isArray(list)) {
          setCompanies(list.filter((u: any) => u.role?.toLowerCase() === 'company'));
        }
      });
    }
  }, [isAdminOrManager]);

  // 2. LÓGICA DE EDIÇÃO: Sincronização rigorosa com o banco
  useEffect(() => {
    if (editData) {
      const initializeEdit = async () => {
        // ESSENCIAL: Carregar as listas de cidades ANTES de setar o formData
        // Caso contrário, os selects de cidade ficam vazios porque a opção não existe na lista
        if (editData.origin_state) {
          const cities = await getCitiesByState(editData.origin_state);
          setOriginCities(cities);
        }
        if (editData.dest_state) {
          const cities = await getCitiesByState(editData.dest_state);
          setDestCities(cities);
        }

        setFormData({
          id: editData.id,
          user_id: String(editData.user_id || ''),
          origin_state: editData.origin_state || '',
          origin_city: editData.origin_city || '',
          dest_state: editData.dest_state || '',
          dest_city: editData.dest_city || '',
          product: editData.product || '',
          weight: editData.weight !== undefined ? String(editData.weight) : '',
          vehicle_type: editData.vehicle_type || '',
          body_type: editData.body_type || '',
          price: editData.price !== undefined ? String(editData.price) : '',
          description: editData.description || '', 
          whatsapp: editData.whatsapp || ''
        });
      };

      initializeEdit();
    } else if (currentUser && !isAdminOrManager) {
      // Se for novo frete, pré-preencher com dados do usuário logado
      setFormData(prev => ({ 
        ...prev, 
        user_id: String(currentUser.id),
        whatsapp: currentUser.whatsapp || ''
      }));
    }
  }, [editData]);

  // 3. LISTENERS DE TROCA DE ESTADO (UF) - Somente para mudanças Manuais
  const handleStateChange = async (state: string, field: 'origin' | 'dest') => {
    const cities = await getCitiesByState(state);
    if (field === 'origin') {
      setOriginCities(cities);
      setFormData(prev => ({ ...prev, origin_state: state, origin_city: '' }));
    } else {
      setDestCities(cities);
      setFormData(prev => ({ ...prev, dest_state: state, dest_city: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = formData.id ? 'update-freight' : 'create-freight';
      
      // Montagem do payload respeitando as colunas do seu SQL
      const payload = {
        id: formData.id,
        user_id: Number(formData.user_id),
        origin_city: formData.origin_city,
        origin_state: formData.origin_state,
        dest_city: formData.dest_city,
        dest_state: formData.dest_state,
        product: formData.product,
        description: formData.description,
        weight: parseFloat(formData.weight) || 0,
        price: parseFloat(formData.price) || 0,
        vehicle_type: formData.vehicle_type,
        body_type: formData.body_type,
        whatsapp: formData.whatsapp,
        status: formData.id ? undefined : 'OPEN'
      };

      await api.post(`/${endpoint}`, payload);
      alert(formData.id ? "Alterações salvas!" : "Frete publicado!");
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 mb-6 font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Voltar
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className={`p-10 text-white flex justify-between items-center relative ${isAdminOrManager ? 'bg-blue-900' : 'bg-slate-900'}`}>
            <div className="relative z-10">
              <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                <Package className="text-orange-500" size={32} /> 
                {formData.id ? 'Editar Carga' : 'Nova Carga'}
              </h1>
            </div>
            <ShieldCheck size={120} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {isAdminOrManager && (
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <label className="block text-[10px] font-black text-blue-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <UserCircle size={16} /> Vincular à Empresa:
                </label>
                <select 
                  required
                  className="w-full p-4 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-800"
                  value={formData.user_id}
                  onChange={e => setFormData({...formData, user_id: e.target.value})}
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name?.toUpperCase() || c.name?.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ORIGEM */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Origem</label>
                <div className="flex gap-2">
                  <select 
                    required 
                    className="w-24 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100"
                    value={formData.origin_state}
                    onChange={e => handleStateChange(e.target.value, 'origin')}
                  >
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select 
                    required 
                    className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100"
                    value={formData.origin_city}
                    onChange={e => setFormData({...formData, origin_city: e.target.value})}
                  >
                    <option value="">Cidade</option>
                    {originCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* DESTINO */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Destino</label>
                <div className="flex gap-2">
                  <select 
                    required 
                    className="w-24 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100"
                    value={formData.dest_state}
                    onChange={e => handleStateChange(e.target.value, 'dest')}
                  >
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select 
                    required 
                    className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100"
                    value={formData.dest_city}
                    onChange={e => setFormData({...formData, dest_city: e.target.value})}
                  >
                    <option value="">Cidade</option>
                    {destCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Produto</label>
                <input type="text" required value={formData.product} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" onChange={e => setFormData({...formData, product: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Peso (Ton)</label>
                <input type="number" step="0.1" required value={formData.weight} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" onChange={e => setFormData({...formData, weight: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Veículo</label>
                <select required value={formData.vehicle_type} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                  <option value="">Selecione...</option>
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Carroceria</label>
                <select required value={formData.body_type} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" onChange={e => setFormData({...formData, body_type: e.target.value})}>
                  <option value="">Selecione...</option>
                  {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex items-center gap-1"><DollarSign size={10}/> Preço (R$)</label>
                <input type="number" required value={formData.price} className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black border border-emerald-100" onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Phone size={12}/> WhatsApp</label>
                <input type="text" required value={formData.whatsapp} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FileText size={12}/> Descrição</label>
                <textarea rows={1} value={formData.description} className="w-full p-4 bg-slate-50 rounded-2xl font-medium border border-slate-100" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-6 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 ${isAdminOrManager ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-orange-600'}`}
            >
              {loading ? "Processando..." : (formData.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR FRETE')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}