import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuthRole } from "@/hooks/useAuthRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { role, isAuthenticated } = useAuthRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/");
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "seller") return "/vendedor";
    return "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative flex h-16 items-center justify-between">
        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo-arseg.jpg" alt="Arseg Extintores" className="w-28 h-28 object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-secondary transition-colors">
            Início
          </Link>
          <Link to="/produtos" className="text-sm font-medium hover:text-secondary transition-colors">
            Produtos
          </Link>
          <Link to="/orcamentos" className="text-sm font-medium hover:text-secondary transition-colors">
            Orçamentos
          </Link>
          <Link to="/contato" className="text-sm font-medium hover:text-secondary transition-colors">
            Contato
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to={getDashboardPath()}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="hero" className="hidden md:flex">
              <Link to="/login">Área Restrita</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navegação do site</SheetDescription>
              </SheetHeader>
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
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={getDashboardPath()}>Dashboard</Link>
                      </Button>
                      <Button variant="destructive" className="w-full mt-2" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="hero" className="w-full">
                      <Link to="/login">Área Restrita</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
