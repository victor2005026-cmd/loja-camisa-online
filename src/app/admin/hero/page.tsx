import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_FOTOS_HERO, type HeroFoto } from "@/lib/types";
import { FotoUploader } from "@/components/admin/FotoUploader";
import { salvarHero } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const admin = createAdminClient();

  const { data: fotos } = await admin
    .from("hero_fotos")
    .select("id, url, ordem")
    .order("ordem", { ascending: true })
    .returns<HeroFoto[]>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Banner da home</h1>
      <p className="mb-6 text-sm text-gray-600">
        Até {MAX_FOTOS_HERO} fotos, mostradas em colagem no topo do catálogo, na ordem que
        aparecem aqui (a primeira fica na faixa mais à esquerda). Arraste pra reordenar.
      </p>

      <form action={salvarHero} className="space-y-4">
        <FotoUploader
          existentes={(fotos ?? []).map((f) => ({ id: f.id, url: f.url }))}
          max={MAX_FOTOS_HERO}
          nomePlano="hero_plano"
          nomeArquivos="hero_novas"
        />

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
