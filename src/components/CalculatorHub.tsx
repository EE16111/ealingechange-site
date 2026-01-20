import React, { useState, useEffect } from 'react';
import type { Currency, ExchangeRates, Store, CalculatorMode, BookingData } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon'; // Assuming we can use this icon or similar
import { createOrder } from '../services/exchangeService';
import Spinner from './ui/Spinner';

interface Props {
    currencies: Currency[];
    rates: ExchangeRates;
    stores: Store[];
    mode: CalculatorMode;
    setMode: (mode: CalculatorMode) => void;
    initialSelectedCurrency: string;
}

const CalculatorHub: React.FC<Props> = ({ currencies, rates, stores, mode, setMode, initialSelectedCurrency }) => {
    // Calculator State
    const [amount, setAmount] = useState<string>('1000');
    const [currencyCode, setCurrencyCode] = useState<string>(initialSelectedCurrency || (currencies[0]?.code || 'EUR'));
    const [convertedAmount, setConvertedAmount] = useState<string>('');
    const [rateUsed, setRateUsed] = useState<number>(0);

    // Reservation Flow State
    const [isReserving, setIsReserving] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(stores[0]?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter out GBP from foreign currencies list if present
    const foreignCurrencies = currencies.filter(c => c.code !== 'GBP');
    const activeCurrency = foreignCurrencies.find(c => c.code === currencyCode) || foreignCurrencies[0];

    useEffect(() => {
        if (!activeCurrency || !rates[activeCurrency.code]) return;

        const rateObj = rates[activeCurrency.code];
        const rate = mode === 'BUY_FOREIGN' ? rateObj.customerBuys : rateObj.customerSells;
        setRateUsed(rate);

        const val = parseFloat(amount.replace(/,/g, '')) || 0;
        let result = 0;
        if (mode === 'BUY_FOREIGN') {
            result = val * rate;
        } else {
            result = val / rate;
        }

        const decimals = mode === 'BUY_FOREIGN' ? activeCurrency.decimal_places : 2;
        setConvertedAmount(result.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));

    }, [amount, currencyCode, mode, rates, activeCurrency]);

    const handleModeChange = (newMode: CalculatorMode) => {
        setMode(newMode);
    };

    const isBuy = mode === 'BUY_FOREIGN';

    const handleReserveClick = () => {
        setError(null);
        setIsReserving(true);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const orderData: BookingData = {
            mode,
            name: formName,
            email: formEmail,
            phone: formPhone,
            branch: selectedBranch,
            baseAmount: amount, // e.g. "1000" GBP
            quoteAmount: convertedAmount, // e.g. "1200" EUR
            currencyCode: currencyCode
        };

        try {
            await createOrder(orderData);
            setSubmitSuccess(true);
        } catch (err) {
            console.error("Order failed", err);
            setError("Failed to create reservation. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setIsReserving(false);
        setSubmitSuccess(false);
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setError(null);
    };

    // --- RENDER SUCCESS VIEW ---
    if (submitSuccess) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckBadgeIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Reservation Confirmed!</h3>
                <p className="text-slate-600 mb-8 max-w-xs">
                    We've sent a confirmation email to <strong>{formEmail}</strong>. Please bring your ID when you collect from {selectedBranch}.
                </p>
                <button
                    onClick={handleReset}
                    className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                >
                    Make Another Reservation
                </button>
            </div>
        );
    }

    // --- RENDER RESERVATION FORM ---
    if (isReserving) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-yellow"></div>

                <div className="flex items-center mb-6">
                    <button onClick={() => setIsReserving(false)} className="text-sm text-slate-400 hover:text-brand-blue mr-auto font-semibold">
                        ← Back
                    </button>
                    <h3 className="text-xl font-bold text-brand-blue text-center flex-grow pr-8">Complete Reservation</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Order Summary</p>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-700 font-medium">
                            {isBuy ? 'Acc:' : 'Selling:'} {amount} {isBuy ? 'GBP' : currencyCode}
                        </span>
                        <span className="text-slate-400 text-sm">→</span>
                        <span className="text-brand-blue font-bold text-lg">
                            {convertedAmount} {isBuy ? currencyCode : 'GBP'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Collect From</label>
                        <select
                            required
                            value={selectedBranch}
                            onChange={e => setSelectedBranch(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                        >
                            {stores.map(store => (
                                <option key={store.store_id} value={store.name}>{store.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formEmail}
                                onChange={e => setFormEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                value={formPhone}
                                onChange={e => setFormPhone(e.target.value)}
                                placeholder="07700 900000"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-blue outline-none"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-brand-yellow text-brand-blue text-lg font-bold py-3 rounded-lg shadow hover:bg-yellow-400 transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Spinner /> : 'Confirm Order'}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-2">
                        You'll receive an email confirmation immediately.
                    </p>
                </form>
            </div>
        );
    }

    // --- RENDER CALCULATOR ---
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-yellow"></div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                <button
                    onClick={() => handleModeChange('BUY_FOREIGN' as CalculatorMode)}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isBuy ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Buy Travel Money
                </button>
                <button
                    onClick={() => handleModeChange('SELL_FOREIGN' as CalculatorMode)}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isBuy ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Sell Back Currency
                </button>
            </div>

            {/* Calculator Body */}
            <div className="space-y-6">

                {/* Input 1: Source Amount */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {isBuy ? 'You Pay (GBP)' : `You Sell (${activeCurrency?.code})`}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => {
                                if (/^[\d,]*\.?[\d]*$/.test(e.target.value)) {
                                    setAmount(e.target.value);
                                }
                            }}
                            className="block w-full text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-16 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                            placeholder="0.00"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                            {isBuy ? 'GBP' : activeCurrency?.code}
                        </div>
                    </div>
                </div>

                {/* Currency Selector */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {isBuy ? 'Select Currency' : 'Select Currency to Sell'}
                    </label>
                    <select
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(e.target.value)}
                        className="block w-full text-lg font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none appearance-none cursor-pointer hover:border-brand-blue transition-colors"
                    >
                        {foreignCurrencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.flag_emoji} {c.code} - {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rate Display */}
                <div className="flex items-center justify-between text-sm py-2 px-3 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
                    <span className="font-semibold">Exchange Rate:</span>
                    <span className="font-mono font-bold tracking-wider">1 GBP = {rateUsed.toFixed(4)} {activeCurrency?.code}</span>
                </div>

                {/* Output: Result */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {isBuy ? `You Get (${activeCurrency?.code})` : 'You Get (GBP)'}
                    </label>
                    <div className="block w-full text-3xl font-extrabold text-brand-blue bg-white border-b-2 border-brand-yellow py-2 px-1">
                        {convertedAmount} <span className="text-base font-normal text-slate-400 ml-1">{isBuy ? activeCurrency?.code : 'GBP'}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleReserveClick}
                    className="w-full flex items-center justify-center bg-brand-blue hover:bg-slate-800 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group"
                >
                    <span>Reserve Now</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform text-brand-yellow" />
                </button>

                <p className="text-xs text-center text-slate-400 mt-2">
                    No payment required now. Pay on collection.
                </p>

            </div>
        </div>
    );
};

export default CalculatorHub;
