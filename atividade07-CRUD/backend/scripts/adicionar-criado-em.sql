-- Nos registros existentes, criado_em recebe o momento desta migração.
-- Nos novos cadastros, o banco preenche a data automaticamente.
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
