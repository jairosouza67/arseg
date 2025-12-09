/**
 * Status badge utilities and component
 */

import React from "react";

export type QuoteStatus = "pending" | "approved" | "rejected";
export type ReminderStatus = "pending" | "sent" | "completed" | "cancelled";

interface StatusConfig {
  label: string;
  className: string;
}

const quoteStatusMap: Record<QuoteStatus, StatusConfig> = {
  pending: { 
    label: "Pendente", 
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200" 
  },
  approved: { 
    label: "Aprovado", 
    className: "bg-green-100 text-green-800 border border-green-200" 
  },
  rejected: { 
    label: "Rejeitado", 
    className: "bg-red-100 text-red-800 border border-red-200" 
  },
};

const reminderStatusMap: Record<ReminderStatus, StatusConfig> = {
  pending: { 
    label: "Pendente", 
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200" 
  },
  sent: { 
    label: "Enviado", 
    className: "bg-blue-100 text-blue-800 border border-blue-200" 
  },
  completed: { 
    label: "Concluído", 
    className: "bg-green-100 text-green-800 border border-green-200" 
  },
  cancelled: { 
    label: "Cancelado", 
    className: "bg-gray-100 text-gray-800 border border-gray-200" 
  },
};

/**
 * Returns a status badge component for quotes
 */
export const getQuoteStatusBadge = (status: string) => {
  const statusInfo = quoteStatusMap[status as QuoteStatus] || { 
    label: status, 
    className: "bg-muted text-foreground" 
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
};

/**
 * Returns a status badge component for reminders
 */
export const getReminderStatusBadge = (status: string) => {
  const statusInfo = reminderStatusMap[status as ReminderStatus] || { 
    label: status, 
    className: "bg-muted text-foreground" 
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
};

/**
 * Generic status badge component
 */
interface StatusBadgeProps {
  status: string;
  type: "quote" | "reminder";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  if (type === "quote") {
    return getQuoteStatusBadge(status);
  }
  return getReminderStatusBadge(status);
};
