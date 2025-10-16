import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, FileText, Building2, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    quotes: 0,
    products: 0,
  });

  const [quotesByStatus, setQuotesByStatus] = useState<{ status: string; count: number; percentage: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<{ name: string; in_stock: boolean }[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchQuotesByStatus();
    fetchLowStockProducts();
    fetchRecentQuotes();

    // Setup realtime subscriptions
    const quotesChannel = supabase
      .channel('quotes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        fetchStats();
        fetchQuotesByStatus();
        fetchRecentQuotes();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStats();
        fetchLowStockProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const fetchStats = async () => {
    const [customersCount, suppliersCount, quotesCount, productsCount] = await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("suppliers").select("*", { count: "exact", head: true }),
      supabase.from("quotes").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      customers: customersCount.count || 0,
      suppliers: suppliersCount.count || 0,
      quotes: quotesCount.count || 0,
      products: productsCount.count || 0,
    });
  };

  const fetchQuotesByStatus = async () => {
    const { data: quotes } = await supabase.from("quotes").select("status");
    
    if (quotes) {
      const statusCounts = quotes.reduce((acc: any, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
      }, {});

      const total = quotes.length;
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status === 'pending' ? 'Pendente' : status === 'approved' ? 'Aprovado' : 'Cancelado',
        count: count as number,
        percentage: ((count as number) / total) * 100,
      }));

      setQuotesByStatus(statusData);
    }
  };

  const fetchLowStockProducts = async () => {
    const { data: products } = await supabase
      .from("products")
      .select("name, in_stock")
      .eq("in_stock", false)
      .order("name", { ascending: true })
      .limit(10);

    if (products) {
      setLowStockProducts(products);
    }
  };

  const fetchRecentQuotes = async () => {
    const { data: quotes } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (quotes) {
      setRecentQuotes(quotes);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
              <p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <p className="text-xs text-muted-foreground">Total de fornecedores cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotes}</div>
              <p className="text-xs text-muted-foreground">Total de orçamentos solicitados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground">Total de produtos no catálogo</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quotes by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Orçamentos por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={quotesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {quotesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Produtos Fora de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todos os produtos estão em estoque</p>
                ) : (
                  lowStockProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-destructive font-semibold">Fora de estoque</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum orçamento recente</p>
              ) : (
                recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{quote.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{quote.customer_phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {parseFloat(quote.total_value).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{quote.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="border border-border hover:bg-accent"
              onClick={() => navigate("/admin/customers")}
            >
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Clientes
            </Button>
            <Button
              variant="outline"
              className="border border-border hover:bg-accent"
              onClick={() => navigate("/admin/suppliers")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar Fornecedores
            </Button>
            <Button
              variant="outline"
              className="border border-border hover:bg-accent"
              onClick={() => navigate("/admin/quotes")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver Orçamentos
            </Button>
            <Button
              variant="outline"
              className="border border-border hover:bg-accent"
              onClick={() => navigate("/admin/products")}
            >
              <Package className="mr-2 h-4 w-4" />
              Gerenciar Produtos
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
