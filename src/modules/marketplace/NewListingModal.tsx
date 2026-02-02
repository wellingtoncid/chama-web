import React, { useState } from 'react';
import { X, Camera, Loader2, Tag, DollarSign, MapPin } from 'lucide-react';
import { api } from '../../api/api';

export default function NewListingModal({ isOpen, onClose, user, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('user_id', user.id);
    if (image) formData.append('image', image);

    try {
      await api.post('?endpoint=create-listing', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Anúncio publicado com sucesso!");
      onRefresh();
      onClose();
    } catch (error) {
      alert("Erro ao publicar anúncio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter text-slate-800">Anunciar Novo Item</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marketplace Ecossistema</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload de Imagem Simples */}
            <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Foto Principal</label>
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-emerald-500 transition-all cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Camera className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">{image ? image.name : "Clique para selecionar foto"}</p>
                </div>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Título do Anúncio</label>
              <input name="title" required placeholder="Ex: Caminhão Scania R440 ou Pneu Usado" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-emerald-500/20 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Categoria</label>
              <select name="category" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold appearance-none">
                <option value="veiculos">Veículos</option>
                <option value="pecas">Peças</option>
                <option value="servicos">Serviços</option>
                <option value="acessorios">Acessórios</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Preço (R$)</label>
              <input name="price" type="number" step="0.01" required placeholder="0,00" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Condição</label>
                <div className="flex gap-2">
                    <label className="flex-1">
                        <input type="radio" name="item_condition" value="novo" className="hidden peer" />
                        <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-[10px] peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 text-slate-400 cursor-pointer">Novo</div>
                    </label>
                    <label className="flex-1">
                        <input type="radio" name="item_condition" value="usado" defaultChecked className="hidden peer" />
                        <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-[10px] peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 text-slate-400 cursor-pointer">Usado</div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input name="location_city" placeholder="Cidade" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-xs" />
                <input name="location_state" maxLength={2} placeholder="UF" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
            {loading ? <Loader2 className="animate-spin" /> : "Publicar Anúncio Agora"}
          </button>
        </form>
      </div>
    </div>
  );
}