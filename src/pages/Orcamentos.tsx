import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, Download } from "lucide-react";

const Orcamentos = () => {
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome / Razão Social *</Label>
                    <Input id="name" placeholder="Digite o nome ou razão social" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Pessoa de Contato</Label>
                    <Input id="contact" placeholder="Nome do responsável" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input id="phone" type="tel" placeholder="(11) 99999-9999" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input id="address" placeholder="Rua, número, complemento, bairro, cidade - UF" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="products">Produtos de Interesse *</Label>
                  <Textarea
                    id="products"
                    placeholder="Liste os produtos e quantidades desejadas. Ex: 10x Extintor ABC 6kg, 5x Extintor CO₂ 6kg"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    placeholder="Informações adicionais, prazo de entrega, forma de pagamento preferida, etc."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="hero" size="lg" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Solicitação
                  </Button>
                </div>
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
