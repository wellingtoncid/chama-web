import axios from 'axios';

export const BASE_URL_API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  const publicRoutes = ['/login', '/register', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => config.url?.endsWith(route));
  
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Error - URL:', error.config?.url);
      // NÃO faz logout automático - apenas loga o erro
      // localStorage.removeItem('@ChamaFrete:token');
      // localStorage.removeItem('@ChamaFrete:user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface WalletBalance {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: number;
  module_key: string;
  feature_key: string;
  amount: number;
  type: string;
  status: string;
  transaction_type: string;
  gateway_payload?: string;
  created_at: string;
}

export interface PricingRule {
  id: number;
  module_key: string;
  feature_key: string;
  feature_name: string;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  duration_days: number;
  is_active: number;
}

export interface RechargeResponse {
  success: boolean;
  url?: string;
  transaction_id?: number;
  amount?: number;
  message?: string;
}
