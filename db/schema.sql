-- ============================================================
--  Gestão Operacional · Esquema do banco (Supabase / PostgreSQL)
--  Execute no SQL Editor do Supabase (uma vez).
-- ============================================================

-- Tabela principal de chamados
create table if not exists public.chamados (
  id                    bigint generated always as identity primary key,
  data_abertura         date,
  hora_abertura         text,
  departamento          text,
  num_chamado           text not null,
  chamado_vinculado     text,
  num_inep              text,
  escola                text,
  municipio             text,
  tecnico               text,
  base_atendimento      text,
  tipo_atendimento      text,
  status                text,
  prioridade            text,
  data_prevista         text,          -- texto: pode conter faixas como "15 a 20/06"
  materiais             text,
  num_chamado_materiais text,
  relatorio_tecnico     text,
  data_encerramento     date,
  link_atividades       text,
  observacoes           text,
  created_at            timestamptz default now(),
  created_by            uuid default auth.uid()
);

-- Impede número de chamado duplicado
create unique index if not exists chamados_num_chamado_key on public.chamados (num_chamado);

-- Índices para os filtros/agregações do dashboard
create index if not exists chamados_status_idx        on public.chamados (status);
create index if not exists chamados_municipio_idx      on public.chamados (municipio);
create index if not exists chamados_data_abertura_idx  on public.chamados (data_abertura);

-- ============================================================
--  Row Level Security — somente usuários AUTENTICADOS acessam
-- ============================================================
alter table public.chamados enable row level security;

drop policy if exists "chamados_select_auth" on public.chamados;
drop policy if exists "chamados_insert_auth" on public.chamados;
drop policy if exists "chamados_update_auth" on public.chamados;
drop policy if exists "chamados_delete_auth" on public.chamados;

create policy "chamados_select_auth" on public.chamados
  for select to authenticated using (true);

create policy "chamados_insert_auth" on public.chamados
  for insert to authenticated with check (true);

create policy "chamados_update_auth" on public.chamados
  for update to authenticated using (true) with check (true);

create policy "chamados_delete_auth" on public.chamados
  for delete to authenticated using (true);

-- ============================================================
--  Criação de usuário: use o painel Authentication > Users > Add user
--  (defina e-mail + senha). Depois faça login em login.html.
-- ============================================================

-- (Opcional) Dados de exemplo — descomente para testar rapidamente:
-- insert into public.chamados (data_abertura, hora_abertura, departamento, num_chamado, num_inep, escola, municipio, tecnico, base_atendimento, tipo_atendimento, status, prioridade)
-- values
--   (current_date - 3, '09:00', '7- Suporte Técnico', '16001', '22100001', 'CETI Exemplo', 'Teresina', 'Matheus', 'BASE - TERESINA', 'Reposição de KIT', 'PENDÊNCIA SEDUC', 'Alta'),
--   (current_date - 1, '14:30', '7- Suporte Técnico', '16002', '22100002', 'Escola Exemplo', 'Picos',    'Halisson', 'BASE - PICOS',    'Instalação de Kit', 'EM EXECUÇÃO DE ROTA', 'Média');
