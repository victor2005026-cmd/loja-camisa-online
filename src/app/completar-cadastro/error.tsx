"use client";

export default function ErroCompletarCadastro({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-xl uppercase tracking-wide text-paper">
        Não deu pra salvar seu cadastro
      </h1>
      <p className="mt-3 text-sm text-muted">
        {error.message || "Algo deu errado ao salvar seus dados. Confira as informações e tente de novo."}
      </p>
      <button
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-flare px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
      >
        Tentar de novo
      </button>
    </div>
  );
}
