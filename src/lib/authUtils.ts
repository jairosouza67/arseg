/**
 * Utilitários para gerenciamento de autenticação
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Limpa todos os dados de autenticação do localStorage
 */
export const clearAuthCache = () => {
  console.log("🧹 Clearing auth cache...");
  
  const keysToRemove = Object.keys(localStorage).filter(
    key => key.includes('supabase') || key.includes('auth') || key.includes('sb-')
  );
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log("  ❌ Removed:", key);
  });
  
  console.log("✅ Auth cache cleared");
};

/**
 * Verifica a saúde da sessão atual
 */
export const checkSessionHealth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Session health check failed:", error);
      return { healthy: false, error };
    }
    
    if (!session) {
      console.log("⚠️ No active session");
      return { healthy: false, error: "No session" };
    }
    
    // Verificar se o token está expirado
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn("⚠️ Session token expired");
      return { healthy: false, error: "Token expired" };
    }
    
    console.log("✅ Session is healthy");
    return { healthy: true, session };
  } catch (err) {
    console.error("❌ Exception checking session health:", err);
    return { healthy: false, error: err };
  }
};

/**
 * Força refresh do token de autenticação
 */
export const forceRefreshSession = async () => {
  console.log("🔄 Forcing session refresh...");
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("❌ Failed to refresh session:", error);
      return { success: false, error };
    }
    
    console.log("✅ Session refreshed successfully");
    return { success: true, session: data.session };
  } catch (err) {
    console.error("❌ Exception refreshing session:", err);
    return { success: false, error: err };
  }
};

/**
 * Reconecta à autenticação após problemas
 */
export const reconnectAuth = async () => {
  console.log("🔌 Attempting to reconnect auth...");
  
  // Primeiro verificar saúde
  const health = await checkSessionHealth();
  
  if (health.healthy) {
    console.log("✅ Session is already healthy");
    return { success: true };
  }
  
  // Tentar refresh
  const refreshResult = await forceRefreshSession();
  
  if (refreshResult.success) {
    console.log("✅ Reconnection successful");
    return { success: true };
  }
  
  // Se falhar, limpar cache e recomendar novo login
  console.warn("⚠️ Reconnection failed, clearing cache");
  clearAuthCache();
  
  return { success: false, requiresLogin: true };
};
