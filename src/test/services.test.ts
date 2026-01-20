import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculatorMode } from '../types';

/**
 * Service Function Tests
 * 
 * Tests for the API service layer.
 * Note: These tests verify the mock data structure since IS_MOCK_MODE may be on or off.
 */

// We need to set mock mode for these tests
vi.mock('../services/exchangeService', async (importOriginal) => {
    const mod = await importOriginal<typeof import('../services/exchangeService')>();
    return {
        ...mod,
        IS_MOCK_MODE: true, // Force mock mode for tests
    };
});

describe('Exchange Service (Mock Mode)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getExchangeData', () => {
        it('should return AppData structure with currencies, rates, and stores', async () => {
            // Dynamic import after mocking
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();

            expect(data).toHaveProperty('currencies');
            expect(data).toHaveProperty('rates');
            expect(data).toHaveProperty('stores');
            expect(Array.isArray(data.currencies)).toBe(true);
            expect(data.currencies.length).toBeGreaterThan(0);
        });

        it('should include GBP in currencies list', async () => {
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();
            const gbp = data.currencies.find(c => c.code === 'GBP');

            expect(gbp).toBeDefined();
            expect(gbp?.name).toBe('British Pound');
        });

        it('should have valid rate structure for each currency', async () => {
            const { getExchangeData } = await import('../services/exchangeService');
            const data = await getExchangeData();

            Object.entries(data.rates).forEach(([_code, rate]) => {
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
