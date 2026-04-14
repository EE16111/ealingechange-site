import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculatorMode } from '../types';

/**
 * Service Layer Tests
 * 
 * Mocks the Firestore layer so tests don't make real network calls.
 */

vi.mock('../services/firestoreService', () => ({
    getExchangeDataFromFirestore: vi.fn().mockResolvedValue({
        currencies: [
            { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2, flag_emoji: '🇪🇺', is_active: true, display_order: 1 },
            { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2, flag_emoji: '🇺🇸', is_active: true, display_order: 2 },
        ],
        rates: {
            EUR: { customerBuys: 1.18, customerSells: 1.10 },
            USD: { customerBuys: 1.25, customerSells: 1.15 },
        },
        stores: [
            { store_id: 1, name: 'West Ealing', address: '16 The Broadway', phone: '020 8840 6420', map_url: '' },
        ],
        siteSettings: {},
    }),
    createOrderInFirestore: vi.fn().mockResolvedValue({ success: true, orderId: 'mock-order-id-123' }),
    createRateAlertInFirestore: vi.fn().mockResolvedValue({ success: true }),
    addSubscriberToFirestore: vi.fn().mockResolvedValue({ success: true }),
    createLeadInFirestore: vi.fn().mockResolvedValue({ success: true }),
    updateRatesInFirestore: vi.fn().mockResolvedValue(undefined),
    updateStoresInFirestore: vi.fn().mockResolvedValue(undefined),
    updateSiteSettingsInFirestore: vi.fn().mockResolvedValue(undefined),
    getAdminDataFromFirestore: vi.fn().mockResolvedValue({ dashboard: {}, recentOrders: [], customers: [] }),
    updateOrderStatusInFirestore: vi.fn().mockResolvedValue(undefined),
}));

describe('Exchange Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getExchangeData', () => {
        it('should return AppData structure with currencies, rates, and stores', async () => {
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();

            expect(data).toHaveProperty('currencies');
            expect(data).toHaveProperty('rates');
            expect(data).toHaveProperty('stores');
            expect(Array.isArray(data.currencies)).toBe(true);
            expect(data.currencies.length).toBeGreaterThan(0);
        });

        it('should include GBP in currencies list (added automatically)', async () => {
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();
            const gbp = data.currencies.find(c => c.code === 'GBP');

            expect(gbp).toBeDefined();
            expect(gbp?.name).toBe('British Pound');
        });

        it('should have valid rate structure for each currency', async () => {
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();

            Object.entries(data.rates).forEach(([, rate]) => {
                expect(rate).toHaveProperty('customerBuys');
                expect(rate).toHaveProperty('customerSells');
                expect(typeof rate.customerBuys).toBe('number');
                expect(typeof rate.customerSells).toBe('number');
                expect(rate.customerBuys).toBeGreaterThan(0);
                expect(rate.customerSells).toBeGreaterThan(0);
            });
        });
    });

    describe('createOrder', () => {
        it('should accept valid booking data and return success', async () => {
            const { createOrder } = await import('../services/exchangeService');
            const orderData = {
                mode: CalculatorMode.BUY_FOREIGN,
                name: 'Test User',
                email: 'test@example.com',
                phone: '07123456789',
                branch: 'West Ealing',
                baseAmount: '100',
                quoteAmount: '125',
                currencyCode: 'USD'
            };

            const result = await createOrder(orderData);

            expect(result).toHaveProperty('success');
            expect(result.success).toBe(true);
        });

        it('should include orderId in successful response', async () => {
            const { createOrder } = await import('../services/exchangeService');
            const result = await createOrder({
                mode: CalculatorMode.BUY_FOREIGN,
                name: 'Jane Doe',
                email: 'jane@example.com',
                phone: '07987654321',
                branch: 'Hanwell',
                baseAmount: '500',
                quoteAmount: '585',
                currencyCode: 'EUR'
            });

            expect(result.orderId).toBeDefined();
            expect(typeof result.orderId).toBe('string');
        });
    });

    describe('createRateAlert', () => {
        it('should accept valid alert data and return success', async () => {
            const { createRateAlert } = await import('../services/exchangeService');
            const alertData = {
                email: 'test@example.com',
                currencyCode: 'EUR',
                targetRate: '1.20',
                mode: CalculatorMode.BUY_FOREIGN
            };

            const result = await createRateAlert(alertData);

            expect(result).toHaveProperty('success');
            expect(result.success).toBe(true);
        });
    });
});
