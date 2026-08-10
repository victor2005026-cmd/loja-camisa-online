-- Fotos extras por produto (a capa continua em camisas.foto_url;
-- aqui ficam até mais 5 fotos adicionais mostradas na página do produto)
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

create table if not exists camisa_fotos (
  id uuid primary key default gen_random_uuid(),
  camisa_id uuid not null references camisas(id) on delete cascade,
  url text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists camisa_fotos_camisa_id_idx on camisa_fotos(camisa_id);

alter table camisa_fotos enable row level security;

-- Leitura pública, igual às outras tabelas do catálogo. Escrita só acontece
-- via rotas de admin com a service_role key (nenhuma policy de insert/update/
-- delete é necessária pro cliente).
create policy "camisa_fotos: leitura publica"
  on camisa_fotos for select
  to anon, authenticated
  using (true);
