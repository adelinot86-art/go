# Projeto GO — Gestão Operacional (handoff / contexto)

Documento de continuidade do projeto. Leia isto para retomar o desenvolvimento em
uma nova pasta/sessão. Tudo que está descrito aqui **já foi implementado e está no
GitHub**, salvo o que estiver marcado como *pendente*.

---

## 1. Visão geral

Sistema web de **gestão de chamados técnicos** para o Programa de Mediação
Tecnológica (Canal Educação · OROS), estado do **Piauí** — manutenção de
kits/computadores/internet via satélite em escolas.

Começou como um app **Google Apps Script + planilha** e foi **migrado** para um
sistema web estático em **Vanilla JS + Supabase (PostgreSQL + Auth + Storage)**.
A versão antiga fica em `legacy-apps-script/` só como referência.

- **Repositório:** https://github.com/adelinot86-art/go
- **Supabase:** projeto ref `hoejhegrgmhygdyubnex` — URL `https://hoejhegrgmhygdyubnex.supabase.co`
  (a *anon key* fica em `assets/js/config.js`; é pública por design, protegida por RLS)
- **Edge Function:** `admin-users` (gestão de usuários) — precisa estar publicada

### Retomar em pasta nova (`gooos`)
O jeito mais limpo é clonar o repositório (já vem conectado ao remote):
```bash
git clone https://github.com/adelinot86-art/go.git gooos
cd gooos
```
> Não abra os `.html` por `file://` — precisa servir por HTTP (Live Server do VSCode,
> `python -m http.server`, etc.), senão o Supabase Auth e os módulos não funcionam.

---

## 2. Stack

- HTML/CSS/JS puro (sem build), hospedável em qualquer estático (HostGator, GitHub Pages…)
- Supabase JS v2 (Auth, PostgREST, Storage) via CDN
- Bibliotecas via CDN: Leaflet (mapas), Chart.js (gráficos), Font Awesome, jsPDF
- Roteamento OSRM (rotas) e tiles OSM/Carto/Esri (mapas), sem chave

### Convenções (importante manter)
- **Código sem acento; textos de UI com acento** (ex: variáveis `municipio`, label "Município").
- Colunas do banco em `snake_case` sem acento.
- Mensagens de commit em pt-BR, terminando com `Co-Authored-By: ...`.
- `git sync` antes de editar; ler o arquivo inteiro antes de mexer.

---

## 3. Estrutura de arquivos

```
index.html            Dashboard (admin/despachante)
login.html            Login (roteia técnico -> tecnico.html; demais -> index.html)
tecnico.html          App do técnico (mobile) — a "caixa" de chamados dele
gantt.html            Despacho: linha do tempo (Gantt) + mapa + rota + barra lateral
config.html           Configurações (abas: Opções dos campos, Clientes, Técnicos, Usuários)
calculadora.html      Calculadora de serviços USS/UST (Item 07/11/13) com PDF

assets/js/
  config.js           SUPABASE_URL + anon key (real; público)
  config.example.js   Modelo
  supabase.js         Cliente `sb` + TODA a camada de dados/auth/storage (helpers globais)
  nav.js              Barra de navegação lateral (Dashboard/Gantt/Calculadora/Configurações)
  coords.js           window.COORDS_PI (coords dos municípios do Piauí, p/ mapa)
  theme.js            Tema claro/escuro (toggle, persiste no localStorage)
  servicos.js         window.CALC_SERV / CALC_DESL (tabelas USS/deslocamento, do Item 07)
  logo.js             window.OROS_LOGO (data URI) — logo no PDF/imagem
  reciboUss.js        Gera PDF (jsPDF) e imagem PNG do cálculo/chamado, com logo

db/                   Migrações SQL (rodar no SQL Editor do Supabase — ordem na seção 4)
supabase/functions/admin-users/index.ts   Edge Function (usa service_role no servidor)
legacy-apps-script/   Versão antiga (Apps Script) — só referência
```

### Camada de dados — `assets/js/supabase.js` (principais helpers)
- Chamados: `fetchChamados` (mapeia colunas do banco -> cabeçalhos de exibição),
  `insertChamado`, `updateChamado`, `fetchChamadosTodos`, `fetchChamadosAtribuidos`,
  `atribuirAgendar`, `agendarChamado`, `desagendarChamado`.
- Técnicos: `fetchTecnicos/addTecnico/updateTecnico/removeTecnico`, `meuTecnico`
  (casa pelo e-mail), `fetchChamadosDoTecnico`, `fetchAgenda`, `setStatusTecnico`
  (ações: `deslocamento`, `execucao`, `encerrado`, `pendente`).
- Escala/disponibilidade: `fetchExcecoes(Todas)`, `setExcecao`, `removeExcecaoData`.
- Opções configuráveis: `fetchOpcoes`, `addOpcao`, `removeOpcao`, `setOrdemOpcao`.
- Perfis/roles: `fetchPerfis/fetchPerfil/setPerfil`, `paginaHome`, `requireAuth`,
  `requireAuthAdmin` (bloqueia técnico das telas admin), `logout`.
