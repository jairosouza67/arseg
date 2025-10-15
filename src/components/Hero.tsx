import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Flame, Award } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 via-foreground/90 to-primary/20" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground">Certificados e Homologados</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            Segurança que
            <span className="block bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              protege vidas
            </span>
          </h1>

          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Equipamentos de combate a incêndio de alta qualidade com atendimento profissional e personalizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <Link to="/orcamentos">Solicitar Orçamento</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/5 backdrop-blur-sm border border-primary-foreground/10 hover:border-primary/50 transition-all animate-scale-in">
              <Flame className="w-8 h-8 text-primary" />
              <h3 className="font-semibold text-primary-foreground">Qualidade Garantida</h3>
              <p className="text-sm text-primary-foreground/70 text-center">
                Produtos certificados e testados
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/5 backdrop-blur-sm border border-primary-foreground/10 hover:border-primary/50 transition-all animate-scale-in delay-100">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="font-semibold text-primary-foreground">Atendimento Rápido</h3>
              <p className="text-sm text-primary-foreground/70 text-center">
                Orçamentos em até 24 horas
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/5 backdrop-blur-sm border border-primary-foreground/10 hover:border-primary/50 transition-all animate-scale-in delay-200">
              <Award className="w-8 h-8 text-primary" />
              <h3 className="font-semibold text-primary-foreground">Experiência</h3>
              <p className="text-sm text-primary-foreground/70 text-center">
                Mais de 10 anos no mercado
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
