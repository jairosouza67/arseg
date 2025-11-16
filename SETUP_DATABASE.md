# Configuração do Banco de Dados Supabase

## Passo 1: Aplicar as Migrações

Acesse o painel do Supabase: https://app.supabase.com

### 1.1 Vá para SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **+ New query**

### 1.2 Execute cada migração na ordem:

**Primeira migração:** Copie e cole o conteúdo do arquivo:
```
supabase/migrations/add_created_by_and_policies_for_roles_fixed.sql
```

Clique em **Run** (ou Ctrl+Enter)

## Passo 2: Configurar seu usuário como Admin

Após executar as migrações, você precisa dar permissão de admin ao seu usuário.

### 2.1 Pegue seu User ID
No SQL Editor, execute:

```sql
SELECT id, email FROM auth.users;
```

Copie o `id` do seu usuário (aquele com seu email de login).

### 2.2 Inserir role de Admin

Execute (substitua `SEU_USER_ID` pelo ID que você copiou):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

## Passo 3: Verificar

Execute para confirmar:

```sql
SELECT ur.*, u.email 
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id;
```

Você deve ver seu email com role = 'admin'.

## Passo 4: Testar no App

1. Faça logout do app (se estiver logado)
2. Faça login novamente
3. Tente aprovar um orçamento - deve funcionar!

---

## Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se você tem role 'admin' na tabela user_roles
- Faça logout e login novamente no app

### Erro: "relation public.user_roles does not exist"
- Execute a migração SQL novamente
- Verifique se está no projeto correto do Supabase
