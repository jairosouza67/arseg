import { Link } from "react-router-dom";
import { Flame, Mail, Phone, MapPin, Home, Package, FileText, MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-arseg.jpg" alt="Arseg Extintores" className="w-12 h-12 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-primary tracking-tight leading-none">ARSEG</span>
                <span className="text-sm font-medium text-muted-foreground -mt-1">Extintores</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Segurança que protege vidas. Especialistas em equipamentos de combate a incêndio.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Início</span>
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Package className="w-4 h-4" />
                  <span>Produtos</span>
                </Link>
              </li>
              <li>
                <Link to="/orcamentos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Orçamentos</span>
                </Link>
              </li>
              <li>
                <Link to="/contato" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Contato</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-semibold mb-4">Produtos</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-primary/70" />
                <span>Extintores AB</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-primary/70" />
                <span>Extintores ABC</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-primary/70" />
                <span>Água Pressurizada</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-primary/70" />
                <span>CO₂</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>(77) 3017-6264</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>arsegextintores@hotmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Avenida Filipinas, Nº 08<br />Bairro Jurema - Vitória da Conquista</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Arseg. Todos os direitos reservados.</p>
          <p className="mt-2">CNPJ: 63.509.052/0001-08</p>
        </div>
      </div>
    </footer>
  );
};
