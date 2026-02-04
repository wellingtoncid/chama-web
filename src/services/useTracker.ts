import { useCallback } from 'react';
import { api } from '../api/api';

// Tipagem para garantir que você não envie dados errados
export type TargetType = 'FREIGHT' | 'AD' | 'GROUP' | 'LISTING';
export type EventType = 'VIEW' | 'WHATSAPP_CLICK' | 'SHARE' | 'VIEW_DETAILS';

export const useTracker = () => {
  
  /**
   * Função para registrar qualquer evento de métrica
   */
  const trackEvent = useCallback(async (
    targetId: number, 
    targetType: TargetType, 
    eventType: EventType
  ) => {
    if (!targetId) return;

    try {
      // Usamos um POST para o endpoint unificado que criamos no Router/index.php
      await api.post('/metrics/register', {
        target_id: targetId,
        target_type: targetType,
        event_type: eventType,
        // O userId o backend já pega pela Session/JWT, mas se precisar forçar, mande aqui
      });
    } catch (error) {
      // Falha silenciosa para não atrapalhar a experiência do usuário
      console.warn(`[Tracker] Falha ao registrar ${eventType} para ${targetType}:`, error);
    }
  }, []);

  /**
   * Atalho específico para cliques de WhatsApp (ajuda na organização do código)
   */
  const trackWhatsAppClick = useCallback((targetId: number, targetType: TargetType, phoneNumber: string) => {
    trackEvent(targetId, targetType, 'WHATSAPP_CLICK');
    
    // Formata e abre o link do WhatsApp
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  }, [trackEvent]);

  return { trackEvent, trackWhatsAppClick };
};