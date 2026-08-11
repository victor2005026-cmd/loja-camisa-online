import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_FOTOS_HERO, type HeroFoto } from "@/lib/types";
import { adicionarFotosHero, removerFotoHero } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const admin = createAdminClient();

  const { data: fotos } = await admin
    .from("hero_fotos")
    .select("id, url, ordem")
    .order("ordem", { ascending: true })
    .returns<HeroFoto[]>();

  const total = fotos?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Banner da home</h1>
      <p className="mb-6 text-sm text-gray-600">
        Até {MAX_FOTOS_HERO} fotos, mostradas em colagem no topo do catálogo, na ordem que você
        subir aqui. Pra reordenar, remova e suba de novo na ordem certa.
      </p>

      {total > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {fotos!.map((foto, i) => (
            <div key={foto.id} className="relative">
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                {i + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={`Foto ${i + 1} do banner`}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <form action={removerFotoHero.bind(null, foto.id)}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Remover
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {total >= MAX_FOTOS_HERO ? (
        <p className="text-sm text-gray-500">
          Já tem {MAX_FOTOS_HERO} fotos (o máximo). Remova alguma pra subir outra.
        </p>
      ) : (
        <form action={adicionarFotosHero} className="space-y-3">
          <input
            type="file"
            name="fotos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
          <p className="text-xs text-gray-500">
            Pode selecionar várias de uma vez (até completar {MAX_FOTOS_HERO}). Até 5MB cada.
          </p>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
