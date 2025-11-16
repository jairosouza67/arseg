/*
  # Permissões para Vendedor e Colunas de Autoria

  1. New Columns
    - Tabela `quotes`
      - `created_by` (uuid, referência ao usuário que criou o orçamento, null para orçamentos públicos)
    - Tabela `renewal_reminders`
      - `created_by` (uuid, referência ao usuário responsável pelo lembrete)

  2. Security
    - Habilita RLS (se ainda não estiver habilitado).
    - Policies para `quotes`:
      - Administradores: acesso completo.
      - Vendedores: SELECT apenas em registros onde `created_by = auth.uid()`.
      - Público (anon): pode inserir orçamentos (sem apagar/editar).
    - Policies para `renewal_reminders`:
      - Administradores: acesso completo.
      - Vendedores: SELECT apenas em registros onde `created_by = auth.uid()`.
      - Inserts normalmente feitos pelo backend/admin vinculados a `created_by`.

  3. Changes
    - Nenhuma remoção de dados.
    - Colunas adicionadas com NULL permitido para preservar dados existentes.
    - Uso de `has_role` para identificar admins.
*/

-- 1. Colunas created_by (se não existirem)
ALTER TABLE IF EXISTS public.quotes
ADD COLUMN IF NOT EXISTS created_by uuid NULL;

ALTER TABLE IF EXISTS public.renewal_reminders
ADD COLUMN IF NOT EXISTS created_by uuid NULL;

-- 2. Garantir RLS habilitado
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- 3. Policies para QUOTES

-- Admin: acesso total
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Admin full access to quotes'
      AND tablename = 'quotes'
  ) THEN
    CREATE POLICY "Admin full access to quotes"
      ON public.quotes
      FOR ALL
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

-- Vendedor: pode ver apenas seus próprios registros
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Seller select own quotes'
      AND tablename = 'quotes'
  ) THEN
    CREATE POLICY "Seller select own quotes"
      ON public.quotes
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'seller'
        )
        AND created_by = auth.uid()
      );
  END IF;
END $$;

-- Público (anon) pode inserir orçamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Anon insert quotes'
      AND tablename = 'quotes'
  ) THEN
    CREATE POLICY "Anon insert quotes"
      ON public.quotes
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Usuários autenticados podem inserir orçamentos vinculando created_by = auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated insert quotes with self created_by'
      AND tablename = 'quotes'
  ) THEN
    CREATE POLICY "Authenticated insert quotes with self created_by"
      ON public.quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- 4. Policies para RENEWAL_REMINDERS

-- Admin: acesso total
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Admin full access to renewal_reminders'
      AND tablename = 'renewal_reminders'
  ) THEN
    CREATE POLICY "Admin full access to renewal_reminders"
      ON public.renewal_reminders
      FOR ALL
      USING (public.has_role('admin', auth.uid()))
      WITH CHECK (public.has_role('admin', auth.uid()));
  END IF;
END $$;

-- Vendedor: pode ver apenas seus próprios lembretes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Seller select own renewal_reminders'
      AND tablename = 'renewal_reminders'
  ) THEN
    CREATE POLICY "Seller select own renewal_reminders"
      ON public.renewal_reminders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'seller'
        )
        AND created_by = auth.uid()
      );
  END IF;
END $$;

-- Insert/Update de renewal_reminders: feitos pelo admin ou processos internos.
-- (Nenhuma permissão ampla extra é concedida aqui para evitar riscos)
