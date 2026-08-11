"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removerFotoStorage, uploadFotoHero } from "@/lib/supabase/storage";
import { MAX_FOTOS_HERO } from "@/lib/types";

export async function adicionarFotosHero(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const { count } = await admin
    .from("hero_fotos")
    .select("id", { count: "exact", head: true });

  let ordemAtual = count ?? 0;

  const arquivos = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const arquivo of arquivos) {
    if (ordemAtual >= MAX_FOTOS_HERO) break;

    const url = await uploadFotoHero(admin, arquivo);
    await admin.from("hero_fotos").insert({ url, ordem: ordemAtual });
    ordemAtual += 1;
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function removerFotoHero(fotoId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: foto } = await admin
    .from("hero_fotos")
    .select("id, url")
    .eq("id", fotoId)
    .maybeSingle();

  if (!foto) return;

  await removerFotoStorage(admin, foto.url);
  await admin.from("hero_fotos").delete().eq("id", fotoId);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}
