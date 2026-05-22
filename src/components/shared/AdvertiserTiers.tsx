import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { Crown, Star, Heart, Loader2 } from "lucide-react";

const TIER_CONFIG: Record<string, { label: string; icon: typeof Crown; color: string; badge: string; price: string }> = {
  sponsor_master: {
    label: "Oferecimento Master",
    icon: Crown,
    color: "text-amber-500",
    badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    price: "R$ 497/mês",
  },
  maintainer_premium: {
    label: "Mantenedor Premium",
    icon: Star,
    color: "text-blue-500",
    badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    price: "R$ 297/mês",
  },
  supporter_connect: {
    label: "Apoiador Connect",
    icon: Heart,
    color: "text-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    price: "R$ 97/mês",
  },
};

const TIER_ORDER = ["sponsor_master", "maintainer_premium", "supporter_connect"];

interface Advertiser {
  user_id: number;
  name: string;
  slug: string;
  avatar: string | null;
  plan_name: string;
  expires_at: string;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^\//, "").replace(/^api\//, "");
  return `http://127.0.0.1:8000/${clean}`;
};

export default function AdvertiserTiers() {
  const [tiers, setTiers] = useState<Record<string, Advertiser[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/advertisers/tiers");
        if (res.data?.success) {
          setTiers(res.data.data || {});
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Parceiros Oficiais</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      </div>
    );
  }

  const hasAnyAdvertisers = TIER_ORDER.some((key) => (tiers[key]?.length ?? 0) > 0);
  if (!hasAnyAdvertisers) return null;

  return (
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Parceiros Oficiais</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="space-y-6">
        {TIER_ORDER.map((tierKey) => {
          const advertisers = tiers[tierKey];
          if (!advertisers?.length) return null;

          const config = TIER_CONFIG[tierKey];
          const Icon = config.icon;

          return (
            <div key={tierKey}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={config.color} />
                <span className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  {config.label}
                </span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                  {config.price}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {advertisers.map((ad) => (
                  <a
                    key={ad.user_id}
                    href={`/perfil/${ad.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                  >
                    {ad.avatar ? (
                      <img
                        src={getAvatarUrl(ad.avatar)}
                        alt={ad.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400">
                          {getInitials(ad.name)}
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate max-w-[120px]">
                      {ad.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
