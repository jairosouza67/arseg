import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Lock } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <div className="container max-w-md">
          <Card className="shadow-glow animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero">
                  <Flame className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Área Administrativa</CardTitle>
              <CardDescription>
                Faça login para acessar o painel de gestão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@safefirepro.com.br"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Entrar
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">
                  Esqueceu sua senha?
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Acesso restrito a funcionários autorizados
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
