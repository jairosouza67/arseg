-- Migration: 003_secure_user_roles_rls.sql
-- Habilita RLS na tabela user_roles e cria políticas mínimas seguras.
--
-- CONTEXTO: Versões anteriores desabilitaram o RLS para contornar recursão
-- infinita nas policies. A recursão ocorria porque as policies de outras
-- tabelas consultavam user_roles, que por sua vez tinha policies que
-- consultavam user_roles novamente.
--
-- SOLUÇÃO ADOTADA:
--   - Apenas o próprio usuário pode LER sua própria role (via auth.uid()).
--   - Admins leem/escrevem via Edge Function (service role key) ou SQL editor.
--   - O cliente JS usa o SDK com o JWT da sessão -> sem recursão.
--
-- EXECUTE NO SQL EDITOR DO SUPABASE APÓS VALIDAR O COMPORTAMENTO EM DEV.
-- ============================================================================

-- 1. Remover policies antigas que possam causar conflito
DROP POLICY IF EXISTS "Admin full access to user_roles"  ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role"           ON public.user_roles;
DROP POLICY IF EXISTS "Public read user_roles"            ON public.user_roles;
DROP POLICY IF EXISTS "Service role bypass"               ON public.user_roles;

-- 2. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Usuário autenticado pode LER apenas a própria role
--    (não causa recursão: a policy não consulta user_roles, só usa auth.uid())
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Apenas a service role (Edge Functions, SQL Editor) pode INSERT/UPDATE/DELETE.
--    O formulário de login não precisa de escrita direta — isso passa pelo admin.
--    (Nenhuma policy de escrita para authenticated = bloqueado por RLS)

-- 5. Verificação: exibe as policies ativas na tabela
SELECT
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'user_roles'
ORDER BY policyname;
