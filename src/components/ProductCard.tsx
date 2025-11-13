import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  name: string;
  type: string;
  price: number;
  image?: string;
  inStock: boolean;
  onAddToQuote?: () => void;
}

export const ProductCard = ({
  name,
  type,
  price,
  image,
  inStock,
  onAddToQuote,
}: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-elegant hover:border-primary/30 transition-all duration-300 animate-fade-in border-primary/10">
      <CardHeader className="p-0">
        <div className="relative h-56 bg-muted overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-3">
        <Badge variant="outline" className="mb-1">
          {type}
        </Badge>
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sob Consulta
        </p>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button
          onClick={onAddToQuote}
          className="w-full group-hover:shadow-elegant group-hover:shadow-primary/20 transition-all"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao Orçamento
        </Button>
      </CardFooter>
    </Card>
  );
};
