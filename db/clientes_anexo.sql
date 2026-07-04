-- ============================================================
--  Gestão Operacional · Clientes — campo Nome do Anexo
--  Rode no SQL Editor.
-- ============================================================
alter table public.clientes
  add column if not exists nome_anexo text;
