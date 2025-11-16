import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CartProvider } from "@/contexts/CartContext.tsx";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
import { UpdateNotification } from "@/components/UpdateNotification.tsx";
import AppRouter from "@/router/AppRouter.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <UpdateNotification />
          <AppRouter />
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
