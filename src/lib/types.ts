export const TAMANHOS_DISPONIVEIS = ["P", "M", "G", "GG"] as const;

export type PedidoStatus = "aguardando_pagamento" | "pago" | "cancelado";

export type Camisa = {
  id: string;
  modelo: string;
  descricao: string | null;
  preco: number;
  foto_url: string | null;
  ativo: boolean;
  created_at: string;
};

export type CamisaTamanho = {
  id: string;
  camisa_id: string;
  tamanho: string;
  estoque: number;
};

export type CamisaComTamanhos = Camisa & {
  camisa_tamanhos: CamisaTamanho[];
};

export type Pedido = {
  id: string;
  user_id: string;
  status: PedidoStatus;
  valor_total: number;
  forma_pagamento: string | null;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  created_at: string;
};

export type PedidoItem = {
  id: string;
  pedido_id: string;
  camisa_id: string;
  tamanho: string;
  quantidade: number;
  preco_unitario: number;
};

export type PedidoComItens = Pedido & {
  pedido_itens: (PedidoItem & { camisas: Pick<Camisa, "modelo" | "foto_url"> | null })[];
};

export type CartItem = {
  camisaId: string;
  modelo: string;
  fotoUrl: string | null;
  tamanho: string;
  quantidade: number;
  preco: number;
  estoqueDisponivel: number;
};
