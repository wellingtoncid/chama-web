import { useEffect, useState } from 'react';
import { api } from '../../api/api';
import { 
  Clock, User, Activity, ShieldCheck, 
  Trash2, Edit3, MessageSquare, AlertCircle, RefreshCw,
  TrendingUp, Users, Package, Loader2, X, Info
} from 'lucide-react';

export default function AdminDashboardActivity() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ users: 0, freights: 0, conversion: '0%' });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null); // Estado para o Modal

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin-dashboard-data');
      if (response.data.success) {
        const { stats, recent_activities } = response.data.data;
        setLogs(recent_activities || []);
        setStats({
          users: stats.total_users || 0,
          freights: stats.active_freights || 0,
          conversion: (stats.conversion_rate || 0) + '%'
        });
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getActionStyles = (targetType: string) => {
    const types: any = {
      'USER': { icon: <User size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' },
      'FREIGHT': { icon: <Package size={16} />, color: 'text-orange-500', bg: 'bg-orange-50' },
      'LEAD': { icon: <MessageSquare size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      'SYSTEM': { icon: <ShieldCheck size={16} />, color: 'text-slate-500', bg: 'bg-slate-50' },
    };
    return types[targetType] || { icon: <Activity size={16} />, color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Usuários Totais" value={stats.users} icon={<Users className="text-blue-500" />} trend="Geral" />
        <StatCard title="Fretes Ativos" value={stats.freights} icon={<Package className="text-orange-500" />} trend="Hoje" />
        <StatCard title="Taxa de Conversão" value={stats.conversion} icon={<TrendingUp className="text-emerald-500" />} trend="Mês" />
      </div>
    
      {/* FEED DE ATIVIDADES */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 min-h-[500px] flex flex-col relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-2">
              <Clock className="text-indigo-500" /> Atividades Recentes
            </h2>
          </div>
          <button onClick={fetchData} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            logs.map((log: any, index: number) => {
              const style = getActionStyles(log.type);
              return (
                <div 
                  key={log.id || index} // RESOLVE O ERRO DE KEY
                  onClick={() => setSelectedLog(log)}
                  className="group flex gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${style.bg} ${style.color} flex items-center justify-center shadow-sm`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-indigo-600 uppercase italic">{log.user}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {log.time ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 truncate">{log.action}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${getActionStyles(selectedLog.type).bg} ${getActionStyles(selectedLog.type).color}`}>
                {getActionStyles(selectedLog.type).icon}
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase italic">Detalhes do Evento</h3>
            <p className="text-sm text-slate-600 font-bold mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              "{selectedLog.action}"
            </p>

            <div className="space-y-3">
              <DetailRow label="Responsável" value={selectedLog.user} />
              <DetailRow label="Data/Hora" value={new Date(selectedLog.time).toLocaleString()} />
              <DetailRow label="Categoria" value={selectedLog.type} />
              <DetailRow label="ID de Referência" value={`#${selectedLog.id || '---'}`} />
              <DetailRow label="Endereço IP" value={selectedLog.ip_address || 'Não registrado'} />
              <DetailRow label="Agente" value={selectedLog.userAgent || 'Desconhecido'} />
            </div>

            <button 
              onClick={() => setSelectedLog(null)}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes Auxiliares
function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 italic">{value}</h3>
        </div>
      </div>
      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{trend}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50">
      <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}