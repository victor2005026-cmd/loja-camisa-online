-- Loja de camisas online — schema inicial
-- Execute este arquivo no SQL Editor do Supabase (ou via `supabase db push`
-- se estiver usando o Supabase CLI).

-- extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- =========================================================
-- CAMISAS (catálogo)
-- =========================================================
create table if not exists camisas (
  id uuid primary key default gen_random_uuid(),
  modelo text not null,
  descricao text,
  preco numeric(10,2) not null check (preco >= 0),
  foto_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CAMISA_TAMANHOS (estoque por tamanho de cada camisa)
-- =========================================================
create table if not exists camisa_tamanhos (
  id uuid primary key default gen_random_uuid(),
  camisa_id uuid not null references camisas(id) on delete cascade,
  tamanho text not null,
  estoque integer not null default 0 check (estoque >= 0),
  unique (camisa_id, tamanho)
);

-- =========================================================
-- PEDIDOS
-- =========================================================
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento', 'pago', 'cancelado')),
  valor_total numeric(10,2) not null check (valor_total >= 0),
  forma_pagamento text,
  mercado_pago_preference_id text,
  mercado_pago_payment_id text,
  created_at timestamptz not null default now()
);

create index if not exists pedidos_user_id_idx on pedidos(user_id);
create index if not exists pedidos_mp_payment_id_idx on pedidos(mercado_pago_payment_id);

-- =========================================================
-- PEDIDO_ITENS
-- =========================================================
create table if not exists pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  camisa_id uuid not null references camisas(id),
  tamanho text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0)
);

create index if not exists pedido_itens_pedido_id_idx on pedido_itens(pedido_id);

-- =========================================================
-- RLS
-- =========================================================
alter table camisas enable row level security;
alter table camisa_tamanhos enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;

-- Catálogo é público (qualquer visitante, logado ou não, pode ler)
create policy "camisas: leitura publica"
  on camisas for select
  to anon, authenticated
  using (ativo = true);

create policy "camisa_tamanhos: leitura publica"
  on camisa_tamanhos for select
  to anon, authenticated
  using (true);

-- Pedidos: cada cliente só vê/cria os próprios.
-- (Na prática o backend usa a service role para criar o pedido já validado
-- e calcular o valor a partir do banco, mas a policy de INSERT fica aqui
-- como defesa em profundidade e para cumprir o modelo "cliente cria o próprio pedido".)
create policy "pedidos: cliente ve os proprios"
  on pedidos for select
  to authenticated
  using (user_id = auth.uid());

create policy "pedidos: cliente cria os proprios"
  on pedidos for insert
  to authenticated
  with check (user_id = auth.uid());

-- Itens de pedido: visíveis/criáveis apenas se o pedido pertence ao cliente
create policy "pedido_itens: cliente ve os proprios"
  on pedido_itens for select
  to authenticated
  using (
    exists (
      select 1 from pedidos
      where pedidos.id = pedido_itens.pedido_id
        and pedidos.user_id = auth.uid()
    )
  );

create policy "pedido_itens: cliente cria nos proprios pedidos"
  on pedido_itens for insert
  to authenticated
  with check (
    exists (
      select 1 from pedidos
      where pedidos.id = pedido_itens.pedido_id
        and pedidos.user_id = auth.uid()
    )
  );

-- Nenhuma policy de UPDATE/DELETE é criada para clientes: status de pedido,
-- estoque e confirmação de pagamento só mudam via rotas de servidor que usam
-- a service_role key (checkout e webhook), nunca direto do navegador.

-- =========================================================
-- Dados de exemplo (opcional, remova se não quiser)
-- =========================================================
insert into camisas (modelo, descricao, preco, foto_url) values
  ('Camisa Brasil Home 2026', 'Camisa oficial da seleção, modelo titular', 249.90, null),
  ('Camisa Básica Preta', 'Camisa 100% algodão, corte slim', 79.90, null),
  ('Camisa Básica Branca', 'Camisa 100% algodão, corte slim', 79.90, null)
on conflict do nothing;

insert into camisa_tamanhos (camisa_id, tamanho, estoque)
select id, tamanho, 10
from camisas
cross join (values ('P'), ('M'), ('G'), ('GG')) as t(tamanho)
where modelo in ('Camisa Brasil Home 2026', 'Camisa Básica Preta', 'Camisa Básica Branca')
on conflict do nothing;
