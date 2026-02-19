import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validação de configuração
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  if (import.meta.env.DEV) {
    console.error(
      "⚠️ Supabase configuration missing: Define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env"
    );
    console.error("Key status:", { url: !!SUPABASE_URL ? 'SET' : 'MISSING', key: SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING' });
  }
}

// Criar cliente Supabase com configurações otimizadas
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: localStorage,
      storageKey: 'arseg-auth-token',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-client-info': 'arseg-web-app'
      }
    }
  }
);
