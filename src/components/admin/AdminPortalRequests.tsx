import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { 
  Users, Flame, Download, Search, Filter, ChevronLeft, ChevronRight,
  Trash2, X, Clock, Check, Phone, Mail, Calendar,
    Send, User, Edit3, DollarSign,
  TrendingUp, TrendingDown, Target, Kanban, List,
  Edit
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'new', label: 'Novo', color: 'bg-slate-100 border-slate-300' },
  { id: 'contacted', label: 'Contatado', color: 'bg-blue-100 border-blue-300' },
  { id: 'qualification', label: 'Qualificação', color: 'bg-purple-100 border-purple-300' },
  { id: 'proposal', label: 'Proposta', color: 'bg-amber-100 border-amber-300' },
  { id: 'won', label: 'Ganho', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-100 border-red-300' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const formatDateTime = (date: string) => new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const getScoreInfo = (score: number) => {
  if (score >= 80) return { label: 'Quente', color: 'bg-red-500', text: 'text-white' };
  if (score >= 50) return { label: 'Morno', color: 'bg-orange-500', text: 'text-white' };
  return { label: 'Frio', color: 'bg-blue-500', text: 'text-white' };
};

export default function AdminPortalRequests() {
  const [leads, setLeads] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadNotes, setLeadNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Helper to find seller name safely
  const getSellerName = (id: number) => {
    if (!Array.isArray(sellers) || !id) return '-';
    const seller = sellers.find((u: any) => u.id === id);
    return seller?.name || '-';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('admin-portal-requests');
      setLeads(res.data?.data || []);
    } catch { console.error("Erro"); } 
    finally { setLoading(false); }
  };

  const fetchSellers = async () => {
    try {
      const res = await api.get('admin-team');
      const data = res.data?.data || [];
      setSellers(Array.isArray(data) ? data : []);
    } catch { setSellers([]); }
  };

  const fetchLeadNotes = async (id: number) => {
    setLoadingNotes(true);
    try {
      const res = await api.get(`admin-lead-history?id=${id}`);
      setLeadNotes(res.data?.data || []);
    } catch { setLeadNotes([]); }
    finally { setLoadingNotes(false); }
  };

  useEffect(() => { fetchData(); fetchSellers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [stageFilter, searchTerm, dateFilter]);

  const getDateRange = () => {
    if (dateFilter === 'all') return { s: null, e: null };
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const m = new Date(now.getFullYear(), now.getMonth(), 1);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const elm = new Date(now.getFullYear(), now.getMonth(), 0);
    switch (dateFilter) {
      case 'today': return { s: t, e: now };
      case 'week': return { s: new Date(t.getTime() - 7 * 864e5), e: now };
      case 'month': return { s: m, e: now };
      case 'lastmonth': return { s: lm, e: elm };
      case 'custom': return { s: customDateStart ? new Date(customDateStart) : null, e: customDateEnd ? new Date(customDateEnd + 'T23:59:59') : null };
    }
    return { s: null, e: null };
  };

  const filteredLeads = useMemo(() => {
    const { s, e } = getDateRange();
    return leads.filter(l => {
      if (s || e) { const d = new Date(l.created_at); if (s && d < s) return false; if (e && d > e) return false; }
      if (stageFilter !== 'all' && l.pipeline_stage !== stageFilter) return false;
      if (searchTerm) { const t = searchTerm.toLowerCase(); if (!l.title?.toLowerCase().includes(t) && !l.contact_info?.includes(t)) return false; }
      return true;
    });
  }, [leads, stageFilter, searchTerm, dateFilter, customDateStart, customDateEnd]);

  const pipelineLeads = useMemo(() => {
    const p: Record<string, any[]> = {};
    PIPELINE_STAGES.forEach(s => p[s.id] = []);
    filteredLeads.forEach(l => { const st = l.pipeline_stage || 'new'; if (p[st]) p[st].push(l); });
    return p;
  }, [filteredLeads]);

  const stats = useMemo(() => ({
    total: filteredLeads.length,
    won: filteredLeads.filter(l => l.pipeline_stage === 'won').length,
    lost: filteredLeads.filter(l => l.pipeline_stage === 'lost').length,
    value: filteredLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0),
    hot: filteredLeads.filter(l => (l.score || 0) >= 50).length,
  }), [filteredLeads]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize);

  const openLeadDetail = (l: any) => { setSelectedLead(l); fetchLeadNotes(l.id); };

  const updateLeadStage = async (id: number, stage: string) => {
    try {
      await api.post('admin-update-lead', { id, pipeline_stage: stage });
      setLeads(prev => prev.map(x => x.id === id ? { ...x, pipeline_stage: stage } : x));
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, pipeline_stage: stage }));
    } catch { alert("Erro ao mover"); }
  };

  const updateLeadField = async (field: string, value: any) => {
    if (!selectedLead) return;
    try {
      await api.post('admin-update-lead', { id: selectedLead.id, [field]: value });
      setLeads(prev => prev.map(x => x.id === selectedLead.id ? { ...x, [field]: value } : x));
      setSelectedLead(prev => ({ ...prev, [field]: value }));
    } catch { alert("Erro ao atualizar"); }
  };

  const saveNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setSavingNote(true);
    try {
      await api.post('admin-update-lead', { id: selectedLead.id, new_note: newNote.trim() });
      setNewNote(''); await fetchLeadNotes(selectedLead.id); await fetchData();
    } catch { alert("Erro"); }
    finally { setSavingNote(false); }
  };

  const exportCSV = () => {
    if (!filteredLeads.length) return;
    const csv = [['Data', 'Empresa', 'Contato', 'Estágio', 'Valor', 'Score'], ...filteredLeads.map(l => [formatDate(l.created_at), l.title, l.contact_info, l.pipeline_stage || 'new', l.deal_value, l.score])].map(r => r.join(';')).join('\n');
    const b = new Blob(['\ufeff' + csv], { type: 'text/csv' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = `crm_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-400">Carregando...</div>;

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">CRM Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de leads e negociações</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><Kanban size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><List size={18} /></button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 text-xs font-bold uppercase bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700"><Download size={16} /> Exportar</button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl"><Users size={20} className="text-blue-500" /></div>
            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total Leads</p><p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl"><TrendingUp size={20} className="text-emerald-500" /></div>
            <div><p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">Ganhos</p><p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{stats.won}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl"><TrendingDown size={20} className="text-red-500" /></div>
            <div><p className="text-xs text-red-700 dark:text-red-400 font-bold uppercase">Perdidos</p><p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{stats.lost}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl"><Target size={20} className="text-amber-500" /></div>
            <div><p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Quentes</p><p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{stats.hot}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl"><DollarSign size={20} className="text-indigo-500" /></div>
            <div><p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase">Valor Total</p><p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.value)}</p></div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {PIPELINE_STAGES.map(s => (
            <button key={s.id} onClick={() => setStageFilter(s.id)} className={`px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all ${stageFilter === s.id ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              {s.label} ({pipelineLeads[s.id]?.length || 0})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {[{k:'all',l:'Todos'},{k:'today',l:'Hoje'},{k:'week',l:'7D'},{k:'month',l:'30D'},{k:'custom',l:'Custom'}].map(p => (
            <button key={p.k} onClick={() => { setDateFilter(p.k); setShowCustomDate(p.k === 'custom'); }} className={`px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${dateFilter === p.k ? 'bg-slate-800 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'}`}>
              <Filter size={12} /> {p.l}
            </button>
          ))}
        </div>
        {showCustomDate && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <input type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm"/>
            <span className="text-slate-400">até</span>
            <input type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm"/>
          </div>
        )}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Buscar lead..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"/>
        </div>
      </div>

      {/* KANBAN */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.filter(s => stageFilter === 'all' || s.id === stageFilter).map(stage => (
            <div key={stage.id} className="flex-shrink-0 w-64">
              <div className={`p-3 rounded-t-2xl border-b-2 ${stage.color.replace('bg-','border-')}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm uppercase text-slate-700">{stage.label}</span>
                  <span className="text-xs font-black bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{pipelineLeads[stage.id]?.length || 0}</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {pipelineLeads[stage.id]?.map(l => (
                  <div key={l.id} onClick={() => openLeadDetail(l)} className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">#{l.id}</span>
                        {(l.score || 0) >= 80 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Quente" />}
                        {(l.score || 0) >= 50 && (l.score || 0) < 80 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Morno" />}
                      </div>
                      <div className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${l.pipeline_stage === 'won' ? 'bg-emerald-100 text-emerald-600' : l.pipeline_stage === 'lost' ? 'bg-red-100 text-red-600' : l.pipeline_stage === 'proposal' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                        {l.pipeline_stage || 'Novo'}
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{l.title || '-'}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{l.contact_info || '-'}</p>
                    {(l.deal_value > 0 || l.score > 0) && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-600">
                        {l.deal_value > 0 && <span className="text-xs font-bold text-emerald-600">{formatCurrency(l.deal_value)}</span>}
                        {l.score > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreInfo(l.score).color} ${getScoreInfo(l.score).text}`}>{l.score}</span>}
                      </div>
                    )}
                    {l.assigned_to && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <User size={10} className="text-indigo-500" />
                        </div>
                        <span className="text-[10px] text-slate-400">{getSellerName(l.assigned_to)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Leads ({filteredLeads.length})</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mostrar</span>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
              </select>
              <span className="text-xs text-slate-500">por página</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Empresa</th>
                  <th className="px-5 py-4">Contato</th>
                  <th className="px-5 py-4">Estágio</th>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Responsável</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(() => {
                  const paged = filteredLeads.slice((currentPage-1)*pageSize, currentPage*pageSize);
                  return paged.map(l => (
                    <tr key={l.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-5 py-4 text-slate-500">{formatDate(l.created_at)}</td>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{l.title || '-'}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{l.contact_info || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${l.pipeline_stage === 'won' ? 'bg-emerald-100 text-emerald-700' : l.pipeline_stage === 'lost' ? 'bg-red-100 text-red-700' : l.pipeline_stage === 'proposal' ? 'bg-amber-100 text-amber-700' : l.pipeline_stage === 'qualification' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {l.pipeline_stage || 'Novo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-600">{l.deal_value ? formatCurrency(l.deal_value) : '-'}</td>
                      <td className="px-5 py-4">
                        {l.score > 0 ? <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreInfo(l.score).color} ${getScoreInfo(l.score).text}`}>{l.score}</span> : '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{getSellerName(l.assigned_to)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => openLeadDetail(l)} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg"><Edit size={16} className="text-indigo-500" /></button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs text-slate-500">Página {currentPage} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between z-10">
              <div><h2 className="text-lg font-black text-slate-900 dark:text-white">#{selectedLead.id}</h2></div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* STAGES */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Estágio do Pipeline</p>
                <div className="grid grid-cols-3 gap-2">
                  {PIPELINE_STAGES.map(s => (
                    <button key={s.id} onClick={() => updateLeadStage(selectedLead.id, s.id)} className={`p-2.5 rounded-xl text-xs font-bold uppercase border-2 transition-all ${selectedLead.pipeline_stage === s.id ? `${s.color} bg-white` : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              {/* INFO */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.title || '-'}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selectedLead.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500"><User size={14}/><span>{selectedLead.contact_info || '-'}</span></div>
              </div>
              {/* FIELDS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                  <label className="text-xs font-bold uppercase text-slate-500">Valor R$</label>
                  <input type="text" value={selectedLead.deal_value || ''} onChange={e => updateLeadField('deal_value', e.target.value.replace(/\D/g, ''))} className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border rounded-lg text-sm font-bold" placeholder="0"/>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                  <label className="text-xs font-bold uppercase text-slate-500">Score (0-100)</label>
                  <input type="number" value={selectedLead.score || ''} onChange={e => updateLeadField('score', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border rounded-lg text-sm" placeholder="0"/>
                </div>
              </div>
              {/* RESPONSIBLE */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                <label className="text-xs font-bold uppercase text-slate-500">Responsável</label>
                <select value={selectedLead.assigned_to || ''} onChange={e => updateLeadField('assigned_to', parseInt(e.target.value) || null)} className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border rounded-lg text-sm">
                  <option value="">Não atribuído</option>
                  {(Array.isArray(sellers) ? sellers : []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {/* NOTE */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-800 border rounded-xl text-sm" rows={3} placeholder="Nova anotação..."/>
                <button onClick={saveNote} disabled={savingNote || !newNote.trim()} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{savingNote ? 'Salvando...' : 'Salvar Anotação'}</button>
              </div>
              {/* TIMELINE */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Histórico ({leadNotes.length})</p>
                {loadingNotes ? <div className="text-center py-4"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : leadNotes.length > 0 ? (
                  <div className="space-y-3">
                    {leadNotes.map((n, i) => (
                      <div key={n.id || i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <div><p className="text-[10px] text-slate-400">{formatDateTime(n.created_at)}</p><p className="text-sm text-slate-700 dark:text-slate-200">{n.note}</p></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-4 text-slate-400 text-sm">Nenhuma anotação</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}