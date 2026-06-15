export interface Cliente {
  id: number;
  nome: string;
  whatsapp: string;
  tipo: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  cidade: string | null;
  ativo: boolean;
  created_at: string;
  cnpj: string | null;
  total_pedidos: number;
  valor_total_comprado: number;
  atendido_por_ia: boolean;
}

export interface Mensagem {
  id: number;
  origem: string;
  texto: string;
  created_at: string;
}

export interface Conversa {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  status: 'agente' | 'humano' | 'encerrada';
  updated_at: string;
}

export interface ItemPedido {
  produto: string;
  qtd_kg: number;
  preco_kg: number;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  itens_json: string;
  valor_total: number;
  origem: 'ia' | 'humano';
  status: 'confirmado' | 'negociando' | 'aguardando' | 'entregue';
  created_at: string;
  metodo_pagamento: string | null;
  pago: boolean;
  link_pagamento: string | null;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string | null;
  preco_kg: number;
  ativo: boolean;
  created_at: string;
  sku: string | null;
  unidade: string;
  estoque: number;
  estoque_minimo: number;
  preco_custo: number | null;
  descricao: string | null;
}

export interface ClienteDetalhe {
  cliente: Cliente;
  pedidos: Pedido[];
  conversas: Conversa[];
}

export interface DashboardOverview {
  pedidos_hoje: number;
  pedidos_agente_hoje: number;
  conversas_ativas: number;
  volume_hoje: number;
  pct_agente: number;
}

export interface Empresa {
  id: number;
  nome: string;
  cnpj: string | null;
  cidade: string | null;
  plano: string;
  ativo: boolean;
  whatsapp_numero: string | null;
  evolution_url: string | null;
  evolution_instance: string | null;
  whatsapp_conectado: boolean;
  created_at: string;
  email_contato: string | null;
  telefone: string | null;
  endereco: string | null;
  responsavel: string | null;
  segmento: string | null;
}

export interface UsuarioMe {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'empresa';
  empresa_id: number | null;
}

export interface AdminOverview {
  total_empresas: number;
  empresas_ativas: number;
  total_pedidos_plataforma: number;
  gmv_plataforma: number;
  total_clientes: number;
}

export interface ComparativoOrigem {
  pedidos: number;
  volume: number;
  ticket_medio: number;
}

export interface Comparativo {
  ia: ComparativoOrigem;
  humano: ComparativoOrigem;
  pct_ia: number;
}

export interface ClienteInativo {
  id: number;
  nome: string;
  whatsapp: string;
  cidade: string | null;
  dias_sem_comprar: number;
  ultimo_pedido: string | null;
  total_pedidos: number;
}

export interface ClienteReposicao {
  id: number;
  nome: string;
  whatsapp: string;
  intervalo_medio_dias: number;
  ultimo_pedido: string;
  proxima_sugerida: string;
  devido: boolean;
}

export interface DashboardAnalytics {
  faturamento_por_dia: { dia: string; total: number; qtd: number }[];
  pedidos_por_status: {
    confirmado: number;
    negociando: number;
    aguardando: number;
    entregue: number;
  };
  top_produtos: { produto: string; qtd_kg: number; receita: number }[];
  top_clientes: { nome: string; total: number }[];
  ticket_medio: number;
  total_a_receber: number;
  total_pago: number;
}
