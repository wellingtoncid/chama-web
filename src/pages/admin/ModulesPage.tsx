import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/api';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';
import {
  LayoutGrid, ChevronDown, ChevronUp,
  Truck, ShoppingBag, FileText, Megaphone,
  MessageCircle, CreditCard, Tag, HelpCircle, Users, Shield, Eye, Check, AlertCircle, Loader2, Key, ChevronLeft, ChevronRight
} from 'lucide-react';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  fretes: <Truck size={20} />,
  marketplace: <ShoppingBag size={20} />,
  cotacoes: <FileText size={20} />,
  publicidade: <Megaphone size={20} />,
  chat: <MessageCircle size={20} />,
  financeiro: <CreditCard size={20} />,
  planos: <Tag size={20} />,
  suporte: <HelpCircle size={20} />,
  grupos: <Users size={20} />,
};

interface Permission {
  id: number;
  slug: string;
  label: string;
}

interface Module {
  id: number;
  module_key: string;
  label: string;
  description: string;
  icon: string | null;
  permission_prefix: string | null;
  is_required: number;
  sort_order: number;
  permissions: Permission[];
  roles_with_access: {
    id: number;
    name: string;
    slug: string;
    type: string;
    access: string;
  }[];
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/admin-modules');

      if (res.data?.success) {
        setModules(res.data.data || []);
      } else {
        setError(res.data?.message || 'Erro ao carregar dados');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: modules.length,
    required: modules.filter(m => m.is_required === 1).length,
    optional: modules.filter(m => m.is_required === 0).length,
    totalRoles: new Set(modules.flatMap(m => m.roles_with_access.map(r => r.id))).size,
  };

  const totalPages = Math.ceil(modules.length / pageSize);
  const paginatedModules = useMemo(() => {
    return modules.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [modules, currentPage, pageSize]);

  if (error) {
    return (
      <PageShell title="Módulos do Sistema" description="Visualize os módulos disponíveis e seus cargos com acesso">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-6">
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold hover:underline">
            Tentar novamente
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Módulos do Sistema"
      description="Visualize os módulos disponíveis e seus cargos com acesso"
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={LayoutGrid} />
          <StatCard label="Obrigatórios" value={stats.required} variant="yellow" icon={AlertCircle} />
          <StatCard label="Opcionais" value={stats.optional} variant="blue" icon={Eye} />
          <StatCard label="Cargos Envolvidos" value={stats.totalRoles} variant="purple" icon={Shield} />
        </StatsGrid>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Módulos ({modules.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Módulo</th>
                <th className="px-5 py-4">Cargos com Acesso</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : paginatedModules.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center"><LayoutGrid size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhum módulo encontrado</p></td></tr>
              ) : paginatedModules.map((module) => {
                const isExpanded = expandedModule === module.id;
                const rolesCount = module.roles_with_access.length;

                return (
                  <>
                    <tr key={module.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                            {MODULE_ICONS[module.module_key] || <LayoutGrid size={24} />}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-slate-800 dark:text-white text-sm uppercase italic">{module.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{module.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {module.roles_with_access.slice(0, 4).map((role) => (
                            <span key={role.id} className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 flex items-center gap-1">
                              {role.access === 'full' ? <Check size={10} className="text-green-500" /> : <Eye size={10} />}
                              {role.name}
                            </span>
                          ))}
                          {rolesCount > 4 && (
                            <span className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 font-bold">+{rolesCount - 4}</span>
                          )}
                          {rolesCount === 0 && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Nenhum acesso</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {module.is_required === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <AlertCircle size={10} /> Obrigatório
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Opcional
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                          className="py-2 px-4 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1 ml-auto"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpanded ? 'Fechar' : 'Detalhes'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${module.id}`}>
                        <td colSpan={4} className="px-5 py-6 bg-slate-50 dark:bg-slate-900/50">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Permissões do Módulo ({module.permissions?.length || 0})</p>
                              {module.permissions && module.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {module.permissions.map((perm) => (
                                    <span key={perm.id} className="text-[10px] px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-bold flex items-center gap-1">
                                      <Key size={10} /> {perm.label}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm font-bold text-slate-400">Nenhuma permissão definida</p>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Cargos com Acesso ({rolesCount})</p>
                              <div className="space-y-2">
                                {module.roles_with_access.map((role) => (
                                  <div key={role.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                                    role.access === 'full'
                                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <Shield size={14} className="text-slate-500 dark:text-slate-400" />
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{role.name}</span>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                        role.type === 'internal' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                      }`}>
                                        {role.type === 'internal' ? 'Interno' : 'Externo'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {role.access === 'full' ? (
                                        <>
                                          <Check size={12} className="text-emerald-500" />
                                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Completo</span>
                                        </>
                                      ) : (
                                        <>
                                          <Eye size={12} className="text-slate-400" />
                                          <span className="text-[10px] font-bold text-slate-400">Leitura</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {module.roles_with_access.length === 0 && (
                                  <p className="text-sm font-bold text-slate-400 text-center py-4">Nenhum cargo tem acesso a este módulo</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, modules.length)} de {modules.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
