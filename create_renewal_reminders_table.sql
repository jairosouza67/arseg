-- Execute this script in your Supabase SQL Editor to create the renewal_reminders table

-- Create renewal_reminders table if it doesn't exist
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

-- Enable RLS
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_status_date ON public.renewal_reminders(status, reminder_date);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_quote_id ON public.renewal_reminders(quote_id);

-- Verify the table was created
SELECT 'renewal_reminders table created successfully' as result;