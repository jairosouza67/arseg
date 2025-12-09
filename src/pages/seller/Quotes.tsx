import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Trash2, FileDown } from "lucide-react";
import { generateQuotePDF } from "@/lib/generateQuotePDF";
import { formatDate } from "@/lib/dateUtils";
import { getQuoteStatusBadge } from "@/lib/statusUtils";

const SellerQuotes = () => {
  const { userId, loading } = useAuthRole();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading) fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userId]);

  const fetchQuotes = async () => {
    if (!userId) return setQuotes([]);

    const res: any = await (supabase as any)
      .from("quotes")
      .select("id, customer_name, customer_phone, customer_email, items, status, created_at")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    const data = res.data;
    const error = res.error;

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar seus orçamentos." });
      return;
    }

    // Se não encontrou orçamentos por `created_by`, tenta um fallback usando o email do usuário.
    if ((!data || data.length === 0) && !res.error) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const userEmail = user?.email ?? null;

        if (userEmail) {
          const emailRes: any = await (supabase as any)
            .from("quotes")
            .select("id, customer_name, customer_phone, customer_email, items, status, created_at")
            .eq("customer_email", userEmail)
            .order("created_at", { ascending: false });

          if (!emailRes.error && emailRes.data && emailRes.data.length > 0) {
            setQuotes(emailRes.data || []);
            return;
          }
        }
      } catch (err) {
        // Não conseguiu obter o usuário; segue com lista vazia
        console.error("Erro ao buscar email do usuário para fallback:", err);
      }
    }

    setQuotes(data || []);
  };

  // Date formatting and status badge functions moved to lib utilities

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { data, error } = await supabase
      .from("quotes")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar status:", error);
      toast({ variant: "destructive", title: "Erro ao atualizar status", description: error.message });
      return;
    }

    toast({ title: "Sucesso", description: "Status atualizado com sucesso." });

    fetchQuotes();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este orçamento?")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o orçamento." });
    } else {
      toast({ title: "Sucesso", description: "Orçamento excluído com sucesso." });
      fetchQuotes();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Meus Orçamentos</h1>
          <p className="text-muted-foreground">Lista de orçamentos criados por você.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Qtd Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <React.Fragment key={quote.id}>
                    <TableRow className="hover:bg-muted/40" onClick={() => toggleRow(quote.id)}>
                      <TableCell className="align-top">
                        {expandedRows.has(quote.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="align-top">{formatDate(quote.created_at)}</TableCell>
                      <TableCell className="align-top font-medium">{quote.customer_name}</TableCell>
                      <TableCell className="align-top">{quote.customer_email || "-"}</TableCell>
                      <TableCell className="align-top">{quote.customer_phone}</TableCell>
                      <TableCell className="align-top">{Array.isArray(quote.items) ? quote.items.length : 0}</TableCell>
                      <TableCell className="align-top">
                        <Select value={quote.status} onValueChange={(value) => handleStatusChange(quote.id, value)}>
                          <SelectTrigger className="w-28">
                            <SelectValue>{getQuoteStatusBadge(quote.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex gap-1">
                          <button
                            className="p-2"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await generateQuotePDF(quote as any);
                            }}
                            title="Baixar PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quote.id);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRows.has(quote.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/40">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Produtos solicitados</h4>
                              {Array.isArray(quote.items) && quote.items.length > 0 ? (
                                <div className="space-y-2">
                                  {quote.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-background rounded">
                                      <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">{item.product_type}</p>
                                      </div>
                                      <div className="text-right text-xs">
                                        <p>Quantidade: {item.quantity}</p>
                                        <p>Preço: a combinar</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Nenhum item registrado.</p>
                              )}
                            </div>
                            {quote.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Observações do cliente</h4>
                                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}

                {quotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum orçamento encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SellerQuotes;
