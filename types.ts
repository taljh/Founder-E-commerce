
export type ViewState = 'HOME' | 'ORDERS' | 'FINANCE' | 'COSTS' | 'PRODUCTS' | 'REPORTS' | 'CEO';

export enum OrderStatus {
  COMPLETED = 'مكتمل',
  RETURNED = 'مرتجع',
  PENDING = 'قيد الانتظار',
  SHIPPED = 'تم الشحن'
}

export type PaymentMethod = 'MADA' | 'VISA' | 'APPLE_PAY' | 'TABBY' | 'TAMARA' | 'COD';
export type ShippingCarrier = 'ARAMEX' | 'SMSA' | 'SPL' | 'DHL' | 'OWN_DELIVERY';

// FINANCIAL TYPES
export interface CashFlowEntry {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  amount: number;
  date: string;
  status: 'SETTLED' | 'PENDING'; // Received in bank or stuck with Courier/Tabby
  description: string;
}

export interface PnLStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  
  // Operating Breakdown
  operatingExpenses: number; // Total Operating
  shippingCost: number;
  paymentFees: number;
  packagingCost: number;

  marketingExpenses: number;
  fixedExpenses: number; // Salaries, Rent, Manual Fixed
  netProfit: number;
  period: string;
}

export interface Order {
  id: string;
  amount: number;
  date: string;
  timestamp: number;
  status: OrderStatus;
  customerName: string;
  paymentMethod: PaymentMethod;
  shippingCarrier: ShippingCarrier;
  items: { productId: string; quantity: number }[];
  
  // ERP Fields
  isSettled: boolean; // Has the money hit the bank?
  settlementDate?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  cost: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  category: string;
}

// PACKAGING & INVENTORY
export interface PackagingMaterial {
  id: string;
  name: string;
  costPerUnit: number; // User defined cost per piece
}

export interface PackagingTemplate {
  id: string;
  name: string;
  items: { materialId: string; quantity: number }[];
}

// INVOICES
export interface SallaInvoice {
  id: string;
  fileName: string;
  date: string;
  amount: number;
  breakdown: {
    subscription: number;
    fees: number;
    tax: number;
  };
}

// ECONOMICS
export interface OrderEconomics {
  revenue: number;
  cogs: number;
  paymentFee: number;
  shippingCost: number;
  packagingCost: number;
  packagingDetails: string[];
  netProfit: number;
}

// CONFIG TYPES
export interface PaymentRule {
  method: PaymentMethod;
  name: string;
  percentFee: number;
  fixedFee: number;
  settlementDays: number; // e.g., Tabby takes 7 days, COD takes 14 days
}

export interface ShippingRule {
  carrier: ShippingCarrier;
  name: string;
  cost: number;
}

export interface FixedCost {
  id: number;
  name: string;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  active: boolean;
  category: 'SALARIES' | 'RENT' | 'SOFTWARE' | 'OTHER';
  source?: 'SALLA_INVOICE' | 'MANUAL';
}

export interface ExpenseTransaction {
  id: string;
  amount: number;
  type: 'OPERATING' | 'FIXED' | 'ASSET';
  description: string;
  date: string;
  timestamp: number;
}

export interface AdSpend {
  id: number;
  platform: 'SNAPCHAT' | 'TIKTOK' | 'INSTAGRAM' | 'GOOGLE';
  amount: number;
  date: string;
  timestamp: number;
  type?: 'TOPUP' | 'INVOICE';
  roas?: number; // Return on Ad Spend
}

export type TimeFilter = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
