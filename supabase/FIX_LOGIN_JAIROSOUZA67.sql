-- =================================================================
-- SCRIPT PARA CORRIGIR LOGIN DO jairosouza67@gmail.com
-- Execute este script completo no SQL Editor do Supabase
-- =================================================================

-- PASSO 1: Verificar estado atual do usuário
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  ur.role,
  ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'jairosouza67@gmail.com';

-- Se o resultado acima mostrar:
-- - id preenchido mas role NULL: o usuário existe mas não tem role
-- - nenhum resultado: o usuário não existe no sistema

-- PASSO 2: Garantir que a tabela user_roles está acessível
-- (Desabilita RLS para evitar problemas de recursão)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover qualquer role antiga (se existir)
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jairosouza67@gmail.com');

-- PASSO 4: Inserir role admin para jairosouza67@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'jairosouza67@gmail.com';

-- PASSO 5: Verificar se a correção funcionou
SELECT 
  u.id as user_id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'jairosouza67@gmail.com';

-- Resultado esperado:
-- user_id: e608c78e-9238-4686-98e1-695ddfda765f
-- email: jairosouza67@gmail.com
-- role: admin
-- role_assigned_at: (timestamp atual)

-- =================================================================
-- APÓS EXECUTAR ESTE SCRIPT:
-- 1. Faça logout do site (se estiver logado)
-- 2. Limpe o cache do navegador ou use Ctrl+Shift+R
-- 3. Faça login novamente
-- 4. Você deve conseguir acessar /admin
-- =================================================================
