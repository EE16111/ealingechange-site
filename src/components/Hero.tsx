import React from 'react';
import type { Currency, ExchangeRates, Store, CalculatorMode } from '../types';
import CalculatorHub from './CalculatorHub';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import CommissionIcon from './icons/CommissionIcon';
import LocationIcon from './icons/LocationIcon';
import { FadeIn, ScaleIn } from './ui/Motion';
import Ticker from './ui/Ticker';

interface Props {
  currencies: Currency[];
  rates: ExchangeRates;
  stores: Store[];
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
  initialSelectedCurrency: string;
}

const Hero: React.FC<Props> = (props) => {
  const features = [
    { icon: <CommissionIcon className="w-6 h-6 text-brand-yellow" />, text: '0% Commission Fees' },
    { icon: <CheckBadgeIcon className="w-6 h-6 text-brand-yellow" />, text: '5-Star Rated Service' },
    { icon: <LocationIcon className="w-6 h-6 text-brand-yellow" />, text: 'Reserve Online, Collect In-Store' },
  ];

  return (
    <section className="relative bg-white pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20">
        <Ticker />
      </div>
      <div className="container mx-auto px-4 mt-8">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 items-center">

          <FadeIn className="text-center md:text-left" delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-brand-blue">
              London's <span className="text-brand-yellow">Best Rates</span>,
              <br className="hidden md:block" />
              Right on Your High Street.
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
              Check our live exchange rates, reserve your currency online in seconds, and collect from our branches in West Ealing or Hanwell.
            </p>
            <ul className="mt-8 space-y-4 max-w-md mx-auto md:mx-0">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center md:justify-start space-x-3">
                  {feature.icon}
                  <span className="font-semibold text-slate-700">{feature.text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          <ScaleIn delay={0.3} className="relative z-10 w-full max-w-md mx-auto md:max-w-none">
            <CalculatorHub {...props} />
          </ScaleIn>

        </div>
      </div>
    </section>
  );
};

export default Hero;