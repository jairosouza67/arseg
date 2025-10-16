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
    <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 animate-fade-in">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-card overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-6xl">🧯</span>
            </div>
          )}
          <Badge
            variant={inStock ? "default" : "secondary"}
            className="absolute top-3 right-3"
          >
            {inStock ? "Em Estoque" : "Sob Consulta"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-2">
        <Badge variant="outline" className="mb-2">
          {type}
        </Badge>
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-base text-muted-foreground font-medium">
          Sob Consulta
        </p>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={onAddToQuote}
          variant="default"
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao Orçamento
        </Button>
      </CardFooter>
    </Card>
  );
};
