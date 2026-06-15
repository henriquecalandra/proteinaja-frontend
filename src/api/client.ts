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

export const register = (
  nome: string,
  email: string,
  senha: string,
  nome_empresa?: string
) =>
  api.post<{ access_token: string }>('/auth/register', {
    nome,
    email,
    senha,
    nome_empresa,
  });

export interface ClienteCreatePayload {
  nome: string;
  whatsapp: string;
  tipo: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  cnpj?: string | null;
  cidade?: string | null;
  atendido_por_ia?: boolean;
  email?: string | null;
  telefone?: string | null;
  razao_social?: string | null;
  inscricao_estadual?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  uf?: string | null;
  cep?: string | null;
  contato_nome?: string | null;
  condicao_pagamento?: string | null;
  limite_credito?: number | null;
  observacoes?: string | null;
  vendedor_id?: number | null;
}

export interface ClienteUpdatePayload {
  nome?: string;
  cnpj?: string | null;
  cidade?: string | null;
  tipo?: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  ativo?: boolean;
  atendido_por_ia?: boolean;
  email?: string | null;
  telefone?: string | null;
  razao_social?: string | null;
  inscricao_estadual?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  uf?: string | null;
  cep?: string | null;
  contato_nome?: string | null;
  condicao_pagamento?: string | null;
  limite_credito?: number | null;
  observacoes?: string | null;
  vendedor_id?: number | null;
}

export interface VendedorCreatePayload {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  ativo?: boolean;
  meta_mensal?: number | null;
}

export interface VendedorUpdatePayload {
  nome?: string;
  email?: string | null;
  telefone?: string | null;
  ativo?: boolean;
  meta_mensal?: number | null;
}

export const getVendedores = () => api.get('/sellers');
export const criarVendedor = (payload: VendedorCreatePayload) =>
  api.post('/sellers', payload);
export const atualizarVendedor = (id: number, payload: VendedorUpdatePayload) =>
  api.patch(`/sellers/${id}`, payload);

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
export const getDashboardAnalytics = () => api.get('/dashboard/analytics');
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
export const getComparativo = () => api.get('/dashboard/comparativo');
export const getInativos = (dias?: number) =>
  api.get('/clients/inativos', { params: dias != null ? { dias } : undefined });
export const getReposicao = () => api.get('/clients/reposicao');

export interface ProdutoCreatePayload {
  nome: string;
  preco_kg: number;
  categoria?: string | null;
  ativo?: boolean;
  sku?: string | null;
  unidade?: string;
  estoque?: number;
  estoque_minimo?: number;
  preco_custo?: number | null;
  descricao?: string | null;
}

export interface ProdutoUpdatePayload {
  nome?: string;
  preco_kg?: number;
  categoria?: string | null;
  ativo?: boolean;
  sku?: string | null;
  unidade?: string;
  estoque?: number;
  estoque_minimo?: number;
  preco_custo?: number | null;
  descricao?: string | null;
}

export const gerarPagamento = (pedidoId: number, metodo: 'pix' | 'boleto') =>
  api.post(`/orders/${pedidoId}/payment`, { metodo });
export const marcarPago = (pedidoId: number) => api.post(`/orders/${pedidoId}/pay`);

export const getProdutos = () => api.get('/products/');
export const criarProduto = (payload: ProdutoCreatePayload) =>
  api.post('/products/', payload);
export const atualizarProduto = (id: number, payload: ProdutoUpdatePayload) =>
  api.patch(`/products/${id}`, payload);

export interface EmpresaUpdatePayload {
  nome?: string;
  cnpj?: string | null;
  cidade?: string | null;
  whatsapp_numero?: string | null;
  evolution_url?: string | null;
  evolution_instance?: string | null;
  email_contato?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  responsavel?: string | null;
  segmento?: string | null;
}

export const getMe = () => api.get('/auth/me');
export const getAdminOverview = () => api.get('/admin/overview');
export const getAdminCompanies = () => api.get('/admin/companies');
export const getCompany = () => api.get('/company');
export const atualizarEmpresa = (payload: EmpresaUpdatePayload) =>
  api.patch('/company', payload);
export const conectarWhatsapp = () => api.post('/company/whatsapp/connect');
export const desconectarWhatsapp = () => api.post('/company/whatsapp/disconnect');

export default api;
