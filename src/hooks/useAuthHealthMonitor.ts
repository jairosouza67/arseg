import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook de monitoramento da saúde da autenticação
 * Detecta anomalias e tenta recuperação automática
 */
export const useAuthHealthMonitor = (userId: string | null, role: string | null, isAuthenticated: boolean) => {
  const healthCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailures = useRef(0);
  const lastKnownGoodState = useRef<{ userId: string | null; role: string | null }>({ userId: null, role: null });

  useEffect(() => {
    // Salvar último estado válido
    if (userId && role) {
      lastKnownGoodState.current = { userId, role };
      consecutiveFailures.current = 0;
    }

    // Monitoramento de saúde a cada 30 segundos
    healthCheckInterval.current = setInterval(async () => {
      try {
        // Verificar se usuário ainda está autenticado
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Auth health check failed:', error);
          consecutiveFailures.current += 1;
          
          if (consecutiveFailures.current >= 3) {
            console.error('🚨 CRITICAL: 3 consecutive auth failures detected');
            // Aqui você pode adicionar telemetria/alertas
          }
          return;
        }

        // Caso 1: Deveria estar autenticado mas sessão foi perdida
        if (isAuthenticated && !session) {
          console.warn('⚠️ Session lost unexpectedly, user was authenticated');
          consecutiveFailures.current += 1;
        }
        // Caso 2: Tem sessão mas estado está dessincronizado
        else if (session && !isAuthenticated) {
          console.warn('⚠️ Session exists but auth state is false');
          consecutiveFailures.current += 1;
        }
        // Caso 3: Usuário autenticado sem role
        else if (session && isAuthenticated && !role) {
          console.warn('⚠️ User authenticated but role is null');
          
          // Tentar recarregar role do banco
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (!roleData?.role) {
            console.error('🚨 User has no role in database:', session.user.email);
            consecutiveFailures.current += 1;
          }
        }
        // Caso 4: Tudo OK
        else if (session && isAuthenticated && role) {
          consecutiveFailures.current = 0;
        }

      } catch (err) {
        console.error('Auth health check exception:', err);
        consecutiveFailures.current += 1;
      }
    }, 30000); // 30 segundos

    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, [userId, role, isAuthenticated]);

  return {
    isHealthy: consecutiveFailures.current === 0,
    failureCount: consecutiveFailures.current,
  };
};
