# Loja de Camisas Online

Loja pública de venda de camisas — catálogo, login com Google, carrinho e
pagamento real (Pix, débito e crédito) via Mercado Pago. Stack: Next.js 16
(App Router) + TypeScript + Tailwind CSS + Supabase (banco + auth).

Este é um projeto **isolado**: usa seu próprio projeto Supabase, criado do
zero, sem qualquer relação com outros sistemas ou tabelas que você já tenha.

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**.
2. Escolha uma região (recomendado `South America (São Paulo)`).
3. Anote a **senha do banco** (só é usada se você quiser conectar via `psql`).
4. Espere o projeto provisionar (~2 min).
5. Vá em **Settings → API** e guarde três valores, você vai precisar deles no `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**, nunca vai para o frontend)

### 1.1 Rodar a migration

1. No painel do Supabase, abra **SQL Editor → New query**.
2. Cole o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e clique em **Run**.
3. Isso cria as tabelas `camisas`, `camisa_tamanhos`, `pedidos`, `pedido_itens`, as
   políticas de RLS, e insere 3 camisas de exemplo (com estoque) para você já
   ver o catálogo funcionando.

> Se preferir, use o [Supabase CLI](https://supabase.com/docs/guides/cli)
> (`supabase link` + `supabase db push`) em vez de colar no SQL Editor.

### 1.2 Schema criado

- **`camisas`** — catálogo (`modelo`, `descricao`, `preco`, `foto_url`, `ativo`). Leitura pública.
- **`camisa_tamanhos`** — estoque por tamanho de cada camisa (`camisa_id`, `tamanho`, `estoque`). Leitura pública.
- **`pedidos`** — um pedido por checkout (`user_id`, `status`, `valor_total`, `forma_pagamento`, `mercado_pago_payment_id`). RLS: cliente só vê/cria os próprios.
- **`pedido_itens`** — itens de cada pedido (`pedido_id`, `camisa_id`, `tamanho`, `quantidade`, `preco_unitario`). RLS: só do próprio pedido.

Todo o fluxo de criação de pedido e confirmação de pagamento roda em rotas de
servidor usando a `service_role` key, que recalculam o preço a partir do
banco — o cliente nunca consegue manipular valores.

---

## 2. Configurar login com Google

### 2.1 Criar as credenciais no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto (ou use um existente).
2. Vá em **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - Preencha nome do app, e-mail de suporte, e-mail de contato do desenvolvedor.
   - Em modo de teste, adicione seu e-mail (e de quem for testar) como **Test user**.
3. Vá em **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Em **Authorized redirect URIs**, adicione a URL de callback do Supabase. Ela
     está em **Supabase → Authentication → Sign In / Providers → Google**
     (algo como `https://<seu-projeto>.supabase.co/auth/v1/callback`).
4. Copie o **Client ID** e o **Client Secret** gerados.

### 2.2 Ativar o provider no Supabase

1. No Supabase: **Authentication → Sign In / Providers → Google**.
2. Ative o provider e cole o **Client ID** e **Client Secret** do passo anterior.
3. Salve.

### 2.3 Configurar URLs de redirecionamento

Em **Authentication → URL Configuration**, adicione:
- **Site URL**: `http://localhost:3000` (em produção, a URL da Vercel)
- **Redirect URLs**: `http://localhost:3000/auth/callback` (e depois a URL de produção `/auth/callback`)

Não precisa criar tabela de perfil: nome, e-mail e avatar do usuário vêm
automaticamente do Google em `user.user_metadata` (`full_name`, `avatar_url`, `email`).

---

## 3. Configurar o Mercado Pago (modo de teste)

1. Acesse [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel) e faça login com sua conta Mercado Pago (ou crie uma).
2. **Suas integrações → Criar aplicação**. Escolha "Pagamentos online" / "CheckoutPro".
3. Na aplicação criada, aba **Credenciais de teste**, copie:
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN` (**secreto**, só no backend)
4. Em **Contas de teste** (menu lateral, fora da aplicação), crie 2 usuários de teste:
   - Um **vendedor** de teste (não é usado diretamente aqui, mas fica registrado).
   - Um **comprador** de teste — é com esse login que você vai simular a compra
     no checkout do Mercado Pago (ele não usa dinheiro real).
5. Para simular Pix/cartão aprovado ou recusado em teste, use os
   [cartões de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards)
   — por exemplo, um cartão de teste de crédito com CVV `123` e nome do titular
   `APRO` para aprovação automática.

### 3.1 O webhook precisa de uma URL pública mesmo em desenvolvimento

O Mercado Pago envia a confirmação de pagamento via HTTP POST para
`NEXT_PUBLIC_SITE_URL/api/mercadopago/webhook`. Isso significa que
`localhost:3000` **não** recebe a notificação diretamente. Para testar local:

1. Instale um túnel, ex. [ngrok](https://ngrok.com/) ou `cloudflared`:
   ```bash
   ngrok http 3000
   ```
2. Copie a URL pública gerada (ex. `https://abcd1234.ngrok-free.app`) e coloque
   em `NEXT_PUBLIC_SITE_URL` no seu `.env.local`.
