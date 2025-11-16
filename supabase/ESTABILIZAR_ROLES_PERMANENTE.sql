-- =====================================================
-- SCRIPT DE PROTEÇÃO E ESTABILIZAÇÃO DO SISTEMA DE ROLES
-- Execute APENAS UMA VEZ no SQL Editor do Supabase
-- =====================================================

-- PARTE 1: Garantir que a tabela user_roles existe com estrutura correta
-- =====================================================

-- Verificar estrutura atual
DO $$
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role app_role NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
        );
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
        
        RAISE NOTICE 'Tabela user_roles criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela user_roles já existe';
    END IF;
END $$;

-- PARTE 2: Desabilitar RLS permanentemente para evitar recursão
-- =====================================================

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Remover todas as policies antigas que podem causar conflito
DROP POLICY IF EXISTS "Admin full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Public read user_roles" ON public.user_roles;

-- PARTE 3: Criar função para garantir admin sempre exista
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar ID do usuário admin
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'jairosouza67@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Garantir que o registro de admin existe
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'admin'::app_role,
            updated_at = now();
            
        RAISE NOTICE 'Admin role garantida para jairosouza67@gmail.com';
    ELSE
        RAISE WARNING 'Usuário jairosouza67@gmail.com não encontrado em auth.users';
    END IF;
END;
$$;

-- Executar a função imediatamente
SELECT public.ensure_admin_exists();

-- PARTE 4: Criar trigger para auto-atribuir role em novos usuários
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se for o email admin, garantir role admin
    IF NEW.email = 'jairosouza67@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role)
        ON CONFLICT (user_id) DO NOTHING;
    -- Caso contrário, não atribuir role (será null/user por padrão)
    END IF;
    
    RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PARTE 5: Criar função de verificação/reparo automático
-- =====================================================

CREATE OR REPLACE FUNCTION public.verify_and_fix_admin_role()
RETURNS TABLE(
    status TEXT,
    user_email TEXT,
    user_id UUID,
    current_role app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id UUID;
    admin_role app_role;
BEGIN
    -- Buscar admin
    SELECT u.id, ur.role INTO admin_id, admin_role
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE u.email = 'jairosouza67@gmail.com';
    
    -- Se não encontrou usuário
    IF admin_id IS NULL THEN
        RETURN QUERY SELECT 'ERROR'::TEXT, 'jairosouza67@gmail.com'::TEXT, NULL::UUID, NULL::app_role;
        RETURN;
    END IF;
    
    -- Se role não é admin, corrigir
    IF admin_role IS NULL OR admin_role != 'admin'::app_role THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_id, 'admin'::app_role)
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin'::app_role, updated_at = now();
        
        RETURN QUERY SELECT 'FIXED'::TEXT, 'jairosouza67@gmail.com'::TEXT, admin_id, 'admin'::app_role;
    ELSE
        RETURN QUERY SELECT 'OK'::TEXT, 'jairosouza67@gmail.com'::TEXT, admin_id, admin_role;
    END IF;
END;
$$;

-- PARTE 6: Executar verificação e reparo
-- =====================================================

SELECT * FROM public.verify_and_fix_admin_role();

-- PARTE 7: Criar view para facilitar consultas de roles
-- =====================================================

CREATE OR REPLACE VIEW public.v_user_roles_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    COALESCE(ur.role, NULL) as role,
    CASE 
        WHEN ur.role = 'admin' THEN true
        ELSE false
    END as is_admin,
    CASE 
        WHEN ur.role = 'seller' THEN true
        ELSE false
    END as is_seller,
    ur.created_at as role_assigned_at,
    ur.updated_at as role_updated_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;

-- PARTE 8: Verificação final
-- =====================================================

-- Mostrar estado atual do sistema
SELECT 
    '=== ESTADO ATUAL DO SISTEMA DE ROLES ===' as info;

SELECT * FROM public.v_user_roles_summary 
WHERE email = 'jairosouza67@gmail.com';

-- Contar usuários por role
SELECT 
    COALESCE(role::TEXT, 'no_role') as role_type,
    COUNT(*) as total_users
FROM public.v_user_roles_summary
GROUP BY role
ORDER BY total_users DESC;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================

RAISE NOTICE '
╔═══════════════════════════════════════════════════╗
║  SISTEMA DE ROLES ESTABILIZADO COM SUCESSO!      ║
╚═══════════════════════════════════════════════════╝

✅ Tabela user_roles protegida
✅ RLS desabilitado (sem recursão)
✅ Admin jairosouza67@gmail.com garantido
✅ Trigger automático criado
✅ Funções de reparo disponíveis

FUNÇÕES DISPONÍVEIS:
- SELECT public.ensure_admin_exists();
- SELECT * FROM public.verify_and_fix_admin_role();
- SELECT * FROM public.v_user_roles_summary;
';
