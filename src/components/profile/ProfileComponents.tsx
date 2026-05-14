import { memo, useCallback } from 'react';
import { Eye, MessageCircle, Truck, Building2, Megaphone, Calendar, AlertCircle, ShieldCheck, Share2, X, Check } from 'lucide-react';
import type { ProfileTheme } from './ProfileTheme';
import Header from '@/components/shared/Header';
import { useCountUp } from '@/hooks/useCountUp';

const iconMap: Record<string, React.ReactNode> = {
  Eye: <Eye size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Truck: <Truck size={20} />,
  Building2: <Building2 size={20} />,
  Megaphone: <Megaphone size={20} />,
  Calendar: <Calendar size={20} />,
};

export const StatCard = memo(function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const { count, ref } = useCountUp(value, 1200, value > 0);

  return (
    <div
      ref={ref}
      className="group bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="text-slate-400 dark:text-slate-500 mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
        {iconMap[icon] || <Eye size={20} />}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
        {value > 0 ? count.toLocaleString('pt-BR') : '---'}
      </p>
      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
});

export const ProfileInfoItem = memo(function ProfileInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
      <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
      <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase italic truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
});

export const VehicleProfileBadge = memo(function VehicleProfileBadge({
  vehicleType,
  bodyType,
  avatarUrl,
  theme,
}: {
  vehicleType?: string;
  bodyType?: string;
  avatarUrl?: string;
  theme: ProfileTheme;
}) {
  const vType = vehicleType || 'Não informado';

  return (
    <div className={`w-44 h-44 md:w-52 md:h-52 ${theme.bg} rounded-[3rem] p-1.5 shadow-2xl`}>
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden flex flex-col items-center justify-center p-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
              <Truck size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase text-center leading-tight line-clamp-2">
              {vType}
            </p>
            {bodyType && (
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-full">{bodyType}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export function GradientAvatar({
  name,
  avatarUrl,
  size = 'lg',
}: {
  name?: string;
  avatarUrl?: string;
  size?: 'sm' | 'lg';
}) {
  const sizeClasses = size === 'lg'
    ? 'w-44 h-44 md:w-52 md:h-52 text-5xl md:text-6xl'
    : 'w-20 h-20 text-2xl';

  const initials = (name || 'U')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className={`${sizeClasses} rounded-[3rem] p-1.5 shadow-2xl`}>
      {avatarUrl ? (
        <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden">
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 rounded-[2.8rem] flex items-center justify-center">
          <span className="font-black text-white/90 tracking-tight">{initials}</span>
        </div>
      )}
    </div>
  );
}

export function ProfileLoadingState({ message = 'Carregando perfil...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin" />
        <Truck className="absolute inset-0 m-auto text-slate-300 dark:text-slate-600" size={30} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-8">{message}</p>
    </div>
  );
}

export function ProfileNotFoundState() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex-grow flex items-center justify-center p-10">
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center shadow-2xl max-w-md border border-slate-200 dark:border-slate-800">
          <AlertCircle size={80} className="text-red-100 dark:text-red-900/30 mx-auto mb-6" />
          <h1 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">Perfil Indisponível</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium italic">
            Este perfil não existe ou foi removido da plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}

export const IdentityBadge = memo(function IdentityBadge() {
  return (
    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
      <ShieldCheck size={24} />
    </div>
  );
});

export function ShareProfileButton({ url, title }: { url: string; title: string }) {
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Chama Frete - ${title}`, url });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        const btn = document.activeElement as HTMLElement;
        const original = btn?.innerHTML;
        if (btn) {
          btn.innerHTML = '<div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Link copiado!</div>';
          setTimeout(() => { if (btn) btn.innerHTML = original || ''; }, 2000);
        }
      } catch {
        // fallback
      }
    }
  }, [url, title]);

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-xl"
      title="Compartilhar perfil"
    >
      <Share2 size={24} />
    </button>
  );
}
