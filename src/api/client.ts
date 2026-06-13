import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (email: string, senha: string) =>
  api.post<{ access_token: string }>('/auth/login', { email, senha });

export const getOverview = () => api.get('/dashboard/overview');
export const getConversas = () => api.get('/conversations/');
export const getMensagens = (id: number) => api.get(`/conversations/${id}/messages`);
export const assumirConversa = (id: number) => api.post(`/conversations/${id}/assume`);
export const getPedidos = () => api.get('/orders/');
export const getClientes = () => api.get('/clients/');

export default api;
