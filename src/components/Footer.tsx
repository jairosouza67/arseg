import { Link } from "react-router-dom";
import { Flame, Mail, Phone, MapPin, Home, Package, FileText, MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-16 pb-8 border-t border-slate-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-2 rounded-lg group-hover:bg-gray-100 transition-colors">
                <img src="/logo-arseg.jpg" alt="Arseg Extintores" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white tracking-tight leading-none group-hover:text-primary transition-colors">ARSEG</span>
                <span className="text-xs font-medium text-slate-400 -mt-0.5">Extintores</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Segurança que protege vidas. Especialistas em equipamentos de combate a incêndio com certificação e qualidade.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Início</span>
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                  <Package className="w-4 h-4" />
                  <span>Produtos</span>
                </Link>
              </li>
              <li>
                <Link to="/orcamentos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Orçamentos</span>
                </Link>
              </li>
              <li>
                <Link to="/contato" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Contato</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-semibold text-white mb-6">Produtos</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Flame className="w-4 h-4 text-primary" />
                <span>Extintores AB</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Flame className="w-4 h-4 text-primary" />
                <span>Extintores ABC</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Flame className="w-4 h-4 text-primary" />
                <span>Água Pressurizada</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Flame className="w-4 h-4 text-primary" />
                <span>CO₂</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span>(77) 3017-6264</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span>arsegextintores@hotmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span>Avenida Filipinas, Nº 08<br />Bairro Jurema - Vitória da Conquista</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Arseg. Todos os direitos reservados.</p>
          <p>CNPJ: 63.509.052/0001-08</p>
        </div>
      </div>
    </footer>
  );
};
