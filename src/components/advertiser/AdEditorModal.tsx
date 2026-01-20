import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Type, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/api';

interface AdEditorProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdEditorModal({ userId, onClose, onSuccess }: AdEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination_url: '',
    image: null as File | null
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.title) return alert("Preencha o título e selecione uma imagem.");

    setLoading(true);
    try {
      // Usamos FormData para envio de arquivo
      const data = new FormData();
      data.append('user_id', userId.toString());
      data.append('title', formData.title);
      data.append('destination_url', formData.destination_url);
      data.append('image', formData.image);

      await api.post('?endpoint=create-ad', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Anúncio enviado para aprovação!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar anúncio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Novo Banner</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Configure sua campanha publicitária</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Preview do Upload */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className={`h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all ${preview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 group-hover:border-orange-500'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-[1.8rem] p-2" />
              ) : (
                <>
                  <ImageIcon className="text-slate-300 mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Clique para subir o Banner</p>
                  <p className="text-[8px] text-slate-400 mt-1">Sugestão: 728x90 (Horizontal) ou 300x250 (Lateral)</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block">Título do Anúncio (Interno)</label>
              <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3">
                <Type className="text-slate-400 mr-3" size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: Promoção Pneus Sul"
                  className="bg-transparent w-full outline-none text-sm font-bold text-slate-700"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block">Link de Destino (URL ou WhatsApp)</label>
              <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3">
                <LinkIcon className="text-slate-400 mr-3" size={18} />
                <input 
                  type="url" 
                  placeholder="https://wa.me/..."
                  className="bg-transparent w-full outline-none text-sm font-bold text-slate-700"
                  value={formData.destination_url}
                  onChange={e => setFormData({...formData, destination_url: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Finalizar e Enviar para Análise
          </button>
        </form>
      </div>
    </div>
  );
}