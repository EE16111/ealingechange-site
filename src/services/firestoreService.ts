// Firebase Firestore Service for Ealing Exchange
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    addDoc,
    query,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import app from './firebase';
import type { AppData, ExchangeRates, Store, Currency, SiteSettings, BookingData, RateAlertData, SubscriberData, LeadData, AdminData, AdminOrder, CustomerData } from '../types';

// Initialize Firestore
const db = getFirestore(app);

// Collection references
const COLLECTIONS = {
    RATES: 'rates',
    CURRENCIES: 'currencies',
    STORES: 'stores',
    SETTINGS: 'settings',
    ORDERS: 'orders',
    SUBSCRIBERS: 'subscribers',
    RATE_ALERTS: 'rateAlerts',
    LEADS: 'leads',
    CUSTOMERS: 'customers'
};

// ============== PUBLIC DATA ==============

export const getExchangeDataFromFirestore = async (): Promise<AppData> => {
    try {
        // Get rates
        const ratesDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'exchangeRates'));
        const rates: ExchangeRates = ratesDoc.exists() ? ratesDoc.data() as ExchangeRates : {};

        // Get currencies
        const currenciesSnapshot = await getDocs(collection(db, COLLECTIONS.CURRENCIES));
        const currencies: Currency[] = [];
        currenciesSnapshot.forEach(doc => {
            currencies.push({ ...doc.data(), code: doc.id } as Currency);
        });

        // Sort by display_order
        currencies.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        // Get stores
        const storesSnapshot = await getDocs(collection(db, COLLECTIONS.STORES));
        const stores: Store[] = [];
        storesSnapshot.forEach(doc => {
            stores.push({ ...doc.data(), store_id: parseInt(doc.id) } as Store);
        });

        // Get site settings
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'site'));
        const siteSettings: SiteSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : {};

        return { currencies, rates, stores, siteSettings };
    } catch (error) {
        console.error('Error fetching data from Firestore:', error);
        throw error;
    }
};

// ============== ADMIN DATA ==============

export const updateRatesInFirestore = async (rates: ExchangeRates): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'exchangeRates'), rates);
};

export const updateStoresInFirestore = async (stores: Store[]): Promise<void> => {
    for (const store of stores) {
        await setDoc(doc(db, COLLECTIONS.STORES, store.store_id.toString()), store);
    }
};

export const updateSiteSettingsInFirestore = async (settings: SiteSettings): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'site'), settings, { merge: true });
};

// ============== ORDERS ==============

export const createOrderInFirestore = async (orderData: BookingData): Promise<{ success: boolean; orderId: string }> => {
    const orderRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        status: 'Pending Collection',
        created_at: Timestamp.now()
    });
    return { success: true, orderId: orderRef.id };
};

export const getOrdersFromFirestore = async (limitCount: number = 50): Promise<AdminOrder[]> => {
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('created_at', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const orders: AdminOrder[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        orders.push({
            order_id: doc.id,
            created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            customer_name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            currency_code: data.currencyCode || '',
            foreign_amount: parseFloat(data.quoteAmount) || 0,
            gbp_amount: parseFloat(data.baseAmount) || 0,
            collection_branch: data.branch || '',
            status: data.status || 'Pending'
        });
    });
    return orders;
};

export const updateOrderStatusInFirestore = async (orderId: string, status: string): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status });
};

// ============== SUBSCRIBERS & LEADS ==============

export const addSubscriberToFirestore = async (data: SubscriberData): Promise<{ success: boolean }> => {
    await addDoc(collection(db, COLLECTIONS.SUBSCRIBERS), {
        ...data,
        created_at: Timestamp.now()
    });
    return { success: true };
};

export const createRateAlertInFirestore = async (data: RateAlertData): Promise<{ success: boolean }> => {
    await addDoc(collection(db, COLLECTIONS.RATE_ALERTS), {
        ...data,
        created_at: Timestamp.now()
    });
    return { success: true };
};

export const createLeadInFirestore = async (data: LeadData): Promise<{ success: boolean }> => {
    await addDoc(collection(db, COLLECTIONS.LEADS), {
        ...data,
        status: 'Chat Lead',
        created_at: Timestamp.now()
    });
    return { success: true };
};

// ============== CUSTOMERS ==============

export const getCustomersFromFirestore = async (): Promise<CustomerData[]> => {
    const q = query(collection(db, COLLECTIONS.CUSTOMERS), limit(100));
    const snapshot = await getDocs(q);
    const customers: CustomerData[] = [];
    snapshot.forEach(doc => {
        customers.push(doc.data() as CustomerData);
    });
    return customers;
};

// ============== ADMIN DASHBOARD ==============

export const getAdminDataFromFirestore = async (): Promise<AdminData> => {
    const orders = await getOrdersFromFirestore(50);
    const customers = await getCustomersFromFirestore();

    // Calculate dashboard stats
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today));

    return {
        dashboard: {
            totalOrdersToday: todayOrders.length,
            totalGbpToday: todayOrders.reduce((sum, o) => sum + o.gbp_amount, 0),
            volumeByCurrency: {}
        },
        recentOrders: orders,
        customers
    };
};

export default db;
