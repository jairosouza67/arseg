import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Download, Package, Upload, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  in_stock: boolean;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    let imageUrl = formData.image_url;

    // If we are creating a new product and the user selected an image,
    // we need an id first (to name the file consistently) then upload and update.
    if (!editingProduct) {
      const { data: insertedProduct, error: insertError } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            type: formData.type,
            price: formData.price,
            in_stock: formData.in_stock,
            description: formData.description,
            image_url: selectedImage ? null : (imageUrl || null),
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível adicionar o produto.",
        });
        return;
      }

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop() || "png";
        const fileName = `${insertedProduct.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, selectedImage, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setIsUploading(false);
          toast({
            variant: "destructive",
            title: "Erro no upload",
            description:
              uploadError.message ||
              "Não foi possível fazer upload da imagem. Verifique se o bucket 'products' existe no Supabase.",
          });
          return;
        }

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: imageUrl || null })
          .eq("id", insertedProduct.id);

        if (updateError) {
          setIsUploading(false);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Produto criado, mas não foi possível salvar a imagem.",
          });
          return;
        }
      }

      setIsUploading(false);
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso.",
      });
      fetchProducts();
      closeDialog();
      return;
    }

    if (editingProduct) {
      // Upload image if a new one was selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop() || "png";
        const fileName = `${editingProduct.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, selectedImage, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setIsUploading(false);
          toast({
            variant: "destructive",
            title: "Erro no upload",
            description:
              uploadError.message ||
              "Não foi possível fazer upload da imagem. Verifique se o bucket 'products' existe no Supabase.",
          });
          return;
        }

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          type: formData.type,
          price: formData.price,
          in_stock: formData.in_stock,
          description: formData.description,
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
        image_url: product.image_url || "",
      });
      setImagePreview(product.image_url || null);
      setSelectedImage(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        type: "",
        price: 0,
        in_stock: true,
        description: "",
        image_url: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
    setIsUploading(false);
  };

  const bulkImportFireExtinguishers = async () => {
    if (!confirm('Deseja adicionar todos os extintores de incêndio ao catálogo? Esta operação adicionará 27 produtos.')) return;

    const fireExtinguishers = [
      // Extintores Veiculares Pó ABC
      { name: 'Extintor Veicular Pó ABC 1kg', type: 'Pó ABC', description: 'Extintor veicular portátil de pó químico ABC 1kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor Veicular Pó ABC 2kg', type: 'Pó ABC', description: 'Extintor veicular portátil de pó químico ABC 2kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      // Extintores de Pó BC
      { name: 'Extintor de Pó BC 4kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 4kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC 6kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 6kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC 8kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 8kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC 10kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 10kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC 12kg', type: 'Pó BC', description: 'Extintor portátil de pó químico BC 12kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      // Extintores de Pó BC Carreta
      { name: 'Extintor de Pó BC Carreta 20kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 20kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC Carreta 30kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 30kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      { name: 'Extintor de Pó BC Carreta 50kg', type: 'Pó BC', description: 'Extintor sobre rodas de pó químico BC 50kg', in_stock: true, price: 0, image_url: '/products/extintor-bc.png' },
      // Extintores de Pó ABC
      { name: 'Extintor de Pó ABC 4kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 4kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC 6kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 6kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC 8kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 8kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC 10kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 10kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC 12kg', type: 'Pó ABC', description: 'Extintor portátil de pó químico ABC 12kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      // Extintores de Pó ABC Carreta
      { name: 'Extintor de Pó ABC Carreta 20kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 20kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC Carreta 30kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 30kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      { name: 'Extintor de Pó ABC Carreta 50kg', type: 'Pó ABC', description: 'Extintor sobre rodas de pó químico ABC 50kg', in_stock: true, price: 0, image_url: '/products/extintor-abc.png' },
      // Extintores CO2
      { name: 'Extintor CO2 4kg', type: 'CO₂', description: 'Extintor portátil de dióxido de carbono 4kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      { name: 'Extintor CO2 6kg', type: 'CO₂', description: 'Extintor portátil de dióxido de carbono 6kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      // Extintores CO2 Carreta
      { name: 'Extintor CO2 Carreta 10kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 10kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      { name: 'Extintor CO2 Carreta 20kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 20kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      { name: 'Extintor CO2 Carreta 30kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 30kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      { name: 'Extintor CO2 Carreta 40kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 40kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
      { name: 'Extintor CO2 Carreta 50kg', type: 'CO₂', description: 'Extintor sobre rodas de dióxido de carbono 50kg', in_stock: true, price: 0, image_url: '/products/extintor-co2.png' },
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
    <>
      {/* Header responsivo */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={bulkImportFireExtinguishers} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Importar Extintores</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) closeDialog();
              else setIsDialogOpen(true);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openDialog()} className="w-full sm:w-auto">
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
              <form onSubmit={handleSubmit} className="space-y-4" onPaste={handlePaste}>
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

                {/* Image Upload Section (igual à aba Produtos) */}
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
                        disabled={isUploading}
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
                        id={editingProduct ? "edit-image-upload" : "new-image-upload"}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={editingProduct ? "edit-image-upload" : "new-image-upload"}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Clique para adicionar imagem</span>
                        <span className="text-xs text-muted-foreground mt-1">ou cole uma imagem (Ctrl+V)</span>
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isUploading}>
                    {isUploading ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog} disabled={isUploading}>
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
          <CardTitle className="text-lg sm:text-xl">Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Versão Mobile - Cards */}
          <div className="block md:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preço a combinar</span>
                  {product.in_stock ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Em estoque</span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Indisponível</span>
                  )}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum produto cadastrado</p>
              </div>
            )}
          </div>

          {/* Versão Desktop - Tabela */}
          <div className="hidden md:block overflow-x-auto">
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Products;
