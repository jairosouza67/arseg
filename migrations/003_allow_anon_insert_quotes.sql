-- Migration: 003_allow_anon_insert_quotes.sql
-- Permite que visitantes não autenticados insiram orçamentos

-- Habilita RLS caso ainda não esteja
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;

-- Remove policy anterior se existir (idempotência)
DROP POLICY IF EXISTS "Anon insert quotes" ON public.quotes;

-- Permite inserts anônimos na tabela quotes
CREATE POLICY "Anon insert quotes"
  ON public.quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Observação: esta migration apenas garante que visitantes possam
-- inserir orçamentos. Policies adicionais para leitura/gestão
-- (ex.: Admin full access) devem existir separadamente.
