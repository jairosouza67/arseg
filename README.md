# Arseg - Extintores e Equipamentos de Segurança

Aplicativo web para gestão e venda de extintores de incêndio, construído com React, TypeScript e Supabase.

## 🛡️ SISTEMA DE AUTENTICAÇÃO ESTABILIZADO

O sistema de autenticação foi completamente reconstruído para eliminar problemas intermitentes:

### Problemas Corrigidos
- ✅ **Race Conditions Eliminadas** - Proteção contra múltiplas chamadas simultâneas
- ✅ **Código Duplicado Removido** - Função centralizada para carregamento de roles
- ✅ **Gerenciamento de Estado Melhorado** - Estados de loading mais precisos
- ✅ **Validação de Sessão Aprimorada** - Verificação real antes de navegar
- ✅ **Logs Detalhados** - Diagnóstico completo em cada etapa

### Componentes Principais
- `AuthProvider` - Gerenciamento centralizado de autenticação
- `useAuth` - Hook para acesso ao contexto de autenticação
- `authUtils.ts` - Utilitários para diagnóstico e recuperação
- `AdminRoute` e `SellerDashboardRoute` - Rotas protegidas otimizadas

## Tecnologias Utilizadas

- **React 18.3.1** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Component library
- **React Router DOM** - Routing
- **Supabase** - Backend como serviço (autenticação e banco de dados)
- **TanStack Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

## Configuração do Ambiente

### ⚠️ IMPORTANTE: Projeto Supabase Deve Estar Ativo

O projeto Supabase deve estar **despausado** para que o sistema de autenticação funcione. Se o projeto estiver pausado, ocorrerá erro `ERR_NAME_NOT_RESOLVED`.

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn

### Instalaçãos

1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
VITE_RESEND_API_KEY=sua-chave-resend-aqui
```

### Variáveis de Ambiente Críticas

- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Chave pública do Supabase
- `VITE_RESEND_API_KEY` - Chave da API Resend (opcional para emails)

### Configuração do Resend (para lembretes por email)

Para habilitar o envio de lembretes de renovação por email:

1. Crie uma conta no [Resend](https://resend.com)
2. Obtenha sua API key no painel do Resend
3. Adicione a chave no arquivo `.env`:
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Nota**: Sem a chave do Resend, os lembretes serão criados mas não enviados por email.

### Execução

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra [http://localhost:8080](http://localhost:8080) no seu navegador.

### Diagnóstico de Autenticação

Se houver problemas de login, verifique o console do navegador:

**Logs normais (sistema saudável):**
```
🔧 Supabase Config: { url: "https://seu-projeto.supabase.co", keyConfigured: true }
🔵 AuthProvider: Initializing...
🔑 Attempting login with email: usuario@exemplo.com
✅ Login successful, user: xxx-xxx-xxx
✅ Session confirmed after X attempts
🔔 Auth state changed: { event: 'SIGNED_IN' }
📊 Loading role for user: ...
✅ Role found: admin
✅ AdminRoute: Access granted
```

**Logs de erro:**
```
❌ Error fetching user role: ...
⚠️ No role found, attempting to infer seller...
⚠️ Session lost or signed out
```

### Utilitários de Diagnóstico

Execute no console do navegador para diagnosticar problemas:

```javascript
// Verificar saúde da sessão
import { checkSessionHealth } from '@/lib/authUtils';
const health = await checkSessionHealth();
console.log(health);

// Forçar refresh da sessão
import { forceRefreshSession } from '@/lib/authUtils';
const result = await forceRefreshSession();
console.log(result);

// Limpar cache de autenticação
import { clearAuthCache } from '@/lib/authUtils';
clearAuthCache();

// Forçar refresh do AuthContext
const { refreshAuth } = useAuth();
await refreshAuth();
```

## Deploy

Para fazer deploy do aplicativo:

1. **Build do projeto**:
```bash
npm run build
```

2. **Deploy em plataforma estática** (Vercel, Netlify, etc.):
   - Faça upload da pasta `dist` gerada pelo build
   - Configure as variáveis de ambiente no painel da plataforma
   - **Importante**: Certifique-se de que o projeto Supabase está **despausado**

3. **Alternativa: Docker**:
```bash
# Build da imagem
docker build -t arseg-app .

# Execução do container
docker run -p 8080:8080 --env-file .env arseg-app
```

### Configuração em Produção

1. Execute o script de estabilização de roles no Supabase:
   - Vá para o SQL Editor do Supabase
   - Execute `supabase/ESTABILIZAR_ROLES_PERMANENTE.sql`
   - Isso garante que o admin tenha role correta e novos usuários sejam tratados adequadamente

2. Verifique mensalmente o estado do sistema:
```sql
-- Verificar estado do admin
SELECT * FROM public.v_user_roles_summary 
WHERE email = 'jairosouza67@gmail.com';

