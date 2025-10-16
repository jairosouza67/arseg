import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuoteItem {
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface QuoteData {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  items: QuoteItem[];
  total_value: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export const generateQuotePDF = (quote: QuoteData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ORÇAMENTO", 105, 20, { align: "center" });
  
  // Quote Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Número: ${quote.id.substring(0, 8).toUpperCase()}`, 14, 35);
  doc.text(`Data: ${new Date(quote.created_at).toLocaleDateString("pt-BR")}`, 14, 41);
  
  // Status
  const statusMap: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  doc.text(`Status: ${statusMap[quote.status] || quote.status}`, 14, 47);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 14, 60);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${quote.customer_name}`, 14, 68);
  if (quote.customer_email) {
    doc.text(`Email: ${quote.customer_email}`, 14, 74);
  }
  doc.text(`Telefone: ${quote.customer_phone}`, 14, 80);
  
  // Items Table
  const tableData = quote.items.map((item) => [
    item.product_name,
    item.product_type,
    item.quantity.toString(),
    `R$ ${item.unit_price.toFixed(2)}`,
    `R$ ${item.total_price.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    startY: 90,
    head: [["Produto", "Tipo", "Qtd", "Preço Unit.", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `VALOR TOTAL: R$ ${quote.total_value.toFixed(2)}`,
    196,
    finalY + 10,
    { align: "right" }
  );
  
  // Notes
  if (quote.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 14, finalY + 25);
    
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, finalY + 32);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento é apenas um orçamento e não representa uma nota fiscal.", 105, pageHeight - 15, { align: "center" });
  
  // Save
  const fileName = `orcamento_${quote.customer_name.replace(/\s+/g, "_")}_${quote.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};
