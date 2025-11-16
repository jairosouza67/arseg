-- Migration: 002_allow_owners_manage_quotes.sql
-- Permite que o usuário que criou um quote (created_by) realize SELECT/UPDATE/DELETE no próprio registro

-- Garante que RLS esteja habilitado (normalmente já está pelo setup)
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;

-- Remove policy anterior se existir (segurança em re-runs)
DROP POLICY IF EXISTS "Owners manage own quotes" ON public.quotes;

CREATE POLICY "Owners manage own quotes"
  ON public.quotes
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
