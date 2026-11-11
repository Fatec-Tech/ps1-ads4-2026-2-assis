-- CREATE TABLE IF NOT EXISTS não modifica tabelas já existentes.
-- Execute esta alteração em cada banco usado por dev, teste e produção.
-- A coluna é opcional para preservar os pacientes já cadastrados.
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
