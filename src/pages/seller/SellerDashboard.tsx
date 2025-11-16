import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header.tsx";
import { Footer } from "@/components/Footer.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FileText, Bell, Package } from "lucide-react";
import { useAuthRole } from "@/hooks/useAuthRole.tsx";
import { supabase } from "@/integrations/supabase/client.ts";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { userId, loading } = useAuthRole();
  const [quotesCount, setQuotesCount] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      fetchCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userId]);

  const fetchCounts = async () => {
    if (!userId) {
      setQuotesCount(0);
      setRemindersCount(0);
      return;
    }

    // Count quotes created by this user
    const quotesRes: any = await (supabase as any)
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId);

    setQuotesCount(quotesRes.count || 0);

    // Fetch quote IDs then count reminders linked to those quotes
    const quoteIdsRes: any = await (supabase as any)
      .from("quotes")
      .select("id")
      .eq("created_by", userId);

    const quoteIds = (quoteIdsRes.data || []).map((q: any) => q.id);

    if (quoteIds.length === 0) {
      setRemindersCount(0);
      return;
    }

    const remindersRes: any = await (supabase as any)
      .from("renewal_reminders")
      .select("*", { count: "exact", head: true })
      .in("quote_id", quoteIds);

    setRemindersCount(remindersRes.count || 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Painel do Vendedor</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu painel. Aqui estão suas ações rápidas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Orçamentos</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotesCount}</div>
              <p className="text-sm text-muted-foreground mb-4">Orçamentos criados por você</p>
              <Button variant="outline" onClick={() => navigate("/vendedor/orcamentos")}>Ver Meus Orçamentos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Lembretes</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remindersCount}</div>
              <p className="text-sm text-muted-foreground mb-4">Lembretes vinculados aos seus orçamentos</p>
              <Button variant="outline" onClick={() => navigate("/vendedor/lembretes")}>Ver Meus Lembretes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Navegue pelo catálogo de produtos</p>
              <Button variant="outline" onClick={() => navigate("/vendedor/produtos")}>Ver Produtos</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
