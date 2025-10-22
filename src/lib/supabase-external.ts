import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Configuração do Supabase externo do usuário
const SUPABASE_URL = 'https://rqsfzckoozhlmwdfiwky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxc2Z6Y2tvb3pobG13ZGZpd2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDI4NjEsImV4cCI6MjA3NjU3ODg2MX0.ZQxFQkwUs0UntJlxKqqfuO-HdKtycfBTml0mSXB9_O0';

// Cliente Supabase externo
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
