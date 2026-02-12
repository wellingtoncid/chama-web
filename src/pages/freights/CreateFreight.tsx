import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, ShieldCheck, UserCircle, DollarSign, FileText } from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import { VEHICLE_TYPES, BODY_TYPES } from '../../constants/freightOptions';
import Swal from 'sweetalert2';

export default function CreateFreight() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

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
    contact_preference: 'both' // Padrão conforme sua regra de negócio
  });

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

  useEffect(() => {
    if (editData) {
      const initializeEdit = async () => {
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
          contact_preference: editData.contact_preference || 'both'
        });
      };
      initializeEdit();
    } else if (currentUser && !isAdminOrManager) {
      setFormData(prev => ({ 
        ...prev, 
        user_id: String(currentUser.id)
      }));
    }
  }, [editData]);

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
      
      const payload = {
        ...formData,
        id: formData.id,
        user_id: Number(formData.user_id),
        weight: parseFloat(formData.weight) || 0,
        price: parseFloat(formData.price) || 0
        //status: formData.id ? undefined : 'OPEN'
      };

      const response = await api.post(`/${endpoint}`, payload);
      // Aviso de Sucesso simples e limpo
      await Swal.fire({
        icon: 'success',
        title: formData.id ? 'Salvo!' : 'Publicado!',
        text: response.data.message,
        timer: 2500,
        showConfirmButton: false
      });

      navigate('/dashboard');

    } catch (error: any) {
      // Captura a mensagem do PHP (ex: conteúdo impróprio ou erro de banco)
      const msg = error.response?.data?.message || "Erro ao processar requisição.";

      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        text: msg,
        confirmButtonText: 'ENTENDI'
      });
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
                  <select required className="w-24 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={formData.origin_state} onChange={e => handleStateChange(e.target.value, 'origin')}>
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select required className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={formData.origin_city} onChange={e => setFormData({...formData, origin_city: e.target.value})}>
                    <option value="">Cidade</option>
                    {originCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* DESTINO */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Destino</label>
                <div className="flex gap-2">
                  <select required className="w-24 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={formData.dest_state} onChange={e => handleStateChange(e.target.value, 'dest')}>
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select required className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={formData.dest_city} onChange={e => setFormData({...formData, dest_city: e.target.value})}>
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

            {/* DESCRIÇÃO AMPLIADA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                <FileText size={12}/> Observações e Detalhes da Carga
              </label>
              <textarea 
                rows={5} 
                value={formData.description} 
                placeholder="Ex: Carga paletizada, exige ajudante para descarga, pagamento 50% na saída..."
                className="w-full p-4 bg-slate-50 rounded-3xl font-medium border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-6 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 transition-colors ${isAdminOrManager ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-orange-600'}`}
            >
              {loading ? "Processando..." : (formData.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR FRETE')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}