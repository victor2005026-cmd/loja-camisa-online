-- Ajuste na lista de categorias: remove "Feminina" e "Regata", adiciona "Seleções".
-- Reclassifica os produtos de demonstração que estavam nessas categorias.
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

update camisas set categoria = 'Seleções'
  where modelo in (
    'Camisa Brasil Home 2026',
    'Camisa Torcedor Argentina Home 2026',
    'Camisa Feminina Brasil Home'
  );

update camisas set categoria = 'Básica'
  where modelo in (
    'Camisa Feminina Básica Rosa',
    'Regata Treino Preta',
    'Regata Treino Branca'
  );
