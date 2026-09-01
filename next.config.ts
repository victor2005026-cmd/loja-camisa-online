import type { NextConfig } from "next";

// Sem nonce por enquanto: o site usa bastante style inline (as animações
// de /experiencia, o carrossel do hero) e um script embutido (JSON-LD do
// produto), e nonce exigiria renderização dinâmica em toda página — trade-off
// que não vale a pena aqui. 'unsafe-inline' ainda bloqueia a ameaça real:
// carregar script/recurso de um domínio de fora não autorizado.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://jysrhzuujoxjndpxbnio.supabase.co https://*.googleusercontent.com;
  font-src 'self';
  connect-src 'self' https://jysrhzuujoxjndpxbnio.supabase.co https://viacep.com.br;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
