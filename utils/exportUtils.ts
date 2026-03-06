
import { Transaction, TransactionType } from '../types';
import * as XLSX from 'xlsx';

export const downloadTransactionsAsExcel = (transactions: Transaction[], currencyCode: string = 'INR', companyName: string = 'SR INFOTECH') => {
  if (transactions.length === 0) return;

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Prepare data for Excel
  const header = [
    [`${companyName.toUpperCase()} - CORPORATE FINANCIAL STATEMENT`],
    ['Generated on:', new Date().toLocaleString()],
    [],
    ['SUMMARY'],
    ['Total Income', totalIncome.toFixed(2)],
    ['Total Expense', totalExpense.toFixed(2)],
    ['Net Balance', netBalance.toFixed(2)],
    [],
    ['TRANSACTION DETAILS'],
    ['Date', 'Entity Name', 'Particular', 'Category', 'Type', `Amount (${currencyCode})`]
  ];

  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const rows = sortedTransactions.map(t => [
    t.date,
    t.name || '-',
    t.particular,
    t.category,
    t.type.toUpperCase(),
    t.amount
  ]);

  const worksheetData = [...header, ...rows];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Add some basic styling/configuration
  const wscols = [
    { wch: 12 }, // Date
    { wch: 25 }, // Entity Name
    { wch: 20 }, // Particular
    { wch: 15 }, // Category
    { wch: 10 }, // Type
    { wch: 15 }, // Amount
  ];
  ws['!cols'] = wscols;

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Financial Statement');

  // Generate and download file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `SR_INFOTECH_Statement_${timestamp}.xlsx`);
};
