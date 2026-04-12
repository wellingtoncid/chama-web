import React from 'react';
import { MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { AdImage } from '../AdImage';

interface ListingCardProps {
  data: {
    id: number;
    slug: string;
    title: string;
    price: string | number;
    category: string;
    main_image?: string;
    images?: string[];
    location_city?: string;
    location_state?: string;
    is_featured?: number;
    item_condition?: string;
    seller_name?: string;
    is_affiliate?: number | boolean;
    external_url?: string;
  };
  onClick?: () => void;
  onView?: () => void;
  className?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  veiculos: 'Veículos',
  moveis: 'Móveis',
  eletronicos: 'Eletrônicos',
  roupas: 'Roupas',
  ferramentas: 'Ferramentas',
  maquinas: 'Máquinas',
  insumos: 'Insumos',
  acessorios: 'Acessórios',
  outros: 'Outros',
};

export default function ListingCard({ data, onClick, onView, className = '' }: ListingCardProps) {
  const imageUrl = data.main_image || data.images?.[0];

  // Call onView when component mounts (item enters viewport)
  React.useEffect(() => {
    if (onView) {
      onView();
    }
  }, [onView]);

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg cursor-pointer font-sans flex flex-col h-[420px] ${className}`}
    >
      {/* Imagem */}
      <div className="h-52 bg-slate-100 dark:bg-slate-700 relative overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <AdImage url={imageUrl} className="w-full h-full object-cover" alt={data.title} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}

        {data.is_featured === 1 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingUp size={10} /> DESTAQUE
          </div>
        )}

        {data.is_affiliate && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
            <ExternalLink size={10} className="inline mr-1" />MERCADO LIVRE
          </div>
        )}

        {data.item_condition && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
            {data.item_condition}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {CATEGORY_NAMES[data.category] || data.category}
          </span>
          {data.location_state && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <MapPin size={10} /> {data.location_state}
            </span>
          )}
        </div>

        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-2 flex-grow uppercase">
          {data.title}
        </h3>

        {data.seller_name && (
          <p className="text-[10px] text-slate-400 mb-2">
            por {data.seller_name}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <div>
            <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Preço</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.price))}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all">
            VER <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
