import Link from "next/link";
import { ScrollCinema } from "@/components/ScrollCinema";
import { RevelarAoRolar } from "@/components/RevelarAoRolar";

export default function ExperienciaPage() {
  return (
    <div>
      <ScrollCinema videoSrc="/experiencia/camisa-video.mp4" />

      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <RevelarAoRolar>
          <p className="font-mono text-xs uppercase tracking-widest text-ouro">Grade 1:1</p>
          <h2 className="mt-3 font-display text-3xl uppercase leading-tight tracking-tight text-paper sm:text-4xl">
            Feitas pra parecer a de verdade
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            &ldquo;1:1&rdquo; é o nome que o mercado dá pra réplica de grau mais alto — a que mais se aproxima do
            modelo oficial em escudo, cores, tecido e acabamento. Não é peça licenciada pelo clube, mas
            é o padrão que a gente busca em cada camisa antes de colocar no catálogo.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Isso significa prestar atenção onde a maioria não presta: o alinhamento do escudo, a
            costura das mangas, a gramatura do tecido, a cor que não desbota depois da primeira
            lavada. É a diferença entre uma camisa que parece fantasia e uma que parece de verdade.
          </p>
        </RevelarAoRolar>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 text-center sm:grid-cols-2 lg:grid-cols-4">
          <RevelarAoRolar>
            <p className="font-display text-lg uppercase tracking-wide text-paper">Pix na hora</p>
            <p className="mt-2 text-sm text-muted">
              Pagou, confirmamos rapidinho e o pedido já entra na fila de envio.
            </p>
          </RevelarAoRolar>
          <RevelarAoRolar className="delay-100">
            <p className="font-display text-lg uppercase tracking-wide text-paper">Cada peça revisada</p>
            <p className="mt-2 text-sm text-muted">
              A gente confere escudo, costura e tecido de cada camisa antes de anunciar — não só a foto.
            </p>
          </RevelarAoRolar>
          <RevelarAoRolar className="delay-200">
            <p className="font-display text-lg uppercase tracking-wide text-paper">Fala com a gente</p>
            <p className="mt-2 text-sm text-muted">
              Dúvida numa peça, num tamanho ou numa cor? Chama no WhatsApp antes de comprar.
            </p>
          </RevelarAoRolar>
          <RevelarAoRolar className="delay-300">
            <p className="font-display text-lg uppercase tracking-wide text-paper">Entrega rápida</p>
            <p className="mt-2 text-sm text-muted">
              Santos, São Vicente e Praia Grande recebem rapidinho, direto da nossa mão pra sua.
            </p>
          </RevelarAoRolar>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <RevelarAoRolar>
          <h2 className="font-display text-3xl uppercase leading-tight tracking-tight text-paper sm:text-4xl">
            Curtiu o que viu?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Essa foi só uma prova do cuidado que a gente tem com cada camisa. No catálogo tem muito
            mais — torcedor, retrô, player e seleções esperando por você.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-paper px-6 py-2.5 text-sm font-semibold text-ink shadow-md transition hover:brightness-95 hover:shadow-lg"
          >
            Ver o catálogo completo
          </Link>
        </RevelarAoRolar>
      </section>
    </div>
  );
}
