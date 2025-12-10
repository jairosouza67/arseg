import { Link, useLocation } from "react-router-dom";
import { Home, Users, Building2, FileText, Package, UserCog, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Clientes",
    url: "/admin/clientes",
    icon: Users,
  },
  {
    title: "Fornecedores",
    url: "/admin/fornecedores",
    icon: Building2,
  },
  {
    title: "Orçamentos",
    url: "/admin/orcamentos",
    icon: FileText,
  },
  {
    title: "Produtos",
    url: "/admin/produtos",
    icon: Package,
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: UserCog,
  },
  {
    title: "Lembretes",
    url: "/admin/lembretes",
    icon: Bell,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="text-lg font-semibold">Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
