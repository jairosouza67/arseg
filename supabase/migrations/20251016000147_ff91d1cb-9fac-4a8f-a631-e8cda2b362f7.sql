-- Fix quotes SELECT policy to avoid referencing auth.users (causing permission error)
-- Use JWT email claim instead

-- Drop old policy that referenced auth.users
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;

-- Recreate policy using JWT claims
CREATE POLICY "Users can view their own quotes"
ON public.quotes
FOR SELECT
USING (
  customer_email IS NOT NULL
  AND lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
