import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Download } from "lucide-react";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  in_stock: boolean;
  description: string | null;
  created_at: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: 0,
    in_stock: true,
    description: "",
  });

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
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", editingProduct.id);

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
        closeDialog();
      }
    } else {
      const { error } = await supabase.from("products").insert([formData]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível adicionar o produto.",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso.",
        });
        fetchProducts();
        closeDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

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

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        type: product.type,
        price: product.price,
        in_stock: product.in_stock,
        description: product.description || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        type: "",
        price: 0,
        in_stock: true,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const bulkImportFireExtinguishers = async () => {
    if (!confirm('Deseja adicionar todos os extintores de incêndio ao catálogo? Esta operação adicionará 27 produtos.')) return;

    const fireExtinguishers = [
      // Extintores Veiculares Pó ABC
      { name: 'Extintor Veicular Pó ABC 1kg', type: 'Pó ABC', description: 'Extintor veicular portátil de pó químico ABC 1kg', in_stock: true, price: 0 },
      { name: 'Extintor Veicular Pó ABC 2kg', type: 'Pó ABC', description: 'Extintor veicular portátil de pó químico ABC 2kg', in_stock: true, price: 0 },
      // Extintores de Pó BC
      { name: 'Extintor de Pó BC 4kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 4kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC 6kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 6kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC 8kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 8kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC 10kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 10kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC 12kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 12kg', in_stock: true, price: 0 },
      // Extintores de Pó BC Carreta
      { name: 'Extintor de Pó BC Carreta 20kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 20kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC Carreta 30kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 30kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó BC Carreta 50kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 50kg', in_stock: true, price: 0 },
      // Extintores de Pó ABC
      { name: 'Extintor de Pó ABC 4kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 4kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC 6kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 6kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC 8kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 8kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC 10kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 10kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC 12kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 12kg', in_stock: true, price: 0 },
      // Extintores de Pó ABC Carreta
      { name: 'Extintor de Pó ABC Carreta 20kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 20kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC Carreta 30kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 30kg', in_stock: true, price: 0 },
      { name: 'Extintor de Pó ABC Carreta 50kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 50kg', in_stock: true, price: 0 },
      // Extintores CO2
      { name: 'Extintor CO2 4kg', type: 'CO₂', description: 'Extintor portátil de dióxido de carbono 4kg', in_stock: true, price: 0 },
      { name: 'Extintor CO2 6kg', type: 'CO₂', description: 'Extintor portátil de dióxido de carbono 6kg', in_stock: true, price: 0 },
      // Extintores CO2 Carreta
      { name: 'Extintor CO2 Carreta 10kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 10kg', in_stock: true, price: 0 },
      { name: 'Extintor CO2 Carreta 20kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 20kg', in_stock: true, price: 0 },
      { name: 'Extintor CO2 Carreta 30kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 30kg', in_stock: true, price: 0 },
      { name: 'Extintor CO2 Carreta 40kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 40kg', in_stock: true, price: 0 },
      { name: 'Extintor CO2 Carreta 50kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 50kg', in_stock: true, price: 0 },
    ];

    const { error } = await supabase.from('products').insert(fireExtinguishers);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível importar os produtos. Verifique se já existem produtos com os mesmos nomes.',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: '27 produtos de extintores foram adicionados ao catálogo.',
      });
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={bulkImportFireExtinguishers}>
              <Download className="mr-2 h-4 w-4" />
              Importar Extintores
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do produto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Input
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label htmlFor="in_stock">Em Estoque</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Salvar</Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>Preço a combinar</TableCell>
                    <TableCell>
                      {product.in_stock ? (
                        <span className="text-green-600">Em estoque</span>
                      ) : (
                        <span className="text-red-600">Indisponível</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum produto cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
