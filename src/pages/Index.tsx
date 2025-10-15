import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCategories } from "@/components/ProductCategories";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Extintor ABC 6kg",
    type: "ABC - Pó Químico",
    price: 89.90,
    inStock: true,
  },
  {
    id: 2,
    name: "Extintor CO₂ 6kg",
    type: "CO₂",
    price: 199.90,
    inStock: true,
  },
  {
    id: 3,
    name: "Extintor AB 10L",
    type: "AB - Água Pressurizada",
    price: 149.90,
    inStock: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        <ProductCategories />

        {/* Featured Products */}
        <section className="py-20">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Produtos em{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Destaque
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Conheça nossos extintores mais procurados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToQuote={() => console.log(`Added ${product.name} to quote`)}
                />
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/produtos">
                  Ver Todos os Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Precisa de um Orçamento Personalizado?
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Nossa equipe está pronta para atender sua empresa com soluções sob medida
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="outline" className="bg-background hover:bg-background/90">
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
    </div>
  );
};

export default Index;
