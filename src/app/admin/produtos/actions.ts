"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removerFotoStorage, uploadFotoCamisa } from "@/lib/supabase/storage";
import { MAX_FOTOS_PRODUTO, TAMANHOS_DISPONIVEIS } from "@/lib/types";

type FotoPlanoItem = { kind: "existing"; id: string } | { kind: "new" };

function parseFotoPlano(formData: FormData): FotoPlanoItem[] {
  try {
    const bruto = JSON.parse(formData.get("fotos_plano")?.toString() ?? "[]");
    if (!Array.isArray(bruto)) return [];
    return bruto.slice(0, MAX_FOTOS_PRODUTO);
  } catch {
    return [];
  }
}

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

  const { data: camisaAtual } = await admin
    .from("camisas")
    .select("foto_url")
    .eq("id", camisaId)
    .maybeSingle();
  const { data: fotosAtuais } = await admin
    .from("camisa_fotos")
    .select("id, url")
    .eq("camisa_id", camisaId);

  const urlPorIdExistente = new Map<string, string>();
  if (camisaAtual?.foto_url) urlPorIdExistente.set("capa", camisaAtual.foto_url);
  for (const foto of fotosAtuais ?? []) urlPorIdExistente.set(foto.id, foto.url);

  const plano = parseFotoPlano(formData);
  const arquivosNovos = formData
    .getAll("fotos_novas")
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
      if (arquivo) resolvidos.push(await uploadFotoCamisa(admin, camisaId, arquivo));
    }
  }

  const novaCapa = resolvidos[0] ?? null;
  const novasExtras = resolvidos.slice(1);

  await admin.from("camisas").update({ foto_url: novaCapa }).eq("id", camisaId);

  await admin.from("camisa_fotos").delete().eq("camisa_id", camisaId);
  if (novasExtras.length > 0) {
    await admin
      .from("camisa_fotos")
      .insert(novasExtras.map((url, i) => ({ camisa_id: camisaId, url, ordem: i })));
  }

  const urlsAntigas = new Set<string>([
    ...(camisaAtual?.foto_url ? [camisaAtual.foto_url] : []),
    ...(fotosAtuais ?? []).map((f) => f.url),
  ]);
  const urlsNovas = new Set(resolvidos);
  for (const urlAntiga of urlsAntigas) {
    if (!urlsNovas.has(urlAntiga)) await removerFotoStorage(admin, urlAntiga);
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
