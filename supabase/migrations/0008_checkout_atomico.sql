-- Cria o pedido inteiro (pedido + itens + baixa de estoque) numa única
-- transação atômica, pra impedir que dois clientes comprem a última
-- unidade de um tamanho ao mesmo tempo (condição de corrida).
-- Execute no SQL Editor do Supabase (mesmo processo das migrations anteriores).

create or replace function criar_pedido_com_estoque(
  p_user_id uuid,
  p_valor_total numeric,
  p_entrega_telefone text,
  p_entrega_rua text,
  p_entrega_numero text,
  p_entrega_complemento text,
  p_entrega_bairro text,
  p_entrega_cidade text,
  p_entrega_estado text,
  p_entrega_cep text,
  p_itens jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_pedido_id uuid;
  v_item jsonb;
  v_linhas_afetadas int;
begin
  -- Baixa o estoque de cada item primeiro. Se algum não tiver estoque
  -- suficiente no exato momento da baixa, a exceção desfaz tudo (inclusive
  -- baixas de itens anteriores deste mesmo pedido).
  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    update camisa_tamanhos
    set estoque = estoque - (v_item->>'quantidade')::int
    where camisa_id = (v_item->>'camisa_id')::uuid
      and tamanho = v_item->>'tamanho'
      and estoque >= (v_item->>'quantidade')::int;

    get diagnostics v_linhas_afetadas = row_count;

    if v_linhas_afetadas = 0 then
      raise exception 'ESTOQUE_INSUFICIENTE:%:%', v_item->>'camisa_id', v_item->>'tamanho';
    end if;
  end loop;

  insert into pedidos (
    user_id, status, valor_total, forma_pagamento,
    entrega_telefone, entrega_rua, entrega_numero, entrega_complemento,
    entrega_bairro, entrega_cidade, entrega_estado, entrega_cep
  ) values (
    p_user_id, 'aguardando_pagamento', p_valor_total, 'pix',
    p_entrega_telefone, p_entrega_rua, p_entrega_numero, p_entrega_complemento,
    p_entrega_bairro, p_entrega_cidade, p_entrega_estado, p_entrega_cep
  )
  returning id into v_pedido_id;

  insert into pedido_itens (pedido_id, camisa_id, tamanho, quantidade, preco_unitario)
  select
    v_pedido_id,
    (v_item->>'camisa_id')::uuid,
    v_item->>'tamanho',
    (v_item->>'quantidade')::int,
    (v_item->>'preco_unitario')::numeric
  from jsonb_array_elements(p_itens) as v_item;

  return v_pedido_id;
end;
$$;
