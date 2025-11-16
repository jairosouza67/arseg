import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Page Header */}
        <section className="bg-gradient-hero py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
                Entre em Contato
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Nossa equipe está pronta para atender você
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <Phone className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Telefone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">(77) 3017-6264</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Segunda a Sexta, 8h às 18h
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <MessageSquare className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>WhatsApp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">(77) 98842-6440</p>
                    <Button variant="hero" size="sm" className="mt-3 w-full">
                      Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <Mail className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>E-mail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">arsegextintores@hotmail.com</p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <MapPin className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Endereço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Avenida Filipinas, Nº 08<br />
                      Bairro Jurema - Vitória da Conquista
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-2xl">Envie sua Mensagem</CardTitle>
                    <CardDescription>
                      Preencha o formulário abaixo e entraremos em contato em breve
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" placeholder="Seu nome" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input id="subject" placeholder="Motivo do contato" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        placeholder="Digite sua mensagem aqui..."
                        className="min-h-[200px]"
                        required
                      />
                    </div>

                    <Button variant="hero" size="lg" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Contato;
