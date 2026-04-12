import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Loader2, Tag, DollarSign, MapPin, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

const MARKETPLACE_CONFIG = {
  maxImages: 5,
  maxSizeMB: 3,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  recommendedSize: '1200x800px'
};

export default function NewListingModal({ isOpen, onClose, user, onRefresh, editingItem }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setExistingImages([]);
      setImages([]);
      setErrors([]);
    }
  }, [editingItem]);

  if (!isOpen) return null;

  const validateImage = (file: File): string | null => {
    if (!MARKETPLACE_CONFIG.acceptedFormats.includes(file.type)) {
      return `Formato não suportado: ${file.name}. Use JPG, PNG ou WebP.`;
    }
    
    const maxBytes = MARKETPLACE_CONFIG.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Arquivo muito grande: ${file.name}. Máximo ${MARKETPLACE_CONFIG.maxSizeMB}MB.`;
    }
    
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > MARKETPLACE_CONFIG.maxImages) {
      setErrors([`Máximo de ${MARKETPLACE_CONFIG.maxImages} imagens permitidas.`]);
      return;
    }

    const newErrors: string[] = [];
    const validImages: File[] = [];
    
    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        newErrors.push(error);
      } else {
        validImages.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (images.length === 0 && existingImages.length === 0) {
      setErrors(['Adicione pelo menos 1 imagem.']);
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('user_id', user.id);
    
    images.forEach((img, index) => {
      formData.append(`images[${index}]`, img);
    });

    try {
      if (isEditing) {
        formData.append('id', editingItem.id);
        await api.post('/update-listing', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          title: 'Sucesso!',
          text: 'Anúncio atualizado com sucesso!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      } else {
        await api.post('/create-listing', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          title: 'Sucesso!',
          text: 'Anúncio publicado com sucesso!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
      setImages([]);
      onRefresh();
      onClose();
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 402 && data?.code === 'INSUFFICIENT_BALANCE') {
        const required = data.required || 9.90;
        const balance = data.balance || 0;
        const freeLimit = data.free_limit || 0;
        const usedFree = data.used_free || 0;
        
        Swal.fire({
          title: 'Saldo Insuficiente',
          html: `
            <div class="text-left space-y-2">
              <p>Você precisa de <strong>R$ ${required.toFixed(2).replace('.', ',')}</strong> para publicar.</p>
              <p class="text-slate-500">Saldo atual: <strong>R$ ${balance.toFixed(2).replace('.', ',')}</strong></p>
              ${freeLimit > 0 ? `<p class="text-amber-600 mt-2">Você já usou ${usedFree} de ${freeLimit} publicação(ões) grátis este mês.</p>` : ''}
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Recarregar Carteira',
          cancelButtonText: 'Pagar com Mercado Pago',
          confirmButtonColor: '#059669',
          cancelButtonColor: '#3B82F6',
          reverseButtons: true,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/dashboard/financeiro');
          } else if (result.isDismissed) {
            handleMercadoPagoPayment();
          }
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: data?.message || 'Erro ao publicar anúncio.',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoPayment = async () => {
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: 'marketplace',
        feature_key: 'publish_listing',
        payment_method: 'mercadopago'
      });
      
      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Não foi possível processar o pagamento.',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
    } catch (e: any) {
      Swal.fire({
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao processar pagamento.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm dark:bg-black/60">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter text-slate-800 dark:text-slate-100">
              {isEditing ? 'Editar Anúncio' : 'Anunciar Novo Item'}
            </h2>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Marketplace Ecossistema</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm text-slate-600 dark:text-slate-400"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Upload de Imagens */}
          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">
              Fotos ({images.length}/{MARKETPLACE_CONFIG.maxImages})
            </label>
            
            {/* Imagens Selecionadas */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[8px] font-black px-1 rounded">Capa</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Área de Upload */}
            {images.length < MARKETPLACE_CONFIG.maxImages && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center hover:border-emerald-500 transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  accept={MARKETPLACE_CONFIG.acceptedFormats.join(',')}
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Clique para adicionar fotos</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {MARKETPLACE_CONFIG.maxImages - images.length} foto(s) disponível(s)
                </p>
              </div>
            )}
            
            {/* Erros */}
            {errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-1 last:mb-0">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Info */}
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 text-center">
              Formatos: JPG, PNG, WebP • Máx. {MARKETPLACE_CONFIG.maxSizeMB}MB por imagem
            </p>
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Título do Anúncio</label>
            <input 
              name="title" 
              required 
              placeholder="Ex: Caminhão Scania R440 ou Pneu Usado" 
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold focus:bg-white dark:focus:bg-slate-600 border-2 border-transparent focus:border-emerald-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Categoria</label>
            <select 
              name="category" 
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold appearance-none text-slate-800 dark:text-slate-100"
            >
              <option value="veiculos">Veículos</option>
              <option value="pecas">Peças</option>
              <option value="servicos">Serviços</option>
              <option value="acessorios">Acessórios</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Preço (R$)</label>
            <input 
              name="price" 
              type="number" 
              step="0.01" 
              required 
              placeholder="0,00" 
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Condição</label>
            <div className="flex gap-2">
              <label className="flex-1">
                <input type="radio" name="item_condition" value="novo" className="hidden peer" />
                <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-[10px] peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 text-slate-400 dark:text-slate-500 cursor-pointer transition-all">Novo</div>
              </label>
              <label className="flex-1">
                <input type="radio" name="item_condition" value="usado" defaultChecked className="hidden peer" />
                <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-[10px] peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 text-slate-400 dark:text-slate-500 cursor-pointer transition-all">Usado</div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input 
              name="location_city" 
              placeholder="Cidade" 
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
            <input 
              name="location_state" 
              maxLength={2} 
              placeholder="UF" 
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs uppercase text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>

          <button 
            disabled={loading || (images.length === 0 && existingImages.length === 0)} 
            type="submit" 
            className="w-full py-6 bg-slate-900 dark:bg-slate-700 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (images.length === 0 && existingImages.length === 0) ? (
              'Adicione pelo menos 1 foto'
            ) : isEditing ? (
              'Salvar Alterações'
            ) : (
              'Publicar Anúncio Agora'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
