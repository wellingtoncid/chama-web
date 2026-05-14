import { useEffect } from 'react';

interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const baseTitle = 'Chama Frete - Marketplace de Fretes';
    const prevTitle = document.title;

    document.title = meta.title ? `${meta.title} | Chama Frete` : baseTitle;

    const setMetaTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMetaTag = (property: string) => {
      const el = document.querySelector(`meta[property="${property}"]`);
      if (el) el.remove();
    };

    if (meta.description) {
      setMetaTag('og:description', meta.description);
      const nameDesc = document.querySelector('meta[name="description"]');
      if (nameDesc) nameDesc.setAttribute('content', meta.description);
    }
    if (meta.image) setMetaTag('og:image', meta.image);
    if (meta.url) setMetaTag('og:url', meta.url);
    if (meta.type) setMetaTag('og:type', meta.type);
    if (meta.title) {
      setMetaTag('og:title', meta.title);
      setMetaTag('twitter:title', meta.title);
    }

    return () => {
      document.title = prevTitle;
      if (meta.description) {
        removeMetaTag('og:description');
        const nameDesc = document.querySelector('meta[name="description"]');
        if (nameDesc) nameDesc.setAttribute('content', 'Chama Frete - Marketplace de fretes conectando empresas e motoristas. Encontre fretes, anuncie veículos e insumos, e expanda seus negócios logísticos.');
      }
      if (meta.image) removeMetaTag('og:image');
      if (meta.url) {
        const urlEl = document.querySelector('meta[property="og:url"]');
        if (urlEl) urlEl.setAttribute('content', 'https://www.chamafrete.com.br');
      }
      if (meta.type) {
        const typeEl = document.querySelector('meta[property="og:type"]');
        if (typeEl) typeEl.setAttribute('content', 'website');
      }
      if (meta.title) {
        removeMetaTag('og:title');
        removeMetaTag('twitter:title');
      }
    };
  }, [meta.title, meta.description, meta.image, meta.url, meta.type]);
}