-- Verificar e corrigir se necessário
SELECT * FROM public.verify_and_fix_admin_role();
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── pages/              # Páginas da aplicação
├── contexts/           # Contextos React para estado global
├── hooks/              # Custom hooks
├── lib/                # Utilitários e funções auxiliares
├── integrations/       # Integrações com serviços externos (Supabase)
├── router/             # Configuração de rotas
├── assets/             # Assets estáticos
└── App.tsx             # Componente raiz da aplicação
```

### Estrutura de Autenticação

```
src/
├── contexts/
│   └── AuthContext.tsx     # Provedor de autenticação centralizado
├── hooks/
│   ├── useAuthRole.tsx     # Hook para acesso ao contexto de auth
│   └── useUserRole.tsx     # Hook legado (substituído por useAuthRole)
├── integrations/supabase/
│   ├── client.ts          # Cliente Supabase configurado
│   └── types.ts           # Tipos TypeScript gerados
├── lib/
│   └── authUtils.ts       # Utilitários de diagnóstico e recuperação
├── components/
│   ├── AdminRoute.tsx     # Rota protegida para admin
│   └── SellerDashboardRoute.tsx  # Rota protegida para vendedores
└── pages/
    └── Login.tsx          # Página de login otimizada
```

## Banco de Dados

O aplicativo utiliza o Supabase como backend. As tabelas principais são:

- `products` - Produtos (extintores)
- `customers` - Clientes
- `quotes` - Orçamentos
- `suppliers` - Fornecedores
- `user_roles` - Permissões de usuários
- `renewal_reminders` - Lembretes de renovação de extintores

### Sistema de Roles Estabilizado

O sistema de roles foi completamente reestruturado para evitar problemas de recursão e inconsistências:

1. **RLS Desabilitado** - Row Level Security desativado na tabela `user_roles` para evitar loops
2. **Trigger Automática** - Função `handle_new_user()` atribui role automaticamente para novos usuários
3. **Função de Reparo** - `verify_and_fix_admin_role()` corrige automaticamente inconsistências
4. **View de Consulta** - `v_user_roles_summary` facilita consultas e monitoramento

### Scripts de Manutenção

Execute periodicamente no SQL Editor do Supabase:

```sql
-- Verificar e corrigir admin
SELECT * FROM public.verify_and_fix_admin_role();

-- Garantir admin existe
SELECT public.ensure_admin_exists();

-- Visualizar estado atual
SELECT * FROM public.v_user_roles_summary;
```

### Sistema de Roles Estabilizado

O sistema de roles foi completamente reestruturado para evitar problemas de recursão e inconsistências:

1. **RLS Desabilitado** - Row Level Security desativado na tabela `user_roles` para evitar loops
2. **Trigger Automática** - Função `handle_new_user()` atribui role automaticamente para novos usuários
3. **Função de Reparo** - `verify_and_fix_admin_role()` corrige automaticamente inconsistências
4. **View de Consulta** - `v_user_roles_summary` facilita consultas e monitoramento

### Scripts de Manutenção

Execute periodicamente no SQL Editor do Supabase:

```sql
-- Verificar e corrigir admin
SELECT * FROM public.verify_and_fix_admin_role();

-- Garantir admin existe
SELECT public.ensure_admin_exists();

