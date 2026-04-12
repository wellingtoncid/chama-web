import React from 'react';
import { Truck, ChevronRight, MapPin, Package, Calendar, ShieldCheck } from 'lucide-react';

interface FreightRowProps {
  data: any;
  onClick?: () => void;
  showDate?: boolean;
}

export default function FreightRow({ data, onClick, showDate = true }: FreightRowProps) {
  // Normalização de campos para evitar erros de undefined
  const origin = data.origin_city || 'Origem não informada';
  const dest = data.dest_city || 'Destino não informado';
  const product = data.product || 'Carga geral';
  const vehicle = data.vehicle_type || data.vehicleType || 'Qualquer';

  // Verificar se driver/empresa está verificado
  const isVerified = data.user_is_verified == 1 || (data.verified_until && new Date(data.verified_until) > new Date());

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900/30 transition-all cursor-pointer border-l-4 border-l-orange-500"
    >
      {/* Ícone de Categoria */}
      <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-xl text-orange-600 shrink-0">
        <Truck size={20} />
      </div>

      {/* Info Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase truncate">
            {origin} <span className="text-orange-500 mx-1">→</span> {dest}
          </h4>
          {isVerified && (
            <span title="Verificado" className="shrink-0">
              <ShieldCheck size={14} className="text-emerald-500" fill="currentColor" />
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Package size={12} className="text-slate-300" /> {product}
          </span>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
            {vehicle}
          </span>
          {showDate && data.created_at && (
            <span className="text-[10px] font-medium text-slate-300 flex items-center gap-1">
              <Calendar size={12} /> {new Date(data.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Ação */}
      <div className="flex items-center gap-2">
        {data.value > 0 && (
          <span className="hidden md:block text-xs font-black text-slate-700 dark:text-slate-200 mr-2">
            R$ {data.value}
          </span>
        )}
        <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}