"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

function traduzErro(mensagem: string) {
  if (mensagem.includes("already registered") || mensagem.includes("already exists")) {
    return "Já existe uma conta com esse e-mail. Tente entrar.";
  }
  if (mensagem.includes("Password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return "Não foi possível criar a conta. Tente novamente.";
}

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setLoading(false);

    if (error) {
      setErro(traduzErro(error.message));
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-sm px-4 py-10 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Confirme seu e-mail</h1>
        <p className="mt-3 text-sm text-muted">
          Enviamos um link de confirmação pra <strong className="text-paper">{email}</strong>. Clique
          nele pra ativar sua conta e poder entrar.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-flare underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Criar conta</h1>

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

        <div>
          <label className="block text-sm font-medium text-muted">Senha</label>
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
          <label className="block text-sm font-medium text-muted">Confirmar senha</label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-paper hover:underline">
          Entrar
        </Link>
      </p>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        ou
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleLoginButton className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-paper hover:border-muted" />
    </div>
  );
}
