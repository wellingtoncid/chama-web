import { useState, useEffect, useRef } from "react";
import { api, BASE_URL_API } from "../../api/api";
import { Crown, Star, Heart, Loader2 } from "lucide-react";

const TIER_CONFIG: Record<string, { label: string; icon: typeof Crown; color: string; avatarSize: string; cardPad: string; nameSize: string; speed: string }> = {
  sponsor_master: {
    label: "Oferecimento Master",
    icon: Crown,
    color: "text-amber-500",
    avatarSize: "w-16 h-16",
    cardPad: "px-6 py-5",
    nameSize: "text-sm",
    speed: "40s",
  },
  maintainer_premium: {
    label: "Mantenedor Premium",
    icon: Star,
    color: "text-blue-500",
    avatarSize: "w-14 h-14",
    cardPad: "px-5 py-4",
    nameSize: "text-xs",
    speed: "30s",
  },
  supporter_connect: {
    label: "Apoiador Connect",
    icon: Heart,
    color: "text-emerald-500",
    avatarSize: "w-12 h-12",
    cardPad: "px-4 py-3",
    nameSize: "text-xs",
    speed: "25s",
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
  return `${BASE_URL_API}/${clean}`;
};

function AdvertiserCard({ ad, config }: { ad: Advertiser; config: typeof TIER_CONFIG[string] }) {
  return (
    <a
      href={`/perfil/${ad.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col items-center gap-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${config.cardPad} hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group shrink-0`}
    >
      {ad.avatar ? (
        <img
          src={getAvatarUrl(ad.avatar)}
          alt={ad.name}
          className={`${config.avatarSize} rounded-full object-cover flex-shrink-0`}
        />
      ) : (
        <div className={`${config.avatarSize} rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg font-black text-slate-500 dark:text-slate-400">
            {getInitials(ad.name)}
          </span>
        </div>
      )}
      <span className={`${config.nameSize} font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center leading-tight`}>
        {ad.name}
      </span>
    </a>
  );
}

function MarqueeTrack({ advertisers, config }: { advertisers: Advertiser[]; config: typeof TIER_CONFIG[string] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const check = () => {
      setShouldScroll(el.scrollWidth > el.clientWidth + 20);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [advertisers]);

  if (!shouldScroll) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {advertisers.map((ad) => (
          <AdvertiserCard key={ad.user_id} ad={ad} config={config} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-4"
        style={{
          animation: `marquee-scroll ${config.speed} linear infinite`,
          animationPlayState: "running",
          width: "fit-content",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {[...advertisers, ...advertisers].map((ad, i) => (
          <AdvertiserCard key={`${ad.user_id}-${i}`} ad={ad} config={config} />
        ))}
      </div>
    </div>
  );
}

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
        //
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
              </div>
              <MarqueeTrack advertisers={advertisers} config={config} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
