import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Currency, ExchangeRates } from '../types';
import { CalculatorMode } from '../types';
import { createRateAlert } from '../services/exchangeService';
import Card from './ui/Card';
import { FadeIn } from './ui/Motion';

interface Props {
  currencies: Currency[];
  rates: ExchangeRates;
  onSelectCurrency: (currency: Currency, mode: CalculatorMode) => void;
}

const TrendArrow: React.FC<{ isUp: boolean }> = ({ isUp }) => (
  <motion.span
    initial={{ opacity: 0, y: isUp ? 5 : -5 }}
    animate={{ opacity: 1, y: 0 }}
    className={`ml-2 text-xs font-bold inline-flex items-center ${isUp ? 'text-green-500' : 'text-red-500'}`}
  >
    {isUp ? '▲' : '▼'}
  </motion.span>
);

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Rate Alert Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencyCode: string;
  currentRate: number;
}

const RateAlertModal: React.FC<ModalProps> = ({ isOpen, onClose, currencyCode, currentRate }) => {
  const [email, setEmail] = useState('');
  const [targetRate, setTargetRate] = useState((currentRate * 1.02).toFixed(4)); // Default to +2%
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createRateAlert({
        email,
        currencyCode,
        targetRate,
        mode: CalculatorMode.BUY_FOREIGN // Default assumption
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-blue flex items-center">
            <BellIcon className="w-6 h-6 mr-2 text-brand-yellow" />
            Set Rate Alert
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="text-lg font-bold text-brand-blue">Alert Set!</h4>
            <p className="text-slate-600">We'll email you when {currencyCode} hits {targetRate}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700 mb-4">
              Current Rate for {currencyCode}: <span className="font-bold text-brand-blue">{currentRate}</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Target Rate</label>
              <input
                type="number"
                step="0.0001"
                value={targetRate}
                onChange={(e) => setTargetRate(e.target.value)}
                className="w-full border-slate-300 rounded-lg focus:ring-brand-yellow focus:border-brand-yellow"
                required
              />
              <p className="text-xs text-slate-500 mt-1">We'll notify you when the rate reaches this value.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-slate-300 rounded-lg focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="you@example.com"
                required
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex justify-center items-center"
            >
              {status === 'loading' ? <span className="animate-spin mr-2">⏳</span> : 'Create Alert'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const LiveRatesTable: React.FC<Props> = ({ currencies, rates, onSelectCurrency }) => {
  const [alertCurrency, setAlertCurrency] = useState<string | null>(null);

  const popularCurrencies = ['USD', 'EUR', 'AUD', 'CAD', 'JPY', 'CHF', 'AED', 'TRY'];
  const foreignCurrencies = currencies.filter(c => c.code !== 'GBP' && popularCurrencies.includes(c.code));

  if (foreignCurrencies.length === 0) {
    return null;
  }

  return (
    <div className="py-12 md:py-16">
      <FadeIn className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-blue sm:text-4xl">
          Our <span className="text-brand-yellow">Live Exchange Rates</span>
        </h2>
        <p className="mt-2 text-lg text-slate-500">
          We check our rates daily to ensure you get the best value.
        </p>
      </FadeIn>
      <Card className="overflow-visible p-0 md:p-0">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-semibold text-slate-600">Currency</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">We Sell (You Get)</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">We Buy (You Give)</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-center hidden md:table-cell">Action</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {foreignCurrencies.map(currency => {
                const rate = rates[currency.code];
                if (!rate) return null;

                // Deterministic pseudo-random trend for demo
                const isUp = currency.code.charCodeAt(0) % 2 === 0;

                return (
                  <motion.tr
                    key={currency.code}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="group border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{currency.flag_emoji}</span>
                        <div>
                          <p>{currency.code}</p>
                          <p className="text-xs text-slate-500 hidden sm:block">{currency.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-700">
                      {rate.customerBuys.toFixed(4)}
                      <TrendArrow isUp={isUp} />
                    </td>
                    <td className="p-4 text-right font-mono text-slate-700">
                      {rate.customerSells.toFixed(4)}
                      <TrendArrow isUp={!isUp} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => onSelectCurrency(currency, CalculatorMode.BUY_FOREIGN)}
                          className="bg-brand-yellow text-brand-blue font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wide hover:bg-yellow-400 transition-colors shadow-sm"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => onSelectCurrency(currency, CalculatorMode.SELL_FOREIGN)}
                          className="bg-white border border-slate-200 text-brand-blue font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() => setAlertCurrency(currency.code)}
                          className="bg-slate-100 text-slate-400 p-1.5 rounded hover:bg-slate-200 hover:text-brand-blue transition-colors relative group/tooltip"
                          aria-label="Set Rate Alert"
                        >
                          <BellIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </Card>
      <p className="text-center text-xs text-slate-500 mt-4">Rates are indicative and subject to change. Final rate confirmed at branch.</p>

      <AnimatePresence>
        {alertCurrency && rates[alertCurrency] && (
          <RateAlertModal
            isOpen={!!alertCurrency}
            onClose={() => setAlertCurrency(null)}
            currencyCode={alertCurrency}
            currentRate={rates[alertCurrency].customerBuys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveRatesTable;