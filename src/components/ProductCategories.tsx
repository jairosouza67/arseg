import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Wind, Snowflake, Zap } from "lucide-react";

const categories = [
  {
    icon: Droplets,
    title: "Extintor AB",
    description: "Indicado para incêndios classe A (sólidos) e B (líquidos inflamáveis)",
    color: "text-blue-500",
  },
  {
    icon: Zap,
    title: "Extintor ABC",
    description: "Combate a incêndios classe A, B e C (equipamentos elétricos energizados)",
    color: "text-primary",
  },
  {
    icon: Wind,
    title: "Água Pressurizada",
    description: "Solução eficaz para incêndios classe A com água sob pressão",
    color: "text-accent",
  },
  {
    icon: Snowflake,
    title: "CO₂",
    description: "Ideal para equipamentos elétricos e eletrônicos sensíveis",
    color: "text-secondary",
  },
];

export const ProductCategories = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Nossos Tipos de{" "}
            Nossos Tipos de{" "}
            <span className="text-primary">
              Extintores
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Soluções completas para cada necessidade de segurança contra incêndio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card
              key={category.title}
              className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${category.color}`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
