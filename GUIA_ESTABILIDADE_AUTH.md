# 🛡️ GUIA DE ESTABILIDADE DO SISTEMA DE AUTENTICAÇÃO

## 📋 Proteções Implementadas

### 1. **AuthContext Centralizado**
- ✅ Um único ponto de controle para autenticação
- ✅ Evita múltiplos listeners `onAuthStateChange`
- ✅ Previne race conditions e conflitos de estado
- ✅ Arquivo: `src/contexts/AuthContext.tsx`

### 2. **Monitor de Saúde Automático**
- ✅ Verifica integridade da sessão a cada 30 segundos
- ✅ Detecta anomalias automaticamente
- ✅ Registra falhas consecutivas
- ✅ Arquivo: `src/hooks/useAuthHealthMonitor.ts`

### 3. **Proteções no Banco de Dados**
- ✅ RLS desabilitado em `user_roles` (sem recursão)
- ✅ Trigger automático para novos usuários
- ✅ Função `ensure_admin_exists()` para garantir admin
- ✅ Função `verify_and_fix_admin_role()` para reparo automático
- ✅ Script: `supabase/ESTABILIZAR_ROLES_PERMANENTE.sql`

---

## 🔧 Manutenção Preventiva

### Verificação Mensal (Recomendado)

Execute no Supabase SQL Editor:

```sql
-- 1. Verificar estado do admin
SELECT * FROM public.v_user_roles_summary 
WHERE email = 'jairosouza67@gmail.com';

-- 2. Verificar e corrigir se necessário
SELECT * FROM public.verify_and_fix_admin_role();

-- 3. Ver resumo geral
SELECT 
    COALESCE(role::TEXT, 'no_role') as role_type,
    COUNT(*) as total_users
FROM public.v_user_roles_summary
GROUP BY role;
```

### Se o Login Parar de Funcionar

**Passo 1:** Verificar no Console do Navegador
- Procure por logs com ⚠️ ou ❌
- Verifique se `health: ✅` está presente nos logs

**Passo 2:** Execute no Supabase
```sql
SELECT public.ensure_admin_exists();
SELECT * FROM public.verify_and_fix_admin_role();
```

**Passo 3:** Limpar Cache do Navegador
- `Ctrl + Shift + Delete` → Limpar dados de navegação
- Ou `Ctrl + Shift + R` para hard reload

**Passo 4:** Verificar Variáveis de Ambiente
- Netlify: https://app.netlify.com/sites/arseg/settings/deploys#environment
- Deve ter:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🚨 Troubleshooting

### Problema: "Loading infinito"
**Causa:** `loading` nunca fica `false`  
**Solução:**
1. Ver logs no console procurando por "Setting loading to false"
2. Se não aparecer, o `isMounted` pode estar false
3. Recarregar a página ou fazer logout/login

### Problema: "userId volta para null"
**Causa:** Múltiplos `onAuthStateChange` conflitando  
**Solução:**
- ✅ JÁ CORRIGIDO com AuthContext
- Não usar `useAuthRole` diretamente em múltiplos lugares
- Sempre usar através do contexto

### Problema: "role: null mas deveria ser admin"
**Causa:** Registro ausente na tabela `user_roles`  
**Solução:**
```sql
SELECT public.ensure_admin_exists();
```

### Problema: "ERR_INTERNET_DISCONNECTED"
**Causa:** Problema de rede ou variáveis de ambiente  
**Solução:**
1. Verificar conexão com internet
2. Testar: `https://rqsfzckoozhlmwdfiwky.supabase.co`
3. Verificar variáveis no Netlify
4. Testar localmente com `npm run dev`

---

## 📊 Monitoramento em Produção

### Logs que Indicam Sistema Saudável
```
🔵 AuthProvider: Initializing...
🔄 AuthProvider load() - getUser result: { user: "e608c78e-..." }
📊 AuthProvider Query user_roles: { role: "admin" }
✅ Role encontrada: admin
✅ AuthProvider load(): Setting loading to false
🔍 AuthProvider state: ... role: admin isAdmin: true loading: false health: ✅
🛡️ AdminRoute check: { isAdmin: true, loading: false }
✅ AdminRoute: Access granted
```

### Logs que Indicam Problema
```
❌ Erro ao buscar papel do usuário
⚠️ Session lost unexpectedly
🚨 CRITICAL: 3 consecutive auth failures detected
⚠️ User authenticated but role is null
⚠️ Auth health degraded: X consecutive failures
```

---

## 🔐 Backup e Recuperação

### Backup da Configuração de Roles

```sql
-- Fazer backup
COPY (
    SELECT user_id, role, created_at, updated_at
    FROM public.user_roles
) TO '/tmp/user_roles_backup.csv' WITH CSV HEADER;

-- Restaurar (se necessário)
-- Ajuste o caminho conforme necessário
```

### Recrear Estrutura Completa

Se tudo falhar, execute novamente:
```
supabase/ESTABILIZAR_ROLES_PERMANENTE.sql
```

---

## ✅ Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Executou `ESTABILIZAR_ROLES_PERMANENTE.sql` no Supabase
- [ ] Testou login localmente (`npm run dev`)
- [ ] Verificou logs no console (sem erros ❌)
- [ ] Testou acesso a `/admin` após login
- [ ] Testou recarregar página (F5) com usuário logado
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Clear cache and deploy no Netlify

---

## 📞 Suporte

Se após todas as verificações o problema persistir:

1. Capturar todos os logs do console
2. Executar no Supabase:
   ```sql
   SELECT * FROM public.v_user_roles_summary;
   SELECT * FROM public.verify_and_fix_admin_role();
   ```
3. Verificar se há erros de TypeScript no build
4. Verificar Network tab do DevTools para erros 401/403

---

**Última atualização:** 2025-11-15  
**Versão do sistema:** 2.0 (AuthContext refactor)
