import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import {
  LayoutGrid, ChevronDown, ChevronUp,
  Truck, ShoppingBag, FileText, Megaphone,
  MessageCircle, CreditCard, Tag, HelpCircle, Users, Shield, Eye, Check
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

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Módulos do Sistema
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Visualize os módulos disponíveis e seus cargos com acesso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const isExpanded = expandedModule === module.id;
          const rolesCount = module.roles_with_access.length;

          return (
            <div
              key={module.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {MODULE_ICONS[module.module_key] || <LayoutGrid size={24} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {module.is_required === 1 && (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                        Obrigatório
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {module.label}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {module.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {module.roles_with_access.slice(0, 3).map((role) => (
                    <span
                      key={role.id}
                      className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded flex items-center gap-1"
                    >
                      {role.access === 'full' ? (
                        <Check size={10} className="text-green-600" />
                      ) : (
                        <Eye size={10} className="text-slate-400" />
                      )}
                      {role.name}
                    </span>
                  ))}
                  {rolesCount > 3 && (
                    <span className="text-xs px-2 py-0.5 text-slate-400">
                      +{rolesCount - 3}
                    </span>
                  )}
                  {rolesCount === 0 && (
                    <span className="text-xs text-slate-400">Nenhum acesso</span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    Permissões do Módulo
                  </h4>
                  {module.permissions && module.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {module.permissions.map((perm) => (
                        <span
                          key={perm.id}
                          className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                          title={perm.slug}
                        >
                          {perm.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Nenhuma permissão definida
                    </p>
                  )}

                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    Cargos com Acesso
                  </h4>
                  <div className="space-y-2">
                    {module.roles_with_access.map((role) => (
                      <div
                        key={role.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          role.access === 'full'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {role.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            role.type === 'internal'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {role.type === 'internal' ? 'Interno' : 'Externo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {role.access === 'full' ? (
                            <>
                              <Check size={14} className="text-green-600" />
                              <span className="text-xs text-green-600">Completo</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} className="text-slate-400" />
                              <span className="text-xs text-slate-500">Leitura</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {module.roles_with_access.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                        Nenhum cargo tem acesso a este módulo
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {module.is_required === 1 ? 'Módulo obrigatório' : 'Módulo opcional'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {rolesCount} cargo(s) com acesso
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
