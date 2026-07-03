-- ============================================================
--  Gestão Operacional · Notificações para os técnicos
--  Rode no SQL Editor DEPOIS de field_service.sql.
-- ============================================================
create table if not exists public.notificacoes (
  id           bigint generated always as identity primary key,
  tecnico_nome text not null,      -- casa com chamados.tecnico / tecnicos.nome
  chamado_id   bigint,
  num_chamado  text,
  mensagem     text,
  lida         boolean default false,
  created_at   timestamptz default now()
);
create index if not exists notificacoes_tec_idx on public.notificacoes (lower(tecnico_nome), lida);

alter table public.notificacoes enable row level security;
drop policy if exists notif_all_auth on public.notificacoes;
create policy notif_all_auth on public.notificacoes for all to authenticated using (true) with check (true);
