import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { BarChart3, TrendingUp, MousePointer2, Eye } from 'lucide-react';

export default function AdvertiserReports({ userId }: { userId: number }) {
  const [stats, setStats] = useState({ views: 0, clicks: 0, ctr: "0" });

  useEffect(() => {
    api.get(`/ads?user_id=${userId}`).then(res => {
      const data = res.data || [];
      const totalViews = data.reduce((acc: number, ad: any) => acc + Number(ad.views_count || 0), 0);
      const totalClicks = data.reduce((acc: number, ad: any) => acc + Number(ad.clicks_count || 0), 0);
      setStats({
        views: totalViews,
        clicks: totalClicks,
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00"
      });
    });
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <Eye className="text-slate-300 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Alcance</p>
          <p className="text-3xl font-black text-slate-800 italic">{stats.views.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <MousePointer2 className="text-orange-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interações (Cliques)</p>
          <p className="text-3xl font-black text-slate-800 italic">{stats.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <TrendingUp className="text-emerald-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Conversão</p>
          <p className="text-3xl font-black text-emerald-600 italic">{stats.ctr}%</p>
        </div>
      </div>
    </div>
  );
}