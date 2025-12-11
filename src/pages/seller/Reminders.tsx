import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const SellerReminders = () => {
  const { userId, loading } = useAuthRole();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userId]);

  useEffect(() => {
    const sub = supabase
      .channel('seller-renewal-reminders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renewal_reminders' }, () => {
        fetchReminders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      fetchReminders();
    }, 15000);
    return () => clearInterval(id);
  }, [userId]);

  async function fetchReminders() {
    if (!userId) return setReminders([]);

    // Primeiro busca os IDs de orçamentos criados por este usuário
    const quoteIdsRes: any = await (supabase as any)
      .from("quotes")
      .select("id")
      .eq("created_by", userId);

    if (quoteIdsRes.error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar seus lembretes (falha ao buscar orçamentos)." });
      return;
    }

    const quoteIds = (quoteIdsRes.data || []).map((q: any) => q.id);

    if (quoteIds.length === 0) {
      // Sem orçamentos vinculados, não há lembretes
      setReminders([]);
      return;
    }

    const res: any = await (supabase as any)
      .from("renewal_reminders")
      .select("*")
      .in("quote_id", quoteIds)
      .order("reminder_date", { ascending: false });

    const data = res.data;
    const error = res.error;

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar seus lembretes." });
      return;
    }

    setReminders(data || []);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Meus Lembretes</h1>
          <p className="text-sm text-muted-foreground mt-1">Lembretes relacionados aos orçamentos que você criou.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum lembrete encontrado.</p>
            ) : (
              <>
                {/* Versão Mobile - Cards */}
                <div className="block md:hidden space-y-4">
                  {reminders.map((r) => (
                    <div key={r.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold">{r.customer_name}</p>
                        <span className="text-xs px-2 py-1 rounded bg-muted">{r.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Lembrete</p>
                          <p>{r.reminder_date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Renovação</p>
                          <p>{r.renewal_date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Versão Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data do Lembrete</TableHead>
                        <TableHead>Data de Renovação</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reminders.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.reminder_date}</TableCell>
                          <TableCell>{r.renewal_date}</TableCell>
                          <TableCell className="font-medium">{r.customer_name}</TableCell>
                          <TableCell>{r.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SellerReminders;
