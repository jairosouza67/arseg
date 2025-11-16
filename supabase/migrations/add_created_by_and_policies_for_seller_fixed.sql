/*
  # Correção das policies para Vendedor e Admin sem usar public.has_role()

  1. New Tables / Columns
    - `quotes.created_by` (uuid, referência ao usuário que criou o orçamento, NULL permitido)
    - `renewal_reminders.created_by` (uuid, referência ao usuário responsável pelo lembrete, NULL permitido)

  2. Security
    - Garante RLS habilitado em:
      - `quotes`
      - `renewal_reminders`
    - Policies criadas apenas se não existirem:
      - `quotes`:
        - Admin: acesso total (FOR ALL) baseado em tabela `public.user_roles`.
        - Vendedor: SELECT apenas onde `created_by = auth.uid()`.
        - Anon: pode INSERT (orçamentos públicos).
        - Authenticated: pode INSERT desde que `created_by = auth.uid()`.
      - `renewal_reminders`:
        - Admin: acesso total (FOR ALL) baseado em `public.user_roles`.
        - Vendedor: SELECT apenas onde `created_by = auth.uid()`.

  3. Changes
    - Remove uso da função inexistente `public.has_role`.
    - Usa checagens diretas em `public.user_roles` para admins e sellers.
    - Nenhuma deleção de policies, tabelas ou dados.
    - Todas operações protegidas com IF NOT EXISTS para serem idempotentes.
*/

ALTER TABLE IF EXISTS public.quotes
ADD COLUMN IF NOT EXISTS created_by uuid NULL;

ALTER TABLE IF EXISTS public.renewal_reminders
ADD COLUMN IF NOT EXISTS created_by uuid NULL;

ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.renewal_reminders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admin full access to quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Admin full access to quotes"
      ON public.quotes
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Seller select own quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Anon insert quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Anon insert quotes"
      ON public.quotes
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Authenticated insert quotes with self created_by'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Authenticated insert quotes with self created_by"
      ON public.quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admin full access to renewal_reminders'
      AND tablename = 'renewal_reminders'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Admin full access to renewal_reminders"
      ON public.renewal_reminders
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Seller select own renewal_reminders'
      AND tablename = 'renewal_reminders'
      AND schemaname = 'public'
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
