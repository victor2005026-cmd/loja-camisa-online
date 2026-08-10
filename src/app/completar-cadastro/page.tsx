import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_BRASIL } from "@/lib/types";
import { salvarPerfil } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompletarCadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (perfil) {
    redirect(next.startsWith("/") ? next : "/");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Complete seu cadastro</h1>
      <p className="mt-1 text-sm text-muted">
        Precisamos do seu telefone e endereço pra combinar a entrega das suas compras.
      </p>

      <form action={salvarPerfil} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label className="block text-sm font-medium text-muted">Telefone (com DDD)</label>
          <input
            name="telefone"
            required
            placeholder="(11) 91234-5678"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-muted">CEP</label>
            <input
              name="cep"
              required
              placeholder="00000-000"
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted">Rua</label>
            <input
              name="rua"
              required
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-muted">Número</label>
            <input
              name="numero"
              required
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted">Complemento</label>
            <input
              name="complemento"
              placeholder="Apto, bloco... (opcional)"
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted">Bairro</label>
          <input
            name="bairro"
            required
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted">Cidade</label>
            <input
              name="cidade"
              required
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-muted">UF</label>
            <select
              name="estado"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
            >
              <option value="" disabled>
                --
              </option>
              {ESTADOS_BRASIL.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110"
        >
          Salvar e continuar
        </button>
      </form>
    </div>
  );
}
