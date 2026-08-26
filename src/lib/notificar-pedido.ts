// Notificação de venda por e-mail — best-effort, nunca deve derrubar o checkout.
// Precisa de RESEND_API_KEY e ADMIN_EMAILS configurados; sem isso, não faz nada.
type ItemNotificacao = {
  modelo: string;
  tamanho: string;
  quantidade: number;
  precoUnitario: number;
};

export async function notificarNovoPedido(params: {
  valorTotal: number;
  telefone: string;
  endereco: string;
  itens: ItemNotificacao[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const destinatarios = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!apiKey || destinatarios.length === 0) return;

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const linhasItens = params.itens
    .map((item) => `${item.quantidade}x ${item.modelo} (${item.tamanho}) — ${formatarPreco(item.precoUnitario * item.quantidade)}`)
    .join("\n");

  const painelUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/pedidos`;

  const texto = [
    `Novo pedido: ${formatarPreco(params.valorTotal)}`,
    "",
    linhasItens,
    "",
    `Telefone: ${params.telefone}`,
    `Endereço: ${params.endereco}`,
    "",
    `Confirmar pagamento: ${painelUrl}`,
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LV Sports <onboarding@resend.dev>",
        to: destinatarios,
        subject: `Novo pedido — ${formatarPreco(params.valorTotal)}`,
        text: texto,
      }),
    });
  } catch {
    // Notificação é um extra — se falhar, o pedido já foi criado normalmente.
  }
}

// Avisa o cliente que o pedido dele venceu sem pagamento e o estoque foi
// liberado — best-effort, mesma regra: nunca derruba a varredura de expiração.
export async function notificarPedidoExpirado(params: {
  email: string;
  valorTotal: number;
  itens: { modelo: string; tamanho: string; quantidade: number }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const linhasItens = params.itens
    .map((item) => `${item.quantidade}x ${item.modelo} (${item.tamanho})`)
    .join("\n");

  const texto = [
    `Seu pedido de ${formatarPreco(params.valorTotal)} expirou sem pagamento e foi cancelado.`,
    "",
    linhasItens,
    "",
    "Sem problema — o estoque já foi liberado de volta. É só montar o carrinho de novo quando quiser finalizar a compra.",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LV Sports <contato@lvsports013.com.br>",
        to: [params.email],
        subject: "Seu pedido expirou sem pagamento",
        text: texto,
      }),
    });
  } catch {
    // Notificação é um extra — se falhar, o pedido já foi cancelado normalmente.
  }
}
