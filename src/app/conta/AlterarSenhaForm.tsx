"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AlterarSenhaForm() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (error) {
      setErro("Não foi possível alterar a senha. Tente novamente.");
      return;
    }

    setSenha("");
    setConfirmarSenha("");
    setSucesso(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted">Nova senha</label>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Confirmar nova senha</label>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
        />
      </div>

      {erro && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{erro}</p>}
      {sucesso && <p className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300">Senha alterada.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-paper hover:border-ouro disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
