import { BASE_URL_API } from '../api';

interface AdImageProps {
  url: string;
  className?: string;
  alt?: string;
}

export const AdImage = ({ url, className, alt = "" }: AdImageProps) => {
  const getFullUrl = (path: string) => {
    // 1. Se não houver path, retorna placeholder
    if (!path || path === "") {
        return 'https://via.placeholder.com/800x400?text=Sem+Imagem';
    }
    
    // 2. Se for uma URL completa (Unsplash, Imgur, etc), retorna direto
    if (path.startsWith('http')) {
        return path;
    }
    
    // 3. Limpa a URL Base (remove barra no final se existir)
    const baseUrl = BASE_URL_API.endsWith('/') 
        ? BASE_URL_API.slice(0, -1) 
        : BASE_URL_API;

    // 4. Limpa o Path (remove barra no início se existir)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // 5. Retorna a concatenação limpa
    // Ex: http://api.seusite.com.br/storage/ads/imagem.jpg
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <img 
      src={getFullUrl(url)} 
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Fallback definitivo para evitar loop de erro
        const target = e.target as HTMLImageElement;
        if (target.src !== 'https://via.placeholder.com/800x400?text=Erro+no+Servidor') {
            target.src = 'https://via.placeholder.com/800x400?text=Erro+no+Servidor';
        }
      }}
    />
  );
};