import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
import { useAuthRole } from "@/hooks/useAuthRole";

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

// Subcategorias para cada dropdown
const CATEGORY_SUBCATEGORIES: Record<string, { value: string; label: string; types: string[] }[]> = {
  "equipamentos": [
    { value: "equipamentos-all", label: "Todos Equipamentos", types: ["Mangueira", "Combate a Incêndio", "Hidrante", "Sprinkler"] },
    { value: "equipamentos-mangueira", label: "Mangueiras", types: ["Mangueira"] },
    { value: "equipamentos-hidrante", label: "Hidrantes", types: ["Hidrante"] },
    { value: "equipamentos-combate", label: "Combate a Incêndio", types: ["Combate a Incêndio"] },
    { value: "equipamentos-sprinkler", label: "Sprinklers", types: ["Sprinkler"] },
  ],
  "sinalizacao": [
    { value: "sinalizacao-all", label: "Todos Sinalização", types: ["Sinalização", "Iluminação", "Placa", "Luminária"] },
    { value: "sinalizacao-placas", label: "Placas de Sinalização", types: ["Sinalização", "Placa"] },
    { value: "sinalizacao-iluminacao", label: "Iluminação de Emergência", types: ["Iluminação", "Luminária"] },
  ],
  "pecas": [
    { value: "pecas-all", label: "Todos Peças", types: ["Componentes", "Acessórios", "Sifão", "Suporte", "Fitas", "Agente Extintor", "Válvula", "Manômetro"] },
    { value: "pecas-sifao", label: "Sifões", types: ["Sifão"] },
    { value: "pecas-suporte", label: "Suportes", types: ["Suporte"] },
    { value: "pecas-valvula", label: "Válvulas e Manômetros", types: ["Válvula", "Manômetro"] },
    { value: "pecas-agente", label: "Agentes Extintores", types: ["Agente Extintor"] },
    { value: "pecas-fitas", label: "Fitas e Adesivos", types: ["Fitas"] },
    { value: "pecas-acessorios", label: "Outros Acessórios", types: ["Acessórios", "Componentes"] },
  ],
};

