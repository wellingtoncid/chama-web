import { useEffect, useRef } from 'react';
import { api } from '../../api/api';

interface AdTrackerProps {
  adId: number;
  children: React.ReactNode;
}

export function AdViewTracker({ adId, children }: AdTrackerProps) {
  const viewed = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !viewed.current) {
          viewed.current = true; // Impede contar 2x na mesma sessão
          api.post('?endpoint=manage-ads', { 
            id: adId, 
            action: 'increment-view' 
          }).catch(err => console.error("Erro ao logar view", err));
        }
      },
      { threshold: 0.5 } // 50% do anúncio precisa estar visível
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [adId]);

  return <div ref={elementRef}>{children}</div>;
}