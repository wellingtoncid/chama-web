import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Download, Search, ChevronLeft, ChevronRight,
  X, Send, User, DollarSign, GripVertical,
  TrendingUp, TrendingDown, Target, Edit
} from 'lucide-react';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';
import { api } from '../../api/api';

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
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

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
      const res = await api.get('internal-users');
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
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'kanban' | 'list')}
            className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="list">Lista</option>
            <option value="kanban">Kanban</option>
          </select>
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
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos os Estágios ({filteredLeads.length})</option>
          {PIPELINE_STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.label} ({pipelineLeads[s.id]?.length || 0})</option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setShowCustomDate(e.target.value === 'custom'); }}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos os Períodos</option>
          <option value="today">Hoje</option>
          <option value="week">Últimos 7 dias</option>
          <option value="month">Últimos 30 dias</option>
          <option value="lastmonth">Mês Passado</option>
          <option value="custom">Personalizado</option>
        </select>
        {showCustomDate && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <input type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg text-sm"/>
            <span className="text-slate-400">até</span>
            <input type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg text-sm"/>
          </div>
        )}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Buscar lead..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
      </div>

      {/* KANBAN */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.filter(s => stageFilter === 'all' || s.id === stageFilter).map(stage => (
            <div key={stage.id} className="flex-shrink-0 w-56"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-indigo-50/50', 'dark:bg-indigo-900/10'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-900/10'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-900/10');
                if (draggedLeadId) { updateLeadStage(draggedLeadId, stage.id); setDraggedLeadId(null); }
              }}
            >
              <div className={`p-2.5 rounded-t-2xl border-b-2 ${stage.color.replace('bg-','border-')}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">{stage.label}</span>
                  <span className="text-xs font-black bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{pipelineLeads[stage.id]?.length || 0}</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                {pipelineLeads[stage.id]?.map(l => (
                  <div key={l.id}
                    className={`bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm transition-all ${draggedLeadId === l.id ? 'opacity-50' : 'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500'}`}
                  >
                    <div className="flex items-start gap-1.5 p-2.5">
                      <button
                        draggable
                        onDragStart={(e) => { setDraggedLeadId(l.id); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => setDraggedLeadId(null)}
                        className="mt-0.5 p-0.5 rounded cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:hover:text-slate-300"
                      >
                        <GripVertical size={14} />
                      </button>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openLeadDetail(l)}>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                            <span className="text-slate-400 font-mono">#{l.id}</span> {l.title || '-'}
                          </h4>
                          {(l.score || 0) >= 80 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="Quente" />}
                          {(l.score || 0) >= 50 && (l.score || 0) < 80 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" title="Morno" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{l.contact_info || '-'}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {l.deal_value > 0 && <span className="text-xs font-bold text-emerald-600">{formatCurrency(l.deal_value)}</span>}
                          {l.score > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreInfo(l.score).color} ${getScoreInfo(l.score).text}`}>{l.score}</span>}
                          {l.assigned_to && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 ml-auto">
                              <User size={10} /> {getSellerName(l.assigned_to)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredLeads.length)} de {filteredLeads.length}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRight size={16} /></button>
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
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col" style={{maxHeight: '300px'}}>
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Histórico ({leadNotes.length})</p>
                {loadingNotes ? <div className="text-center py-4"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : leadNotes.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {leadNotes.map((n, i) => (
                      <div key={n.id || i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <div><p className="text-[10px] text-slate-400">{formatDateTime(n.created_at)}</p><p className="text-sm text-slate-700 dark:text-slate-200">{n.content || n.note}</p></div>
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