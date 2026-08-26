"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

function traduzErro(mensagem: string) {
  if (mensagem.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (mensagem.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

function erroDaUrlParaMensagem(erroUrl: string | null) {
  if (erroUrl === "confirmacao") {
    return "Esse link de confirmação expirou ou já foi usado. Peça um novo ou tente entrar normalmente.";
  }
  return null;
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(() =>
    erroDaUrlParaMensagem(searchParams.get("erro")),
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro(traduzErro(error.message));
      setLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Entrar</h1>

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
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
          />
        </div>

        {erro && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{erro}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <Link href="/recuperar-senha" className="hover:text-paper">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="hover:text-paper">
          Criar conta
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        ou
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleLoginButton className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink shadow-md transition hover:brightness-95 hover:shadow-lg" />
    </div>
  );
}
