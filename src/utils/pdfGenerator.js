import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate a PDF summary of delivery orders.
 * @param {Array} orders - List of orders to include.
 * @param {Object} savings - Object with totalFuelSaved and totalCO2Saved.
 */
export const generatePDFReport = (orders = [], savings = {}) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Delivery Summary Report", 14, 20);

  // Date and Metrics
  doc.setFontSize(12);
  doc.text("Date: " + new Date().toLocaleDateString(), 14, 30);
  doc.text("Total Orders: " + orders.length, 14, 38);
  doc.text("Fuel Saved: ₹" + (savings.totalFuelSaved || 0), 14, 46);
  doc.text("CO2 Saved: " + (savings.totalCO2Saved || 0) + " kg", 14, 54);

  // Table Content
  const tableData = orders.map(order => [
    order.id,
    order.customerName,
    order.zone,
    order.estimatedDelay + " min",
    order.distance + " km",
    order.riskScore,
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["ID", "Customer", "Zone", "ETA", "Distance", "Risk"]],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [52, 58, 64] }, // Dark gray
  });

  // Save the file
  doc.save("Delivery_Summary_Report.pdf");
};