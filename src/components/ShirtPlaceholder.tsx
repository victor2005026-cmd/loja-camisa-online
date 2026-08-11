export function ShirtPlaceholder({
  categoria,
  className = "",
}: {
  categoria: string;
  className?: string;
}) {
  return (
    <div
      className={`textura-tecido relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-surface to-ink ${className}`}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] bg-ouro" />
      <span className="px-3 text-center font-display text-2xl uppercase leading-[0.95] tracking-tight text-paper/15 sm:text-3xl">
        {categoria}
      </span>
    </div>
  );
}
