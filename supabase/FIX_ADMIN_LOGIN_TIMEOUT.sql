-- =====================================================
-- FIX ADMIN LOGIN TIMEOUT ISSUE
-- Execute this script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Disable RLS on user_roles to prevent circular dependencies
-- This is CRITICAL - RLS on user_roles causes infinite recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop any existing policies on user_roles that might cause issues
DROP POLICY IF EXISTS "Admin full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Public read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated read user_roles" ON public.user_roles;

-- STEP 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- STEP 4: Ensure your admin user exists with correct role
-- First, check if the user exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID for jairosouza67@gmail.com
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'jairosouza67@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'User jairosouza67@gmail.com not found in auth.users';
    ELSE
        RAISE NOTICE 'Found user ID: %', admin_user_id;
        
        -- Delete any existing role entry for this user
        DELETE FROM public.user_roles WHERE user_id = admin_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
        
        RAISE NOTICE 'Admin role assigned successfully';
    END IF;
END $$;

-- STEP 5: Verify the fix
SELECT 
    u.email,
    u.id as user_id,
    ur.role,
    ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'jairosouza67@gmail.com';

-- STEP 6: Check if RLS is disabled (should show 'false')
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- =====================================================
-- EXPECTED OUTPUT:
-- 1. User email with role 'admin'
-- 2. RLS enabled should be 'false' (f)
-- =====================================================