- Usuários (Edge Function): `adminUsers(action, payload)` — list/create/update/delete.
- Notificações: `criarNotificacao`, `fetchNotificacoes`, `marcarNotificacoesLidas`.
- Clientes: `fetchClientes/addCliente/updateCliente/removeCliente`.
- Mídia (Storage): `uploadMidiaChamado`, `fetchMidiaChamado`, `urlMidia`, `urlMidiaDownload`.

> **Atenção ao `updateChamado`:** ele grava as colunas do formulário e **preserva**
> (não zera) campos não gerenciados pelo cadastro: `uss_total`, `uss_detalhe`,
> `video_path`/`fotos_paths` (via `chamado_midia`), agendamento e carimbos de status.

---

## 4. Banco de dados — ordem dos SQLs

Rode no **SQL Editor do Supabase**, nesta ordem (idempotentes; `seed_exemplo` é opcional):

1. `db/schema.sql` — tabela **chamados** (20 colunas) + índices + RLS (só autenticados)
2. `db/config_e_admin.sql` — **config_opcoes** (opções dos campos) + **admins** (e-mails que podem gerir usuários) + seed de opções
3. `db/field_service.sql` — tabela **tecnicos** + colunas de field service nos chamados
   (`agendado_em`, `duracao_min`, `deslocamento_em`, `execucao_em`, `encerrado_em`, `encerrado_por`)
4. `db/tecnico_escala.sql` — em tecnicos: `habilidades[]`, `rotas[]`, `hora_inicio/fim`,
   `dias_semana[]` + tabela **tecnico_excecoes** (folga/trabalho por data)
5. `db/notificacoes.sql` — tabela **notificacoes**
6. `db/habilidade_rota_chamado.sql` — colunas `habilidade`/`rota` no chamado
7. `db/perfis.sql` — tabela **perfis** (email, `tipo` usuario|tecnico, nome)
8. `db/uss_chamado.sql` — colunas `uss_total`, `uss_detalhe` no chamado
9. `db/clientes.sql` — tabela **clientes** + seed de **GRE** (21) e **Município** (224) em config_opcoes
10. `db/clientes_campos.sql` — clientes: `qtd_kits`, `kits_ids[]`, `tipo_kit`, `tipo_conexao`,
    `qtd_turmas_mt`, `jornada_ampliada`, `tipo_oferta_uapi` + seed tipo_kit/tipo_conexao
11. `db/clientes_anexo.sql` — clientes: `nome_anexo`
12. `db/clientes_seed.sql` — **importa 780 clientes** (da planilha Clientes.xlsx). Rodar 1x.
13. `db/midia.sql` — **bucket Storage** `chamados-midia` (público) + policies + tabela **chamado_midia**

Depois de criar as tabelas:
- **Crie um usuário admin** e marque o perfil: em Authentication crie o login e rode
  `insert into public.admins (email) values ('SEU-EMAIL');` e
  `insert into public.perfis (email,tipo,nome) values ('SEU-EMAIL','usuario','Admin') on conflict (email) do update set tipo=excluded.tipo;`
- **Publique a Edge Function** (seção 6).

---

## 5. Funcionalidades (o que já existe)

### Login (`login.html`)
- Supabase Auth (e-mail/senha). Ao entrar, **roteia por perfil**: `tipo=tecnico` vai
  para `tecnico.html`; demais vão para `index.html`. `requireAuthAdmin` impede técnico
  de acessar dashboard/gantt/config.

### Dashboard (`index.html`)
- **KPIs** em 3 grupos (Volume / Prazo & SLA / Risco), **clicáveis** (filtram tudo),
  com **metas** e **tendência**; inclui **USS acumulado**.
- **Mapa Leaflet** com seletor de camadas (Detalhado/Escuro/Ruas/Satélite).
- Gráficos (Chart.js), filtros do topo.
- **Tabela de chamados** (não finalizados): busca + filtros multi-select + editar (✏️).
- **Tabela de chamados finalizados**: mesma pegada, com coluna **USS** + **Total USS**,
  e por linha os botões **PDF**, **Imagem** e **Mídia** (fotos/vídeo p/ download).
- **Cadastro/edição de chamado** (modal). O campo **Escola/Identificação** puxa os
  **clientes** (preenche Município e INEP ao escolher). Campo **Técnico** puxa da tabela tecnicos.

### App do técnico (`tecnico.html`, mobile)
- Vê só os chamados dele (casados por nome). Fluxo de status:
  **Deslocamento → Execução → Finalizar**.
- **Finalizar** abre uma folha com: relatório, materiais, **cálculo de USS (Item 07)**
  (bloco/linha/qtd × peso do deslocamento), **upload de 1 vídeo + até 10 fotos**, e
  dois botões: **Encerrar** (conclui, grava USS + mídia) ou **Deixar pendente**
  (salva o relatório e devolve o chamado à fila — tira técnico e horário).
