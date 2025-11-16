-- Script to fix renewal reminders functionality
-- Execute this in your Supabase SQL Editor

-- 1. Create the renewal_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  reminder_date date NOT NULL,
  renewal_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for admin access
DROP POLICY IF EXISTS "Admin full access to renewal_reminders" ON public.renewal_reminders;
CREATE POLICY "Admin full access to renewal_reminders"
  ON public.renewal_reminders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_status_date ON public.renewal_reminders(status, reminder_date);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_quote_id ON public.renewal_reminders(quote_id);

-- 5. Insert some sample data for testing (optional - remove if not needed)
-- INSERT INTO public.renewal_reminders (
--   customer_name, customer_email, customer_phone, reminder_date, renewal_date, status, notes
-- ) VALUES
-- ('Cliente Teste 1', 'cliente1@email.com', '(11) 99999-9999', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '30 days', 'pending', 'Lembrete de teste'),
-- ('Cliente Teste 2', 'cliente2@email.com', '(11) 88888-8888', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '40 days', 'pending', 'Outro lembrete de teste');

-- 6. Verify the table exists and has correct structure
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'renewal_reminders' AND schemaname = 'public';

-- 7. Check if policies are applied
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'renewal_reminders' AND schemaname = 'public';