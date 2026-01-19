import { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import { 
  Megaphone, Eye, Upload, X, 
  Trash2, ExternalLink, Loader2, Plus, MousePointer2, Pencil, Link as LinkIcon
} from 'lucide-react';

// URL base para corrigir os links locais
const BASE_URL_API = 'http://127.0.0.1/chama-frete/api';

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Alternar entre Upload e URL
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [externalImageUrl, setExternalImageUrl] = useState(''); // Estado para URL manual
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('PROMOÇÃO');
  const [position, setPosition] = useState('sidebar');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [locationCity, setLocationCity] = useState('Brasil');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função crucial para corrigir a exibição das imagens
  const getFullImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400x200?text=Sem+Imagem';
    if (url.startsWith('http')) {
      // Se for do Unsplash ou já tiver o caminho correto, retorna direto
      if (url.includes('unsplash.com') || url.includes('chama-frete')) return url;
      // Se for o link quebrado do 127.0.0.1, insere a pasta da API
      return url.replace('http://127.0.0.1/', `${BASE_URL_API}/`);
    }
    // Se for apenas o nome do arquivo, monta o caminho completo
    return `${BASE_URL_API}/${url}`;
  };

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads');
      setAds(res.data || []);
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
      setExternalImageUrl(''); // Limpa a URL se selecionou arquivo
    }
  };

  const handleEdit = (ad: any) => {
    resetForm();
    setEditingId(ad.id);
    setTitle(ad.title);
    setLink(ad.link || '');
    setWhatsapp(ad.link_whatsapp || '');
    setDescription(ad.description || '');
    setCategory(ad.category || 'PROMOÇÃO');
    setPosition(ad.position || 'sidebar');
    setLocationCity(ad.location_city || 'Brasil');
    
    // Identifica se a imagem atual parece ser um upload ou link externo
    if (ad.image_url?.includes('uploads/')) {
        setImageMode('upload');
        setPreviewUrl(getFullImageUrl(ad.image_url));
    } else {
        setImageMode('url');
        setExternalImageUrl(ad.image_url);
        setPreviewUrl(ad.image_url);
    }
    setIsModalOpen(true);
  };

  const handleUpload = async () => {
    if (!title || !whatsapp) return alert("Preencha título e WhatsApp");
    
    setUploading(true);
    
    try {
      // Se estiver no modo upload e tiver arquivo, usa FormData
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
        // Se for URL externa ou edição sem nova foto
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
      alert("Erro ao salvar anúncio. Verifique os dados.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover este banner?")) return;
    try {
      await api.post('/manage-ads', { id, action: 'delete' });
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch (error) {
      alert("Erro ao excluir anúncio.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setLink('');
    setDescription('');
    setWhatsapp('');
    setCategory('PROMOÇÃO');
    setSelectedFile(null);
    setPreviewUrl(null);
    setExternalImageUrl('');
    setPosition('sidebar');
    setLocationCity('Brasil');
    setImageMode('upload');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic text-slate-800 leading-tight">Publicidade</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Banners e Performance</p>
          </div>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase italic shadow-lg hover:bg-orange-500 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Novo Anúncio
        </button>
      </div>

      {/* LISTA DE ANÚNCIOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Banner</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Campanha</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Cliques / Views</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : ads.map((ad: any) => (
                <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="w-24 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={getFullImageUrl(ad.image_url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase italic text-sm">{ad.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{ad.position} - {ad.location_city}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black text-slate-700">{ad.clicks_count || 0}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><MousePointer2 size={8} /> Cliques</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black text-slate-700">{ad.views_count || 0}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><Eye size={8} /> Views</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(ad)} className="p-2 bg-slate-100 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(ad.id)} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
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
              <h4 className="font-black italic uppercase text-slate-800">Gerenciar Anúncio</h4>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* SELETOR DE MODO DE IMAGEM */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <Upload size={14}/> Arquivo
                    </button>
                    <button 
                        onClick={() => setImageMode('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <LinkIcon size={14}/> URL Externa
                    </button>
                </div>

                {imageMode === 'upload' ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-4 border-dashed rounded-[2rem] p-4 flex flex-col items-center justify-center cursor-pointer h-40 relative overflow-hidden ${previewUrl ? 'border-orange-500' : 'border-slate-100'}`}
                    >
                        {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : <Upload className="text-slate-300" size={32} />}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">URL da Imagem</label>
                        <input 
                            type="text" 
                            placeholder="https://images.unsplash.com/..." 
                            value={externalImageUrl} 
                            onChange={(e) => {setExternalImageUrl(e.target.value); setPreviewUrl(e.target.value);}} 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" 
                        />
                        {previewUrl && <img src={previewUrl} className="w-full h-24 object-cover rounded-xl mt-2 border border-slate-100" />}
                    </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Onde exibir?</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs">
                    <option value="sidebar">Barra Lateral</option>
                    <option value="freight_list">Lista de Fretes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" />
                <input type="text" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" />
                <input type="text" placeholder="Link (Opcional)" value={link} onChange={(e) => setLink(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" />
                <input type="text" placeholder="Localização" value={locationCity} onChange={(e)=>setLocationCity(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" />
              </div>
            </div>

            <button 
              disabled={uploading}
              onClick={handleUpload}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs mt-8 hover:bg-orange-500 transition-all shadow-xl"
            >
              {uploading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingId ? "SALVAR ALTERAÇÕES" : "ATIVAR CAMPANHA")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}