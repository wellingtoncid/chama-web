import axios from 'axios';

export const BASE_URL_API = import.meta.env.VITE_API_URL || 'http://127.0.0.1/chama-frete/api/public';

export const api = axios.create({
  baseURL: BASE_URL_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ChamaFrete:token');
  
  // Verifica se a URL termina exatamente com as rotas de auth
  const publicRoutes = ['/login', '/register', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => config.url?.endsWith(route));
  
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