3. Reinicie `npm run dev`.
4. Agora, quando você finalizar uma compra de teste, o Mercado Pago vai
   conseguir notificar seu servidor local via o túnel.

Sem isso, o pedido fica criado (`aguardando_pagamento`), o pagamento é
aprovado no lado do Mercado Pago, mas o webhook nunca chega e o pedido nunca
muda para `pago`.

---

## 4. Rodando localmente

```bash
npm install
cp .env.example .env.local
# preencha .env.local com as chaves dos passos 1, 2 e 3
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 4.1 Testando uma compra de ponta a ponta

1. Clique em **Entrar com Google** e faça login (use uma conta real do
   Google — o login é normal, só o pagamento é que é em modo teste).
2. Escolha uma camisa, um tamanho, e clique em **Adicionar ao carrinho**.
3. Vá em **Carrinho → Finalizar compra**. Isso chama `POST /api/checkout`, que:
   - valida estoque e recalcula o preço direto do banco;
   - cria uma linha em `pedidos` com `status = aguardando_pagamento`;
   - cria a preferência no Mercado Pago e te redireciona para o checkout.
4. No checkout do Mercado Pago, **faça login com a conta de comprador de
   teste** (não com sua conta pessoal) e finalize o pagamento com um dos
   [cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards),
   ou escolha Pix (o Mercado Pago simula a aprovação automaticamente em modo teste).
5. Você volta para `/pedidos?status=sucesso`. Se o túnel (ngrok) estiver de
   pé, em alguns segundos o pedido muda de **Aguardando pagamento** para
   **Pago** — o webhook processou a confirmação e abateu o estoque em
   `camisa_tamanhos`.
6. Recarregue o catálogo (`/`) e confira que o estoque daquele tamanho caiu.

Se quiser inspecionar as notificações recebidas, veja os logs do terminal
onde `npm run dev` está rodando — o webhook loga erros de validação (valor
pago não confere, pedido não encontrado, etc).

---

## 5. Indo para produção (quando tiver CPF/CNPJ vinculado ao Mercado Pago)

1. Na sua aplicação em **developers.mercadopago.com/panel**, complete a
   ativação de produção (vincula CPF/CNPJ e dados bancários).
2. Copie as **Credenciais de produção** (Public Key e Access Token — começam
   sem o prefixo `TEST-`).
3. No `.env` de produção (Vercel), troque:
   - `MERCADOPAGO_ACCESS_TOKEN` → access token de produção
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` → public key de produção
   - `MERCADOPAGO_ENV=production`
4. Não precisa mudar nenhum código — a rota `/api/checkout` já escolhe entre
   `sandbox_init_point` e `init_point` com base em `MERCADOPAGO_ENV`.
5. Faça uma compra real de baixo valor para confirmar que webhook, estoque e
   pedido pago estão funcionando antes de divulgar a loja.

---

## 6. Deploy na Vercel

1. Suba este projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione (mesmos nomes do `.env.example`):

   | Variável | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key do Supabase |
   | `MERCADOPAGO_ACCESS_TOKEN` | access token (teste ou produção) |
   | `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | public key (teste ou produção) |
   | `MERCADOPAGO_ENV` | `test` ou `production` |
   | `NEXT_PUBLIC_SITE_URL` | URL final do site na Vercel, ex. `https://sua-loja.vercel.app` |

4. Deploy. Depois do primeiro deploy, copie a URL gerada pela Vercel e:
   - Atualize `NEXT_PUBLIC_SITE_URL` com essa URL (e faça redeploy).
   - Adicione `https://sua-loja.vercel.app/auth/callback` nas **Redirect URLs**
     do Supabase (passo 2.3).
   - Adicione a mesma URL como **Authorized redirect URI** só se o Supabase
     pedir uma nova (normalmente não precisa, o redirect fica todo no domínio
     do Supabase).

