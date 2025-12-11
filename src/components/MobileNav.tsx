import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, FileText, MessageSquare, LayoutDashboard, Users, Building2, UserCog, Bell, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthRole } from "@/hooks/useAuthRole";

// Itens de navegação pública
const publicNavItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
];

// Itens principais do dashboard admin (4 itens)
const adminMainNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
];

// Itens secundários do dashboard admin (dropdown)
const adminMoreNavItems = [
  { href: "/admin/fornecedores", label: "Fornecedores", icon: Building2 },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { href: "/admin/lembretes", label: "Lembretes", icon: Bell },
];

// Itens do dashboard vendedor
const sellerNavItems = [
  { href: "/vendedor", label: "Dashboard", icon: Home },
  { href: "/vendedor/produtos", label: "Produtos", icon: Package },
  { href: "/vendedor/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/vendedor/lembretes", label: "Lembretes", icon: Bell },
];

export const MobileNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuthRole();
  const [showMore, setShowMore] = useState(false);

  // Detectar se está no dashboard
  const isInAdminDashboard = location.pathname.startsWith("/admin");
  const isInSellerDashboard = location.pathname.startsWith("/vendedor");

  // Escolher os itens de navegação baseado no contexto
  let navItems;
  let moreItems: typeof adminMoreNavItems = [];

  if (isInAdminDashboard) {
    navItems = adminMainNavItems;
    moreItems = adminMoreNavItems;
  } else if (isInSellerDashboard) {
    navItems = sellerNavItems;
  } else {
    navItems = [
      ...publicNavItems,
      isAdmin
        ? { href: "/admin", label: "Dashboard", icon: LayoutDashboard }
        : { href: "/contato", label: "Contato", icon: MessageSquare },
    ];
  }

  // Verificar se algum item do "mais" está ativo
  const isMoreItemActive = moreItems.some(item => location.pathname === item.href);

  return (
    <>
      {/* Dropdown do "Mais" */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-background border-t rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-sm">Mais opções</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Barra de navegação principal */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="container flex justify-around h-16 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-full",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}

          {/* Botão "Mais" apenas no admin */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-full",
                isMoreItemActive || showMore ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
