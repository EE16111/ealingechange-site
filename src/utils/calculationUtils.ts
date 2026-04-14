/**
 * Currency Calculation Utilities
 * 
 * Pure functions for currency exchange math.
 * These are extracted for testability and reuse.
 */

import { CalculatorMode } from '../types';
import type { ExchangeRates } from '../types';

/**
 * Calculate how much foreign currency a customer gets when buying with GBP (BUY_FOREIGN mode).
 * Formula: foreignAmount = gbpAmount * customerBuys rate
 */
export function calculateForeignFromGbp(gbpAmount: number, rate: number): number {
    if (gbpAmount <= 0 || rate <= 0) return 0;
    return gbpAmount * rate;
}

/**
 * Calculate how much GBP a customer gets when selling foreign currency (SELL_FOREIGN mode).
 * Formula: gbpAmount = foreignAmount / customerSells rate
 */
export function calculateGbpFromForeign(foreignAmount: number, rate: number): number {
    if (foreignAmount <= 0 || rate <= 0) return 0;
    return foreignAmount / rate;
}

/**
 * Get the applicable rate for the given mode.
 * BUY_FOREIGN: customer buys foreign currency → use customerBuys rate
 * SELL_FOREIGN: customer sells foreign currency → use customerSells rate
 */
export function getApplicableRate(currencyCode: string, mode: CalculatorMode, rates: ExchangeRates): number | null {
    const rateObj = rates[currencyCode];
    if (!rateObj) return null;
    return mode === CalculatorMode.BUY_FOREIGN ? rateObj.customerBuys : rateObj.customerSells;
}

/**
 * Main conversion function that handles both directions.
 * Returns the converted amount and the rate used, or null if rate not found.
 */
export function calculateConversion(
    inputAmount: number,
    currencyCode: string,
    mode: CalculatorMode,
    rates: ExchangeRates
): { result: number; rate: number } | null {
    const rate = getApplicableRate(currencyCode, mode, rates);
    if (rate === null || rate <= 0) return null;

    let result: number;
    if (mode === CalculatorMode.BUY_FOREIGN) {
        // Customer gives GBP, gets foreign currency
        result = calculateForeignFromGbp(inputAmount, rate);
    } else {
        // Customer gives foreign currency, gets GBP
        result = calculateGbpFromForeign(inputAmount, rate);
    }

    return { result, rate };
}

/**
 * Check if a rate alert threshold has been met.
 * BUY_FOREIGN alert: triggers when current rate >= targetRate (customer gets MORE foreign currency)
 * SELL_FOREIGN alert: triggers when current rate <= targetRate (customer gives LESS foreign currency back)
 */
export function isRateAlertTriggered(
    targetRate: number,
    currentRate: number,
    mode: CalculatorMode
): boolean {
    if (mode === CalculatorMode.BUY_FOREIGN) {
        return currentRate >= targetRate;
    } else {
        return currentRate <= targetRate;
    }
}

/**
 * Format currency amount to string with the appropriate decimal places.
 */
export function formatCurrencyAmount(amount: number, decimalPlaces: number = 2): string {
    return amount.toLocaleString('en-GB', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });
}
