import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import {
  Plus, Edit3, Trash2, X, Loader2, Tag, CheckCircle2, Copy,
  Search, ChevronLeft, ChevronRight, Users, Timer, Ban
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Coupon {
  id: number;
  code: string;
  value: number;
  max_uses: number;
  max_uses_per_user: number;
  expires_at: string | null;
  is_active: number;
  created_at: string;
  uses_count?: number;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [pageSize] = useState(10);

  const [form, setForm] = useState({
    code: '',
    value: '',
    max_uses: '',
    max_uses_per_user: '1',
    expires_at: '',
    is_active: 1,
  });

  const [selectedUses, setSelectedUses] = useState<{ id: number; user_id: number; user_name?: string; user_email?: string; created_at: string }[] | null>(null);
  const [loadingUses, setLoadingUses] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      if (res.data?.success) {
        setCoupons(res.data.data || []);
      }
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const filtered = coupons.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.code.toLowerCase().includes(q) && !`${c.id}`.includes(q)) return false;
    }
    if (filterActive === 'active') return c.is_active === 1;
    if (filterActive === 'inactive') return c.is_active === 0;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalActive = coupons.filter(c => c.is_active === 1).length;
  const totalUses = coupons.reduce((s, c) => s + (c.uses_count || 0), 0);
  const expired = coupons.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length;

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', value: '', max_uses: '', max_uses_per_user: '1', expires_at: '', is_active: 1 });
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      value: String(c.value),
      max_uses: String(c.max_uses),
      max_uses_per_user: String(c.max_uses_per_user),
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
      is_active: c.is_active,
    });
    setShowModal(true);
  };

  const generateCode = async () => {
    try {
      const res = await api.get('/admin/coupons/generate-code');
      if (res.data?.success) {
        setForm({ ...form, code: res.data.data.code });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao gerar código' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      Swal.fire({ icon: 'warning', title: 'Código e valor são obrigatórios' });
      return;
    }
    const value = parseFloat(form.value.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      Swal.fire({ icon: 'warning', title: 'Valor inválido' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        value,
        max_uses: parseInt(form.max_uses) || 0,
        max_uses_per_user: parseInt(form.max_uses_per_user) || 1,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      };

      let res;
      if (editing) {
        res = await api.put(`/admin/coupons/${editing.id}`, payload);
      } else {
        res = await api.post('/admin/coupons', payload);
      }

      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: editing ? 'Cupom atualizado!' : 'Cupom criado!', timer: 1500, showConfirmButton: false });
        setShowModal(false);
        loadCoupons();
      } else {
        Swal.fire({ icon: 'error', title: res.data?.message || 'Erro ao salvar' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Coupon) => {
    const result = await Swal.fire({
      title: 'Excluir cupom?',
      text: `Código: ${c.code}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/admin/coupons/${c.id}`);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Cupom excluído!', timer: 1500, showConfirmButton: false });
        loadCoupons();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao excluir' });
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      const res = await api.put(`/admin/coupons/${c.id}`, { is_active: c.is_active ? 0 : 1 });
      if (res.data?.success) {
        loadCoupons();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao alterar status' });
    }
  };

  const viewUses = async (c: Coupon) => {
    try {
      setLoadingUses(true);
      setSelectedUses([]);
      const res = await api.get(`/admin/coupons/${c.id}/uses`);
      if (res.data?.success) {
        setSelectedUses(res.data.data || []);
      }
    } catch {
      setSelectedUses([]);
    } finally {
      setLoadingUses(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    Swal.fire({ icon: 'success', title: 'Copiado!', timer: 1000, showConfirmButton: false });
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Cupons</h1>
          <p className="text-sm text-slate-500 mt-1">Gerenciar cupons de desconto / crédito</p>
        </div>
        <button
          onClick={openNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Total</p>
              <p className="text-xl font-black text-slate-900 tabular-nums">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Ativos</p>
              <p className="text-xl font-black text-slate-900 tabular-nums">{totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Usos</p>
              <p className="text-xl font-black text-slate-900 tabular-nums">{totalUses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Expirados</p>
              <p className="text-xl font-black text-slate-900 tabular-nums">{expired}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por código..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        {['all', 'active', 'inactive'].map(f => (
          <button
            key={f}
            onClick={() => { setFilterActive(f); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
              filterActive === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Inativos'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : paged.length === 0 ? (
          <div className="py-12 text-center">
            <Tag size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">Nenhum cupom encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Código</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Valor</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Usos</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Limite</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Expira</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map(c => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-sm text-slate-800">{c.code}</code>
                          <button onClick={() => copyCode(c.code)} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-sm text-emerald-600">
                          R$ {c.value.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewUses(c)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          {c.uses_count || 0} usos
                          <Users size={12} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {c.max_uses > 0 ? `${c.max_uses} total` : 'Ilimitado'}
                        {c.max_uses_per_user > 0 && ` · ${c.max_uses_per_user}/user`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
                          {c.expires_at
                            ? new Date(c.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '---'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                            c.is_active && !isExpired
                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {c.is_active && !isExpired ? (
                            <><CheckCircle2 size={10} /> Ativo</>
                          ) : (
                            <><Ban size={10} /> {isExpired ? 'Expirado' : 'Inativo'}</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">{editing ? 'Editar Cupom' : 'Novo Cupom'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editing ? `#${editing.id}` : 'Criar cupom de crédito'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Código *</label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: BEMVINDO10"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    maxLength={30}
                  />
                  {!editing && (
                    <button type="button" onClick={generateCode} className="px-3 py-2.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-200 transition-all">
                      Gerar
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Valor (R$) *</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value.replace(/[^0-9,]/g, '') })}
                  placeholder="Ex: 50,00"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Usos Máximos</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={e => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="0 = ilimitado"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Usos por Usuário</label>
                  <input
                    type="number"
                    value={form.max_uses_per_user}
                    onChange={e => setForm({ ...form, max_uses_per_user: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Expira em</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: form.is_active ? 0 : 1 })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    form.is_active
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {form.is_active ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                  {form.is_active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {editing ? 'Salvar' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUses !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">Usos do Cupom</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedUses.length} uso(s)</p>
              </div>
              <button onClick={() => setSelectedUses(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {loadingUses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            ) : selectedUses.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Nenhum uso registrado</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {selectedUses.map((use) => (
                  <div key={use.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{use.user_name || `#${use.user_id}`}</p>
                      <p className="text-[10px] text-slate-400">{use.user_email || ''}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {use.created_at ? new Date(use.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setSelectedUses(null)} className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
