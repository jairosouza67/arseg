import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const Orcamentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, clearCart, total } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de solicitar o orçamento.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quoteItems = items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_type: item.type,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error } = await supabase.from("quotes").insert([
        {
          customer_name: formData.name,
          customer_email: formData.email || null,
          customer_phone: formData.phone,
          items: quoteItems,
          total_value: total,
          status: "pending",
          notes: `Endereço: ${formData.address}\nContato: ${formData.contact}\nObservações: ${formData.observations}`,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu orçamento foi enviado. Entraremos em contato em breve.",
      });

      clearCart();
      setFormData({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        observations: "",
      });
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o orçamento. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-hero py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
                Solicitar Orçamento
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Preencha o formulário e receba sua cotação em até 24 horas
              </p>
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">Dados do Cliente</CardTitle>
                <CardDescription>
                  Informe seus dados para que possamos preparar um orçamento personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Cart Summary */}
                {items.length > 0 && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-3">Produtos Selecionados</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between font-bold">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome / Razão Social *</Label>
                      <Input
                        id="name"
                        placeholder="Digite o nome ou razão social"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Pessoa de Contato</Label>
                      <Input
                        id="contact"
                        placeholder="Nome do responsável"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      placeholder="Rua, número, complemento, bairro, cidade - UF"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      placeholder="Informações adicionais, prazo de entrega, forma de pagamento preferida, etc."
                      className="min-h-[100px]"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="text-center">
                <CardHeader>
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Orçamento Rápido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Resposta em até 24 horas úteis
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Download className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">PDF ou Word</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Receba o orçamento no formato de sua preferência
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Send className="w-8 h-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Sem Compromisso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Orçamento gratuito e sem obrigação de compra
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Orcamentos;
