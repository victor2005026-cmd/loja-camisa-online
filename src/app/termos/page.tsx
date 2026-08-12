import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — LV Sports",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl uppercase tracking-wide text-paper">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: 10/08/2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">1. Quem somos</h2>
          <p>
            A LV Sports é operada por <strong className="text-paper">Victor Rodrigues Esteves</strong>,
            CPF <strong className="text-paper">499.892.238-66</strong>, com sede em{" "}
            <strong className="text-paper">Santos/SP</strong>. Para contato, use{" "}
            <strong className="text-paper">WhatsApp (13) 99174-9391 ou Instagram @lvsports013</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">2. Cadastro e conta</h2>
          <p>
            Para comprar, você precisa entrar com sua conta Google e completar o cadastro com
            telefone e endereço. Você é responsável por manter esses dados corretos e
            atualizados — usamos exatamente o que está cadastrado para entrar em contato e
            organizar a entrega do seu pedido.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">3. Produtos e preços</h2>
          <p>
            As fotos são ilustrativas; pequenas variações de cor ou estampa entre o que aparece
            na tela e o produto físico podem ocorrer. Preços e disponibilidade de estoque podem
            mudar sem aviso prévio e valem os que estiverem ativos no momento da compra. Se um
            item ficar indisponível depois de comprado, você será avisado e reembolsado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">4. Pagamento</h2>
          <p>
            Pagamentos são processados via Mercado Pago, por Pix. Não temos acesso aos dados da
            sua conta bancária — isso fica inteiramente com o Mercado Pago. Seu pedido só é
            confirmado depois que o pagamento é aprovado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">5. Entrega</h2>
          <p>
            Depois da confirmação do pagamento, entramos em contato pelo telefone cadastrado para
            combinar a entrega. Prazos podem variar de acordo com a localidade e a forma de envio
            combinada.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">6. Trocas, devoluções e arrependimento</h2>
          <p>
            Como manda o Código de Defesa do Consumidor (art. 49), você pode desistir da compra
            em até <strong className="text-paper">7 dias corridos</strong> a partir do recebimento,
            sem precisar justificar — nesse caso, o valor pago é reembolsado integralmente. Produtos
            com defeito de fabricação também podem ser trocados; entre em contato pelos canais
            acima pra combinar os detalhes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">7. Alterações</h2>
          <p>
            Estes termos podem mudar ao longo do tempo. A versão vigente é sempre a publicada
            nesta página.
          </p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-flare underline">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
