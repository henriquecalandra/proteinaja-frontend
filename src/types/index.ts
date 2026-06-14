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
