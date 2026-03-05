import React from 'react';
import { Transaction, TransactionType, User, UserRole, Contact, EntityType, Currency, CompanyProfile } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];
export const LOGO_URL = 'https://raw.githubusercontent.com/connectcloudonetech-hash/stock_management/809cc7da968c577cae0d110a9dc8c278ed65a2ae/image/sr_logo.svg';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'SR INFOTECH',
  address: '123 Business Avenue, Tech Park, Bangalore, India',
  phone: '+91 98765 43210',
  email: 'contact@srinfotech.com',
  logoUrl: LOGO_URL,
  taxId: '27AAACR1234A1Z1'
};

export const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'SR Admin', role: UserRole.ADMIN, password: 'password123' },
  { id: 'u2', username: 'staff', name: 'SR Staff', role: UserRole.STAFF, password: 'password123' },
  { id: 'u3', username: 'srfareed', name: 'SR Fareed', role: UserRole.ADMIN, password: 'Limras@786' }
];

export const NAMES: string[] = [
  'SR INFOTECH',
  'Self Account'
];

export const PARTICULARS: string[] = [
  'CARRY IN',
  'CARRY OUT',
  'Inventory Purchase',
  'Client Payment',
  'Office Rent',
  'Electricity Bill',
  'Salary Payout',
  'Miscellaneous',
  'Conveyance'
];

export const CATEGORIES = PARTICULARS;

export const MOCK_CONTACTS: Contact[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const LOGO_SVG = (className?: string) => (
  <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Crown */}
    <path d="M110 130 L130 70 L200 110 L270 70 L290 130 Z" fill="#E31E24" />
    <circle cx="110" cy="130" r="10" fill="#E31E24" />
    <circle cx="130" cy="70" r="10" fill="#E31E24" />
    <circle cx="200" cy="40" r="12" fill="#E31E24" />
    <path d="M200 40 L200 110" stroke="#E31E24" strokeWidth="4" />
    <circle cx="270" cy="70" r="10" fill="#E31E24" />
    <circle cx="290" cy="130" r="10" fill="#E31E24" />
    
    {/* Shield Base / "S" (Left Red Part) */}
    <path d="M200 160 L100 160 L100 350 L200 480 V160 Z" fill="#E31E24" />
    <path d="M125 220 H175 V250 H125 V320 H175 V350 H100 L100 320 H150 V280 H100 V220 H125 Z" fill="white" fillOpacity="0.1" />
    
    {/* Shield Base / "R" (Right Black Part) */}
    <path d="M200 160 H300 V350 L200 480 V160 Z" fill="#1A1A1A" />
    
    {/* Letter S Stylized Cutouts */}
    <path d="M125 210 H175 V240 L125 240 V290 H175 V320 H125 V360 H100 V320 H150 V270 H100 V210 H125 Z" fill="#F8F9FA" />
    
    {/* Letter R Stylized Cutouts */}
    <path d="M225 210 H275 V280 H250 L275 360 H245 L225 290 V360 H200 V210 H225 Z M225 240 V260 H250 V240 H225 Z" fill="#F8F9FA" />
  </svg>
);
