import React from 'react';
import ReserveIcon from './icons/ReserveIcon';
import EmailConfirmIcon from './icons/EmailConfirmIcon';
import StoreIcon from './icons/StoreIcon';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <ReserveIcon className="w-10 h-10 text-brand-blue" />,
            title: '1. Check Rates & Reserve',
            description: 'Use our calculator to find your rate and reserve your currency online.'
        },
        {
            icon: <EmailConfirmIcon className="w-10 h-10 text-brand-blue" />,
            title: '2. Get Confirmation',
            description: 'Receive an instant email confirmation with your order details and a barcode.'
        },
        {
            icon: <StoreIcon className="w-10 h-10 text-brand-blue" />,
            title: '3. Collect In-Store',
            description: 'Visit your chosen branch with your ID and email to collect your cash.'
        }
    ];

    return (
        <div className="py-12 md:py-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-brand-blue sm:text-4xl">
                    Just <span className="text-brand-yellow">Three Simple Steps</span>
                </h2>
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px">
                    <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" strokeDasharray="8, 8" className="stroke-slate-300" /></svg>
                </div>
                {steps.map((step) => (
                    <div key={step.title} className="relative flex flex-col items-center bg-slate-50 z-10 px-4">
                        <div className="flex-shrink-0 bg-brand-yellow/20 p-4 rounded-full">
                            {step.icon}
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-slate-800">{step.title}</h3>
                        <p className="mt-2 text-base text-slate-500 max-w-xs">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HowItWorks;