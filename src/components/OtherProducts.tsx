import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Droplets, Lightbulb, Settings2, Wrench } from "lucide-react";

const otherCategories = [
    {
        icon: Droplets,
        title: "Mangueiras e Combate",
        description: "Mangueiras de incêndio, esguichos, registros e conexões",
        category: "equipamentos-all",
        image: "/products/mangueira-de-incendio-tipo-1-1-1-2-15-metros.png",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        icon: Lightbulb,
        title: "Sinalização",
        description: "Iluminação de emergência, placas e detectores",
        category: "sinalizacao-all",
        image: "/products/luminaria-bloco-farolete-2-200-lumens.png",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        icon: Settings2,
        title: "Peças e Acessórios",
        description: "Válvulas, sifões, manômetros e componentes",
        category: "pecas-all",
        image: "/products/valvula-m30-completa.png",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        icon: Wrench,
        title: "Suportes",
        description: "Suportes de parede, tripé e veiculares",
        category: "pecas-suporte",
        image: "/products/suporte-tripe-p8-p12-ap10.png",
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
    },
];

export const OtherProducts = () => {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Mais do que{" "}
                        <span className="text-primary">Extintores</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Linha completa de equipamentos e acessórios para segurança contra incêndio
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherCategories.map((category, index) => (
                        <Link
                            key={category.title}
                            to={`/produtos?categoria=${category.category}`}
                            className="block"
                        >
                            <Card
                                className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-2 transition-all duration-300 cursor-pointer animate-fade-in h-full"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Product Image Preview */}
                                <div className="relative z-10 h-32 flex items-center justify-center bg-gradient-to-b from-muted/50 to-transparent overflow-hidden">
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        className="max-h-24 max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                        loading="lazy"
                                    />
                                </div>

                                <CardHeader className="relative z-10 pt-2">
                                    <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 ${category.color}`}>
                                        <category.icon className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{category.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10 pt-0">
                                    <CardDescription className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                                        {category.description}
                                    </CardDescription>
                                    <div className="mt-4 text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Ver produtos
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
