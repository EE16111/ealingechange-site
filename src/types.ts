
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

export interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  component?: React.ReactNode;
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

// --- Umrah Types ---
export type UmrahStatus = 'Enquiry' | 'Quoted' | 'Confirmed' | 'Paid' | 'Completed' | 'Cancelled';
export type UmrahPackageTier = '3-Star' | '4-Star' | '5-Star' | 'Custom';

export interface UmrahEnquiry {
  id: string;
  created_at: string;
  updated_at: string;
  // Customer details
  customer_name: string;
  email: string;
  phone: string;
  // Trip details
  adults: number;
  children: number;
  preferred_dates: string;
  duration_nights: number;
  package_tier: UmrahPackageTier;
  // Status & notes
  status: UmrahStatus;
  quoted_price?: number;
  notes: string;
  assigned_to?: string;
}

// --- Travel Types ---
export type TravelBookingType = 'Flight' | 'Hotel' | 'Package' | 'Other';
export type TravelStatus = 'Enquiry' | 'Searching' | 'Quoted' | 'Booked' | 'Completed' | 'Cancelled';

export interface TravelBooking {
  id: string;
  created_at: string;
  updated_at: string;
  // Customer details
  customer_name: string;
  email: string;
  phone: string;
  // Trip details
  booking_type: TravelBookingType;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  // Status & pricing
  status: TravelStatus;
  quoted_price?: number;
  confirmed_price?: number;
  notes: string;
}

// --- Phone Service Types ---
export type RepairStatus = 'Received' | 'Diagnosing' | 'Awaiting Parts' | 'Repairing' | 'Ready' | 'Collected' | 'Cancelled';
export type BuybackStatus = 'Quote Given' | 'Accepted' | 'Paid' | 'Resold' | 'Rejected';

export interface PhoneRepair {
  id: string;
  created_at: string;
  updated_at: string;
  // Customer details
  customer_name: string;
  phone: string;
  // Device details
  device_brand: string;
  device_model: string;
  issue_description: string;
  // Status & pricing
  status: RepairStatus;
  estimated_cost?: number;
  final_cost?: number;
  notes: string;
  branch: string;
}

export interface PhoneBuyback {
  id: string;
  created_at: string;
  // Customer details
  customer_name: string;
  phone: string;
  // Device details
  device_brand: string;
  device_model: string;
  storage_gb: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  // Pricing
  quoted_price: number;
  paid_price?: number;
  status: BuybackStatus;
  notes: string;
  branch: string;
}

