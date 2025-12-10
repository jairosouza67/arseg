import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { getAllReminders, updateReminderStatus, deleteReminder, sendPendingReminders } from "@/lib/renewalReminders";
import type { RenewalReminder } from "@/lib/renewalReminders";
import { formatDate } from "@/lib/dateUtils";
import { getReminderStatusBadge } from "@/lib/statusUtils";

const RenewalReminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<RenewalReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState<string>("");
  const [dateEnd, setDateEnd] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sellerId, setSellerId] = useState<string>("");
  const [sellers, setSellers] = useState<Array<{ user_id: string }>>([]);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('renewal_reminders').select('*, quotes!inner(created_by)');
      if (dateStart) query = query.gte('reminder_date', dateStart);
      if (dateEnd) query = query.lte('reminder_date', dateEnd);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (sellerId) query = query.eq('quotes.created_by', sellerId);
      query = query.order('reminder_date', { ascending: false });
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      setReminders(((data || []) as any).map((r: any) => ({
        ...r,
        status: r.status as 'pending' | 'sent' | 'completed' | 'cancelled',
      })));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os lembretes.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, dateStart, dateEnd, statusFilter, sellerId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    const sub = supabase
      .channel('renewal-reminders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renewal_reminders' }, () => {
        fetchReminders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [fetchReminders]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchReminders();
    }, 15000);
    return () => clearInterval(id);
  }, [fetchReminders]);

  useEffect(() => {
    supabase
      .from('user_roles')
      .select('user_id')
      .eq('role' as any, 'seller')
      .then(({ data }) => {
        setSellers(data || []);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { label: "Pendente", variant: "default", icon: Clock },
      sent: { label: "Enviado", variant: "secondary", icon: Send },
      completed: { label: "Concluído", variant: "default", icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive", icon: XCircle },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline", icon: Clock };
    const IconComponent = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStatusChange = async (reminderId: string, newStatus: 'pending' | 'sent' | 'completed' | 'cancelled') => {
    try {
      await updateReminderStatus(reminderId, newStatus);
      toast({
        title: "Sucesso",
        description: "Status do lembrete atualizado com sucesso.",
      });
      fetchReminders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status.",
      });
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lembrete?")) return;

    try {
      await deleteReminder(reminderId);
      toast({
        title: "Sucesso",
        description: "Lembrete excluído com sucesso.",
      });
      fetchReminders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o lembrete.",
      });
    }
  };

  const handleSendPendingReminders = async () => {
    const pendingCount = reminders.filter(r => r.status === 'pending').length;

    if (pendingCount === 0) {
      toast({
        title: "Aviso",
        description: "Não há lembretes pendentes para enviar.",
      });
      return;
    }

    if (!confirm(`Deseja enviar ${pendingCount} lembrete(s) pendente(s)?`)) return;

    try {
      setLoading(true);
      await sendPendingReminders();
      toast({
        title: "Sucesso",
        description: "Lembretes enviados com sucesso.",
      });
      fetchReminders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao enviar lembretes. Verifique o console para mais detalhes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilReminder = (reminderDate: string) => {
    const today = new Date();
    const reminder = new Date(reminderDate);
    const diffTime = reminder.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lembretes de Renovação</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie lembretes automáticos de renovação de extintores
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Período:</span>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-40"
            />
            <span className="text-muted-foreground">até</span>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-40"
            />
          </div>

          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sellerId || 'all'} onValueChange={(v) => setSellerId(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Vendedores</SelectItem>
              {sellers.filter(s => s.user_id).map((s) => (
                <SelectItem key={s.user_id} value={s.user_id}>{s.user_id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleSendPendingReminders}
          disabled={loading}
          className="whitespace-nowrap"
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar Pendentes ({reminders.filter(r => r.status === 'pending').length})
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Lista de Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando lembretes...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum lembrete encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data do Lembrete</TableHead>
                  <TableHead>Data da Renovação</TableHead>
                  <TableHead>Dias p/ Lembrete</TableHead>
                  <TableHead>Dias p/ Renovação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => {
                  const daysToReminder = getDaysUntilReminder(reminder.reminder_date);
                  const daysToRenewal = getDaysUntilRenewal(reminder.renewal_date);

                  return (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.customer_name}</TableCell>
                      <TableCell>{reminder.customer_phone}</TableCell>
                      <TableCell>{formatDate(reminder.reminder_date)}</TableCell>
                      <TableCell>{formatDate(reminder.renewal_date)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${daysToReminder <= 0 ? 'text-red-600' : daysToReminder <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                          {daysToReminder <= 0 ? 'Vencido' : `${daysToReminder} dias`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${daysToRenewal <= 0 ? 'text-red-600' : daysToRenewal <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                          {daysToRenewal <= 0 ? 'Vencido' : `${daysToRenewal} dias`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <select
                          value={reminder.status}
                          onChange={(e) => handleStatusChange(reminder.id, e.target.value as 'pending' | 'sent' | 'completed' | 'cancelled')}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">Pendente</option>
                          <option value="sent">Enviado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reminder.id)}
                          title="Excluir lembrete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lembretes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter(r => r.status === 'sent').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RenewalReminders;
