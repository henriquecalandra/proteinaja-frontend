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

export const register = (nome: string, email: string, senha: string) =>
  api.post<{ access_token: string }>('/auth/register', { nome, email, senha });

export interface ClienteCreatePayload {
  nome: string;
  whatsapp: string;
  tipo: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  cnpj?: string | null;
  cidade?: string | null;
  atendido_por_ia?: boolean;
}

export interface ClienteUpdatePayload {
  nome?: string;
  cnpj?: string | null;
  cidade?: string | null;
  tipo?: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  ativo?: boolean;
  atendido_por_ia?: boolean;
}

export interface ItemPedidoInput {
  produto: string;
  qtd_kg: number;
  preco_kg: number;
}

export interface PedidoCreatePayload {
  cliente_id: number;
  itens: ItemPedidoInput[];
  status?: 'confirmado' | 'negociando' | 'aguardando' | 'entregue';
}

export const criarCliente = (payload: ClienteCreatePayload) =>
  api.post('/clients/', payload);

export const atualizarCliente = (id: number, payload: ClienteUpdatePayload) =>
  api.patch(`/clients/${id}`, payload);

export const criarPedido = (payload: PedidoCreatePayload) =>
  api.post('/orders/', payload);

export const getOverview = () => api.get('/dashboard/overview');
export const getConversas = () => api.get('/conversations/');
export const getMensagens = (id: number) => api.get(`/conversations/${id}/messages`);
export const assumirConversa = (id: number) => api.post(`/conversations/${id}/assume`);
export const encerrarConversa = (id: number) => api.post(`/conversations/${id}/close`);
export const getClienteDetalhe = (id: number) => api.get(`/clients/${id}`);
export const enviarMensagem = (conversaId: number, texto: string) =>
  api.post(`/conversations/${conversaId}/messages`, { texto });
export const getPedidos = () => api.get('/orders/');
export const mudarStatusPedido = (pedidoId: number, status: string) =>
  api.patch(`/orders/${pedidoId}`, { status });
export const getClientes = () => api.get('/clients/');

export interface ProdutoCreatePayload {
  nome: string;
  preco_kg: number;
  categoria?: string | null;
  ativo?: boolean;
}

export interface ProdutoUpdatePayload {
  nome?: string;
  preco_kg?: number;
  categoria?: string | null;
  ativo?: boolean;
}

export const gerarPagamento = (pedidoId: number, metodo: 'pix' | 'boleto') =>
  api.post(`/orders/${pedidoId}/payment`, { metodo });
export const marcarPago = (pedidoId: number) => api.post(`/orders/${pedidoId}/pay`);

export const getProdutos = () => api.get('/products/');
export const criarProduto = (payload: ProdutoCreatePayload) =>
  api.post('/products/', payload);
export const atualizarProduto = (id: number, payload: ProdutoUpdatePayload) =>
  api.patch(`/products/${id}`, payload);

export default api;
