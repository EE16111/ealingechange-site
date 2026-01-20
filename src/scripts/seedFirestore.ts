// Seed script for Firebase Firestore
// Run this once to populate initial data
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBL2NVY-kDF0kIUaZoLL_ERf5YN-hthxko",
    authDomain: "sys-34584539868966162311959642.firebaseapp.com",
    projectId: "sys-34584539868966162311959642",
    storageBucket: "sys-34584539868966162311959642.firebasestorage.app",
    messagingSenderId: "59413213434",
    appId: "1:59413213434:web:de1b8169b233b510201943"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your rates from the spreadsheet
const exchangeRates = {
    'USD': { customerBuys: 1.31, customerSells: 1.41 },
    'EUR': { customerBuys: 1.12, customerSells: 1.23 },
    'CHF': { customerBuys: 1.03, customerSells: 1.14 },
    'AUD': { customerBuys: 1.95, customerSells: 2.15 },
    'CAD': { customerBuys: 1.78, customerSells: 2.03 },
    'AED': { customerBuys: 4.79, customerSells: 5.27 },
    'SAR': { customerBuys: 4.80, customerSells: 5.70 }
};

// Currency details
const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2, flag_emoji: '🇺🇸', is_active: true, display_order: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2, flag_emoji: '🇪🇺', is_active: true, display_order: 2 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', decimal_places: 2, flag_emoji: '🇨🇭', is_active: true, display_order: 3 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_places: 2, flag_emoji: '🇦🇺', is_active: true, display_order: 4 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_places: 2, flag_emoji: '🇨🇦', is_active: true, display_order: 5 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimal_places: 2, flag_emoji: '🇦🇪', is_active: true, display_order: 6 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimal_places: 2, flag_emoji: '🇸🇦', is_active: true, display_order: 7 }
];

// Store locations
const stores = [
    { store_id: 1, name: 'Ealing Exchange - West Ealing', address: '16 The Broadway, West Ealing, London, W13 0SR', phone: '020 8840 6420', map_url: 'https://www.google.com/maps/search/?api=1&query=16+The+Broadway,+West+Ealing,+London,+W13+0SR' },
    { store_id: 2, name: 'Ealing Exchange - Hanwell', address: '111 Uxbridge Rd, Hanwell, London, W7 3ST', phone: '020 3336 3633', map_url: 'https://www.google.com/maps/search/?api=1&query=111+Uxbridge+Rd,+Hanwell,+London,+W7+3ST' }
];

// Site settings
const siteSettings = {
    social_facebook: 'https://facebook.com/ealingexchange',
    social_twitter: 'https://twitter.com/ealingexchange',
    google_review_link: 'https://g.page/r/ealingexchange'
};

async function seedFirestore() {
    console.log('🌱 Seeding Firestore...');

    try {
        // 1. Save exchange rates
        console.log('📊 Adding exchange rates...');
        await setDoc(doc(db, 'settings', 'exchangeRates'), exchangeRates);

        // 2. Save currencies
        console.log('💱 Adding currencies...');
        for (const currency of currencies) {
            await setDoc(doc(db, 'currencies', currency.code), currency);
        }

        // 3. Save stores
        console.log('🏪 Adding stores...');
        for (const store of stores) {
            await setDoc(doc(db, 'stores', store.store_id.toString()), store);
        }

        // 4. Save site settings
        console.log('⚙️ Adding site settings...');
        await setDoc(doc(db, 'settings', 'site'), siteSettings);

        console.log('✅ Firestore seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding Firestore:', error);
    }
}

// Export for use
export { seedFirestore, exchangeRates, currencies, stores, siteSettings };
