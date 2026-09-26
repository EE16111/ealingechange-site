// Exchange Service - Now using Firebase Firestore
import type { AppData, AdminUser, BookingData, LeadData, RateAlertData, SubscriberData, AdminData, AdminOrder, CustomerData, Store, ExchangeRates, SiteSettings, Currency } from '../types';
import {
    getExchangeDataFromFirestore,
    updateRatesInFirestore,
    updateStoresInFirestore,
    updateSiteSettingsInFirestore,
    createOrderInFirestore,
    getAdminDataFromFirestore,
    addSubscriberToFirestore,
    createRateAlertInFirestore,
    createLeadInFirestore,
    updateOrderStatusInFirestore
} from './firestoreService';

// No more mock mode - we're using real Firestore
export const IS_MOCK_MODE = false;

// GBP currency for the list
const GBP_CURRENCY: Currency = {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimal_places: 2,
    flag_emoji: '🇬🇧',
    is_active: true,
    display_order: 0
};

// ============== PUBLIC DATA ==============

export const getExchangeData = async (): Promise<AppData> => {
    try {
        const data = await getExchangeDataFromFirestore();

        // Ensure GBP is in the currencies list
        const hasGBP = data.currencies.some(c => c.code === 'GBP');
        if (!hasGBP) {
            data.currencies.unshift(GBP_CURRENCY);
        }

        return data;
    } catch (error) {
        console.error('Error fetching exchange data:', error);
        throw new Error('Failed to load exchange rates. Please try again later.');
    }
};

// ============== ORDERS ==============

export const createOrder = async (orderData: BookingData): Promise<{ success: boolean; orderId?: string }> => {
    try {
        const result = await createOrderInFirestore(orderData);
        return result;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order. Please try again.');
    }
};

// ============== RATE ALERTS ==============

export const createRateAlert = async (alertData: RateAlertData): Promise<{ success: boolean }> => {
    try {
        return await createRateAlertInFirestore(alertData);
    } catch (error) {
        console.error('Error creating rate alert:', error);
        throw new Error('Failed to set rate alert. Please try again.');
    }
};

// ============== NEWSLETTER ==============

export const addSubscriber = async (subscriberData: SubscriberData): Promise<{ success: boolean }> => {
    try {
        return await addSubscriberToFirestore(subscriberData);
    } catch (error) {
        console.error('Error adding subscriber:', error);
        throw new Error('Failed to subscribe. Please try again.');
    }
};

// ============== CHAT LEADS ==============

export const createChatLead = async (leadData: LeadData): Promise<{ success: boolean }> => {
    try {
        return await createLeadInFirestore(leadData);
    } catch (error) {
        console.error('Error creating lead:', error);
        throw new Error('Failed to save contact info. Please try again.');
    }
};

// ============== ADMIN DATA ==============

export const getAdminData = async (_date?: string): Promise<AdminData> => {
    try {
        return await getAdminDataFromFirestore();
    } catch (error) {
        console.error('Error fetching admin data:', error);
        throw new Error('Failed to load admin data.');
    }
};

export const getOrderDetails = async (orderId: string): Promise<AdminOrder> => {
    const adminData = await getAdminData();
    const order = adminData.recentOrders.find(o => o.order_id === orderId);
    if (!order) throw new Error('Order not found');
    return order;
};

export const getCustomerDetails = async (email: string): Promise<{ customer: CustomerData | null; orders: AdminOrder[] }> => {
    const adminData = await getAdminData();
    const customer = adminData.customers.find(c => c.email === email);
    const orders = adminData.recentOrders.filter(o => o.email === email);
    if (!customer) throw new Error('Customer not found');
    return { customer, orders };
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean }> => {
    try {
        await updateOrderStatusInFirestore(orderId, status);
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status.');
    }
};

// ============== ADMIN CONTENT UPDATES ==============

export const updateContent = async (rates: ExchangeRates, stores: Store[], siteSettings: SiteSettings): Promise<{ success: boolean }> => {
    try {
        await updateRatesInFirestore(rates);
        await updateStoresInFirestore(stores);
        await updateSiteSettingsInFirestore(siteSettings);
        return { success: true };
    } catch (error) {
        console.error('Error updating content:', error);
        throw new Error('Failed to save changes.');
    }
};

// ============== ADMIN LOGIN (handled by Firebase Auth now) ==============
// The adminLogin function is no longer used - Firebase Auth handles this in AdminLoginModal
export const adminLogin = async (_email: string, _password: string): Promise<AdminUser> => {
    throw new Error('Admin login is now handled by Firebase Authentication');
};
