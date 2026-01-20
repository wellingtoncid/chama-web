import axios from 'axios';

// Detecta automaticamente a URL base (Local ou Produção via .env)
export const BASE_URL_API = import.meta.env.VITE_API_URL || 'http://127.0.0.1/chama-frete/api';

export const api = axios.create({
  baseURL: BASE_URL_API,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para injetar o token JWT em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ChamaFrete:token');
  const isPublicRoute = config.url?.match(/login|register|reset-password/);
  
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor para tratar expiração de sessão (Erro 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@ChamaFrete:token');
      localStorage.removeItem('@ChamaFrete:user');
      
      const publicPages = ['/login', '/register', '/forgot-password'];
      if (!publicPages.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);