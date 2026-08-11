// Colagem de fotos em faixas com corte diagonal, tipo banner de campanha
// esportiva — cada faixa é um paralelogramo (via clip-path), sobrepostas
// levemente pra não sobrar frestas entre os cortes.
export function HeroColagem({ fotos }: { fotos: string[] }) {
  return (
    <div className="absolute inset-0 flex">
      {fotos.map((url, i) => {
        const primeira = i === 0;
        const ultima = i === fotos.length - 1;
        const clipPath = primeira
          ? "polygon(0 0, 100% 0, 88% 100%, 0 100%)"
          : ultima
            ? "polygon(12% 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(12% 0, 100% 0, 88% 100%, 0 100%)";

        return (
          <div
            key={url}
            className="relative h-full flex-1"
            style={{ clipPath, marginLeft: primeira ? 0 : "-6%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          </div>
        );
      })}
    </div>
  );
}
