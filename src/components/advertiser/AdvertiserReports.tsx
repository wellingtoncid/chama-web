import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { BarChart3, TrendingUp, MousePointer2, Eye, Calendar } from 'lucide-react';

export default function AdvertiserReports({ userId }: { userId: number }) {
  const [stats, setStats] = useState({ views: 0, clicks: 0, ctr: "0", ads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/my-ads`).then(res => {
      const ads = res.data?.data || [];
      const totalViews = ads.reduce((acc: number, ad: any) => acc + Number(ad.views_count || 0), 0);
      const totalClicks = ads.reduce((acc: number, ad: any) => acc + Number(ad.clicks_count || 0), 0);
      setStats({
        views: totalViews,
        clicks: totalClicks,
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00",
        ads: ads.length
      });
    }).catch(() => {
      setStats({ views: 0, clicks: 0, ctr: "0", ads: 0 });
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="text-blue-500" size={20} />
            <span className="text-[10px] font-black text-slate-400 uppercase">Visualizações</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.views.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <MousePointer2 className="text-orange-500" size={20} />
            <span className="text-[10px] font-black text-slate-400 uppercase">Cliques</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-slate-400 uppercase">Taxa de Clique</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.ctr}%</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-purple-500" size={20} />
            <span className="text-[10px] font-black text-slate-400 uppercase">Anúncios Ativos</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.ads}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem]">
        <p className="text-sm text-blue-800 font-medium">
          As estatísticas são atualizadas automaticamente quando usuários visualizam ou clicam nos seus anúncios.
        </p>
      </div>
    </div>
  );
}