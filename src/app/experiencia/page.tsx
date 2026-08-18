import { ScrollCinema } from "@/components/ScrollCinema";

export default function ExperienciaPage() {
  return (
    <div>
      <ScrollCinema imagemSrc="/preview/demo-camisa.jpg" />

      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="font-display text-2xl uppercase tracking-wide text-paper">
          Mais uma seção viria aqui
        </h2>
        <p className="mt-3 text-sm text-muted">
          É só pra você ver que dá pra continuar a rolagem normal depois do efeito.
        </p>
      </div>
    </div>
  );
}
