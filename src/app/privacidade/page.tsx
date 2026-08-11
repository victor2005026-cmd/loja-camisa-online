import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — LV Sports",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl uppercase tracking-wide text-paper">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-muted">Última atualização: 10/08/2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <p>
            Esta página explica quais dados a LV Sports coleta, pra que servem e com quem
            são compartilhados, conforme a Lei Geral de Proteção de Dados (LGPD). O responsável
            pelo tratamento dos seus dados é{" "}
            <strong className="text-paper">Victor Rodrigues Esteves</strong>, CPF{" "}
            <strong className="text-paper">499.892.238-66</strong>. Dúvidas ou pedidos sobre seus dados:{" "}
            <strong className="text-paper">WhatsApp (13) 99174-9391 ou Instagram @lv.sports013</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">1. Quais dados coletamos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Nome, e-mail e foto de perfil, fornecidos pelo Google quando você entra na loja</li>
            <li>Telefone e endereço completo, que você preenche no cadastro</li>
            <li>Histórico de pedidos: produtos, tamanhos, valores e status de pagamento</li>
            <li>Itens salvos no carrinho, guardados só no seu navegador (não no nosso banco)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">2. Para que usamos</h2>
          <p>
            Só para operar a loja: identificar sua conta, processar e confirmar pagamentos,
            organizar a entrega das suas compras, e cumprir obrigações fiscais. Não vendemos nem
            alugamos seus dados para terceiros, e não usamos seu telefone ou endereço para nada
            além de combinar a entrega dos seus próprios pedidos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">3. Com quem compartilhamos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-paper">Google</strong> — autenticação da sua conta (login)
            </li>
            <li>
              <strong className="text-paper">Supabase</strong> — banco de dados e armazenamento
              onde suas informações ficam hospedadas
            </li>
            <li>
              <strong className="text-paper">Mercado Pago</strong> — processamento do pagamento via
              Pix; dados bancários/da conta de pagamento ficam só com eles, nunca passam por nós
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">4. Cookies e armazenamento local</h2>
          <p>
            Usamos um cookie de sessão pra manter você logado, e o armazenamento local do
            navegador (localStorage) pra guardar o conteúdo do seu carrinho entre visitas. Nenhum
            dos dois é usado para rastreamento ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">5. Por quanto tempo guardamos</h2>
          <p>
            Dados de cadastro (telefone/endereço) ficam enquanto sua conta existir. Pedidos são
            mantidos mesmo depois disso, pelo tempo exigido pela legislação fiscal.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">6. Seus direitos</h2>
          <p>
            Você pode pedir a qualquer momento pra ver quais dados temos sobre você, corrigi-los
            ou excluir sua conta e seus dados, usando o contato no topo desta página. Excluir sua
            conta não apaga pedidos já feitos, que precisam ser mantidos por obrigação legal.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-paper">7. Alterações</h2>
          <p>
            Esta política pode mudar ao longo do tempo. A versão vigente é sempre a publicada
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
