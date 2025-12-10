import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Flame, Award } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background"></div>

      {/* Elegant red light elements */}
      {/* Elegant red light elements - Reduced intensity */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      {/* Extinguisher Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/products/extintor-abc.png"
          alt=""
          className="absolute -left-20 top-20 w-96 opacity-20 -rotate-12 blur-[1px] animate-float"
          style={{ animationDelay: "0s" }}
        />
        <img
          src="/products/extintor-co2.png"
          alt=""
          className="absolute -right-20 bottom-0 w-96 opacity-20 rotate-12 blur-[1px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="container relative z-10 py-24">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-glow">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Certificados e Homologados</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Segurança que
              <span className="block mt-2 text-primary leading-tight">
                protege vidas
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed hero-text-dark">
              Equipamentos de combate a incêndio de alta qualidade com atendimento profissional e personalizado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto shadow-elegant shadow-primary/20 relative overflow-hidden group">
              <Link to="/produtos">
                <span className="relative z-10">Ver Produtos</span>
                <span className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all">
              <Link to="/orcamentos">Solicitar Orçamento</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-primary/10 hover:border-primary/30 hover:shadow-elegant transition-all animate-scale-in group">
              <div className="p-3 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors shadow-sm">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Qualidade Garantida</h3>
              <p className="text-sm text-muted-foreground text-center">
                Produtos certificados e testados!
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-primary/10 hover:border-primary/30 hover:shadow-elegant transition-all animate-scale-in delay-100 group">
              <div className="p-3 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors shadow-sm">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Atendimento Rápido</h3>
              <p className="text-sm text-muted-foreground text-center">
                Nossos atendentes sempre a disposição!
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-primary/10 hover:border-primary/30 hover:shadow-elegant transition-all animate-scale-in delay-200 group">
              <div className="p-3 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors shadow-sm">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Experiência</h3>
              <p className="text-sm text-muted-foreground text-center">
                Os profissionais mais qualificados do mercado!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
