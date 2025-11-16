-- ============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO BANCO
-- Execute este script inteiro no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de roles (se não existir)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela de customers (se não existir)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  address text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela de suppliers (se não existir)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text NOT NULL,
  address text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar tabela de products (se não existir)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  in_stock boolean DEFAULT true NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Criar tabela de quotes (se não existir)
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_value numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Criar tabela de renewal_reminders (se não existir)
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

-- 7. Adicionar coluna created_by se não existir
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.renewal_reminders ADD COLUMN IF NOT EXISTS created_by uuid;

-- 8. Habilitar RLS em todas as tabelas (EXCETO user_roles para evitar recursão)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- 9. Limpar policies antigas (se existirem)
DROP POLICY IF EXISTS "Admin full access to quotes" ON public.quotes;
DROP POLICY IF EXISTS "Seller-like select own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anon insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated insert quotes with self created_by" ON public.quotes;
DROP POLICY IF EXISTS "Admin full access to renewal_reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Seller-like select own renewal_reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Admin full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Admin full access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;

-- 10. Criar policies para QUOTES
CREATE POLICY "Admin full access to quotes"
  ON public.quotes
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

-- Permitir que o criador (seller) gerencie seus próprios orçamentos
CREATE POLICY "Owners manage own quotes"
  ON public.quotes
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Anon insert quotes"
  ON public.quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated insert quotes"
  ON public.quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 11. Criar policies para RENEWAL_REMINDERS
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

-- 12. USER_ROLES não precisa de policies (RLS desabilitado para evitar recursão infinita)
-- Todos os usuários autenticados podem ler a tabela user_roles

-- 13. Criar policies para CUSTOMERS
CREATE POLICY "Admin full access to customers"
  ON public.customers
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

-- 14. Criar policies para SUPPLIERS
CREATE POLICY "Admin full access to suppliers"
  ON public.suppliers
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

-- 15. Criar policies para PRODUCTS
CREATE POLICY "Admin full access to products"
  ON public.products
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

CREATE POLICY "Public read products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 16. CONFIGURAR SEU USUÁRIO COMO ADMIN
-- Primeiro, deletar registro antigo se existir
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jairosouza67@gmail.com'
);

-- Inserir como admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'jairosouza67@gmail.com';

-- 17. Verificar se deu certo
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id;

-- ============================================
-- SCRIPT FINALIZADO!
-- Você deve ver seu email com role = 'admin' no resultado
-- Agora faça logout e login novamente no app
-- ============================================
