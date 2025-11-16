import { useEffect, useState } from 'react';
import { getPendingReminders } from '@/lib/renewalReminders';
import type { RenewalReminder } from '@/lib/renewalReminders';

export const useRenewalReminders = () => {
  const [pendingReminders, setPendingReminders] = useState<RenewalReminder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingReminders = async () => {
    try {
      setLoading(true);
      const reminders = await getPendingReminders();
      setPendingReminders(reminders);
    } catch (error) {
      console.error('Erro ao buscar lembretes pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReminders();

    // Verificar a cada hora por novos lembretes
    const interval = setInterval(fetchPendingReminders, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(interval);
  }, []);

  return {
    pendingReminders,
    loading,
    refetch: fetchPendingReminders
  };
};
