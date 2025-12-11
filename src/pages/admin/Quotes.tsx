import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, FileDown } from "lucide-react";
import { generateQuotePDF } from "@/lib/generateQuotePDF";
import { createRenewalReminder } from "@/lib/renewalReminders";
import { formatDate } from "@/lib/dateUtils";
import { getQuoteStatusBadge } from "@/lib/statusUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Quote {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  items: any;
  total_value: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const Quotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os orçamentos.",
      });
    } else {
      setQuotes(data || []);
    }
  };

  // Status badge function moved to @/lib/statusUtils

  // Date formatting function moved to @/lib/dateUtils

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
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
      console.error("Erro detalhado ao atualizar status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: `${error.message} (Código: ${error.code})`,
      });
      return;
    }

    if (newStatus === "approved") {
      const quote = data;
      if (quote) {
        try {
          await createRenewalReminder(
            quote.id,
            quote.customer_name,
            quote.customer_email,
            quote.customer_phone
          );
          toast({
            title: "Sucesso",
            description:
              "Status atualizado e lembrete de renovação criado.",
          });
        } catch (reminderError) {
          console.error("Erro ao criar lembrete:", reminderError);
          toast({
            title: "Status atualizado",
            description:
              "Orçamento aprovado, mas houve erro ao criar lembrete de renovação.",
          });
        }
      } else {
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso.",
        });
      }
    } else {
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
    }

    fetchQuotes();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este orçamento?"))
      return;

    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso.",
      });
      fetchQuotes();
    }
  };

  return (
    <>
      {/* Header responsivo */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-bold">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">
            Todos os orçamentos enviados pelo site
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Lista de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Versão Mobile - Cards */}
          <div className="block md:hidden space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{quote.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(quote.created_at)}</p>
                  </div>
                  {getQuoteStatusBadge(quote.status)}
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{quote.customer_phone}</p>
                  {quote.customer_email && (
                    <p className="text-muted-foreground text-xs">{quote.customer_email}</p>
                  )}
                  <p className="text-xs">{Array.isArray(quote.items) ? quote.items.length : 0} item(s)</p>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Select
                    value={quote.status}
                    onValueChange={(value) => handleStatusChange(quote.id, value)}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => generateQuotePDF(quote)} title="Baixar PDF">
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)} title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {quotes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum orçamento encontrado.
              </p>
            )}
          </div>

          {/* Versão Desktop - Tabela */}
          <div className="hidden md:block overflow-x-auto">
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
                    <TableRow
                      className="hover:bg-muted/40"
                      onClick={() => toggleRow(quote.id)}
                    >
                      <TableCell className="align-top">
                        {expandedRows.has(quote.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        {formatDate(quote.created_at)}
                      </TableCell>
                      <TableCell className="align-top font-medium">
                        {quote.customer_name}
                      </TableCell>
                      <TableCell className="align-top">
                        {quote.customer_email || "-"}
                      </TableCell>
                      <TableCell className="align-top">
                        {quote.customer_phone}
                      </TableCell>
                      <TableCell className="align-top">
                        {Array.isArray(quote.items)
                          ? quote.items.length
                          : 0}
                      </TableCell>
                      <TableCell className="align-top">
                        <Select
                          value={quote.status}
                          onValueChange={(value) =>
                            handleStatusChange(quote.id, value)
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue>
                              {getQuoteStatusBadge(quote.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Pendente
                            </SelectItem>
                            <SelectItem value="approved">
                              Aprovado
                            </SelectItem>
                            <SelectItem value="rejected">
                              Rejeitado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await generateQuotePDF(quote);
                            }}
                            title="Baixar PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quote.id);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(quote.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/40">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">
                                Produtos solicitados
                              </h4>
                              {Array.isArray(quote.items) &&
                                quote.items.length > 0 ? (
                                <div className="space-y-2">
                                  {quote.items.map(
                                    (
                                      item: any,
                                      idx: number
                                    ) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center p-2 bg-background rounded"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {item.product_name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {item.product_type}
                                          </p>
                                        </div>
                                        <div className="text-right text-xs">
                                          <p>
                                            Quantidade:{" "}
                                            {item.quantity}
                                          </p>
                                          <p>
                                            Preço: a combinar
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhum item registrado.
                                </p>
                              )}
                            </div>
                            {quote.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Observações do cliente
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">
                                  {quote.notes}
                                </p>
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
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Quotes;
