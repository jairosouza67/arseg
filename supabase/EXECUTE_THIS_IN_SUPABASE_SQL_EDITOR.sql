-- ============================================================================
-- INSTRUÇÕES: Execute este SQL COMPLETO no SQL Editor do Supabase
-- Dashboard -> SQL Editor -> New Query -> Cole tudo e execute
-- ============================================================================

-- PASSO 1: Garantir que o tipo app_role inclui 'seller'
-- ============================================================================
DO $$
BEGIN
  -- Verificar se o tipo app_role existe e adicionar 'seller' se necessário
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    -- Adicionar 'seller' ao enum se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumtypid = 'app_role'::regtype 
      AND enumlabel = 'seller'
    ) THEN
      ALTER TYPE app_role ADD VALUE 'seller';
      RAISE NOTICE 'Valor seller adicionado ao tipo app_role';
    END IF;
  END IF;
  
  -- Remover constraint antiga se existir
  ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Se der erro, apenas continue
    RAISE NOTICE 'Erro ao modificar tipo: %', SQLERRM;
END $$;

-- PASSO 2: Inserir role 'seller' para usuário bahmeira@outlook.com
-- ============================================================================
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o ID do usuário
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'bahmeira@outlook.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Deletar role antiga se existir
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Inserir nova role como seller (com cast para app_role)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'seller'::app_role);
    
    RAISE NOTICE 'Role seller criada para bahmeira@outlook.com';
  ELSE
    RAISE NOTICE 'Usuário bahmeira@outlook.com não encontrado';
  END IF;
END $$;

-- PASSO 3: Adicionar role 'seller' para TODOS os usuários que têm quotes
-- ============================================================================
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT q.created_by, 'seller'::app_role
FROM public.quotes q
LEFT JOIN public.user_roles ur ON ur.user_id = q.created_by
WHERE q.created_by IS NOT NULL
  AND ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 4: Atualizar created_by em renewal_reminders
-- ============================================================================
UPDATE public.renewal_reminders rr
SET created_by = q.created_by
FROM public.quotes q
WHERE rr.quote_id = q.id
  AND rr.created_by IS NULL
  AND q.created_by IS NOT NULL;

-- PASSO 5: Verificar se funcionou
-- ============================================================================
SELECT 
  u.email,
  ur.role,
  COUNT(q.id) as num_quotes
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.quotes q ON q.created_by = u.id
WHERE u.email LIKE '%outlook.com' OR u.email LIKE '%gmail.com'
GROUP BY u.email, ur.role
ORDER BY u.email;

-- ============================================================================
-- FIM - Se você ver bahmeira@outlook.com com role='seller', está OK!
-- ============================================================================
