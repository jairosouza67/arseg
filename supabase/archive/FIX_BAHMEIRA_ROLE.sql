-- Verificar e corrigir role do bahmeira@outlook.com
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar o estado atual
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'bahmeira@outlook.com';

-- 2. Deletar role existente (se houver)
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bahmeira@outlook.com');

-- 3. Inserir role seller corretamente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'seller'::app_role
FROM auth.users
WHERE email = 'bahmeira@outlook.com';

-- 4. Verificar se funcionou
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'bahmeira@outlook.com';

-- Deve retornar: role = 'seller'
