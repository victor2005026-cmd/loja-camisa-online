import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_BRASIL } from "@/lib/types";
import { salvarPerfil } from "../completar-cadastro/actions";
import { AlterarSenhaForm } from "./AlterarSenhaForm";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/entrar?next=/conta");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("telefone, cep, rua, numero, complemento, bairro, cidade, estado")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Minha conta</h1>
      <p className="mt-1 text-sm text-muted">{user.email}</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-paper">Dados de entrega</h2>
        <p className="mt-1 text-xs text-muted">
          Usados pra combinar a entrega das suas compras. Entrega automática em Santos, São
          Vicente e Praia Grande — fora dessas cidades, combinamos o envio pelo WhatsApp.
        </p>

        <form action={salvarPerfil} className="mt-4 space-y-4">
          <input type="hidden" name="next" value="/conta" />

          <div>
            <label className="block text-sm font-medium text-muted">Telefone (com DDD)</label>
            <input
              name="telefone"
              required
              defaultValue={perfil?.telefone ?? ""}
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
                defaultValue={perfil?.cep ?? ""}
                placeholder="00000-000"
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted">Rua</label>
              <input
                name="rua"
                required
                defaultValue={perfil?.rua ?? ""}
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
                defaultValue={perfil?.numero ?? ""}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted">Complemento</label>
              <input
                name="complemento"
                defaultValue={perfil?.complemento ?? ""}
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
              defaultValue={perfil?.bairro ?? ""}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted">Cidade</label>
              <input
                name="cidade"
                required
                defaultValue={perfil?.cidade ?? ""}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-muted">Estado</label>
              <select
                name="estado"
                required
                defaultValue={perfil?.estado ?? "SP"}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-paper"
              >
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
            className="rounded-lg bg-flare px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
          >
            Salvar dados
          </button>
        </form>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-paper">Alterar senha</h2>
        <AlterarSenhaForm />
      </section>
    </div>
  );
}
