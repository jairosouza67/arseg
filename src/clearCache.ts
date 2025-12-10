/**
 * Script de limpeza de cache antigo
 * Executa uma única vez para limpar caches obsoletos
 */
import { debugLog } from "@/lib/debugUtils";

const CURRENT_VERSION = '2025-12-10-001';
const VERSION_KEY = 'arseg-app-version';

// Verificar se é a primeira vez que carrega esta versão
const storedVersion = localStorage.getItem(VERSION_KEY);

if (storedVersion !== CURRENT_VERSION) {
  debugLog('🧹 Nova versão detectada, limpando caches antigos...');
  debugLog('Versão anterior:', storedVersion || 'nenhuma');
  debugLog('Versão atual:', CURRENT_VERSION);

  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        debugLog('🗑️ Deletando cache:', name);
        caches.delete(name);
      });
    });
  }

  // Salvar nova versão
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

  debugLog('✅ Limpeza concluída! Versão:', CURRENT_VERSION);
}

// SEMPRE desregistrar service workers (não apenas na mudança de versão)
// Isso garante que SWs problemáticos não persistam
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      registrations.forEach((registration) => {
        debugLog('🗑️ Desregistrando service worker');
        registration.unregister();
      });
    }
  });
}

