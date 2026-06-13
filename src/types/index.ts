export interface Cliente {
  id: number;
  nome: string;
  whatsapp: string;
  tipo: 'acougue' | 'restaurante' | 'mercadinho' | 'food_service';
  cidade: string | null;
  ativo: boolean;
  created_at: string;
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
  status: 'agente' | 'humano' | 'encerrada';
  updated_at: string;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  itens_json: string;
  valor_total: number;
  origem: 'ia' | 'humano';
  status: 'confirmado' | 'negociando' | 'aguardando' | 'entregue';
  created_at: string;
}

export interface DashboardOverview {
  pedidos_hoje: number;
  pedidos_agente_hoje: number;
  conversas_ativas: number;
  volume_hoje: number;
  pct_agente: number;
}
