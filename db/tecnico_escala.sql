-- ============================================================
--  Gestão Operacional · Escala / Habilidades / Rotas dos técnicos
--  Rode no SQL Editor DEPOIS de field_service.sql.
-- ============================================================

-- Campos adicionais no técnico
alter table public.tecnicos
  add column if not exists habilidades text[]  default '{}',           -- ex: {'Instalação','Manutenção'}
  add column if not exists rotas       text[]  default '{}',           -- rotas atendidas
  add column if not exists hora_inicio time    default '08:00',        -- início do expediente
  add column if not exists hora_fim    time    default '18:00',        -- fim do expediente
  add column if not exists dias_semana int[]   default '{1,2,3,4,5}';  -- dias trabalhados: 0=Dom .. 6=Sáb

-- Exceções por data (calendário de disponibilidade) — folga pontual ou trabalho extra
create table if not exists public.tecnico_excecoes (
  id          bigint generated always as identity primary key,
  tecnico_id  bigint references public.tecnicos(id) on delete cascade,
  data        date not null,
  tipo        text not null default 'folga',   -- 'folga' | 'trabalho'
  hora_inicio time,                            -- opcional (se tipo=trabalho com horário especial)
  hora_fim    time,
  created_at  timestamptz default now()
);
create unique index if not exists tecnico_excecoes_key on public.tecnico_excecoes (tecnico_id, data);

alter table public.tecnico_excecoes enable row level security;
drop policy if exists excecoes_all_auth on public.tecnico_excecoes;
create policy excecoes_all_auth on public.tecnico_excecoes for all to authenticated using (true) with check (true);
