import { Crown, Star, Heart, Check, Lock } from 'lucide-react';
import { AD_POSITION_LABEL } from '@/constants/adPositions';

interface Props {
  activePlan: any;
  includedPositions: string[];
  positionLimits: Record<string, number>;
  periodStart: string | null;
  myAds: any[];
}

const TIER_MAP: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  sponsor_master: { icon: <Crown size={16} />, label: 'Oferecimento Master', color: 'text-yellow-600 dark:text-yellow-400' },
  maintainer_premium: { icon: <Star size={16} />, label: 'Mantenedor Premium', color: 'text-blue-600 dark:text-blue-400' },
  supporter_connect: { icon: <Heart size={16} />, label: 'Apoiador Connect', color: 'text-rose-600 dark:text-rose-400' },
};

export default function AdvertiserPlanCard({ activePlan, includedPositions, positionLimits, periodStart, myAds }: Props) {
  if (!activePlan) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
              <Check size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                Plano: {activePlan.name}
              </h3>
              {(() => {
                const tier = TIER_MAP[activePlan.advertiser_tier as string];
                return tier ? (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${tier.color}`}>
                    {tier.icon} {tier.label}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            R$ {Number(activePlan.price).toFixed(2).replace('.', ',')}/mês
          </span>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Posições incluídas no seu plano:</p>
          <div className="flex flex-wrap gap-2">
            {includedPositions.map(pos => {
              const used = myAds.filter((a: any) =>
                a.position === pos &&
                (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
              ).length;
              const limit = positionLimits[pos] || 1;
              const full = used >= limit;
              return (
                <span key={pos} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  full
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {full ? <Lock size={10} /> : <Check size={10} />}
                  {AD_POSITION_LABEL[pos] || pos}
                  <span className="opacity-70">{used}/{limit}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
