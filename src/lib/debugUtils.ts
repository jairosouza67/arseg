/**
 * Debug logging utilities
 * Logs only execute in development mode
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Conditional console.log that only runs in development
 */
export const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Conditional console.warn that only runs in development
 */
export const debugWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Conditional console.error (always runs, but with dev context)
 */
export const debugError = (...args: any[]) => {
  console.error(...args);
};

/**
 * Group logs (dev only)
 */
export const debugGroup = (label: string, callback: () => void) => {
  if (isDevelopment) {
    console.group(label);
    callback();
    console.groupEnd();
  }
};
