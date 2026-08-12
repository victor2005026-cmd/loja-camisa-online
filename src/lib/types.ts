export const TAMANHOS_DISPONIVEIS = ["P", "M", "G", "GG"] as const;

export const CATEGORIAS_DISPONIVEIS = [
  "Torcedor",
  "Retrô",
  "Player",
  "Seleções",
  "Manga Longa",
  "Infantil",
  "Básica",
] as const;

export type Categoria = (typeof CATEGORIAS_DISPONIVEIS)[number];

export const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

// Região atendida pela loja (Baixada Santista) — cadastro de endereço fica
// restrito a essas cidades.
export const CIDADES_ATENDIDAS = ["Santos", "São Vicente", "Praia Grande"] as const;

export type Perfil = {
  user_id: string;
  telefone: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  created_at: string;
  updated_at: string;
};

export type PedidoStatus = "aguardando_pagamento" | "pago" | "cancelado";

export type Camisa = {
  id: string;
  modelo: string;
  descricao: string | null;
  preco: number;
  foto_url: string | null;
  categoria: string;
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

export type CamisaFoto = {
  id: string;
  camisa_id: string;
  url: string;
  ordem: number;
};

export type CamisaComDetalhes = CamisaComTamanhos & {
  camisa_fotos: CamisaFoto[];
};

export const MAX_FOTOS_HERO = 5;

// 1 capa + 5 extras
export const MAX_FOTOS_PRODUTO = 6;

export type HeroFoto = {
  id: string;
  url: string;
  ordem: number;
};

export type Pedido = {
  id: string;
  user_id: string;
  status: PedidoStatus;
  valor_total: number;
  forma_pagamento: string | null;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  entrega_telefone: string | null;
  entrega_rua: string | null;
  entrega_numero: string | null;
  entrega_complemento: string | null;
  entrega_bairro: string | null;
  entrega_cidade: string | null;
  entrega_estado: string | null;
  entrega_cep: string | null;
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
