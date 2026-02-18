import React, { useState, useEffect } from 'react';
import AdCard from './AdCard';
import { X } from 'lucide-react';
import { api } from '../../api/api';

export const AdPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAd, setHasAd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndShowPopup = async () => {
      // 1. Verifica se o usuário já viu o popup hoje (nas últimas 24h)
      const lastSeen = localStorage.getItem('last_ad_popup_seen');
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (lastSeen && (now - parseInt(lastSeen)) < oneDay) {
        setLoading(false);
        return; // Usuário já viu o anúncio recentemente
      }

      try {
        // 2. Verifica se existe anúncio ativo no banco
        const res = await api.get('/ads', { params: { position: 'popup' } });
        const ads = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        
        if (ads.length > 0) {
          setHasAd(true);
          // 3. Aguarda 4 segundos antes de mostrar (para não assustar no carregamento)
          setTimeout(() => {
            setIsOpen(true);
            // 4. Salva no navegador que o usuário já viu o anúncio
            localStorage.setItem('last_ad_popup_seen', now.toString());
          }, 4000);
        }
      } catch (err) {
        setHasAd(false);
      } finally {
        setLoading(false);
      }
    };

    checkAndShowPopup();
  }, []);

  // Não renderiza nada se estiver carregando, se não houver anúncio ou se não for a hora de abrir
  if (loading || !hasAd || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-700">
      <div className="relative w-full max-w-lg transform animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Botão Fechar Customizado */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute -top-4 -right-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full p-2.5 shadow-2xl z-[10000] hover:bg-red-500 hover:text-white transition-all border-2 border-slate-100 dark:border-slate-800 active:scale-90"
          title="Fechar Anúncio"
        >
          <X size={22} strokeWidth={3} />
        </button>

        {/* Container do Anúncio com bordas arredondadas suaves */}
        <div className="shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
           <AdCard position="popup" variant="vertical" />
        </div>

        {/* Legenda discreta de fechamento */}
        <p className="text-center text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-4">
          Clique fora ou no X para fechar
        </p>
      </div>
      
      {/* Overlay clicável para fechar também ao clicar fora */}
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
};