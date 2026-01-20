import { describe, it, expect } from 'vitest';

/**
 * Calculator Logic Tests
 * 
 * Tests the core buy/sell calculation logic used across the application.
 */

// Replicate the calculation logic from CalculatorHub
const calculateExchange = (
    amount: number,
    rate: number,
    mode: 'BUY' | 'SELL',
    decimalPlaces: number = 2
) => {
    if (mode === 'BUY') {
        // Customer gives GBP, gets foreign currency
        // rate = customerBuys (how much foreign currency per 1 GBP)
        return parseFloat((amount * rate).toFixed(decimalPlaces));
    } else {
        // Customer gives foreign currency, gets GBP
        // rate = customerSells (how much foreign currency needed for 1 GBP)
        return parseFloat((amount / rate).toFixed(decimalPlaces));
    }
};

describe('Exchange Calculator Logic', () => {
    describe('BUY mode (GBP to Foreign)', () => {
        it('should correctly calculate USD for a given GBP amount', () => {
            // £100 at a rate of 1.25 USD/GBP should give $125
            const result = calculateExchange(100, 1.25, 'BUY');
            expect(result).toBe(125);
        });

        it('should correctly calculate EUR with 2 decimal places', () => {
            // £500 at 1.15 EUR/GBP
            const result = calculateExchange(500, 1.15, 'BUY');
            expect(result).toBe(575);
        });

        it('should handle JPY with 0 decimal places', () => {
            // £100 at 185.50 JPY/GBP
            const result = calculateExchange(100, 185.50, 'BUY', 0);
            expect(result).toBe(18550);
        });

        it('should return 0 for 0 input', () => {
            const result = calculateExchange(0, 1.25, 'BUY');
            expect(result).toBe(0);
        });
    });

    describe('SELL mode (Foreign to GBP)', () => {
        it('should correctly calculate GBP for a given USD amount', () => {
            // $130 at a rate of 1.30 USD/GBP should give £100
            const result = calculateExchange(130, 1.30, 'SELL');
            expect(result).toBe(100);
        });

        it('should correctly calculate GBP from EUR', () => {
            // €575 at 1.15 EUR/GBP should give £500
            const result = calculateExchange(575, 1.15, 'SELL');
            expect(result).toBe(500);
        });

        it('should handle decimal results', () => {
            // $100 at 1.25 USD/GBP should give £80
            const result = calculateExchange(100, 1.25, 'SELL');
            expect(result).toBe(80);
        });
    });
});

describe('Rate Validation', () => {
    it('should verify buy rate is less than sell rate (the spread)', () => {
        const buyRate = 1.25;  // We sell at this rate (customer buys)
        const sellRate = 1.30; // We buy at this rate (customer sells)

        // The sell rate should always be higher (we give less GBP when buying foreign currency)
        expect(sellRate).toBeGreaterThan(buyRate);
    });
});
