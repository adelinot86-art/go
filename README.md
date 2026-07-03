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

## Stack

- HTML/CSS/JS puro (sem build) — hospedável em qualquer estático (HostGator, GitHub Pages…)
- [supabase-js v2](https://supabase.com/docs/reference/javascript) via CDN
- Chart.js, Leaflet, Font Awesome, jsPDF (via CDN)

## Estrutura

```
index.html               Dashboard
login.html               Tela de login
calculadora.html         Calculadora de serviços
assets/js/config.js      URL + anon key do Supabase (a anon key é pública)
assets/js/config.example.js  Modelo de configuração
assets/js/supabase.js    Cliente Supabase + camada de dados/auth
db/schema.sql            Criação da tabela + índices + RLS
legacy-apps-script/      Versão anterior (Google Apps Script) — referência
```

## Configuração

1. **Crie um projeto no Supabase** e rode o `db/schema.sql` no *SQL Editor*.
2. **Crie um usuário** em *Authentication → Users → Add user* (e-mail + senha).
3. **Configure as credenciais**: copie `assets/js/config.example.js` para
   `assets/js/config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`
   (em *Project Settings → API*).
4. **Abra `login.html`** (via servidor estático ou hospedagem) e entre.

> A *anon key* é pública por design — o que protege os dados é o **RLS** definido
> em `db/schema.sql` (somente usuários autenticados leem/gravam).

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
