import { useState, useEffect, useRef } from 'react';
import { api, BASE_URL_API } from '../../api'; // Importamos o BASE_URL_API centralizado
import { 
  Megaphone, Eye, Upload, X, 
  Trash2, Loader2, Plus, MousePointer2, Pencil, 
  Link as LinkIcon, Search, TrendingUp, BarChart3
} from 'lucide-react';

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados do Formulário
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('PROMOÇÃO');
  const [position, setPosition] = useState('sidebar');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [locationCity, setLocationCity] = useState('Brasil');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cálculos de Métricas
  const totalViews = ads.reduce((acc, curr) => acc + (Number(curr.views_count) || 0), 0);
  const totalClicks = ads.reduce((acc, curr) => acc + (Number(curr.clicks_count) || 0), 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  // Filtro lógico inteligente
  const filteredAds = ads.filter(ad => 
    ad.title?.toLowerCase().includes(filter.toLowerCase()) || 
    ad.location_city?.toLowerCase().includes(filter.toLowerCase()) ||
    ad.category?.toLowerCase().includes(filter.toLowerCase())
  );

  // Unificação da lógica de Imagem (idêntica ao AdImage)
  const getFullImageUrl = (path: string) => {
    if (!path || path.trim() === "") return 'https://placehold.co/800x400/f1f5f9/64748b?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    
    const baseUrl = BASE_URL_API.endsWith('/') ? BASE_URL_API.slice(0, -1) : BASE_URL_API;
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('api/')) cleanPath = cleanPath.replace('api/', '');
    
    return `${baseUrl}/${cleanPath}`;
  };

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads');
      // Garantimos que ads seja sempre um array
      setAds(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erro ao carregar anúncios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAds(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExternalImageUrl('');
    }
  };

  const handleEdit = (ad: any) => {
      resetForm();
      setEditingId(ad.id);
      setTitle(ad.title || '');
      setLink(ad.link || ''); 
      setWhatsapp(ad.link_whatsapp || '');
      setDescription(ad.description || '');
      setCategory(ad.category || 'PROMOÇÃO');
      setPosition(ad.position || 'sidebar');
      setLocationCity(ad.location_city || 'Brasil');
      
      if (ad.image_url) {
          if (ad.image_url.startsWith('http')) {
              setImageMode('url');
              setExternalImageUrl(ad.image_url);
              setPreviewUrl(ad.image_url);
          } else {
              setImageMode('upload');
              setPreviewUrl(getFullImageUrl(ad.image_url));
          }
      }
      setIsModalOpen(true);
  };

  const handleUpload = async () => {
    if (!title || !whatsapp) return alert("Preencha título e Link/WhatsApp");
    setUploading(true);
    try {
      if (imageMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (editingId) formData.append('id', editingId.toString());
        formData.append('title', title);
        formData.append('link', link);
        formData.append('category', category);
        formData.append('position', position);
        formData.append('link_whatsapp', whatsapp);
        formData.append('description', description);
        formData.append('location_city', locationCity);

        await api.post('/upload-ad', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          id: editingId,
          title, 
          link,
          image_url: imageMode === 'url' ? externalImageUrl : undefined,
          category, 
          position,
          link_whatsapp: whatsapp,
          description,
          location_city: locationCity,
          action: editingId ? 'update' : 'create'
        };
        await api.post('/manage-ads', payload);
      }
      setIsModalOpen(false);
      resetForm();
      loadAds();
    } catch (error) {
      alert("Erro ao salvar anúncio. Verifique o console.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover este anúncio definitivamente?")) return;
    try {
      await api.post('/manage-ads', { id, action: 'delete' });
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch (error) {
      alert("Erro ao excluir anúncio.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setLink(''); setDescription(''); setWhatsapp('');
    setCategory('PROMOÇÃO'); setSelectedFile(null); setPreviewUrl(null);
    setExternalImageUrl(''); setPosition('sidebar'); setLocationCity('Brasil');
    setImageMode('upload');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* MÉTRICAS GERAIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-50 italic mb-1">Visualizações</p>
            <h3 className="text-3xl font-black italic">{totalViews.toLocaleString()}</h3>
          </div>
          <Eye className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" size={80} />
        </div>

        <div className="bg-orange-500 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-50 italic mb-1">Cliques Totais</p>
            <h3 className="text-3xl font-black italic">{totalClicks.toLocaleString()}</h3>
          </div>
          <MousePointer2 className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" size={80} />
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">CTR Médio</p>
            <h3 className="text-3xl font-black italic text-slate-800">{averageCTR}%</h3>
          </div>
          <TrendingUp className="absolute -right-2 -bottom-2 text-slate-50 group-hover:scale-110 transition-transform" size={80} />
        </div>

        <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-50 italic mb-1">Ativos</p>
            <h3 className="text-3xl font-black italic">{ads.length}</h3>
          </div>
          <BarChart3 className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" size={80} />
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase italic text-slate-800 leading-tight">Publicidade</h2>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Painel de Controle</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-72 ml-0 md:ml-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar por título ou cidade..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 transition-all rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none"
            />
          </div>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase italic shadow-lg hover:bg-orange-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Novo Anúncio
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Preview</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Campanha</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Performance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : filteredAds.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center font-bold text-slate-400 uppercase italic">Nenhum anúncio encontrado</td></tr>
              ) : filteredAds.map((ad: any) => (
                <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="w-24 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={getFullImageUrl(ad.image_url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase italic text-sm">{ad.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase">{ad.position}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{ad.location_city}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800 leading-none">{ad.clicks_count || 0}</span>
                            <span className="text-[7px] font-black text-orange-500 uppercase mt-1">Cliques</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800 leading-none">{ad.views_count || 0}</span>
                            <span className="text-[7px] font-black text-blue-500 uppercase mt-1">Views</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-emerald-600 leading-none">
                              {ad.views_count > 0 ? ((ad.clicks_count / ad.views_count) * 100).toFixed(1) : 0}%
                            </span>
                            <span className="text-[7px] font-black text-slate-400 uppercase mt-1">CTR</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(ad)} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black italic uppercase text-slate-800 text-xl leading-none">Configurar Anúncio</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{editingId ? 'Editar Campanha' : 'Nova Campanha'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <Upload size={14}/> Arquivo
                    </button>
                    <button 
                        onClick={() => setImageMode('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <LinkIcon size={14}/> URL Externa
                    </button>
                </div>

                {imageMode === 'upload' ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-4 border-dashed rounded-[2.5rem] p-4 flex flex-col items-center justify-center cursor-pointer h-48 relative overflow-hidden transition-all hover:border-orange-300 ${previewUrl ? 'border-orange-500' : 'border-slate-100'}`}
                    >
                        {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : (
                          <div className="text-center">
                            <Upload className="text-slate-300 mx-auto mb-2" size={32} />
                            <p className="text-[8px] font-black text-slate-400 uppercase">Clique para selecionar</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Link da Imagem (Unsplash/Pexels)</label>
                        <input 
                            type="text" 
                            placeholder="https://..." 
                            value={externalImageUrl} 
                            onChange={(e) => {setExternalImageUrl(e.target.value); setPreviewUrl(e.target.value);}} 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500/20" 
                        />
                        {previewUrl && <img src={previewUrl} className="w-full h-24 object-cover rounded-2xl mt-2 border border-slate-100" />}
                    </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Local de Exibição</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none">
                    <option value="sidebar">Barra Lateral</option>
                    <option value="freight_list">Lista de Fretes</option>
                    <option value="home_hero">Banner Principal Home</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Título do Cliente/Campanha</label>
                  <input type="text" placeholder="Ex: Olist - Marketplace" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">WhatsApp ou Link de Destino</label>
                  <input type="text" placeholder="WhatsApp ou URL completa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Cidade (Filtro)</label>
                  <input type="text" placeholder="Ex: Curitiba ou Brasil" value={locationCity} onChange={(e)=>setLocationCity(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Descrição Curta</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none h-20 resize-none" placeholder="Texto descritivo do anúncio..." />
                </div>
              </div>
            </div>

            <button 
              disabled={uploading}
              onClick={handleUpload}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs mt-8 hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "SALVAR ALTERAÇÕES" : "PUBLICAR AGORA")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}