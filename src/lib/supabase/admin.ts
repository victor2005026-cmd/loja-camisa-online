import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client com a service_role key — ignora RLS.
// NUNCA importe este arquivo em código que rode no navegador.
// Use apenas dentro de Route Handlers (src/app/api/**) que rodam no servidor.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
