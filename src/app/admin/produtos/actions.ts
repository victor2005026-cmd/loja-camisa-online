"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removerFotoStorage, uploadFotoCamisa } from "@/lib/supabase/storage";
import { TAMANHOS_DISPONIVEIS } from "@/lib/types";

const MAX_FOTOS_EXTRA = 5;

function parseEstoque(formData: FormData, tamanho: string) {
  const n = Number(formData.get(`estoque_${tamanho}`));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export async function salvarCamisa(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = formData.get("id")?.toString();
  const modelo = formData.get("modelo")?.toString().trim();
  const descricao = formData.get("descricao")?.toString().trim() || null;
  const preco = Number(formData.get("preco"));
  const categoria = formData.get("categoria")?.toString().trim() || "Torcedor";
  const ativo = formData.get("ativo") === "on";

  if (!modelo || !Number.isFinite(preco) || preco < 0) {
    throw new Error("Dados inválidos.");
  }

  let camisaId = id;

  if (camisaId) {
    const { error } = await admin
      .from("camisas")
      .update({ modelo, descricao, preco, categoria, ativo })
      .eq("id", camisaId);
    if (error) throw new Error("Não foi possível salvar o produto.");
  } else {
    const { data, error } = await admin
      .from("camisas")
      .insert({ modelo, descricao, preco, categoria, ativo, foto_url: null })
      .select("id")
      .single();
    if (error || !data) throw new Error("Não foi possível criar o produto.");
    camisaId = data.id;
  }

  if (!camisaId) throw new Error("Não foi possível identificar o produto.");

  const capa = formData.get("capa");
  if (capa instanceof File && capa.size > 0) {
    const fotoUrl = await uploadFotoCamisa(admin, camisaId, capa);
    await admin.from("camisas").update({ foto_url: fotoUrl }).eq("id", camisaId);
  }

  const fotosExtra = formData
    .getAll("fotos_extra")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FOTOS_EXTRA);

  for (let i = 0; i < fotosExtra.length; i++) {
    const url = await uploadFotoCamisa(admin, camisaId, fotosExtra[i]);
    await admin.from("camisa_fotos").insert({ camisa_id: camisaId, url, ordem: i });
  }

  for (const tamanho of TAMANHOS_DISPONIVEIS) {
    await admin.from("camisa_tamanhos").upsert(
      { camisa_id: camisaId, tamanho, estoque: parseEstoque(formData, tamanho) },
      { onConflict: "camisa_id,tamanho" },
    );
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function alternarAtivo(id: string, ativo: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("camisas").update({ ativo }).eq("id", id);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function removerFotoExtra(fotoId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: foto } = await admin
    .from("camisa_fotos")
    .select("id, camisa_id, url")
    .eq("id", fotoId)
    .maybeSingle();

  if (!foto) return;

  await removerFotoStorage(admin, foto.url);
  await admin.from("camisa_fotos").delete().eq("id", fotoId);

  revalidatePath(`/admin/produtos/${foto.camisa_id}`);
  revalidatePath(`/produto/${foto.camisa_id}`);
}
