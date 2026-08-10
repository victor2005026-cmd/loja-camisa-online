"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatarTempo(segundos: number) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export function PagamentoPix({
  pedidoId,
  brCode,
  expiraEm,
}: {
  pedidoId: string;
  brCode: string;
  expiraEm: string;
}) {
  const router = useRouter();
  const [restante, setRestante] = useState(() =>
    Math.max(0, Math.floor((new Date(expiraEm).getTime() - Date.now()) / 1000)),
  );
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRestante(Math.max(0, Math.floor((new Date(expiraEm).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiraEm]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/pedidos/${pedidoId}/status`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "pago") {
        router.push("/pedidos?status=sucesso");
        router.refresh();
      } else if (data.status === "cancelado") {
        router.refresh();
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [pedidoId, router]);

  async function copiarCodigo() {
    await navigator.clipboard.writeText(brCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mt-6 space-y-4 text-center">
      <p className="text-sm text-muted">
        {restante > 0
          ? <>Pague em até <strong className="text-flare">{formatarTempo(restante)}</strong> pra garantir seu pedido</>
          : "Expirando..."}
      </p>

      <button
        onClick={copiarCodigo}
        className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110"
      >
        {copiado ? "Código copiado!" : "Copiar código Pix"}
      </button>

      <p className="text-xs text-muted">
        Aguardando a confirmação do pagamento — esta página atualiza sozinha assim que o Pix cair.
      </p>
    </div>
  );
}
