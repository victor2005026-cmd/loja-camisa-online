import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Trata os links de confirmação de e-mail (cadastro) e recuperação de senha.
// O template de e-mail no painel do Supabase precisa apontar pra cá — veja o README.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/redefinir-senha`);
      }

      if (data.user) {
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
      }

      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=confirmacao`);
}
