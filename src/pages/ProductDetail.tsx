import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
import { Link } from "react-router-dom";

interface Product {
    id: string;
    name: string;
    type: string;
    price: number;
    in_stock: boolean;
    image_url: string | null;
    description: string | null;
}

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { toast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Erro ao carregar produto:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível carregar os detalhes do produto.",
            });
            navigate("/produtos");
        } finally {
            setLoading(false);
        }
    };

    const getProductImage = (p: Product) => {
        if (p.image_url) return p.image_url;

        const t = p.type.toLowerCase();
        const n = p.name.toLowerCase();
        if (t.includes("abc") || n.includes("abc")) return "/products/extintor-abc.png";
        if (t.includes("bc") || n.includes("bc")) return "/products/extintor-bc.png";
        if (t.includes("co2") || t.includes("co₂") || n.includes("co2") || n.includes("co₂")) return "/products/extintor-co2.png";
        if (t.includes("água") || t.includes("agua") || n.includes("água") || n.includes("agua")) return "/products/extintor-agua.png";
        return undefined;
    };

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            type: product.type,
            price: product.price,
        });
        toast({
            title: "Produto adicionado",
            description: `${product.name} foi adicionado ao carrinho.`,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    const image = getProductImage(product);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/30">
            <Header />

            <main className="flex-1 pb-24 md:pb-12">
                <div className="container py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                        <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                        <span className="text-foreground font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Image Gallery/Container */}
                        <div className="space-y-4">
                            <div className="relative aspect-square bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center shadow-sm group overflow-hidden">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <span className="text-9xl opacity-20">🧯</span>
                                )}
                                <Badge
                                    variant={product.in_stock ? "default" : "secondary"}
                                    className="absolute top-6 right-6 shadow-md text-sm py-1 px-3"
                                >
                                    {product.in_stock ? "Em Estoque" : "Sob Consulta"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                                    <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Qualidade</span>
                                    <span className="text-xs font-medium">Garantida</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                                    <CheckCircle2 className="h-6 w-6 text-primary mb-2" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Certificado</span>
                                    <span className="text-xs font-medium">Inmetro</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                                    <ShoppingCart className="h-6 w-6 text-primary mb-2" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Pronta</span>
                                    <span className="text-xs font-medium">Entrega</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-sm font-semibold py-1 px-4 border-primary/20 bg-primary/5 text-primary">
                                    {product.type}
                                </Badge>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-primary">Sob Consulta</span>
                                    <div className="h-6 w-[1px] bg-slate-200" />
                                    <span className="text-muted-foreground">Melhores preços do mercado</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="prose prose-slate max-w-none">
                                    <h3 className="text-lg font-semibold text-slate-900">Descrição Técnica</h3>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        {product.description || "Este equipamento de alta performance é essencial para a segurança contra incêndios em seu estabelecimento. Atende a todas as normas de segurança vigentes e possui certificação oficial."}
                                    </p>
                                </div>

                                <div className="bg-slate-100/50 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-slate-700">Homologado pelo Corpo de Bombeiros</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-slate-700">Garantia total de fábrica</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-slate-700">Assistência técnica especializada</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        size="lg"
                                        onClick={handleAddToCart}
                                        className="flex-1 h-14 text-lg font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                    >
                                        <ShoppingCart className="mr-3 h-6 w-6" />
                                        Adicionar ao Orçamento
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => navigate("/produtos")}
                                        className="h-14 font-semibold"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Continuar Comprando
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <MobileNav />
        </div>
    );
};

export default ProductDetail;
