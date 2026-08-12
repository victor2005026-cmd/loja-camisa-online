-- Preço promocional opcional por camisa, pra testar a ideia de "Promoções"
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

alter table camisas add column if not exists preco_promocional numeric(10,2);

alter table camisas
  drop constraint if exists camisas_preco_promocional_menor_check;

alter table camisas
  add constraint camisas_preco_promocional_menor_check
  check (preco_promocional is null or preco_promocional < preco);
