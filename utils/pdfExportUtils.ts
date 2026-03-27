import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, CompanyProfile } from '../types';

interface PDFExportOptions {
  title: string;
  period: string;
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
  currencyCode: string;
  companyProfile: CompanyProfile;
}

export const generateFinancialPDF = (transactions: Transaction[], options: PDFExportOptions) => {
  const doc = new jsPDF();
  const { title, period, stats, currencyCode, companyProfile } = options;

  // Header Section
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(0, 0, 210, 45, 'F');
  
  // Left Side: Company Branding
  doc.setTextColor(227, 30, 36); // SR Red
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyProfile.name.toUpperCase(), 15, 25);

  // Right Side: Document Title
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT OF ACCOUNT', 195, 20, { align: 'right' });
  
  doc.setTextColor(227, 30, 36);
  doc.setFontSize(10);
  doc.text(period.toUpperCase(), 195, 26, { align: 'right' });
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Type: ${title}`, 195, 31, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 35, { align: 'right' });

  // Account Summary Box (Bank Style)
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 55, 180, 25, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CREDITS (IN)', 25, 63);
  doc.text('TOTAL DEBITS (OUT)', 85, 63);
  doc.text('NET PERIOD BALANCE', 145, 63);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald 600
  doc.text(`${currencyCode} ${(stats.income / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })}`, 25, 72);
  
  doc.setTextColor(227, 30, 36); // SR Red
  doc.text(`${currencyCode} ${(stats.expense / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })}`, 85, 72);
  
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`${currencyCode} ${(stats.balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })}`, 145, 72);

  // 1. Main Transaction Table
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const tableData = sortedTransactions.map(t => [
    t.date,
    t.name,
    t.particular,
    t.description || '',
    t.type === TransactionType.INCOME ? (t.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : '',
    t.type === TransactionType.EXPENSE ? (t.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : ''
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['DATE', 'ENTITY', 'CATEGORY', 'NOTES', 'CREDIT (IN)', 'DEBIT (OUT)']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255], 
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 3
    },
    bodyStyles: { 
      fontSize: 7, 
      textColor: [51, 65, 85], // Slate 700
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22, halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold' },
      5: { cellWidth: 22, halign: 'right', textColor: [227, 30, 36], fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    margin: { left: 15, right: 15 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for summaries
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 2. Category Wise Summary Table
  const categorySummaryMap: Record<string, { income: number, expense: number }> = {};
  transactions.forEach(t => {
    const cat = t.particular || 'Uncategorized';
    if (!categorySummaryMap[cat]) {
      categorySummaryMap[cat] = { income: 0, expense: 0 };
    }
    if (t.type === TransactionType.INCOME) {
      categorySummaryMap[cat].income += t.amount;
    } else {
      categorySummaryMap[cat].expense += t.amount;
    }
  });

  const categoryTableData = Object.entries(categorySummaryMap).map(([cat, data]) => [
    cat,
    data.income > 0 ? (data.income / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : '',
    data.expense > 0 ? (data.expense / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : '',
    ((data.income - data.expense) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
  ]);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CATEGORY WISE SUMMARY', 15, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['CATEGORY', 'TOTAL CREDIT (IN)', 'TOTAL DEBIT (OUT)', 'NET BALANCE']],
    body: categoryTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [71, 85, 105], // Slate 600
      textColor: [255, 255, 255], 
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', textColor: [16, 185, 129] },
      2: { halign: 'right', textColor: [227, 30, 36] },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 15, right: 15 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for entity summary
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 3. Entity Wise Summary Table
  const entitySummaryMap: Record<string, { income: number, expense: number }> = {};
  transactions.forEach(t => {
    if (!entitySummaryMap[t.name]) {
      entitySummaryMap[t.name] = { income: 0, expense: 0 };
    }
    if (t.type === TransactionType.INCOME) {
      entitySummaryMap[t.name].income += t.amount;
    } else {
      entitySummaryMap[t.name].expense += t.amount;
    }
  });

  const entityTableData = Object.entries(entitySummaryMap).map(([name, data]) => [
    name,
    data.income > 0 ? (data.income / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : '',
    data.expense > 0 ? (data.expense / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : '',
    ((data.income - data.expense) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
  ]);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTITY WISE SUMMARY', 15, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['ENTITY NAME', 'TOTAL CREDIT (IN)', 'TOTAL DEBIT (OUT)', 'NET BALANCE']],
    body: entityTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [71, 85, 105], // Slate 600
      textColor: [255, 255, 255], 
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', textColor: [16, 185, 129] },
      2: { halign: 'right', textColor: [227, 30, 36] },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 15, right: 15 }
  });

  doc.save(`SR_Statement_${period.replace(/ /g, '_')}.pdf`);
};
