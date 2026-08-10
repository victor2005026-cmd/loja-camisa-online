"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent("/redefinir-senha")}`,
    });

    setLoading(false);

    if (error) {
      setErro("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-sm px-4 py-10 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Verifique seu e-mail</h1>
        <p className="mt-3 text-sm text-muted">
          Se existir uma conta com <strong className="text-paper">{email}</strong>, enviamos um link
          pra redefinir a senha.
        </p>
        <Link href="/entrar" className="mt-6 inline-block text-sm font-medium text-flare underline">
          Voltar pro login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted">Enviamos um link pra você redefinir a senha por e-mail.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted">E-mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
          />
        </div>

        {erro && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{erro}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </div>
  );
}
