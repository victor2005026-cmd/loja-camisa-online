-- Fotos do banner colagem da home, escolhidas pelo admin (não vêm dos produtos)
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

create table if not exists hero_fotos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

alter table hero_fotos enable row level security;

create policy "hero_fotos: leitura publica"
  on hero_fotos for select
  to anon, authenticated
  using (true);

-- Sem policies de insert/update/delete pra clientes: só a service_role (admin) escreve.
