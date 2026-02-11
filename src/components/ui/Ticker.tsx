import React from 'react';
import { motion } from 'framer-motion';
import type { ExchangeRates } from '../../types';

interface Props {
    rates: ExchangeRates;
}

const Ticker: React.FC<Props> = ({ rates }) => {
    // Get rates from Firebase, with fallbacks
    const tickerItems = [
        { code: 'USD', name: 'GBP/USD', rate: rates?.USD?.customerBuys || 1.31 },
        { code: 'EUR', name: 'GBP/EUR', rate: rates?.EUR?.customerBuys || 1.18 },
        { code: 'AUD', name: 'GBP/AUD', rate: rates?.AUD?.customerBuys || 1.88 },
        { code: 'AED', name: 'GBP/AED', rate: rates?.AED?.customerBuys || 4.58 },
        { code: 'THB', name: 'GBP/THB', rate: rates?.THB?.customerBuys || 43.5 },
    ];

    return (
        <div className="bg-brand-blue text-white overflow-hidden py-2 relative z-20">
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex space-x-12 px-4"
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                >
                    {[...Array(4)].map((_, i) => (
                        <React.Fragment key={i}>
                            {tickerItems.map((item, idx) => (
                                <span key={`${i}-${item.code}`} className="flex items-center">
                                    <span className={`mr-2 ${idx % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {idx % 2 === 0 ? '▲' : '▼'}
                                    </span>
                                    {item.name} {item.rate.toFixed(4)}
                                </span>
                            ))}
                            <span className="text-brand-yellow font-bold">★ 0% Commission on ALL exchanges ★</span>
                            <span className="text-white font-semibold">Best rates guaranteed in West London</span>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Ticker;
