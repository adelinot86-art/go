-- ============================================================
--  Gestão Operacional · Field Service (técnicos de campo)
--  Rode no SQL Editor DEPOIS de schema.sql e config_e_admin.sql.
-- ============================================================

-- ---------- Técnicos de campo ----------
-- O vínculo com o login é por E-MAIL: crie o usuário na aba Usuários
-- (mesmo e-mail) e cadastre o técnico aqui com o mesmo e-mail.
create table if not exists public.tecnicos (
  id               bigint generated always as identity primary key,
  nome             text not null,
  email            text,               -- e-mail do login do técnico (para ele ver só os chamados dele)
  telefone         text,
  base_atendimento text,
  cor              text default '#4d9fff',  -- cor do técnico no Gantt
  ativo            boolean default true,
  created_at       timestamptz default now()
);
create unique index if not exists tecnicos_nome_key  on public.tecnicos (lower(nome));
create index        if not exists tecnicos_email_idx on public.tecnicos (lower(email));

alter table public.tecnicos enable row level security;
drop policy if exists tecnicos_select_auth on public.tecnicos;
drop policy if exists tecnicos_write_auth  on public.tecnicos;
create policy tecnicos_select_auth on public.tecnicos for select to authenticated using (true);
create policy tecnicos_write_auth  on public.tecnicos for all    to authenticated using (true) with check (true);

-- ---------- Colunas de field service nos chamados ----------
alter table public.chamados
  add column if not exists agendado_em     timestamptz,   -- início agendado (Gantt)
  add column if not exists duracao_min      int default 60, -- duração estimada em minutos
  add column if not exists deslocamento_em  timestamptz,   -- carimbo: técnico saiu em deslocamento
  add column if not exists execucao_em      timestamptz,   -- carimbo: técnico iniciou execução
  add column if not exists encerrado_em     timestamptz,   -- carimbo: técnico encerrou
  add column if not exists encerrado_por    text;          -- nome do técnico que encerrou

create index if not exists chamados_agendado_idx on public.chamados (agendado_em);

-- ---------- (Opcional) migrar técnicos já existentes ----------
-- Copia os nomes distintos de técnico já usados nos chamados para a tabela tecnicos:
-- insert into public.tecnicos (nome)
--   select distinct tecnico from public.chamados
--   where coalesce(trim(tecnico),'') <> '' and tecnico <> '-'
-- on conflict do nothing;
