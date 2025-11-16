-- Aprovação de orçamentos: coluna, triggers, auditoria e políticas

-- 1) Coluna approved_at em quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- 2) Tabela de auditoria de aprovações
CREATE TABLE IF NOT EXISTS public.approval_audit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  approver_user_id uuid,
  approver_role text,
  approved_at timestamptz,
  success boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.approval_audit ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin full access to approval_audit'
      AND tablename = 'approval_audit'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Admin full access to approval_audit"
      ON public.approval_audit
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
  END IF;
END $$;

-- 3) Trigger para setar approved_at
CREATE OR REPLACE FUNCTION public.set_approved_at_on_quotes()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_approved_at_on_quotes ON public.quotes;
CREATE TRIGGER trg_set_approved_at_on_quotes
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.set_approved_at_on_quotes();

-- 4) Trigger de auditoria de aprovação
CREATE OR REPLACE FUNCTION public.log_quote_approval()
RETURNS trigger AS $$
DECLARE
  v_role text;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    SELECT ur.role INTO v_role FROM public.user_roles ur WHERE ur.user_id = auth.uid();
    INSERT INTO public.approval_audit(quote_id, approver_user_id, approver_role, approved_at, success)
    VALUES (NEW.id, auth.uid(), v_role, NEW.approved_at, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_quote_approval ON public.quotes;
CREATE TRIGGER trg_log_quote_approval
AFTER UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.log_quote_approval();

-- 5) RLS: restringir sellers de aprovar
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners manage own quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    DROP POLICY "Owners manage own quotes" ON public.quotes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners select own quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Owners select own quotes"
      ON public.quotes
      FOR SELECT
      TO authenticated
      USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners insert own quotes'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Owners insert own quotes"
      ON public.quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners update own quotes (no approval)'
      AND tablename = 'quotes'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Owners update own quotes (no approval)"
      ON public.quotes
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid() AND NEW.status <> 'approved');
  END IF;
END $$;