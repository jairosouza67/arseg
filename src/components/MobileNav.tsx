import { Link, useLocation } from "react-router-dom";
import { Home, Package, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
];

export const MobileNav = () => {
  const location = useLocation();
  const { isAdmin } = useUserRole();

  const finalNavItems = [
    ...navItems,
    isAdmin
      ? { href: "/admin", label: "Dashboard", icon: LayoutDashboard }
      : { href: "/contato", label: "Contato", icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="container flex justify-around h-16 items-center">
        {finalNavItems.map((item) => {
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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
