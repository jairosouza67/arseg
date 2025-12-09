/**
 * Date formatting utilities
 */

/**
 * Formats a date string to Brazilian Portuguese format
 * @param dateString - ISO date string
 * @returns Formatted date string (DD/MM/YYYY HH:mm)
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a date string to Brazilian Portuguese format (date only)
 * @param dateString - ISO date string
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDateOnly = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
