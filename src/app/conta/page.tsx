import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { salvarPerfil } from "../completar-cadastro/actions";
import { CamposEndereco } from "../completar-cadastro/CamposEndereco";
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

          <CamposEndereco
            cepInicial={perfil?.cep ?? ""}
            ruaInicial={perfil?.rua ?? ""}
            bairroInicial={perfil?.bairro ?? ""}
            cidadeInicial={perfil?.cidade ?? ""}
            estadoInicial={perfil?.estado ?? ""}
          />

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

      <section className="mt-10 border-t border-line pt-8">
        <LogoutButton className="text-sm font-medium text-red-400 hover:text-red-300" />
      </section>
    </div>
  );
}
