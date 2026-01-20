import React, { useState } from 'react';
import { CalculatorMode } from '../types';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';

interface HeaderProps {
    onNavigate: (path: string, mode?: CalculatorMode) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNav = (path: string, mode?: CalculatorMode) => {
        onNavigate(path, mode);
        setIsMobileMenuOpen(false);
    };

    const navLinks = (
        <>
            <button onClick={() => handleNav('/', CalculatorMode.BUY_FOREIGN)} className="block md:inline-block w-full text-left md:text-center text-slate-700 hover:text-brand-yellow transition-colors px-3 py-2 rounded-md font-medium">Buy Currency</button>
            <button onClick={() => handleNav('/', CalculatorMode.SELL_FOREIGN)} className="block md:inline-block w-full text-left md:text-center text-slate-700 hover:text-brand-yellow transition-colors px-3 py-2 rounded-md font-medium">Sell Currency</button>
            <button onClick={() => handleNav('/')} className="block md:inline-block w-full text-left md:text-center text-slate-700 hover:text-brand-yellow transition-colors px-3 py-2 rounded-md font-medium">Live Rates</button>
            <button onClick={() => handleNav('/blog')} className="block md:inline-block w-full text-left md:text-center text-slate-700 hover:text-brand-yellow transition-colors px-3 py-2 rounded-md font-medium">Blog</button>
            <button onClick={() => handleNav('/contact')} className="block md:inline-block w-full text-left md:text-center text-slate-700 hover:text-brand-yellow transition-colors px-3 py-2 rounded-md font-medium">Contact</button>
        </>
    );

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <button onClick={() => onNavigate('/')} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-yellow rounded-md text-left">
                        <div className="text-2xl font-extrabold text-brand-blue">
                        Ealing <span className="text-brand-yellow">Exchange</span>
                        </div>
                    </button>
                    
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks}
                    </nav>

                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-brand-yellow hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-yellow"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
                 <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200">
                    {navLinks}
                </nav>
            </div>
        </header>
    );
};

export default Header;