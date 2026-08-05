"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAMANHOS_DISPONIVEIS } from "@/lib/types";

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
  const fotoUrl = formData.get("foto_url")?.toString().trim() || null;
  const ativo = formData.get("ativo") === "on";

  if (!modelo || !Number.isFinite(preco) || preco < 0) {
    throw new Error("Dados inválidos.");
  }

  let camisaId = id;

  if (camisaId) {
    const { error } = await admin
      .from("camisas")
      .update({ modelo, descricao, preco, foto_url: fotoUrl, ativo })
      .eq("id", camisaId);
    if (error) throw new Error("Não foi possível salvar o produto.");
  } else {
    const { data, error } = await admin
      .from("camisas")
      .insert({ modelo, descricao, preco, foto_url: fotoUrl, ativo })
      .select("id")
      .single();
    if (error || !data) throw new Error("Não foi possível criar o produto.");
    camisaId = data.id;
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
