import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const allProducts = [
  { id: 1, name: "Extintor ABC 4kg", type: "ABC - Pó Químico", price: 69.90, inStock: true },
  { id: 2, name: "Extintor ABC 6kg", type: "ABC - Pó Químico", price: 89.90, inStock: true },
  { id: 3, name: "Extintor ABC 12kg", type: "ABC - Pó Químico", price: 159.90, inStock: true },
  { id: 4, name: "Extintor CO₂ 6kg", type: "CO₂", price: 199.90, inStock: true },
  { id: 5, name: "Extintor CO₂ 10kg", type: "CO₂", price: 299.90, inStock: true },
  { id: 6, name: "Extintor AB 10L", type: "AB - Água Pressurizada", price: 149.90, inStock: true },
  { id: 7, name: "Extintor AB 50L", type: "AB - Água Pressurizada", price: 0, inStock: false },
  { id: 8, name: "Extintor Pó Químico 20kg", type: "ABC - Pó Químico", price: 0, inStock: false },
];

const categories = ["Todos", "ABC - Pó Químico", "CO₂", "AB - Água Pressurizada"];

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
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

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
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
                  {...product}
                  onAddToQuote={() => console.log(`Added ${product.name} to quote`)}
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
    </div>
  );
};

export default Produtos;
