import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./clearCache"; // Limpa cache antigo automaticamente

// Service Worker DISABLED - Causing issues with Supabase requests
// Unregister any existing service workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log("🗑️ Service Worker unregistered:", registration);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
