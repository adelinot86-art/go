-- ============================================================
--  Gestão Operacional · Configurações + Admins
--  Rode no SQL Editor DEPOIS do schema.sql.
-- ============================================================

-- ---------- Opções configuráveis dos campos do cadastro ----------
create table if not exists public.config_opcoes (
  id         bigint generated always as identity primary key,
  campo      text not null,   -- ex: departamento, base_atendimento, tipo_atendimento, status, prioridade, tecnico, municipio, materiais
  valor      text not null,
  ordem      int  default 0,
  created_at timestamptz default now()
);
create unique index if not exists config_opcoes_campo_valor_key on public.config_opcoes (campo, valor);
create index if not exists config_opcoes_campo_idx on public.config_opcoes (campo);

alter table public.config_opcoes enable row level security;

drop policy if exists "opcoes_select_auth" on public.config_opcoes;
drop policy if exists "opcoes_write_auth"  on public.config_opcoes;
create policy "opcoes_select_auth" on public.config_opcoes for select to authenticated using (true);
create policy "opcoes_write_auth"  on public.config_opcoes for all    to authenticated using (true) with check (true);

-- ---------- Administradores (quem pode gerenciar usuários) ----------
-- A Edge Function 'admin-users' consulta esta tabela para autorizar.
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;  -- acesso só via service_role (Edge Function)

-- >>> IMPORTANTE: cadastre AQUI o e-mail do seu usuário admin (o mesmo do login):
-- insert into public.admins (email) values ('voce@exemplo.com') on conflict do nothing;

-- ---------- Opções iniciais (seed) ----------
insert into public.config_opcoes (campo, valor, ordem) values
  ('departamento','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação',1),
  ('departamento','11- Serviço de Suporte Técnico - Deslocamento',2),
  ('departamento','13- Serviço de Suporte Técnico - Deslocamento',3),
  ('base_atendimento','BASE - TERESINA',1),
  ('base_atendimento','BASE - PICOS',2),
  ('base_atendimento','BASE - FLORIANO',3),
  ('base_atendimento','BASE - PARNAÍBA',4),
  ('base_atendimento','BASE - URUÇUÍ',5),
  ('tipo_atendimento','Manutenção - Substituição de Equipamentos',1),
  ('tipo_atendimento','Reposição de KIT',2),
  ('tipo_atendimento','Instalação de Kit',3),
  ('tipo_atendimento','Suporte de Internet via Satélite',4),
  ('tipo_atendimento','Modernização TV 65'' SMART',5),
  ('status','MONTAR ROTA',1),
  ('status','EM ROTA',2),
  ('status','EM EXECUÇÃO DE ROTA',3),
  ('status','AGUARDANDO PEÇA',4),
  ('status','PENDÊNCIA SEDUC',5),
  ('status','CHAMADO FINALIZADO',6),
  ('prioridade','Urgente',1),
  ('prioridade','Alta',2),
  ('prioridade','Média',3),
  ('prioridade','Baixa',4),
  ('materiais','Sim',1),
  ('materiais','Não',2),
  ('tecnico','Matheus - Inovatech',1),
  ('tecnico','Halisson Werlon',2),
  ('tecnico','João Pedro',3),
  ('tecnico','Carlos Andrade',4)
on conflict (campo, valor) do nothing;
