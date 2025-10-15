import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-hero">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            SafeFire Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/produtos" className="text-sm font-medium hover:text-primary transition-colors">
            Produtos
          </Link>
          <Link to="/orcamentos" className="text-sm font-medium hover:text-primary transition-colors">
            Orçamentos
          </Link>
          <Link to="/contato" className="text-sm font-medium hover:text-primary transition-colors">
            Contato
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="hero" className="hidden md:flex">
            <Link to="/login">Área Administrativa</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Início
                </Link>
                <Link to="/produtos" className="text-lg font-medium hover:text-primary transition-colors">
                  Produtos
                </Link>
                <Link to="/orcamentos" className="text-lg font-medium hover:text-primary transition-colors">
                  Orçamentos
                </Link>
                <Link to="/contato" className="text-lg font-medium hover:text-primary transition-colors">
                  Contato
                </Link>
                <Button asChild variant="hero" className="w-full mt-4">
                  <Link to="/login">Área Administrativa</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
