const CORES_POR_CATEGORIA: Record<string, { bg: string; icon: string }> = {
  Torcedor: { bg: "bg-emerald-950", icon: "text-emerald-400" },
  "Retrô": { bg: "bg-amber-950", icon: "text-amber-400" },
  Player: { bg: "bg-blue-950", icon: "text-blue-400" },
  "Manga Longa": { bg: "bg-slate-800", icon: "text-slate-300" },
  Feminina: { bg: "bg-pink-950", icon: "text-pink-400" },
  Regata: { bg: "bg-orange-950", icon: "text-orange-400" },
  Infantil: { bg: "bg-cyan-950", icon: "text-cyan-400" },
  "Básica": { bg: "bg-zinc-800", icon: "text-zinc-300" },
};

const CORES_PADRAO = { bg: "bg-neutral-800", icon: "text-neutral-400" };

export function ShirtPlaceholder({
  categoria,
  className = "",
}: {
  categoria: string;
  className?: string;
}) {
  const cores = CORES_POR_CATEGORIA[categoria] ?? CORES_PADRAO;

  return (
    <div className={`flex h-full w-full items-center justify-center ${cores.bg} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className={`h-2/5 w-2/5 ${cores.icon}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 8 L10 16 L15 25 L20 21 L20 56 L44 56 L44 21 L49 25 L54 16 L42 8 C42 12 38 15 32 15 C26 15 22 12 22 8 Z" />
      </svg>
    </div>
  );
}
