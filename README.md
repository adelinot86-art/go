# Gestão Operacional — Suporte Técnico (Canal Educação)

Sistema web de **gestão de chamados técnicos** com dashboard operacional, cadastro
de chamados e calculadora de serviços (USS/UST). Front-end em **Vanilla JS** com
banco de dados no **Supabase (PostgreSQL)** e autenticação por e-mail/senha.

## Funcionalidades

- **Dashboard** (`index.html`): KPIs agrupados (Volume / Prazo & SLA / Risco) com
  metas, tendência e **clique para filtrar** todo o painel; mapa operacional do
  Piauí (Leaflet); gráficos (Chart.js); tabela com busca e filtros; exportação CSV.
- **Cadastro de chamados**: modal "Novo chamado" que grava direto no Supabase.
- **Calculadora** (`calculadora.html`): USS com deslocamento (Item 07) e UST
  (Itens 11/13), com localizador inteligente e geração de PDF.
- **Login** (`login.html`): Supabase Auth. Acesso restrito a usuários cadastrados.
- **Configurações** (`config.html`): gerencia as **opções dos campos** do cadastro
  (Departamento, Base, Tipo, Status, Prioridade, Técnico, Município, Materiais) e
  os **usuários** (criar/editar/excluir) — este último via Edge Function.
- **Edição de chamados**: botão ✏️ em cada linha da tabela abre o modal em modo edição.

## Stack

- HTML/CSS/JS puro (sem build) — hospedável em qualquer estático (HostGator, GitHub Pages…)
- [supabase-js v2](https://supabase.com/docs/reference/javascript) via CDN
- Chart.js, Leaflet, Font Awesome, jsPDF (via CDN)

## Estrutura

```
index.html                     Dashboard
login.html                     Tela de login
config.html                    Configurações (opções dos campos + usuários)
calculadora.html               Calculadora de serviços
assets/js/config.js            URL + anon key do Supabase (a anon key é pública)
assets/js/config.example.js    Modelo de configuração
assets/js/supabase.js          Cliente Supabase + camada de dados/auth
db/schema.sql                  Tabela chamados + índices + RLS
db/config_e_admin.sql          Tabelas config_opcoes + admins + opções iniciais
db/seed_exemplo.sql            Dados de exemplo (opcional)
supabase/functions/admin-users/ Edge Function de gestão de usuários
legacy-apps-script/            Versão anterior (Google Apps Script) — referência
```

## Configuração

1. **Crie um projeto no Supabase** e, no *SQL Editor*, rode nesta ordem:
   - `db/schema.sql` (tabela de chamados + RLS)
   - `db/config_e_admin.sql` (opções dos campos + tabela de admins)
   - *(opcional)* `db/seed_exemplo.sql` (dados de teste)
2. **Configure as credenciais**: em `assets/js/config.js`, preencha `SUPABASE_URL`
   e `SUPABASE_ANON_KEY` (*Project Settings → API*).
3. **Crie um usuário** em *Authentication → Users → Add user* (e-mail + senha).
4. **Torne-o admin** (para gerenciar usuários pelo sistema): no SQL Editor rode
   `insert into public.admins (email) values ('seu-email@exemplo.com');`
5. **Publique a Edge Function** de usuários (veja abaixo).
6. **Abra `login.html`** (via servidor estático) e entre.

> A *anon key* é pública por design — o que protege os dados é o **RLS**
> (somente autenticados leem/gravam). O gerenciamento de usuários usa a
> `service_role`, que fica **só no servidor** (na Edge Function).

## Edge Function `admin-users` (gestão de usuários)

Criar/editar/excluir usuários exige a chave `service_role`, que nunca pode ir para
o front-end. Por isso isso roda numa Edge Function. Para publicar:

```bash
# instale a CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref hoejhegrgmhygdyubnex
supabase functions deploy admin-users
```

As variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` já
são injetadas automaticamente no ambiente da função — não precisa configurar nada.
A função só autoriza e-mails presentes na tabela `public.admins`.

> Alternativa sem CLI: no painel do Supabase → *Edge Functions* → *Create a function*
> chamada `admin-users`, cole o conteúdo de `supabase/functions/admin-users/index.ts`.

## Rodar localmente

Por causa do CORS/módulos, sirva por HTTP (não abra via `file://`):

```bash
# Python
python -m http.server 5500
# ou Node
npx serve .
```

Acesse `http://localhost:5500/login.html`.

## Deploy

Suba os arquivos estáticos para o seu host (HostGator, Netlify, GitHub Pages…).
Garanta que `assets/js/config.js` esteja presente no servidor.
