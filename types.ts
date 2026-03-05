
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
}

export enum EntityType {
  VENDOR = 'vendor',
  CUSTOMER = 'customer'
}

export interface Contact {
  id: string;
  name: string;
  type: EntityType;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Transaction {
  id: string;
  name: string;
  particular: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
}

export interface DashboardStats {
  totalIn: number;
  totalOut: number;
  balance: number;
  monthlyData: MonthlyReport[];
}

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export interface CompanyProfile {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  taxId?: string;
  logoBase64?: string;
}

export interface AppSettings {
  appearance: 'light' | 'dark';
  appLockPin: string | null;
  isFingerprintEnabled: boolean;
}
