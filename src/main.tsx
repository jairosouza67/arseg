import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./clearCache"; // Limpa cache antigo automaticamente

// Register service worker for PWA with auto-update
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration);

        // Verificar por atualizações a cada 30 segundos
        setInterval(() => {
          registration.update();
        }, 30000);

        // Quando houver atualização disponível
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("🔄 Nova versão disponível! Recarregando...");
                // Forçar ativação do novo service worker
                newWorker.postMessage({ type: "SKIP_WAITING" });
                // Recarregar página após 500ms
                setTimeout(() => window.location.reload(), 500);
              }
            });
          }
        });

        // Detectar quando service worker assume controle
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("🔄 Service Worker atualizado, recarregando página...");
          window.location.reload();
        });
      })
      .catch((error) => {
        console.log("⚠️ Service Worker registration failed:", error);
        // App continua funcionando mesmo sem SW
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
