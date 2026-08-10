# Loja de Camisas Online

Loja pública de venda de camisas — catálogo, login com Google ou e-mail/senha,
carrinho e pagamento real via Pix (chave própria, com QR Code e copia-e-cola).
Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase (banco,
auth e storage).

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

### 2.4 Publicar o app OAuth (liberar login pra qualquer cliente)

Enquanto o app estiver em modo **Testing** no Google Cloud, só e-mails
cadastrados como **Test user** conseguem logar. Pra liberar geral:

1. **APIs & Services → OAuth consent screen**
2. Preencha (se ainda não tiver) **Application home page**, **Privacy policy
   link** (`https://sua-loja.vercel.app/privacidade`) e **Terms of service
   link** (`.../termos`)
3. Clique em **Publish App**

Como o app só pede escopos básicos (nome, e-mail, foto), o Google libera na
hora — não precisa de revisão manual.

---

## 3. Login com e-mail e senha (alternativa ao Google)

Além do Google, a loja também aceita cadastro/login com e-mail e senha
(`/cadastro`, `/entrar`, `/recuperar-senha`, `/redefinir-senha`), com
confirmação por e-mail obrigatória antes do primeiro login.

### 3.1 Configurar SMTP próprio (obrigatório)

O envio de e-mail embutido do Supabase é muito limitado (poucos e-mails por
hora) e **só libera editar o conteúdo/HTML dos templates se você configurar
um SMTP próprio** — sem isso, o passo 3.2 nem aparece disponível para edição.
Usamos o [Resend](https://resend.com) (gratuito até 3.000 e-mails/mês):

1. Crie uma conta em [resend.com](https://resend.com)
2. No painel do Resend, vá em **API Keys → Create API Key** e copie a chave gerada
3. No Supabase: **Project Settings → Authentication → SMTP Settings** (ative
   "Enable Custom SMTP") e preencha:
   - **Sender email**: `onboarding@resend.dev` (funciona sem verificar domínio
     próprio; quando você tiver um domínio da loja, pode trocar por algo como
     `naoresponda@sualoja.com.br` verificando o domínio no Resend)
   - **Sender name**: `Loja de Camisas`
   - **Host**: `smtp.resend.com`
   - **Port**: `465`
   - **Username**: `resend`
   - **Password**: a API Key copiada no passo 2
4. Salve

### 3.2 Conferir que a confirmação de e-mail está ativa

**Authentication → Sign In / Providers → Email** → confirme que **Confirm
email** está ativado (é o padrão em projetos novos). Sem isso, qualquer
e-mail entraria sem confirmar nada.

### 3.3 Apontar os e-mails de confirmação pra rota da loja

Por padrão, o link desses e-mails leva pro servidor do Supabase, não pro seu
site. Para os links funcionarem com a rota `/auth/confirm` já implementada no
projeto (que confirma o cadastro **e** já verifica se falta completar o
perfil), edite dois templates em **Authentication → Email Templates** (agora
liberado, com o SMTP configurado no passo 3.1):

**Confirm signup** — troque o link por:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar e-mail</a>
```

**Reset Password** — troque o link por:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Redefinir senha</a>
```

### 3.4 Redirect URLs

Em **Authentication → URL Configuration → Redirect URLs**, garanta que
`http://localhost:3000/auth/confirm` (e depois a URL de produção) também
esteja na lista, junto com a de `/auth/callback`.

---

## 4. Configurar o Pix (chave própria, sem intermediador)

O pagamento hoje é só Pix, gerado direto da sua própria chave (sem Mercado
Pago) — o cliente vê um QR Code e um código "copia e cola" na própria loja,
paga direto na sua conta, e **você confirma manualmente** no painel admin.
Diferente do Mercado Pago, não existe nenhum aviso automático de que alguém
pagou — nem o Pix nem nenhum serviço te notifica sozinho, então a confirmação
depende de você conferir o extrato/app do banco.

1. Preencha no `.env.local`:
   - `PIX_KEY` — sua chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória)
   - `PIX_MERCHANT_NAME` — nome exibido no QR Code (até 25 caracteres, sem acento)
   - `PIX_MERCHANT_CITY` — cidade exibida no QR Code (até 15 caracteres, sem acento)
2. Pronto — não precisa de conta em nenhum serviço externo pra isso funcionar.

**Como o pedido fica sem pagar (estoque, tempo, cancelamento):**
- Ao clicar em "Finalizar compra", o estoque do tamanho já é **reservado na
  hora** (abatido do `camisa_tamanhos`), e o pedido nasce como
  `aguardando_pagamento`.
- O cliente tem **30 minutos** (contados a partir da criação do pedido) pra
  pagar — é o timer mostrado na tela de pagamento.
- Se o tempo passar sem confirmação manual sua, o pedido é cancelado
  automaticamente (na próxima vez que alguém abrir o catálogo, a tela de
  pedidos, ou o admin — não tem cron/infra externa, é verificado nessas
  telas) e o estoque reservado volta a ficar disponível.
- Pra confirmar que um pagamento caiu, você mesmo confere seu extrato/app do
  banco e clica em **"Marcar como pago"** na tela `/admin/pedidos` (ou
  **"Cancelar"**, se o cliente desistiu, pra liberar o estoque na hora sem
  esperar os 30 min).

---

## 5. Rodando localmente

```bash
npm install
cp .env.example .env.local
# preencha .env.local com as chaves dos passos 1, 2 e 3
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 5.1 Testando uma compra de ponta a ponta

1. Entre na loja (Google ou e-mail/senha).
2. Escolha uma camisa, um tamanho, e clique em **Adicionar ao carrinho**.
3. Vá em **Carrinho → Finalizar compra**. Isso chama `POST /api/checkout`, que:
   - valida estoque e recalcula o preço direto do banco;
   - cria o pedido com `status = aguardando_pagamento` e **reserva o estoque**
     (abate na hora, sem esperar pagamento);
   - gera o BR Code/QR do Pix e te leva pra `/pedidos/[id]/pagamento`.
4. Você vê o QR Code, o botão "Copiar código Pix" e o timer de 30 minutos.
   Como é uma chave Pix de verdade, dá pra escanear com o app do seu banco e
   pagar de verdade (valor baixo, é sua própria chave recebendo).
5. Depois de pagar (ou só pra testar sem pagar de verdade), vá em
   `/admin/pedidos` e clique em **"Marcar como pago"** nesse pedido.
6. A tela de pagamento do cliente detecta a mudança sozinha em alguns
   segundos (fica checando o status) e redireciona pra `/pedidos?status=sucesso`.
7. Recarregue o catálogo (`/`) e confira que o estoque daquele tamanho caiu
   (na verdade já tinha caído no passo 3 — a confirmação só muda o status).

Pra testar o cancelamento/expiração: crie um pedido e não confirme nada —
depois de 30 minutos, ele vira `cancelado` sozinho (verificado quando alguém
abre o catálogo, `/pedidos` ou `/admin/pedidos`) e o estoque volta.

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
   | `ADMIN_EMAILS` | seu(s) e-mail(s) de admin |
   | `PIX_KEY` | sua chave Pix |
   | `PIX_MERCHANT_NAME` | nome exibido no QR Code |
   | `PIX_MERCHANT_CITY` | cidade exibida no QR Code |
   | `NEXT_PUBLIC_SITE_URL` | URL final do site na Vercel, ex. `https://sua-loja.vercel.app` |

   `MERCADOPAGO_*` não é necessário hoje (não está em uso) — só adicione
   quando reativar cartão, veja a seção 8.

4. Deploy. Depois do primeiro deploy, copie a URL gerada pela Vercel e:
   - Atualize `NEXT_PUBLIC_SITE_URL` com essa URL (e faça redeploy).
   - Adicione `https://sua-loja.vercel.app/auth/callback` e
     `https://sua-loja.vercel.app/auth/confirm` nas **Redirect URLs** do
     Supabase (passos 2.3 e 3.4).
   - Adicione a mesma URL como **Authorized redirect URI** só se o Supabase
     pedir uma nova (normalmente não precisa, o redirect fica todo no domínio
     do Supabase).

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
   botão **Novo produto** e **Editar** (modelo, descrição, preço, categoria,
   fotos, estoque por tamanho P/M/G/GG e se está ativo/visível no catálogo) e
   um atalho pra ativar/desativar sem abrir o formulário.
5. **`/admin/pedidos`** — lista todos os pedidos de todos os clientes, com
   e-mail do comprador, itens, endereço de entrega, status e valor total.
   Pedidos `aguardando_pagamento` têm botões **"Marcar como pago"** (depois
   de você conferir que o Pix caiu) e **"Cancelar"** (libera o estoque na
   hora).

Todas as escritas do painel usam a `service_role` key (mesmo client admin já
usado no checkout) e checam `ADMIN_EMAILS` de novo no servidor a cada ação —
a proteção não depende só da tela não ter link visível.

---

## 8. Mercado Pago (reservado — ativar quando quiser aceitar cartão)

Não está em uso agora (o pagamento é só Pix direto, seção 4). O código de
integração com o Mercado Pago (`mercadopago` no `package.json`, a rota
`src/app/api/mercadopago/webhook/route.ts`) continua no projeto, só
desconectado do checkout — reativar é trabalho de código (reintroduzir a
criação de preferência em `/api/checkout`), não só configuração. Quando
chegar a hora:

1. Acesse [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel) e faça login com sua conta Mercado Pago (ou crie uma).
2. **Suas integrações → Criar aplicação**. Escolha "Pagamentos online" / "CheckoutPro".
3. Na aplicação criada, aba **Credenciais de teste**, copie:
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN` (**secreto**, só no backend)
4. Em **Contas de teste** (menu lateral, fora da aplicação), crie um
   **comprador** de teste — é com esse login que se simula a compra no
   checkout do Mercado Pago (não usa dinheiro real).
5. O webhook precisa de URL pública mesmo em desenvolvimento: use um túnel
   (ex. [ngrok](https://ngrok.com/) `ngrok http 3000`) e aponte
   `NEXT_PUBLIC_SITE_URL` pra URL gerada, sem isso o pedido fica em
   `aguardando_pagamento` mesmo com o pagamento aprovado do lado do Mercado Pago.
6. Pra produção: complete a ativação de produção no painel deles (vincula
   CPF/CNPJ e dados bancários), troque as credenciais de teste pelas de
   produção e `MERCADOPAGO_ENV=production` — a rota já escolhe entre
   `sandbox_init_point` e `init_point` sozinha com base nessa variável.

---

## Segurança — o que já está garantido no código

- O `SUPABASE_SERVICE_ROLE_KEY` e o `PIX_KEY` só são lidos em `src/app/api/**`
  e `src/lib/**` (roda no servidor). Nunca aparecem em nenhum componente
  cliente nem no bundle enviado ao navegador (o BR Code final, que já contém
  a chave Pix embutida — é assim que o Pix funciona, o pagador precisa ver a
  chave —, esse sim é enviado ao cliente, só a variável de ambiente crua não).
- `POST /api/checkout` ignora qualquer preço/estoque enviado pelo navegador:
  busca `camisas`/`camisa_tamanhos` de novo no banco e recalcula o total.
- Como o pagamento é confirmado manualmente (sem webhook/PSP), a confirmação
  (`marcarComoPago`) e o cancelamento (`cancelarPedido`) só existem como
  server actions do painel `/admin`, atrás do `requireAdmin()` — o cliente
  nunca consegue mudar o próprio status de pedido.
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
    page.tsx                     # catálogo público (home, filtro por categoria)
    produto/[id]/page.tsx        # detalhe do produto + galeria + seleção de tamanho
    carrinho/page.tsx            # carrinho + botão de checkout
    pedidos/page.tsx             # "Meus pedidos" (autenticado)
    completar-cadastro/          # telefone + endereço obrigatórios antes de comprar
    entrar/page.tsx              # login com e-mail/senha (+ Google)
    cadastro/page.tsx            # criar conta com e-mail/senha
    recuperar-senha/page.tsx     # pedir link de redefinição de senha
    redefinir-senha/page.tsx     # definir nova senha (via link do e-mail)
    termos/page.tsx              # Termos de Uso
    privacidade/page.tsx         # Política de Privacidade (LGPD)
    pedidos/[id]/pagamento/page.tsx  # QR Code Pix, copia-e-cola, timer de 30min
    auth/callback/route.ts       # callback do OAuth do Google
    auth/confirm/route.ts        # confirma e-mail (cadastro) e recuperação de senha
    api/checkout/route.ts        # cria pedido, reserva estoque, gera o Pix
    api/pedidos/[id]/status/route.ts  # status do pedido (polling da tela de pagamento)
    api/mercadopago/webhook/route.ts  # não usado hoje — reservado (seção 8)
    admin/                        # painel restrito (ADMIN_EMAILS)
      layout.tsx                  # protege todas as rotas /admin
      produtos/page.tsx           # lista + ativar/desativar produto
      produtos/novo/page.tsx      # criar produto
      produtos/[id]/page.tsx      # editar produto + estoque por tamanho + fotos
      produtos/actions.ts         # server actions (service_role)
      pedidos/page.tsx            # lista de pedidos + dados de entrega
      pedidos/actions.ts          # marcar como pago / cancelar (service_role)
  components/
    Header.tsx, Footer.tsx, GoogleLoginButton.tsx, ShirtPlaceholder.tsx
  lib/
    supabase/client.ts           # client Supabase p/ browser
    supabase/server.ts           # client Supabase p/ Server Components (RLS)
    supabase/admin.ts            # client com service_role (só em rotas de API)
    supabase/storage.ts          # upload/remoção de fotos no bucket camisas-fotos
    pix.ts                       # gera o BR Code + QR Code (pix-utils)
    expirar-pedidos.ts           # cancela pedidos vencidos e devolve estoque
    cart-store.ts                # carrinho (zustand + localStorage)
    admin-auth.ts                # checa ADMIN_EMAILS no servidor
    types.ts
  proxy.ts                       # mantém a sessão do Supabase sincronizada
supabase/migrations/
  0001_init.sql                  # camisas, pedidos, pedido_itens, RLS
  0002_categorias_e_demo.sql     # categorias do catálogo
  0003_perfis_e_entrega.sql      # perfis (telefone/endereço) + snapshot de entrega
  0004_camisa_fotos.sql          # galeria de fotos por produto
```

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # roda o build de produção localmente
npm run lint     # eslint
```
