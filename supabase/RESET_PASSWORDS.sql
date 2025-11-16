-- ============================================================================
-- RESET DE SENHAS - Execute no SQL Editor do Supabase
-- ============================================================================
-- IMPORTANTE: Depois de executar, os usuários receberão email para criar nova senha
-- ============================================================================

-- Opção 1: Enviar email de reset para bahmeira@outlook.com
-- Faça isso pelo dashboard: Authentication -> Users -> encontre o usuário -> Reset Password

-- Opção 2: Criar/atualizar usuário com senha conhecida (APENAS PARA TESTE)
-- ============================================================================
-- ATENÇÃO: Use isto APENAS em ambiente de desenvolvimento/teste
-- Em produção, use sempre email de reset

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'bahmeira@outlook.com';
  v_senha text := 'Teste@123'; -- ALTERE ESTA SENHA
BEGIN
  -- Verificar se usuário existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    -- Criar novo usuário
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_senha, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;
    
    -- Criar identity
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id::text, v_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Usuário % criado com senha %', v_email, v_senha;
  ELSE
    -- Atualizar senha do usuário existente
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_senha, gen_salt('bf')),
      updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Senha atualizada para % = %', v_email, v_senha;
  END IF;
  
  -- Garantir que tem role seller
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'seller'::app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = 'seller'::app_role;
  
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email IN ('bahmeira@outlook.com', 'jairosouza67@gmail.com')
ORDER BY u.email;

-- ============================================================================
-- AGORA VOCÊ PODE FAZER LOGIN COM:
-- Email: bahmeira@outlook.com
-- Senha: Teste@123 (ou a que você definiu acima)
-- ============================================================================
