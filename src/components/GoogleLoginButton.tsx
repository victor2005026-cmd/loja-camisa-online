"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton({ className }: { className?: string }) {
  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleLogin}
      className={
        className ??
        "flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      }
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20.5H24v7h11.3C33.7 31.6 29.3 34.5 24 34.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 9.5 24 9.5c3.2 0 6.1 1.2 8.3 3.2l5.4-5.4C34.6 4.3 29.6 2.5 24 2.5 11.8 2.5 2 12.3 2 24.5S11.8 46.5 24 46.5 46 36.7 46 24.5c0-1.4-.1-2.7-.4-4z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l5.8 4.2C13.7 15.1 18.5 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.2l5.4-5.4C34.6 7.3 29.6 5.5 24 5.5c-8 0-14.9 4.6-18.3 11.3z"
        />
        <path
          fill="#4CAF50"
          d="M24 46.5c5.5 0 10.4-1.8 14.1-5l-6.5-5.5c-2 1.5-4.6 2.4-7.6 2.4-5.3 0-9.7-2.9-11.4-7.4l-6.4 4.9C9.1 41.9 15.9 46.5 24 46.5z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4-4.1 5.3l6.5 5.5C41.4 35.6 46 30.9 46 24.5c0-1.4-.1-2.7-.4-4z"
        />
      </svg>
      Entrar com Google
    </button>
  );
}
