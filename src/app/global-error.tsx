"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-paper">
        <h1 className="font-display text-xl uppercase tracking-wide">Algo deu errado</h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          {error.message || "Tivemos um problema aqui do nosso lado. Tenta de novo em alguns instantes."}
        </p>
        <button
          onClick={() => retry()}
          className="mt-6 rounded-lg bg-flare px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
