import { supabase } from "@/integrations/supabase/client";
import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface RenewalReminder {
  id: string;
  quote_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  reminder_date: string;
  renewal_date: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Cria um lembrete de renovação quando um orçamento é aprovado
 * @param quoteId ID do orçamento aprovado
 * @param customerName Nome do cliente
 * @param customerEmail Email do cliente
 * @param customerPhone Telefone do cliente
 */
export const createRenewalReminder = async (
  quoteId: string,
  customerName: string,
  customerEmail: string | null,
  customerPhone: string
): Promise<void> => {
  // Calcular datas: renovação em 1 ano, lembrete 1 mês antes
  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  const reminderDate = new Date(renewalDate);
  reminderDate.setMonth(reminderDate.getMonth() - 1);

  const userRes = await supabase.auth.getUser();
  const currentUserId = userRes.data.user ? userRes.data.user.id : null;

  const quoteRes: any = await (supabase as any)
    .from('quotes')
    .select('created_by')
    .eq('id', quoteId)
    .single();

  const sellerUserId = quoteRes?.data?.created_by ?? currentUserId;

  const { data, error } = await supabase
    .from('renewal_reminders')
    .insert({
      quote_id: quoteId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      reminder_date: reminderDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      renewal_date: renewalDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      status: 'pending',
      notes: 'Lembrete automático de renovação de extintores (anual)',
      created_by: sellerUserId
    })
    .select();

  if (error) {
    console.error('Erro detalhado ao criar lembrete:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  console.log('Lembrete criado com sucesso:', data);
};

/**
 * Busca lembretes pendentes que precisam ser enviados
 */
export const getPendingReminders = async (): Promise<RenewalReminder[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('renewal_reminders')
    .select('*')
    .eq('status', 'pending')
    .lte('reminder_date', today)
    .order('reminder_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar lembretes pendentes:', error);
    throw error;
  }

  return data || [];
};

/**
 * Busca todos os lembretes
 */
export const getAllReminders = async (): Promise<RenewalReminder[]> => {
  const { data, error } = await supabase
    .from('renewal_reminders')
    .select('*')
    .order('reminder_date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar lembretes:', error);
    throw error;
  }

  return data || [];
};

/**
 * Atualiza o status de um lembrete
 */
export const updateReminderStatus = async (
  reminderId: string,
  status: 'pending' | 'sent' | 'completed' | 'cancelled'
): Promise<void> => {
  const { error } = await supabase
    .from('renewal_reminders')
    .update({ status })
    .eq('id', reminderId);

  if (error) {
    console.error('Erro ao atualizar status do lembrete:', error);
    throw error;
  }
};

/**
 * Remove um lembrete
 */
export const deleteReminder = async (reminderId: string): Promise<void> => {
  const { error } = await supabase
    .from('renewal_reminders')
    .delete()
    .eq('id', reminderId);

  if (error) {
    console.error('Erro ao remover lembrete:', error);
    throw error;
  }
};

/**
 * Envia um lembrete de renovação por email
 */
export const sendRenewalReminderEmail = async (reminder: RenewalReminder): Promise<void> => {
  if (!resend) {
    throw new Error('Resend API key não configurada. Adicione VITE_RESEND_API_KEY no arquivo .env');
  }

  if (!reminder.customer_email) {
    throw new Error('Cliente não possui email cadastrado');
  }

  const reminderDate = new Date(reminder.reminder_date).toLocaleDateString('pt-BR');
  const renewalDate = new Date(reminder.renewal_date).toLocaleDateString('pt-BR');

  try {
    const { data, error } = await resend.emails.send({
      from: 'ARSEG Extintores <noreply@arseg.com.br>',
      to: [reminder.customer_email],
      subject: 'Lembrete: Renovação Anual de Extintores',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Lembrete de Renovação</h1>
          
          <p>Olá ${reminder.customer_name},</p>
          
          <p>Este é um lembrete automático sobre a <strong>renovação anual dos seus extintores</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Detalhes da Renovação:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Data do Lembrete:</strong> ${reminderDate}</li>
              <li style="margin-bottom: 10px;"><strong>Data de Renovação:</strong> ${renewalDate}</li>
              <li style="margin-bottom: 10px;"><strong>Cliente:</strong> ${reminder.customer_name}</li>
              <li style="margin-bottom: 10px;"><strong>Telefone:</strong> ${reminder.customer_phone}</li>
            </ul>
          </div>
          
          <p style="color: #dc3545; font-weight: bold;">
            ⚠️ A renovação dos extintores é obrigatória por lei e essencial para sua segurança.
          </p>
          
          <p>Entre em contato conosco para agendar a manutenção e renovação:</p>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>ARSEG Extintores</strong></p>
            <p style="margin: 5px 0;">📞 Telefone: (11) 99999-9999</p>
            <p style="margin: 5px 0;">📧 Email: contato@arseg.com.br</p>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            Este é um email automático. Por favor, não responda diretamente a este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="text-align: center; color: #6c757d; font-size: 12px;">
            ARSEG Extintores - Segurança em Primeiro Lugar<br>
            © ${new Date().getFullYear()} ARSEG. Todos os direitos reservados.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    console.log('Email enviado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao enviar lembrete por email:', error);
    throw error;
  }
};

/**
 * Envia lembretes pendentes e atualiza o status
 */
export const sendPendingReminders = async (): Promise<void> => {
  const pendingReminders = await getPendingReminders();

  for (const reminder of pendingReminders) {
    try {
      if (reminder.customer_email) {
        await sendRenewalReminderEmail(reminder);
        await updateReminderStatus(reminder.id, 'sent');
        console.log(`Lembrete enviado para ${reminder.customer_name}`);
      } else {
        console.warn(`Cliente ${reminder.customer_name} não possui email cadastrado`);
      }
    } catch (error) {
      console.error(`Erro ao enviar lembrete para ${reminder.customer_name}:`, error);
    }
  }
};
