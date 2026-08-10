import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "camisas-fotos";

export async function uploadFotoCamisa(
  admin: SupabaseClient,
  camisaId: string,
  file: File,
): Promise<string> {
  const extensao = file.name.split(".").pop() ?? "jpg";
  const caminho = `${camisaId}/${crypto.randomUUID()}.${extensao}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(caminho, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Não foi possível enviar a foto: ${error.message}`);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(caminho);
  return data.publicUrl;
}

export async function removerFotoStorage(admin: SupabaseClient, url: string) {
  const marcador = `/${BUCKET}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return;

  const caminho = url.slice(indice + marcador.length);
  await admin.storage.from(BUCKET).remove([caminho]);
}
