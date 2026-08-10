import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: perfil } = await supabase
        .from("perfis")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!perfil) {
        return NextResponse.redirect(
          `${origin}/completar-cadastro?next=${encodeURIComponent(next)}`,
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?erro=login`);
}
