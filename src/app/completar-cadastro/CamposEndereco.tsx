"use client";

import { useState } from "react";

type DadosCep = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export function CamposEndereco({
  cepInicial,
  ruaInicial,
  bairroInicial,
  cidadeInicial,
  estadoInicial,
}: {
  cepInicial?: string;
  ruaInicial?: string;
  bairroInicial?: string;
  cidadeInicial?: string;
  estadoInicial?: string;
}) {
  const [cep, setCep] = useState(cepInicial ?? "");
  const [dados, setDados] = useState<DadosCep>({
    rua: ruaInicial ?? "",
    bairro: bairroInicial ?? "",
    cidade: cidadeInicial ?? "",
    estado: estadoInicial ?? "",
  });
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState<string | null>(null);

  async function aoSairDoCep() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErroCep("CEP precisa ter 8 números.");
      return;
    }

    setBuscando(true);
    setErroCep(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const json = await res.json();
      if (json.erro) {
        setErroCep("CEP não encontrado.");
        setDados({ rua: "", bairro: "", cidade: "", estado: "" });
        return;
      }
      setDados({
        rua: json.logradouro || "",
        bairro: json.bairro || "",
        cidade: json.localidade,
        estado: json.uf,
      });
    } catch {
      setErroCep("Não conseguimos verificar esse CEP agora. Tenta de novo.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-muted">CEP</label>
          <input
            name="cep"
            required
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={aoSairDoCep}
            placeholder="00000-000"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted"
          />
          {buscando && <p className="mt-1 text-xs text-muted">Verificando CEP...</p>}
          {erroCep && <p className="mt-1 text-xs text-red-400">{erroCep}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted">Rua</label>
          <input
            name="rua"
            required
            value={dados.rua}
            onChange={(e) => setDados((d) => ({ ...d, rua: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Bairro</label>
        <input
          name="bairro"
          required
          value={dados.bairro}
          onChange={(e) => setDados((d) => ({ ...d, bairro: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted">Cidade</label>
          <input
            name="cidade"
            required
            readOnly
            value={dados.cidade}
            placeholder="Preenchido pelo CEP"
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-muted">Estado</label>
          <input
            name="estado"
            required
            readOnly
            value={dados.estado}
            placeholder="UF"
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted"
          />
        </div>
      </div>
      <p className="text-xs text-muted">
        Cidade e estado vêm automaticamente do CEP, pra garantir que batem com o endereço real.
      </p>
    </>
  );
}
