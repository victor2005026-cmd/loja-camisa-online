"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function buscarCidadeEstadoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    if (json.erro) return null;

    return { cidade: json.localidade as string, estado: json.uf as string };
  } catch {
    return null;
  }
}

export async function salvarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/");
  }

  const next = formData.get("next")?.toString() || "/";
  const telefone = formData.get("telefone")?.toString().trim();
  const cep = formData.get("cep")?.toString().trim();
  const rua = formData.get("rua")?.toString().trim();
  const numero = formData.get("numero")?.toString().trim();
  const complemento = formData.get("complemento")?.toString().trim() || null;
  const bairro = formData.get("bairro")?.toString().trim();
  const cidade = formData.get("cidade")?.toString().trim();
  const estado = formData.get("estado")?.toString().trim().toUpperCase();

  if (!telefone || !cep || !rua || !numero || !bairro || !cidade || !estado) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  const cepReal = await buscarCidadeEstadoPorCep(cep);
  if (!cepReal) {
    throw new Error("Não conseguimos validar esse CEP. Confira o número e tente de novo.");
  }
  if (cepReal.cidade !== cidade || cepReal.estado !== estado) {
    throw new Error("Cidade/estado não conferem com o CEP informado.");
  }

  // Qualquer cidade/estado pode se cadastrar e comprar — a área de entrega
  // automática (Baixada Santista) só é checada na hora de fechar o pedido,
  // em /api/checkout. Fora dela, o cliente é direcionado pro WhatsApp.
  const { error } = await supabase.from("perfis").upsert({
    user_id: user.id,
    telefone,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
  });

  if (error) {
    throw new Error("Não foi possível salvar seu cadastro. Tente novamente.");
  }

  const destino = next.startsWith("/") ? next : "/";
  redirect(destino === "/conta" ? "/conta?salvo=1" : destino);
}
