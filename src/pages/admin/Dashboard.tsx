import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    quotes: 0,
    pendingQuotes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, suppliersRes, quotesRes, pendingRes] = await Promise.all([
          supabase.from("customers").select("*", { count: "exact", head: true }),
          supabase.from("suppliers").select("*", { count: "exact", head: true }),
          supabase.from("quotes").select("*", { count: "exact", head: true }),
          supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        setStats({
          customers: customersRes.count || 0,
          suppliers: suppliersRes.count || 0,
          quotes: quotesRes.count || 0,
          pendingQuotes: pendingRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as estatísticas.",
        });
      }
    };

    fetchStats();
  }, [toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Visão geral do sistema</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/customers")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
              <p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/suppliers")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <p className="text-xs text-muted-foreground">Total de fornecedores</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/quotes")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotes}</div>
              <p className="text-xs text-muted-foreground">Total de orçamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
              <p className="text-xs text-muted-foreground">Orçamentos aguardando</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate("/admin/customers")}
                className="w-full p-3 text-left rounded-md border border-border hover:bg-accent transition-colors"
              >
                Gerenciar Clientes
              </button>
              <button
                onClick={() => navigate("/admin/suppliers")}
                className="w-full p-3 text-left rounded-md border border-border hover:bg-accent transition-colors"
              >
                Gerenciar Fornecedores
              </button>
              <button
                onClick={() => navigate("/admin/quotes")}
                className="w-full p-3 text-left rounded-md border border-border hover:bg-accent transition-colors"
              >
                Ver Orçamentos
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas movimentações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
