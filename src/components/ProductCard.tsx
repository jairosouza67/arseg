import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  type: string;
  price: number;
  image?: string;
  inStock: boolean;
  onAddToQuote?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProductCard = ({
  id,
  name,
  type,
  price,
  image,
  inStock,
  onAddToQuote,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden hover:shadow-elegant hover:border-primary/30 transition-all duration-300 animate-fade-in border-primary/10 flex flex-col h-full">
      <CardHeader
        className="p-0 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/produtos/${id}`)}
      >
        <div className="relative h-56 bg-white overflow-hidden p-6">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-muted/50">
              <span className="text-7xl opacity-30">🧯</span>
            </div>
          )}
          <Badge
            variant={inStock ? "default" : "secondary"}
            className="absolute top-4 right-4 shadow-md"
          >
            {inStock ? "Em Estoque" : "Sob Consulta"}
          </Badge>
          {(onEdit || onDelete) && (
            <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="shadow-md h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="shadow-md h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent
        className="pt-6 space-y-3 cursor-pointer flex-1"
        onClick={() => navigate(`/produtos/${id}`)}
      >
        <Badge variant="outline" className="mb-1">
          {type}
        </Badge>
        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
        <p className="text-sm text-muted-foreground font-medium">
          Sob Consulta
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToQuote?.();
          }}
          className="w-full group-hover:shadow-elegant group-hover:shadow-primary/20 transition-all"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao Orçamento
        </Button>
      </CardFooter>
    </Card>
  );
};
