import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Lista de e-mails com acesso ao painel admin, separados por vírgula em ADMIN_EMAILS.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const isAdmin = !!user?.email && getAdminEmails().includes(user.email.toLowerCase());
  if (!isAdmin) {
    redirect("/");
  }

  return user;
}
