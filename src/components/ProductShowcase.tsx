import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Products to showcase with images from public/products folder
const showcaseProducts = [
    // Extintores
    { id: "extintor-abc", name: "Extintor ABC", image: "/products/extintor-abc.png", category: "extintor-all" },
    { id: "extintor-co2", name: "Extintor CO₂", image: "/products/extintor-co2.png", category: "extintor-co2" },
    { id: "extintor-bc", name: "Extintor BC", image: "/products/extintor-bc.png", category: "extintor-bc" },
    { id: "extintor-agua", name: "Extintor Água", image: "/products/extintor-agua.png", category: "extintor-agua" },
    // Mangueiras
    { id: "mangueira-incendio", name: "Mangueira de Incêndio", image: "/products/mangueira-de-incendio-tipo-1-1-1-2-15-metros.png", category: "equipamentos-mangueira" },
    // Equipamentos
    { id: "esguicho", name: "Esguicho Regulável", image: "/products/esguicho-regulavel-em-latao-2-1-2.png", category: "equipamentos-combate" },
    { id: "registro-globo", name: "Registro Globo", image: "/products/registro-globo-angular-pn16-220-lbs.png", category: "equipamentos-hidrante" },
    // Sinalização
    { id: "luminaria", name: "Luminária de Emergência", image: "/products/luminaria-30-leds.png", category: "sinalizacao-iluminacao" },
    { id: "detector-fumaca", name: "Detector de Fumaça", image: "/products/detector-de-fumaca.png", category: "sinalizacao-all" },
    { id: "balizamento", name: "Balizamento Saída", image: "/products/balizamento-de-saida-de-emergencia.png", category: "sinalizacao-placas" },
    // Peças
    { id: "valvula-m30", name: "Válvula M30", image: "/products/valvula-m30-completa.png", category: "pecas-valvula" },
    { id: "sifao", name: "Sifão para Extintor", image: "/products/sifao-plastico-para-extintor-p12-ap10l-535-mm.png", category: "pecas-sifao" },
    { id: "suporte", name: "Suporte Tripé", image: "/products/suporte-tripe-p8-p12-ap10.png", category: "pecas-suporte" },
    { id: "manometro", name: "Manômetro", image: "/products/manometro-1-4-inox.png", category: "pecas-valvula" },
];

export const ProductShowcase = () => {
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Duplicate products for infinite scroll effect
    const duplicatedProducts = [...showcaseProducts, ...showcaseProducts];

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isPaused) return;

        let animationId: number;
        let scrollPosition = 0;

        const animate = () => {
            scrollPosition += 0.5; // Speed of scroll

            // Reset when we've scrolled past the first set of products
            const halfWidth = scrollContainer.scrollWidth / 2;
            if (scrollPosition >= halfWidth) {
                scrollPosition = 0;
            }

            scrollContainer.scrollLeft = scrollPosition;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isPaused]);

    return (
        <section className="py-16 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
            <div className="container mb-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Conheça Nossos{" "}
                        <span className="text-primary">Produtos</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Equipamentos completos para segurança contra incêndio
                    </p>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-hidden py-8 px-4 cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ scrollBehavior: 'auto' }}
            >
                {duplicatedProducts.map((product, index) => (
                    <Link
                        key={`${product.id}-${index}`}
                        to={`/produtos?categoria=${product.category}`}
                        className="flex-shrink-0 group"
                    >
                        <div className="w-48 h-64 bg-card rounded-xl border border-primary/10 hover:border-primary/40 hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-2">
                            <div className="flex-1 p-4 flex items-center justify-center bg-gradient-to-b from-muted/50 to-transparent">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-36 max-w-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4 pt-2 text-center border-t border-primary/5">
                                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="container mt-4">
                <div className="flex justify-center">
                    <Link
                        to="/produtos"
                        className="text-primary hover:text-primary-dark font-medium flex items-center gap-2 group"
                    >
                        Ver todos os produtos
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};
