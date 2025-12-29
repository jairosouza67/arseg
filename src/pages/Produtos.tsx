import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  in_stock: boolean;
  image_url: string | null;
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  "Equipamentos & Combate": ["Mangueira", "Combate a Incêndio"],
  "Sinalização & Luz": ["Sinalização", "Iluminação"],
  "Peças & Acessórios": ["Componentes", "Acessórios", "Sifão", "Suporte", "Fitas", "Agente Extintor"],
};

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
      });
      return;
    }

    setProducts(data || []);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCategory === "Todos") return true;

    // Lógica para Extintores e Sub-tipos
    if (selectedCategory.startsWith("extintor-")) {
      if (product.type !== "Extintor") return false;
      if (selectedCategory === "extintor-all") return true;

      const subtype = selectedCategory.replace("extintor-", "");
      const n = product.name.toLowerCase();

      if (subtype === "abc") return n.includes("abc");
      if (subtype === "bc") return n.includes("bc") && !n.includes("abc");
      if (subtype === "co2") return n.includes("co2") || n.includes("co²");
      if (subtype === "agua") return n.includes("água") || n.includes("agua");
      if (subtype === "espuma") return n.includes("espuma");
      return true;
    }

    // Lógica para Grupos Genéricos
    const groupTypes = CATEGORY_GROUPS[selectedCategory];
    if (groupTypes) {
      return groupTypes.includes(product.type);
    }

    return product.type === selectedCategory;
  });

  const getProductImage = (product: Product) => {
    const t = product.type.toLowerCase();
    const n = product.name.toLowerCase();
    if (t.includes("abc") || n.includes("abc")) return "/products/extintor-abc.png";
    if (t.includes("bc") || n.includes("bc")) return "/products/extintor-bc.png";
    if (t.includes("co2") || t.includes("co₂") || n.includes("co2") || n.includes("co₂")) return "/products/extintor-co2.png";
    if (t.includes("água") || t.includes("agua") || n.includes("água") || n.includes("agua")) return "/products/extintor-agua.png";
    return undefined;
  };

  const handleAddToCart = (product: Product) => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Page Header */}
        <section className="bg-gradient-hero py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
                Nossos Produtos
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Equipamentos certificados e homologados para sua segurança
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 border-b bg-background sticky top-16 z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters and Cart */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant={selectedCategory === "Todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("Todos")}
                >
                  Todos
                </Button>

                <Select
                  onValueChange={setSelectedCategory}
                  value={selectedCategory.startsWith("extintor-") ? selectedCategory : undefined}
                >
                  <SelectTrigger className={`h-9 w-[180px] ${selectedCategory.startsWith("extintor-") ? "bg-primary text-primary-foreground" : ""}`}>
                    <SelectValue placeholder="Extintores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extintor-all">Todos os Extintores</SelectItem>
                    <SelectItem value="extintor-abc">Pó ABC</SelectItem>
                    <SelectItem value="extintor-bc">Pó BC</SelectItem>
                    <SelectItem value="extintor-co2">CO₂ (Gás Carbônico)</SelectItem>
                    <SelectItem value="extintor-agua">Água Pressurizada</SelectItem>
                    <SelectItem value="extintor-espuma">Espuma Mecânica</SelectItem>
                  </SelectContent>
                </Select>

                {Object.keys(CATEGORY_GROUPS).map((group) => (
                  <Button
                    key={group}
                    variant={selectedCategory === group ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(group)}
                  >
                    {group}
                  </Button>
                ))}

                <CartDrawer />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  type={product.type}
                  price={product.price}
                  inStock={product.in_stock}
                  image={product.image_url ?? getProductImage(product)}
                  onAddToQuote={() => handleAddToCart(product)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  Nenhum produto encontrado.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Produtos;
