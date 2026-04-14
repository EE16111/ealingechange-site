
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  flag_emoji: string;
  is_active: boolean;
  display_order: number;
}

export interface Rate {
  customerBuys: number; // How much foreign currency customer gets for 1 GBP
  customerSells: number; // How much foreign currency customer gives for 1 GBP
}

export interface ExchangeRates {
  [key: string]: Rate;
}

export interface Store {
  store_id: number;
  name: string;
  address: string;
  phone: string;
  map_url: string;
}

export interface SiteSettings {
  [key: string]: string;
}

export interface AppData {
  currencies: Currency[];
  rates: ExchangeRates;
  stores: Store[];
  siteSettings: SiteSettings;
}

export const enum CalculatorMode {
  BUY_FOREIGN = 'BUY_FOREIGN', // Customer buys foreign currency with GBP
  SELL_FOREIGN = 'SELL_FOREIGN', // Customer sells foreign currency for GBP
}

export interface RateAlertData {
  email: string;
  currencyCode: string;
  targetRate: string; // Keep as string for form input
  mode: CalculatorMode;
}

export interface BookingData {
  mode: CalculatorMode;
  name: string;
  email: string;
  phone: string;
  branch: string;
  baseAmount: string;
  quoteAmount: string;
  currencyCode: string;
}

export interface SubscriberData {
  firstName: string;
  lastName: string;
  email: string;
}

// --- Admin Panel Types ---
export type Role = 'Staff' | 'Manager' | 'Admin';

export interface AdminUser {
  email: string;
  name: string;
  role: Role;
}

export interface DashboardStats {
  totalOrdersToday: number;
  totalGbpToday: number;
  volumeByCurrency: { [currencyCode: string]: number };
}

export interface AdminOrder {
  order_id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  currency_code: string;
  foreign_amount: number;
  gbp_amount: number;
  collection_branch: string;
  status: string;
}

export interface CustomerData {
  email: string;
  name: string;
  phone: string;
  order_count: number;
  total_gbp_spent: number;
  last_order_date: string;
}

export interface AdminData {
  dashboard: DashboardStats;
  recentOrders: AdminOrder[];
  customers: CustomerData[];
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  currency?: string;
  amount?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  content: string;
}

