import { BASE_URL_API } from '../api';

interface AdImageProps {
  url: string;
  className?: string;
  alt?: string;
}

export const AdImage = ({ url, className, alt = "" }: AdImageProps) => {
  const getFullUrl = (path: string) => {
    // 1. Sanitização básica
    if (!path || typeof path !== 'string' || path.trim() === "") {
        return 'https://placehold.co/800x400/f1f5f9/64748b?text=Sem+Imagem';
    }
    
    const trimmedPath = path.trim();

    // 2. Se for uma URL completa, retorna direto (Prioridade Máxima)
    if (trimmedPath.startsWith('http')) {
        return trimmedPath;
    }
    
    // 3. Limpa a URL Base
    const baseUrl = BASE_URL_API.endsWith('/') 
        ? BASE_URL_API.slice(0, -1) 
        : BASE_URL_API;

    // 4. Limpa o Path interno
    // Se o path for apenas o nome do arquivo "foto.jpg", 
    // precisamos garantir que ele aponte para a pasta de uploads correta do seu PHP
    let cleanPath = trimmedPath.startsWith('/') ? trimmedPath.substring(1) : trimmedPath;
    
    // Se não for link externo e não começar com uploads, adicionamos o prefixo da pasta
    if (!cleanPath.startsWith('uploads/')) {
        // cleanPath = `uploads/ads/${cleanPath}`; // Ajuste conforme sua estrutura de pastas no servidor
    }

    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <img 
      src={getFullUrl(url)} 
      alt={alt}
      className={className}
      loading="lazy"
      // Melhora a UX: esconde a imagem quebrada até o fallback carregar
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const fallback = 'https://placehold.co/800x400/fee2e2/ef4444?text=Erro+ao+Carregar';
        if (target.src !== fallback) {
            target.src = fallback;
            target.className += " opacity-50"; // Feedback visual de erro
        }
      }}
    />
  );
};