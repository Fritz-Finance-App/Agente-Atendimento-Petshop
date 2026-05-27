-- ============================================================
-- MIGRATION: ADD BUSINESS HOURS TO PETSHOPS
-- ============================================================

-- Add business hour columns to petshops table
ALTER TABLE petshops
  ADD COLUMN IF NOT EXISTS horario_abertura TEXT DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS horario_fechamento TEXT DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS dias_funcionamento TEXT[] DEFAULT ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

-- Add a comment to columns for clarity
COMMENT ON COLUMN petshops.horario_abertura IS 'Horário oficial de abertura do estabelecimento (ex: 08:00)';
COMMENT ON COLUMN petshops.horario_fechamento IS 'Horário oficial de fechamento do estabelecimento (ex: 18:00)';
COMMENT ON COLUMN petshops.dias_funcionamento IS 'Dias da semana de funcionamento oficial';
