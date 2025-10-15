import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuoteItem {
  product_id: string;
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "default" },
      approved: { label: "Aprovado", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("quotes")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status.",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
      fetchQuotes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

    const { error } = await supabase.from("quotes").delete().eq("id", id);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground">Visualize e gerencie orçamentos</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <>
                    <TableRow key={quote.id} className="cursor-pointer" onClick={() => toggleRow(quote.id)}>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {expandedRows.has(quote.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(quote.created_at)}</TableCell>
                      <TableCell className="font-medium">{quote.customer_name}</TableCell>
                      <TableCell>{quote.customer_email || "-"}</TableCell>
                      <TableCell>{quote.customer_phone}</TableCell>
                      <TableCell>{Array.isArray(quote.items) ? quote.items.length : 0} produto(s)</TableCell>
                      <TableCell className="font-bold">{formatCurrency(Number(quote.total_value))}</TableCell>
                      <TableCell>
                        <Select
                          value={quote.status}
                          onValueChange={(value) => handleStatusChange(quote.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="approved">Aprovado</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(quote.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(quote.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/50">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Produtos do Orçamento:</h4>
                              {Array.isArray(quote.items) && quote.items.length > 0 ? (
                                <div className="space-y-2">
                                  {quote.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-background rounded">
                                      <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-muted-foreground">{item.product_type}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm">Quantidade: {item.quantity}</p>
                                        <p className="text-sm">Preço unitário: {formatCurrency(item.unit_price)}</p>
                                        <p className="font-medium">Subtotal: {formatCurrency(item.total_price)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">Nenhum produto listado</p>
                              )}
                            </div>
                            {quote.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Observações:</h4>
                                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {quotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhum orçamento encontrado
                    </TableCell>
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

export default Quotes;
