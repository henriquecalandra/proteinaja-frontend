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
    const isLoginEndpoint = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginEndpoint) {
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
export const enviarMensagem = (conversaId: number, texto: string) =>
  api.post(`/conversations/${conversaId}/messages`, { texto });
export const getPedidos = () => api.get('/orders/');
export const mudarStatusPedido = (pedidoId: number, status: string) =>
  api.patch(`/orders/${pedidoId}`, { status });
export const getClientes = () => api.get('/clients/');

export default api;
