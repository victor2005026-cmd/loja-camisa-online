-- Perfil do cliente (telefone + endereço) e dados de entrega no pedido
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

-- =========================================================
-- PERFIS (telefone + endereço de cada cliente)
-- =========================================================
create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  telefone text not null,
  rua text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  estado text not null,
  cep text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table perfis enable row level security;

create policy "perfis: cliente ve o proprio"
  on perfis for select
  to authenticated
  using (user_id = auth.uid());

create policy "perfis: cliente cria o proprio"
  on perfis for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "perfis: cliente atualiza o proprio"
  on perfis for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================
-- Dados de entrega copiados pro pedido no momento do checkout
-- (não é só referência ao perfil — se o cliente mudar de endereço
-- depois, os pedidos antigos continuam mostrando pra onde foi enviado)
-- =========================================================
alter table pedidos add column if not exists entrega_telefone text;
alter table pedidos add column if not exists entrega_rua text;
alter table pedidos add column if not exists entrega_numero text;
alter table pedidos add column if not exists entrega_complemento text;
alter table pedidos add column if not exists entrega_bairro text;
alter table pedidos add column if not exists entrega_cidade text;
alter table pedidos add column if not exists entrega_estado text;
alter table pedidos add column if not exists entrega_cep text;
