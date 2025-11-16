/**
 * Script de limpeza de cache antigo
 * Executa uma única vez para limpar caches obsoletos
 */

const CURRENT_VERSION = '2025-11-15-002';
const VERSION_KEY = 'arseg-app-version';

// Verificar se é a primeira vez que carrega esta versão
const storedVersion = localStorage.getItem(VERSION_KEY);

if (storedVersion !== CURRENT_VERSION) {
  console.log('🧹 Nova versão detectada, limpando caches antigos...');
  console.log('Versão anterior:', storedVersion || 'nenhuma');
  console.log('Versão atual:', CURRENT_VERSION);

  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        console.log('🗑️ Deletando cache:', name);
        caches.delete(name);
      });
    });
  }

  // Desregistrar service workers antigos
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log('🗑️ Desregistrando service worker antigo');
        registration.unregister();
      });
    });
  }

  // Salvar nova versão
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  
  console.log('✅ Limpeza concluída! Versão:', CURRENT_VERSION);
}
