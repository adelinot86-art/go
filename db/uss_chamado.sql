-- ============================================================
--  Gestão Operacional · Resultado de USS no chamado (Item 07)
--  Rode no SQL Editor. Guarda o cálculo feito no encerramento.
-- ============================================================
alter table public.chamados
  add column if not exists uss_total   numeric,   -- total USS já com o peso do deslocamento
  add column if not exists uss_detalhe text;       -- descrição das atividades + deslocamento
