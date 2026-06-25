import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, ShieldCheck, UserCircle, DollarSign, FileText, Wrench, Award, CheckCircle, AlertCircle, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import WelcomeOnboarding from '../../components/profile/WelcomeOnboarding';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';
import { parseBrazilianNumber } from '../../lib/utils';

function formatBRInteger(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('pt-BR') : '';
}

function formatBRPrice(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const padded = digits.padStart(3, '0');
  const intPart = padded.slice(0, -2).replace(/^0+/, '') || '0';
  const decPart = padded.slice(-2);
  return `${Number(intPart).toLocaleString('pt-BR')},${decPart}`;
}

function parseJsonArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

export default function CreateFreight() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const { vehicleTypes, bodyTypes, equipmentTypes, certificationTypes, loading: settingsLoading } = useSiteSettings();

  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [originCities, setOriginCities] = useState<string[]>([]);
  const [destCities, setDestCities] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [cargoTypes, setCargoTypes] = useState<{ id: number; name: string }[]>([]);
  const [calcLoading, setCalcLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const storageUser = localStorage.getItem('@ChamaFrete:user');
  const currentUser = storageUser ? JSON.parse(storageUser) : null;
  const isAdminOrManager = ['admin', 'manager'].includes(currentUser?.role?.toLowerCase());

  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('@ChamaFrete:user');
    return saved ? JSON.parse(saved) : null;
  });

  const isCompany = ['COMPANY', 'TRANSPORTADORA', 'LOGISTICS'].includes(user?.role?.toUpperCase());
  const needsOnboarding = isCompany && (!user?.document || !user?.company_name);

  const [formData, setFormData] = useState({
    id: null,
    user_id: '',
    origin_state: '',
    origin_city: '',
    dest_state: '',
    dest_city: '',
    product: '',
    weight: '',
    cargo_type_id: '',
    distance_km: '',
    vehicle_type: '',
    body_type: '',
    price: '',
    description: '',
    contact_preference: 'both',
    equipment_needed: [] as string[],
    certifications_needed: [] as string[]
  });

  const [vehicleRows, setVehicleRows] = useState<{ vehicle: string; body: string }[]>([{ vehicle: '', body: '' }]);

  const showAlert = (msg: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  useEffect(() => {
    getStates().then(setStates);
    api.get('cargo-types').then(res => {
      if (res.data?.success) setCargoTypes(res.data.data);
    }).catch(() => {});
    if (isAdminOrManager) {
      api.get('list-all-users').then(res => {
        const list = res.data.success ? res.data.data : res.data;
        if (Array.isArray(list)) setCompanies(list.filter((u: any) => u.role === 'company' || u.role === 'admin'));
      });
    }
  }, [isAdminOrManager]);

  useEffect(() => {
    if (editData) {
      const initializeEdit = async () => {
        if (editData.origin_state) { const cities = await getCitiesByState(editData.origin_state); setOriginCities(cities); }
        if (editData.dest_state) { const cities = await getCitiesByState(editData.dest_state); setDestCities(cities); }
        setFormData({
          id: editData.id,
          user_id: String(editData.user_id || ''),
          origin_state: editData.origin_state || '',
          origin_city: editData.origin_city || '',
          dest_state: editData.dest_state || '',
          dest_city: editData.dest_city || '',
          product: editData.product || '',
          weight: editData.weight !== undefined ? formatBRInteger(String(editData.weight)) : '',
          cargo_type_id: editData.cargo_type_id ? String(editData.cargo_type_id) : '',
          distance_km: editData.distance_km ? formatBRInteger(String(editData.distance_km)) : '',
          vehicle_type: editData.vehicle_type || '',
          body_type: editData.body_type || '',
          price: editData.price !== undefined ? Number(editData.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
          description: editData.description || '',
          contact_preference: editData.contact_preference || 'both',
          equipment_needed: parseJsonArray(editData.equipment_needed),
          certifications_needed: parseJsonArray(editData.certifications_needed)
        });
        // Reconstroi vehicleRows a partir dos dados comma-separated
        const vehicles = String(editData.vehicle_type || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const bodies = String(editData.body_type || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        if (vehicles.length > 0) {
          setVehicleRows(vehicles.map((v, i) => ({ vehicle: v, body: bodies[i] || '' })));
        }
      };
      initializeEdit();
    } else if (currentUser && !isAdminOrManager) {
      setFormData(prev => ({ ...prev, user_id: String(currentUser.id) }));
    }
  }, [editData]);

  const handleStateChange = async (state: string, field: 'origin' | 'dest') => {
    const cities = await getCitiesByState(state);
    if (field === 'origin') { setOriginCities(cities); setFormData(prev => ({ ...prev, origin_state: state, origin_city: '' })); }
    else { setDestCities(cities); setFormData(prev => ({ ...prev, dest_state: state, dest_city: '' })); }
  };

  const handleCalcDistance = async () => {
    if (!formData.origin_city || !formData.dest_city) {
      showAlert('Informe origem e destino primeiro.', 'error');
      return;
    }
    setCalcLoading(true);
    try {
      const res = await api.post('/freight/calc-distance', {
        origin_city: formData.origin_city,
        origin_state: formData.origin_state,
        dest_city: formData.dest_city,
        dest_state: formData.dest_state,
      });
      if (res.data?.success) {
        const km = Math.round(Number(res.data.distance_km));
        setFormData(prev => ({ ...prev, distance_km: formatBRInteger(String(km)) }));
        showAlert(`Distância calculada: ${km.toLocaleString('pt-BR')} km`, 'success');
      } else {
        showAlert(res.data?.message || 'Erro ao calcular distância.', 'error');
      }
    } catch {
      showAlert('Erro ao calcular distância. Informe manualmente.', 'error');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    try {
      const endpoint = formData.id ? 'update-freight' : 'create-freight';
      const storageUser = localStorage.getItem('@ChamaFrete:user');
      const user = storageUser ? JSON.parse(storageUser) : null;
      const payload = {
        ...formData,
        id: formData.id,
        user_id: Number(formData.user_id),
        account_id: user?.account_id,
        weight: parseBrazilianNumber(formData.weight),
        cargo_type_id: formData.cargo_type_id ? Number(formData.cargo_type_id) : null,
        distance_km: formData.distance_km ? parseBrazilianNumber(formData.distance_km) : null,
        price: parseBrazilianNumber(formData.price),
        vehicle_type: vehicleRows.map(r => r.vehicle).filter(Boolean).join(',') || null,
        body_type: vehicleRows.map(r => r.body).filter(Boolean).join(',') || null,
        equipment_needed: JSON.stringify(formData.equipment_needed),
        certifications_needed: JSON.stringify(formData.certifications_needed)
      };
      const response = await api.post(`/${endpoint}`, payload);
      showAlert(response.data.message || (formData.id ? 'Salvo!' : 'Publicado!'), 'success');
      const freightId = response.data?.data?.id || formData.id;
      setTimeout(() => navigate(freightId ? `/dashboard/logistica?promote=freight:${freightId}` : '/dashboard/logistica'), 1200);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao processar requisição.";
      showAlert(msg, 'error');
    } finally { setLoading(false); }
  };

  const AlertToast = () => {
    if (!alertMsg) return null;
    const colors = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };
    return (
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-4 duration-300 ${colors[alertType]}`}>
        {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="font-bold text-sm">{alertMsg}</span>
      </div>
    );
  };

  return (
    <DashboardShell title={formData.id ? 'Editar Carga' : 'Nova Carga'} description="Preencha os dados do frete para publicar">
      <AlertToast />

      {needsOnboarding && (
        <WelcomeOnboarding
          user={user}
          onClose={() => navigate('/dashboard')}
          onComplete={(updatedData: any) => {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            localStorage.setItem('@ChamaFrete:user', JSON.stringify(newUser));
          }}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-slate-400 dark:text-slate-500"
        >
          <ArrowLeft size={16} /> Voltar
        </Button>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">

          <div className="p-8 lg:p-12 space-y-8">
            {isAdminOrManager && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <label className="block text-xs font-black text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <UserCircle size={16} /> Vincular à Empresa:
                </label>
                <select
                  required
                  className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-bold text-slate-800 dark:text-slate-200"
                  value={formData.user_id}
                  onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{String(c.display_name || c.company_name || c.name || 'Empresa sem nome').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Origem</label>
                <div className="flex gap-2">
                  <select required className="w-24 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" value={formData.origin_state} onChange={e => handleStateChange(e.target.value, 'origin')}>
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select required className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" value={formData.origin_city} onChange={e => setFormData({ ...formData, origin_city: e.target.value })}>
                    <option value="">Cidade</option>
                    {originCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Destino</label>
                <div className="flex gap-2">
                  <select required className="w-24 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" value={formData.dest_state} onChange={e => handleStateChange(e.target.value, 'dest')}>
                    <option value="">UF</option>
                    {states.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
                  </select>
                  <select required className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" value={formData.dest_city} onChange={e => setFormData({ ...formData, dest_city: e.target.value })}>
                    <option value="">Cidade</option>
                    {destCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Distância (km)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={formData.distance_km}
                    placeholder="Ex: 850"
                    className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    onChange={e => setFormData({ ...formData, distance_km: formatBRInteger(e.target.value) })}
                  />
                  <button
                    type="button"
                    onClick={handleCalcDistance}
                    disabled={calcLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2"
                  >
                    {calcLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    Calcular
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Peso (kg)</label>
                <input type="text" inputMode="numeric" required value={formData.weight} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" onChange={e => setFormData(prev => ({ ...prev, weight: formatBRInteger(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Produto</label>
              <input type="text" required value={formData.product} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" onChange={e => setFormData({ ...formData, product: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Tipo de Carga</label>
                <select value={formData.cargo_type_id} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" onChange={e => setFormData({ ...formData, cargo_type_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {cargoTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase ml-2 flex items-center gap-1"><DollarSign size={10} /> VALOR</label>
                <input type="text" inputMode="numeric" required value={formData.price} className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-2xl font-black border border-emerald-200 dark:border-emerald-800 tabular-nums" onChange={e => setFormData(prev => ({ ...prev, price: formatBRPrice(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Veículo / Carroceria</label>
              {vehicleRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                  <div className="space-y-2">
                    <select required value={row.vehicle} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" onChange={e => {
                      const updated = [...vehicleRows];
                      updated[idx].vehicle = e.target.value;
                      setVehicleRows(updated);
                    }}>
                      <option value="">Veículo {idx + 1}</option>
                      {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <select required value={row.body} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" onChange={e => {
                      const updated = [...vehicleRows];
                      updated[idx].body = e.target.value;
                      setVehicleRows(updated);
                    }}>
                      <option value="">Carroceria {idx + 1}</option>
                      {bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {idx === vehicleRows.length - 1 && (
                      <button type="button" onClick={() => setVehicleRows([...vehicleRows, { vehicle: '', body: '' }])} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all" title="Adicionar outro veículo">
                        <Plus size={16} />
                      </button>
                    )}
                    {idx > 0 && (
                      <button type="button" onClick={() => setVehicleRows(vehicleRows.filter((_, i) => i !== idx))} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all" title="Remover">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <Wrench size={10} /> Equipamentos Necessários
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[60px]">
                  {equipmentTypes.map(eq => (
                    <button
                      key={eq} type="button"
                      onClick={() => {
                        const current = formData.equipment_needed;
                        const updated = current.includes(eq) ? current.filter(e => e !== eq) : [...current, eq];
                        setFormData({ ...formData, equipment_needed: updated });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        formData.equipment_needed.includes(eq)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <Award size={10} /> Certificações Necessárias
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[60px]">
                  {certificationTypes.map(cert => (
                    <button
                      key={cert} type="button"
                      onClick={() => {
                        const current = formData.certifications_needed;
                        const updated = current.includes(cert) ? current.filter(c => c !== cert) : [...current, cert];
                        setFormData({ ...formData, certifications_needed: updated });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        formData.certifications_needed.includes(cert)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-purple-300'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-2 flex items-center gap-2">
                <FileText size={12} /> Observações e Detalhes da Carga
              </label>
              <textarea
                rows={5}
                value={formData.description}
                placeholder="Ex: Carga paletizada, exige ajudante para descarga, pagamento 50% na saída..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-medium border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${isAdminOrManager ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              size="lg"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Processando...</>
              ) : (
                formData.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR FRETE'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
