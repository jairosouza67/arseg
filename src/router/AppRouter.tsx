import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Index from "@/pages/Index.tsx";
import Login from "@/pages/Login.tsx";
import Produtos from "@/pages/Produtos.tsx";
import Orcamentos from "@/pages/Orcamentos.tsx";
import Contato from "@/pages/Contato.tsx";
import NotFound from "@/pages/NotFound.tsx";
import { AdminRoute } from "@/components/AdminRoute.tsx";
import { SellerDashboardRoute } from "@/components/SellerDashboardRoute.tsx";
import SellerDashboard from "@/pages/seller/SellerDashboard.tsx";
import SellerQuotes from "@/pages/seller/Quotes.tsx";
import SellerReminders from "@/pages/seller/Reminders.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import AdminProducts from "@/pages/admin/Products.tsx";
import AdminQuotes from "@/pages/admin/Quotes.tsx";
import AdminCustomers from "@/pages/admin/Customers.tsx";
import AdminSuppliers from "@/pages/admin/Suppliers.tsx";
import UsersPage from "@/pages/admin/Users.tsx";
import RenewalReminders from "@/pages/admin/RenewalReminders.tsx";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

const AppRouter = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/contato" element={<Contato />} />

                <Route
          path="/vendedor"
          element={
            <SellerDashboardRoute>
              <SidebarProvider>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6">
                    <Outlet />
                  </main>
                </div>
              </SidebarProvider>
            </SellerDashboardRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="orcamentos" element={<SellerQuotes />} />
          <Route path="lembretes" element={<SellerReminders />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <SidebarProvider>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6">
                    <Outlet />
                  </main>
                </div>
              </SidebarProvider>
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="orcamentos" element={<AdminQuotes />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="fornecedores" element={<AdminSuppliers />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="lembretes" element={<RenewalReminders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
