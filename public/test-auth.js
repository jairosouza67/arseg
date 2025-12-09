/**
 * Script de teste para validar o sistema de autenticação
 * 
 * Execute no console do navegador após fazer login:
 * 
 * const script = document.createElement('script');
 * script.src = '/test-auth.js';
 * document.head.appendChild(script);
 */

(async function testAuthSystem() {
  console.log("🧪 ========================================");
  console.log("🧪 TESTE DO SISTEMA DE AUTENTICAÇÃO");
  console.log("🧪 ========================================\n");

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function logTest(name, status, message) {
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${name}: ${message}`);
    
    results.tests.push({ name, status, message });
    if (status === 'pass') results.passed++;
    else if (status === 'fail') results.failed++;
    else results.warnings++;
  }

  // Teste 1: Verificar se Supabase está configurado
  console.log("\n📋 Teste 1: Configuração do Supabase");
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      logTest("Supabase Config", "pass", "Variáveis de ambiente configuradas");
    } else {
      logTest("Supabase Config", "fail", "Variáveis de ambiente faltando");
    }
  } catch (err) {
    logTest("Supabase Config", "fail", err.message);
  }

  // Teste 2: Verificar localStorage
  console.log("\n📋 Teste 2: LocalStorage");
  try {
    const authKeys = Object.keys(localStorage).filter(
      key => key.includes('arseg-auth') || key.includes('sb-')
    );
    
    if (authKeys.length > 0) {
      logTest("LocalStorage", "pass", `${authKeys.length} chaves de auth encontradas`);
    } else {
      logTest("LocalStorage", "warn", "Nenhuma chave de auth no localStorage");
    }
  } catch (err) {
    logTest("LocalStorage", "fail", err.message);
  }

  // Teste 3: Verificar sessão atual
  console.log("\n📋 Teste 3: Sessão Atual");
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logTest("Session", "fail", `Erro: ${error.message}`);
    } else if (session) {
      logTest("Session", "pass", `Usuário: ${session.user.email}`);
      
      // Verificar expiração
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at > now) {
        logTest("Session Expiry", "pass", `Expira em ${Math.floor((session.expires_at - now) / 60)} minutos`);
      } else {
        logTest("Session Expiry", "warn", "Token expirado ou próximo de expirar");
      }
    } else {
      logTest("Session", "warn", "Nenhuma sessão ativa");
    }
  } catch (err) {
    logTest("Session", "fail", err.message);
  }

  // Teste 4: Verificar role do usuário
  console.log("\n📋 Teste 4: Role do Usuário");
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        logTest("User Role", "fail", `Erro ao buscar role: ${error.message}`);
      } else if (roleData?.role) {
        logTest("User Role", "pass", `Role: ${roleData.role}`);
      } else {
        logTest("User Role", "warn", "Usuário sem role definida");
      }
    } else {
      logTest("User Role", "warn", "Nenhum usuário autenticado");
    }
  } catch (err) {
    logTest("User Role", "fail", err.message);
  }

  // Teste 5: Verificar AuthContext
  console.log("\n📋 Teste 5: AuthContext");
  try {
    // Este teste só funciona se o React DevTools estiver disponível
    const authProviderElement = document.querySelector('[data-auth-provider]');
    if (authProviderElement) {
      logTest("AuthContext", "pass", "AuthProvider montado");
    } else {
      logTest("AuthContext", "warn", "Não foi possível verificar AuthProvider");
    }
  } catch (err) {
    logTest("AuthContext", "warn", "Verificação não disponível");
  }

  // Teste 6: Testar refresh de token
  console.log("\n📋 Teste 6: Refresh de Token");
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logTest("Token Refresh", "fail", `Erro: ${error.message}`);
    } else if (data.session) {
      logTest("Token Refresh", "pass", "Token atualizado com sucesso");
    } else {
      logTest("Token Refresh", "warn", "Refresh retornou sem sessão");
    }
  } catch (err) {
    logTest("Token Refresh", "fail", err.message);
  }

  // Teste 7: Verificar performance
  console.log("\n📋 Teste 7: Performance");
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    
    const start = performance.now();
    await supabase.auth.getSession();
    const duration = performance.now() - start;
    
    if (duration < 100) {
      logTest("Performance", "pass", `getSession em ${duration.toFixed(2)}ms`);
    } else if (duration < 500) {
      logTest("Performance", "warn", `getSession em ${duration.toFixed(2)}ms (aceitável)`);
    } else {
      logTest("Performance", "fail", `getSession muito lento: ${duration.toFixed(2)}ms`);
    }
  } catch (err) {
    logTest("Performance", "fail", err.message);
  }

  // Resumo
  console.log("\n🧪 ========================================");
  console.log("🧪 RESUMO DOS TESTES");
  console.log("🧪 ========================================");
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log(`⚠️  Avisos: ${results.warnings}`);
  console.log(`📊 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log("\n🎉 Todos os testes críticos passaram!");
  } else {
    console.log("\n⚠️  Alguns testes falharam. Verifique os detalhes acima.");
  }

  console.log("\n📋 Detalhes completos:");
  console.table(results.tests);

  return results;
})();