-- Visualizar estado atual
SELECT * FROM public.v_user_roles_summary;
```

## Sistema de Lembretes de Renovação

O sistema possui um mecanismo automático de lembretes para renovação de extintores:

### Funcionalidades

- **Criação Automática**: Quando um orçamento é aprovado, um lembrete de renovação é criado automaticamente
- **Calendário Inteligente**: 
  - Renovação programada para 1 ano após a aprovação
  - Lembrete enviado 1 mês antes da data de renovação
- **Envio por Email**: Lembretes são enviados automaticamente por email usando Resend
- **Gerenciamento Administrativo**: Interface completa para visualizar e gerenciar todos os lembretes
- **Status Tracking**: Acompanhe o status dos lembretes (Pendente, Enviado, Concluído, Cancelado)
- **Notificações no Dashboard**: Alertas visuais para lembretes pendentes

### Como Usar

1. **Aprovar Orçamento**: No painel administrativo, mude o status de um orçamento para "Aprovado"
2. **Lembrete Automático**: O sistema cria automaticamente um lembrete de renovação
3. **Envio de Email**: Configure o Resend e clique em "Enviar Lembretes Pendentes" para enviar emails
4. **Gerenciar Lembretes**: Acesse "Lembretes de Renovação" no dashboard para visualizar e gerenciar
5. **Atualizar Status**: Marque lembretes como enviados, concluídos ou cancelados

### Configuração de Email

Para enviar lembretes por email:

1. Configure a variável `VITE_RESEND_API_KEY` no arquivo `.env`
2. Certifique-se de que os clientes possuem email cadastrado nos orçamentos
3. Use o botão "Enviar Lembretes Pendentes" na página de lembretes

### Acesso aos Lembretes

- **Dashboard**: Notificações automáticas de lembretes pendentes
- **Menu Admin**: Botão "Lembretes de Renovação" nas ações rápidas
- **URL**: `/admin/renewal-reminders`

### Scripts de Manutenção

Execute periodicamente para verificar lembretes pendentes:

```javascript
// Enviar lembretes pendentes
import { sendPendingReminders } from '@/lib/renewalReminders';
sendPendingReminders();
```

### Scripts de Manutenção

Execute periodicamente para verificar lembretes pendentes:

```javascript
// Enviar lembretes pendentes
import { sendPendingReminders } from '@/lib/renewalReminders';
sendPendingReminders();
```

## Monitoramento e Manutenção

### Logs de Sistema Saudável

```
🔵 AuthProvider: Initializing...
🔄 Initial session: { userId: "abc123", email: "user@example.com" }
🔄 Processing session change: { event: "INITIAL_LOAD" }
📊 Loading role for user: abc123
✅ Role found: admin
🔍 AuthProvider state: userId: abc123 role: admin isAdmin: true loading: false
🛡️ AdminRoute check: { isAdmin: true, loading: false }
✅ AdminRoute: Access granted
```

### Logs de Problema

```
❌ Error fetching user role: { ... }
⚠️ No role found, attempting to infer seller...
⚠️ Session lost or signed out, event: TOKEN_REFRESHED
```

### Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Projeto Supabase está despausado
- [ ] Variáveis de ambiente configuradas
- [ ] Script `ESTABILIZAR_ROLES_PERMANENTE.sql` executado no Supabase
- [ ] Testado login localmente (`npm run dev`)
- [ ] Verificado logs no console (sem erros ❌)
- [ ] Testado acesso a `/admin` após login
- [ ] Testado recarregar página (F5) com usuário logado
- [ ] Clear cache and deploy na plataforma de hospedagem

### Troubleshooting

**Problema: Botão fica "piscando" (loading infinito)**
- Verifique se há role no banco de dados
- Execute `clearAuthCache()` e faça login novamente

**Problema: Login não funciona**
- Verifique variáveis de ambiente (.env)
- Confirme que projeto Supabase está ativo

**Problema: Redirect não acontece**
- Verifique logs "➡️ Navigating to"
- Confirme que role está correta no banco

**Problema: Sessão se perde**
- Execute `clearAuthCache()` e faça login novamente
- Verifique se projeto Supabase está pausado

## Monitoramento e Manutenção

### Logs de Sistema Saudável

```
🔵 AuthProvider: Initializing...
🔄 Initial session: { userId: "abc123", email: "user@example.com" }
🔄 Processing session change: { event: "INITIAL_LOAD" }
📊 Loading role for user: abc123
✅ Role found: admin
🔍 AuthProvider state: userId: abc123 role: admin isAdmin: true loading: false
🛡️ AdminRoute check: { isAdmin: true, loading: false }
✅ AdminRoute: Access granted
```

### Logs de Problema

```
❌ Error fetching user role: { ... }
⚠️ No role found, attempting to infer seller...
⚠️ Session lost or signed out, event: TOKEN_REFRESHED
```

### Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Projeto Supabase está despausado
- [ ] Variáveis de ambiente configuradas
- [ ] Script `ESTABILIZAR_ROLES_PERMANENTE.sql` executado no Supabase
- [ ] Testado login localmente (`npm run dev`)
- [ ] Verificado logs no console (sem erros ❌)
- [ ] Testado acesso a `/admin` após login
- [ ] Testado recarregar página (F5) com usuário logado
- [ ] Clear cache and deploy na plataforma de hospedagem

### Troubleshooting

**Problema: Botão fica "piscando" (loading infinito)**
- Verifique se há role no banco de dados
- Execute `clearAuthCache()` e faça login novamente

**Problema: Login não funciona**
- Verifique variáveis de ambiente (.env)
- Confirme que projeto Supabase está ativo

**Problema: Redirect não acontece**
- Verifique logs "➡️ Navigating to"
- Confirme que role está correta no banco

**Problema: Sessão se perde**
- Execute `clearAuthCache()` e faça login novamente
- Verifique se projeto Supabase está pausado

## Licença

Este projeto está sob licença MIT.