// Função para obter tipos de uma subcategoria
const getTypesForCategory = (category: string): string[] | null => {
  for (const group of Object.values(CATEGORY_SUBCATEGORIES)) {
    const found = group.find(sub => sub.value === category);
    if (found) return found.types;
  }
  return null;
};

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: 0,
    in_stock: true,
    description: "",
    image_url: "",
  });
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAdmin } = useAuthRole();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
      });
      return;
    }

    // Ordenação customizada: Extintores primeiro, depois o restante em ordem alfabética
    // Verifica se é um extintor real: tipo "Extintor" E nome começa com "Extintor"
    const isRealExtintor = (product: { type: string; name: string }) => {
      const typeIsExtintor = product.type?.toLowerCase() === "extintor";
      const nameStartsWithExtintor = product.name?.toLowerCase().startsWith("extintor");
      return typeIsExtintor && nameStartsWithExtintor;
    };

    const sortedProducts = (data || []).sort((a, b) => {
      const aIsExtintor = isRealExtintor(a);
      const bIsExtintor = isRealExtintor(b);

      // Se um é extintor e o outro não, extintor vem primeiro
      if (aIsExtintor && !bIsExtintor) return -1;
      if (!aIsExtintor && bIsExtintor) return 1;

      // Se ambos são do mesmo tipo (ambos extintores ou ambos não-extintores), ordena alfabeticamente
      return a.name.localeCompare(b.name, "pt-BR");
    });

    setProducts(sortedProducts);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price,
      in_stock: product.in_stock,
      description: "",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || null);
    setSelectedImage(null);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: "" });
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${productName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o produto.",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso.",
      });
      fetchProducts();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsUploading(true);
    let imageUrl = formData.image_url;

    // Upload image if a new one was selected
    if (selectedImage) {
      const fileExt = selectedImage.name.split(".").pop() || "png";
      const fileName = `${editingProduct.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, selectedImage, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: uploadError.message || "Não foi possível fazer upload da imagem. Verifique se o bucket 'products' existe no Supabase.",
        });
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: formData.name,
        type: formData.type,
        price: formData.price,
        in_stock: formData.in_stock,
        image_url: imageUrl || null,
      })
      .eq("id", editingProduct.id);

    setIsUploading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso.",
      });
      fetchProducts();
      closeEditDialog();
    }
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

    // Lógica para os novos dropdowns de subcategorias
    const groupTypes = getTypesForCategory(selectedCategory);
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

                {/* Dropdown Equipamentos & Combate */}
                <Select
                  onValueChange={setSelectedCategory}
                  value={selectedCategory.startsWith("equipamentos-") ? selectedCategory : undefined}
                >
                  <SelectTrigger className={`h-9 w-[180px] ${selectedCategory.startsWith("equipamentos-") ? "bg-primary text-primary-foreground" : ""}`}>
                    <SelectValue placeholder="Equipamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SUBCATEGORIES["equipamentos"].map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Dropdown Sinalização & Luz */}
                <Select
                  onValueChange={setSelectedCategory}
                  value={selectedCategory.startsWith("sinalizacao-") ? selectedCategory : undefined}
                >
                  <SelectTrigger className={`h-9 w-[180px] ${selectedCategory.startsWith("sinalizacao-") ? "bg-primary text-primary-foreground" : ""}`}>
                    <SelectValue placeholder="Sinalização" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SUBCATEGORIES["sinalizacao"].map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Dropdown Peças & Acessórios */}
                <Select
                  onValueChange={setSelectedCategory}
                  value={selectedCategory.startsWith("pecas-") ? selectedCategory : undefined}
                >
                  <SelectTrigger className={`h-9 w-[180px] ${selectedCategory.startsWith("pecas-") ? "bg-primary text-primary-foreground" : ""}`}>
                    <SelectValue placeholder="Peças" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SUBCATEGORIES["pecas"].map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <CartDrawer />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container">
            {(() => {
              // Função para verificar se é extintor real: tipo "Extintor" E nome começa com "Extintor"
              const isExtintor = (product: Product) => {
                const typeIsExtintor = product.type?.toLowerCase() === "extintor";
                const nameStartsWithExtintor = product.name?.toLowerCase().startsWith("extintor");
                return typeIsExtintor && nameStartsWithExtintor;
              };

              // Separar produtos em extintores e outros
              const extintores = filteredProducts.filter(isExtintor);
              const outrosProdutos = filteredProducts.filter(p => !isExtintor(p));

              return (
                <>
                  {/* Extintores */}
                  {extintores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {extintores.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          type={product.type}
                          price={product.price}
                          inStock={product.in_stock}
                          image={product.image_url ?? getProductImage(product)}
                          onAddToQuote={() => handleAddToCart(product)}
                          onEdit={isAdmin ? () => openEditDialog(product) : undefined}
                          onDelete={isAdmin ? () => handleDeleteProduct(product.id, product.name) : undefined}
                        />
                      ))}
                    </div>
                  )}

                  {/* Separador - Mais Produtos */}
                  {extintores.length > 0 && outrosProdutos.length > 0 && (
                    <div className="my-12 flex items-center gap-4">
                      <div className="flex-1 h-px bg-border"></div>
                      <h2 className="text-2xl font-semibold text-muted-foreground">Mais Produtos</h2>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}

                  {/* Outros Produtos */}
                  {outrosProdutos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {outrosProdutos.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          type={product.type}
                          price={product.price}
                          inStock={product.in_stock}
                          image={product.image_url ?? getProductImage(product)}
                          onAddToQuote={() => handleAddToCart(product)}
                          onEdit={isAdmin ? () => openEditDialog(product) : undefined}
                          onDelete={isAdmin ? () => handleDeleteProduct(product.id, product.name) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize os dados do produto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4" onPaste={handlePaste}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo *</Label>
              <Input
                id="edit-type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
              <Label htmlFor="edit-in_stock">Em Estoque</Label>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para adicionar imagem
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      ou cole uma imagem (Ctrl+V)
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isUploading}>
                {isUploading ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isUploading}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;
