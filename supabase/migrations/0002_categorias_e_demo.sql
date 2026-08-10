-- Categorias de camisas + catálogo de demonstração
-- Execute no SQL Editor do Supabase (mesmo processo da 0001_init.sql).

-- =========================================================
-- Coluna de categoria
-- =========================================================
alter table camisas add column if not exists categoria text not null default 'Torcedor';

-- Nome do modelo precisa ser único pra "on conflict (modelo)" funcionar
-- nos inserts de exemplo abaixo (e nos que rodarmos no futuro).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'camisas_modelo_key') then
    alter table camisas add constraint camisas_modelo_key unique (modelo);
  end if;
end $$;

-- Reclassifica os 3 produtos de exemplo da migration anterior
update camisas set categoria = 'Torcedor' where modelo = 'Camisa Brasil Home 2026';
update camisas set categoria = 'Básica' where modelo in ('Camisa Básica Preta', 'Camisa Básica Branca');

-- =========================================================
-- Catálogo de demonstração (13 produtos novos, sem foto —
-- aparecem com o placeholder colorido até você subir fotos reais)
-- =========================================================
insert into camisas (modelo, descricao, preco, foto_url, categoria) values
  ('Camisa Torcedor Argentina Home 2026', 'Camisa oficial da seleção, modelo torcedor', 189.90, null, 'Torcedor'),
  ('Camisa Retrô Seleção 1994', 'Camisa retrô, edição comemorativa', 199.90, null, 'Retrô'),
  ('Camisa Retrô Brasil 1970', 'Camisa retrô, edição comemorativa', 199.90, null, 'Retrô'),
  ('Camisa Player Brasil Home 26/27', 'Camisa modelo jogador, tecido premium', 249.90, null, 'Player'),
  ('Camisa Player França Home 26/27', 'Camisa modelo jogador, tecido premium', 249.90, null, 'Player'),
  ('Camisa Manga Longa Preta', 'Camisa manga longa, 100% algodão', 119.90, null, 'Manga Longa'),
  ('Camisa Manga Longa Branca', 'Camisa manga longa, 100% algodão', 119.90, null, 'Manga Longa'),
  ('Camisa Feminina Brasil Home', 'Camisa feminina, corte ajustado', 199.90, null, 'Feminina'),
  ('Camisa Feminina Básica Rosa', 'Camisa feminina, corte ajustado', 89.90, null, 'Feminina'),
  ('Regata Treino Preta', 'Regata de treino, tecido leve', 79.90, null, 'Regata'),
  ('Regata Treino Branca', 'Regata de treino, tecido leve', 79.90, null, 'Regata'),
  ('Camisa Infantil Brasil Home', 'Camisa infantil, modelo torcedor', 149.90, null, 'Infantil'),
  ('Camisa Infantil Básica Azul', 'Camisa infantil, 100% algodão', 69.90, null, 'Infantil')
on conflict (modelo) do nothing;

-- Estoque P/M/G/GG pra qualquer camisa que ainda não tenha (as novas de cima)
insert into camisa_tamanhos (camisa_id, tamanho, estoque)
select id, tamanho, 10
from camisas
cross join (values ('P'), ('M'), ('G'), ('GG')) as t(tamanho)
on conflict (camisa_id, tamanho) do nothing;
