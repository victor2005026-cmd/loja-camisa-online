"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CIDADES_ATENDIDAS } from "@/lib/types";

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

  if (!telefone || !cep || !rua || !numero || !bairro || !cidade) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  if (!CIDADES_ATENDIDAS.includes(cidade as (typeof CIDADES_ATENDIDAS)[number])) {
    throw new Error("Por enquanto só entregamos em Santos, São Vicente e Praia Grande.");
  }

  const { error } = await supabase.from("perfis").upsert({
    user_id: user.id,
    telefone,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado: "SP",
  });

  if (error) {
    throw new Error("Não foi possível salvar seu cadastro. Tente novamente.");
  }

  redirect(next.startsWith("/") ? next : "/");
}
