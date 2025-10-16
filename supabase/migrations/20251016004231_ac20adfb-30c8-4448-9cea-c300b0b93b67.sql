-- Add policies for admins to manage user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert master admin (jairosouza67@gmail.com)
-- This will work after the user with this email signs up
DO $$
DECLARE
  master_user_id uuid;
BEGIN
  -- Get user ID from auth.users table
  SELECT id INTO master_user_id
  FROM auth.users
  WHERE email = 'jairosouza67@gmail.com'
  LIMIT 1;
  
  -- Only insert if user exists and doesn't already have admin role
  IF master_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (master_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;