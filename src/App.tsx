import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CartProvider } from "@/contexts/CartContext.tsx";
import AppRouter from "@/router/AppRouter.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <AppRouter />
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
