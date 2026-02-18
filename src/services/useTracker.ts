import { useCallback } from 'react';
import { api } from '../api/api';

// Tipagem rigorosa para evitar erros de digitação
export type TargetType = 'FREIGHT' | 'AD' | 'GROUP' | 'LISTING';
export type EventType = 'VIEW' | 'WHATSAPP_CLICK' | 'SHARE' | 'VIEW_DETAILS' | 'CLICK';

export const useTracker = () => {
  
  /**
   * Função para registrar qualquer evento de métrica
   * Alinhada com o MetricsController.php
   */
  const trackEvent = useCallback(async (
    targetId: number | string, // Aceita string caso o ID venha do banco como UUID
    targetType: TargetType, 
    eventType: EventType
  ) => {
    if (!targetId) return;

    try {
      // 1. Corrigido o Endpoint para bater com seu Router PHP
      // 2. Garantimos que os nomes dos campos batam com o registerEvent() do Backend
      await api.post('/log-event', {
        target_id: targetId,
        target_type: targetType, // O Backend fará o strtoupper()
        event_type: eventType,
      });
      
      console.log(`[Tracker] Sucesso: ${eventType} em ${targetType} (${targetId})`);
    } catch (error) {
      // Falha silenciosa para o usuário, mas logada para o desenvolvedor
      console.warn(`[Tracker] Falha ao registrar ${eventType}:`, error);
    }
  }, []);

  /**
   * Atalho para cliques de WhatsApp
   */
  const trackWhatsAppClick = useCallback((
    targetId: number | string, 
    targetType: TargetType, 
    phoneNumber: string
  ) => {
    // Primeiro registra a métrica
    trackEvent(targetId, targetType, 'WHATSAPP_CLICK');
    
    // Depois executa a ação visual
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}`;
    
    // Tentativa de abertura robusta
    const win = window.open(url, '_blank');
    if (!win) window.location.assign(url);
  }, [trackEvent]);

  return { trackEvent, trackWhatsAppClick };
};