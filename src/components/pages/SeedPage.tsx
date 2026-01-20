// Seed page - visit /seed to populate Firestore with initial data
// DELETE THIS FILE AFTER SEEDING!
import React, { useState } from 'react';
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

const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2, flag_emoji: '🇺🇸', is_active: true, display_order: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2, flag_emoji: '🇪🇺', is_active: true, display_order: 2 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', decimal_places: 2, flag_emoji: '🇨🇭', is_active: true, display_order: 3 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_places: 2, flag_emoji: '🇦🇺', is_active: true, display_order: 4 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_places: 2, flag_emoji: '🇨🇦', is_active: true, display_order: 5 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimal_places: 2, flag_emoji: '🇦🇪', is_active: true, display_order: 6 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimal_places: 2, flag_emoji: '🇸🇦', is_active: true, display_order: 7 }
];

const stores = [
    { store_id: 1, name: 'Ealing Exchange - West Ealing', address: '16 The Broadway, West Ealing, London, W13 0SR', phone: '020 8840 6420', map_url: 'https://www.google.com/maps/search/?api=1&query=16+The+Broadway,+West+Ealing,+London,+W13+0SR' },
    { store_id: 2, name: 'Ealing Exchange - Hanwell', address: '111 Uxbridge Rd, Hanwell, London, W7 3ST', phone: '020 3336 3633', map_url: 'https://www.google.com/maps/search/?api=1&query=111+Uxbridge+Rd,+Hanwell,+London,+W7+3ST' }
];

const siteSettings = {
    social_facebook: 'https://facebook.com/ealingexchange',
    social_twitter: 'https://twitter.com/ealingexchange',
    google_review_link: 'https://g.page/r/ealingexchange'
};

const SeedPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [status, setStatus] = useState<string>('Ready to seed');
    const [isSeeding, setIsSeeding] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        setStatus('🌱 Starting seed...');

        try {
            // 1. Save exchange rates
            setStatus('📊 Adding exchange rates...');
            await setDoc(doc(db, 'settings', 'exchangeRates'), exchangeRates);

            // 2. Save currencies
            setStatus('💱 Adding currencies...');
            for (const currency of currencies) {
                await setDoc(doc(db, 'currencies', currency.code), currency);
            }

            // 3. Save stores
            setStatus('🏪 Adding stores...');
            for (const store of stores) {
                await setDoc(doc(db, 'stores', store.store_id.toString()), store);
            }

            // 4. Save site settings
            setStatus('⚙️ Adding site settings...');
            await setDoc(doc(db, 'settings', 'site'), siteSettings);

            setStatus('✅ Firestore seeded successfully!');
            setCompleted(true);
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">🌱 Seed Firestore</h1>
                <p className="text-slate-600 mb-6">This will populate your Firestore database with initial data (currencies, rates, stores).</p>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 font-mono text-sm">
                    {status}
                </div>

                <div className="space-y-4">
                    {!completed ? (
                        <button
                            onClick={handleSeed}
                            disabled={isSeeding}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSeeding ? 'Seeding...' : 'Start Seed'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate('/')}
                            className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-slate-700"
                        >
                            Go to Homepage
                        </button>
                    )}
                </div>

                <p className="mt-6 text-xs text-slate-400 text-center">
                    ⚠️ Delete this page after seeding!
                </p>
            </div>
        </div>
    );
};

export default SeedPage;
