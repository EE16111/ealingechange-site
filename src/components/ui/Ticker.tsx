import React from 'react';
import { motion } from 'framer-motion';

const Ticker: React.FC = () => {
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
                            <span className="flex items-center"><span className="text-green-400 mr-2">▲</span> GBP/USD 1.2500</span>
                            <span className="flex items-center"><span className="text-red-400 mr-2">▼</span> GBP/EUR 1.1550</span>
                            <span className="flex items-center"><span className="text-green-400 mr-2">▲</span> GBP/AUD 1.8850</span>
                            <span className="flex items-center"><span className="text-green-400 mr-2">▲</span> GBP/AED 4.5800</span>
                            <span className="flex items-center"><span className="text-red-400 mr-2">▼</span> GBP/THB 43.500</span>
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
