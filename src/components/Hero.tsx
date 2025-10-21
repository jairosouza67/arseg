import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Award, CheckCircle } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary-dark" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="flex justify-center mb-8">
            <img
              src="/Imagem do WhatsApp de 2025-10-21 à(s) 15.52.42_6e8d4403.jpg"
              alt="ARSEG Extintores"
              className="h-32 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Certificados e Homologados</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Segurança que
            <span className="block text-white drop-shadow-lg">
              protege vidas
            </span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Equipamentos de combate a incêndio de alta qualidade com atendimento profissional e personalizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              <Link to="/orcamentos">Solicitar Orçamento</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all animate-scale-in">
              <CheckCircle className="w-8 h-8 text-white" />
              <h3 className="font-semibold text-white">Qualidade Garantida</h3>
              <p className="text-sm text-white/80 text-center">
                Produtos certificados e testados
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all animate-scale-in delay-100">
              <Shield className="w-8 h-8 text-white" />
              <h3 className="font-semibold text-white">Atendimento Rápido</h3>
              <p className="text-sm text-white/80 text-center">
                Orçamentos em até 24 horas
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all animate-scale-in delay-200">
              <Award className="w-8 h-8 text-white" />
              <h3 className="font-semibold text-white">Experiência</h3>
              <p className="text-sm text-white/80 text-center">
                Mais de 10 anos no mercado
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