O webhook do Mercado Pago passa a apontar automaticamente para
`https://sua-loja.vercel.app/api/mercadopago/webhook` — não precisa mais de
ngrok em produção.

---

## 7. Painel de administração (`/admin`)

Tela restrita pra você (dono da loja) cadastrar/editar produtos e ver os
pedidos recebidos. Não aparece nenhum link pra ela na navegação pública —
acesse direto pela URL.

1. Defina `ADMIN_EMAILS` no `.env.local` (e nas env vars da Vercel) com o
   e-mail da conta Google que você loga na loja. Aceita mais de um e-mail,
   separado por vírgula.
2. Faça login normalmente com **Entrar com Google** usando esse e-mail.
3. Acesse `http://localhost:3000/admin` (ou `https://sua-loja.vercel.app/admin`
   em produção). Quem não estiver na lista de `ADMIN_EMAILS` é redirecionado
   pro catálogo.
4. **`/admin/produtos`** — lista todos os produtos (inclusive inativos), com
   botão **Novo produto** e **Editar** (modelo, descrição, preço, foto,
   estoque por tamanho P/M/G/GG e se está ativo/visível no catálogo) e um
   atalho pra ativar/desativar sem abrir o formulário.
5. **`/admin/pedidos`** — lista todos os pedidos de todos os clientes, com
   e-mail do comprador, itens, forma de pagamento, status e valor total.

Todas as escritas do painel usam a `service_role` key (mesmo client admin já
usado no checkout/webhook) e checam `ADMIN_EMAILS` de novo no servidor a cada
ação — a proteção não depende só da tela não ter link visível.

---

## Segurança — o que já está garantido no código

- O `SUPABASE_SERVICE_ROLE_KEY` e o `MERCADOPAGO_ACCESS_TOKEN` só são lidos em
  `src/app/api/**` (roda no servidor) e em `src/lib/supabase/admin.ts`. Nunca
  aparecem em nenhum componente cliente nem no bundle enviado ao navegador.
- `POST /api/checkout` ignora qualquer preço/estoque enviado pelo navegador:
  busca `camisas`/`camisa_tamanhos` de novo no banco e recalcula o total.
- `POST /api/mercadopago/webhook` confere se `transaction_amount` do
  pagamento aprovado é igual ao `valor_total` do pedido antes de marcar como
  `pago` e abater estoque — se não bater, o pedido é cancelado em vez de
  aprovado.
- O webhook é idempotente: se o Mercado Pago reenviar a mesma notificação
  (comportamento normal do serviço), um pedido já `pago` não sofre o
  abatimento de estoque de novo.
- RLS no Supabase garante que um cliente só lê/cria os próprios `pedidos` e
  `pedido_itens`; não existe policy de `UPDATE`/`DELETE` para o cliente —
  status de pedido e estoque só mudam via rotas de servidor.
- O painel `/admin` verifica `ADMIN_EMAILS` no servidor em toda página e em
  toda server action (não só uma vez no layout) — mesmo alguém descobrindo a
  URL de uma rota ou action do admin, sem estar na lista, cai fora.

---

## Estrutura do projeto

```
src/
  app/
    page.tsx                     # catálogo público (home)
    produto/[id]/page.tsx        # detalhe do produto + seleção de tamanho
    carrinho/page.tsx            # carrinho + botão de checkout
    pedidos/page.tsx             # "Meus pedidos" (autenticado)
    auth/callback/route.ts       # callback do OAuth do Google
    api/checkout/route.ts        # cria pedido + preferência Mercado Pago
    api/mercadopago/webhook/route.ts  # confirma pagamento, abate estoque
    admin/                        # painel restrito (ADMIN_EMAILS)
      layout.tsx                  # protege todas as rotas /admin
      produtos/page.tsx           # lista + ativar/desativar produto
      produtos/novo/page.tsx      # criar produto
      produtos/[id]/page.tsx      # editar produto + estoque por tamanho
      produtos/actions.ts         # server actions (service_role)
      pedidos/page.tsx            # lista de todos os pedidos
  components/
    Header.tsx, GoogleLoginButton.tsx
  lib/
    supabase/client.ts           # client Supabase p/ browser
    supabase/server.ts           # client Supabase p/ Server Components (RLS)
    supabase/admin.ts            # client com service_role (só em rotas de API)
    cart-store.ts                # carrinho (zustand + localStorage)
    types.ts
  proxy.ts                       # mantém a sessão do Supabase sincronizada
supabase/migrations/0001_init.sql
```

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # roda o build de produção localmente
npm run lint     # eslint
```
