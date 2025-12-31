import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ProductCategories } from "@/components/ProductCategories";
import { OtherProducts } from "@/components/OtherProducts";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        <Hero />

        <ProductShowcase />

        <ProductCategories />

        <OtherProducts />

        {/* CTA Section */}
        <section className="py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight">
                Precisa de um Orçamento Personalizado?
              </h2>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Nossa equipe está pronta para atender sua empresa com soluções sob medida
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 shadow-lg">
                  <Link to="/orcamentos">Solicitar Orçamento</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
                  <Link to="/contato">Falar com Especialista</Link>
                </Button>
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

export default Index;

