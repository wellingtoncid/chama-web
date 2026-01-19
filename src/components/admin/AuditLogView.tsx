import React, { useEffect, useState } from 'react';
import { api } from '../../api'; // Verifique se seu axios instance está aqui
import { Shield, Clock, User } from 'lucide-react';

// 1. Definição da Interface (Obrigatório para o TS entender o que vem do banco)
interface AuditLog {
  id: number;
  user_name: string;
  description: string;
  entity_type?: string;
  entity_id?: number;
  created_at: string;
}

export default function AuditLogsView() {
  // 2. Inicialização correta do estado com o Tipo definido
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 3. Tipagem da resposta do Axios para evitar o erro de atribuição
        const response = await api.get<AuditLog[]>('admin-audit-logs');
        
        // No Axios, os dados reais ficam em .data
        // Usamos uma verificação de segurança caso sua API retorne o array direto ou dentro de .data
        const data = Array.isArray(response) ? response : response.data;
        
        setLogs(data || []);
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400 animate-pulse">CARREGANDO RASTROS...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase text-slate-900 leading-none">Auditoria do Sistema</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Histórico de integridade e ações administrativas</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-[10px] font-black uppercase text-slate-400 italic">Usuário Responsável</th>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400 italic">Ação Executada</th>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400 italic text-right">Data e Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <User size={14} />
                    </div>
                    <span className="font-black text-xs uppercase italic text-slate-700">{log.user_name}</span>
                  </div>
                </td>
                <td className="p-5">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{log.description}</p>
                  {log.entity_type && (
                    <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                      {log.entity_type} #{log.entity_id}
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400 font-bold text-[10px]">
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="p-20 text-center text-slate-400 font-black italic uppercase text-xs">
                  Nenhum registro encontrado no histórico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}