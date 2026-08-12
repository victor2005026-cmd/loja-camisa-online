"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removerFotoStorage, uploadFotoHero } from "@/lib/supabase/storage";
import { MAX_FOTOS_HERO } from "@/lib/types";

type FotoPlanoItem = { kind: "existing"; id: string } | { kind: "new" };

function parseFotoPlano(formData: FormData): FotoPlanoItem[] {
  try {
    const bruto = JSON.parse(formData.get("hero_plano")?.toString() ?? "[]");
    if (!Array.isArray(bruto)) return [];
    return bruto.slice(0, MAX_FOTOS_HERO);
  } catch {
    return [];
  }
}

export async function salvarHero(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: fotosAtuais } = await admin.from("hero_fotos").select("id, url");
  const urlPorIdExistente = new Map((fotosAtuais ?? []).map((f) => [f.id, f.url]));

  const plano = parseFotoPlano(formData);
  const arquivosNovos = formData
    .getAll("hero_novas")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const resolvidos: string[] = [];
  let proximoArquivo = 0;
  for (const item of plano) {
    if (item.kind === "existing") {
      const url = urlPorIdExistente.get(item.id);
      if (url) resolvidos.push(url);
    } else {
      const arquivo = arquivosNovos[proximoArquivo];
      proximoArquivo += 1;
      if (arquivo) resolvidos.push(await uploadFotoHero(admin, arquivo));
    }
  }

  await admin.from("hero_fotos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (resolvidos.length > 0) {
    await admin
      .from("hero_fotos")
      .insert(resolvidos.map((url, i) => ({ url, ordem: i })));
  }

  const urlsAntigas = new Set((fotosAtuais ?? []).map((f) => f.url));
  const urlsNovas = new Set(resolvidos);
  for (const urlAntiga of urlsAntigas) {
    if (!urlsNovas.has(urlAntiga)) await removerFotoStorage(admin, urlAntiga);
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}
