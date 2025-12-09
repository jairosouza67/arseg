-- =================================================================
-- SCRIPT DE CORREÇÃO DEFINITIVO
-- Execute este script no SQL Editor do Supabase para corrigir as permissões.
-- =================================================================

-- Passo 1: Desabilitar RLS na tabela de roles para quebrar a recursão
-- Isso permite que outras policies consultem a role do usuário sem erro.
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Passo 2: Limpar policies antigas para garantir um estado limpo
DROP POLICY IF EXISTS "Admin full access to quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anon insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin full access to renewal_reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Admin full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Admin full access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- Passo 3: Recriar policies para as tabelas principais
-- Elas dependem da leitura da tabela user_roles, que agora está acessível.

-- Policy para QUOTES (Orçamentos)
CREATE POLICY "Admin full access to quotes" ON public.quotes
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public insert for quotes" ON public.quotes
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Policy para PRODUCTS (Produtos)
CREATE POLICY "Public read for products" ON public.products
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin full access to products" ON public.products
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies para CUSTOMERS, SUPPLIERS, RENEWAL_REMINDERS
CREATE POLICY "Admin full access to customers" ON public.customers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access to suppliers" ON public.suppliers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access to renewal_reminders" ON public.renewal_reminders
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Passo 4: Garantir que seu usuário é admin
-- Deleta qualquer registro antigo e insere o correto.
DELETE FROM public.user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jairosouza67@gmail.com');
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'jairosouza67@gmail.com';

-- Passo 5: Verificar o resultado
-- Este select deve retornar seu email com a role 'admin'.
SELECT u.email, ur.role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'jairosouza67@gmail.com';

-- =================================================================
-- SCRIPT FINALIZADO.
-- Após executar, faça logout e login novamente no aplicativo.
-- =================================================================
