import { createStaticPix, hasError } from "pix-utils";

export const PEDIDO_EXPIRA_EM_MINUTOS = 30;

export async function gerarPix(pedidoId: string, valorTotal: number) {
  const pix = createStaticPix({
    merchantName: process.env.PIX_MERCHANT_NAME ?? "LOJA DE CAMISAS",
    merchantCity: process.env.PIX_MERCHANT_CITY ?? "SANTOS",
    pixKey: process.env.PIX_KEY!,
    infoAdicional: `Pedido ${pedidoId.slice(0, 8)}`,
    txid: pedidoId.replace(/-/g, "").slice(0, 25).toUpperCase(),
    transactionAmount: valorTotal,
  });

  if (hasError(pix)) {
    throw new Error("Não foi possível gerar o código Pix.");
  }

  return {
    brCode: pix.toBRCode(),
    qrCodeImage: await pix.toImage(),
  };
}