- **Sino de notificações** (recebe quando um chamado é atribuído a ele).
- Na aba **Encerrados**, botões de **PDF/Imagem** do chamado.

### Gantt / Despacho (`gantt.html`)
- Linha do tempo por técnico (06:00–20:00), blocos coloridos por status (com "lanes"
  para não sobrepor). **Linha do tempo atual** (agora) e **passado travado**
  (não reagenda/remove o que já passou).
- **Barra lateral direita**: todos os **chamados abertos** com filtros (Nº, Município,
  Data de abertura, Departamento, Status). **Arrasta-e-solta** um card na linha do
  técnico → atribui técnico + agenda no horário.
- Ao soltar: avisa se o técnico **não tem habilidade compatível**; **não deixa** soltar
  em dia de **folga**; **notifica** o técnico.
- **Mapa** (clicar no bloco/atividade mostra no mapa); **gerar rota** do dia por técnico
  (OSRM) e **reordenar a rota** (arrastar as paradas, reencaixa os horários).
- **Disponibilidade** sombreada (folga listrada; fora do expediente escurecido).
- Detalhe da atividade com USS e botões PDF/Imagem; popover do técnico com skills/rotas.

### Configurações (`config.html`) — só admin
- **Opções dos campos**: gerencia as listas (Departamento, Base, Tipo, Status,
  Prioridade, Técnico, Município, Materiais, GRE, Tipo de Kit, Tipo de Conexão, UAPI).
- **Clientes**: cadastro de escolas (GRE, Município, Código INEP, Escola, Nome do Anexo,
  Qtd de Kits → **abre um campo por kit** para o ID, Tipo de Kit, Tipo de Conexão,
  Qtde de Turmas, Jornada Ampliada, Tipo de Oferta UAPI). 780 já importados.
- **Técnicos**: **seleciona um usuário** (do tipo técnico) já criado; define base, cor,
  **habilidades**, **rotas**, **expediente** (hora início/fim + dias) e **calendário de
  disponibilidade** (clique no dia = folga/trabalho extra).
- **Usuários**: cria login (e-mail/senha) e define **tipo** (Usuário/Técnico); troca
  senha/tipo; exclui — tudo via **Edge Function** `admin-users`.

### Calculadora (`calculadora.html`)
- USS com deslocamento (Item 07) + UST (Itens 11/13), localizador inteligente e PDF.

### Transversais
- **Tema claro/escuro** (`theme.js`) em todas as telas.
- **Recibo USS** (`reciboUss.js`): PDF e imagem PNG com **logo da OROS**, nº do chamado,
  dados e o detalhe do cálculo — acessível no dashboard (finalizados), no Gantt e no app do técnico.

---

## 6. Edge Function `admin-users` (gestão de usuários)

Criar/editar/excluir usuários exige a `service_role` (que **não pode** ir para o front).
Isso roda na Edge Function, que autoriza só e-mails presentes em `public.admins`.

Publicar (CLI):
```bash
supabase login
supabase link --project-ref hoejhegrgmhygdyubnex
supabase functions deploy admin-users
```
> Sem CLI: painel do Supabase → Edge Functions → criar função `admin-users` (via editor)
> e colar o conteúdo de `supabase/functions/admin-users/index.ts`. As variáveis
> `SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY` já vêm no ambiente da função.

---

## 7. Pendências / ideias futuras (não feitas)

- **Tipo de Oferta UAPI**: lista de opções ainda não definida (campo funciona como texto/combo).
- Colunas da planilha de clientes que **não** foram importadas (a pedido): Latitude/Longitude
  (dariam ponto exato no mapa, hoje é por município), Código de Entidade, Kits Supervisores,
  Sala Modelo/Modernizada, Antena, Registro Fotográfico, Modalidades, Regime, Componente,
  Oferta FGB, Possui UAPI/Kit, Escola Prioritária, Análise de Prioridade, Status Supervisão.
- Notificação ao técnico é **in-app** (aparece quando ele abre/atualiza o app); **push real**
  no celular exigiria Web Push/Service Worker.
- Bucket de mídia é **público** (link baixa direto). Dá para trocar por **privado + link assinado**.
- Rota reordenada espaça por duração, **sem** tempo de deslocamento real entre cidades
  (isso exigiria a matriz do OpenRouteService).

---

## 8. Como rodar / publicar

- **Local:** sirva por HTTP e acesse `login.html` (ex.: Live Server no VSCode).
- **Deploy:** suba os estáticos para o host (HostGator/GitHub Pages/Netlify). Garanta que
  `assets/js/config.js` esteja presente.
- **Ao mudar dados:** rode o `.sql` correspondente no Supabase; ao mudar código, `git commit`+`push`.

---

_Última entrega registrada: mídia (vídeo + 10 fotos) no encerramento e download no quadro de
finalizados (commit `4502330`)._
