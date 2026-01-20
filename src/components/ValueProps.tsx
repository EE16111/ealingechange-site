import React from 'react';
import StoreIcon from './icons/StoreIcon';
import StarIcon from './icons/StarIcon';
import ExpertIcon from './icons/ExpertIcon';

const ValueProps: React.FC = () => {
  const features = [
    {
      icon: <StoreIcon className="w-16 h-16 text-brand-yellow" />,
      title: 'Convenient',
      description: "Reserve your currency online in minutes and pick it up from our easily accessible West Ealing and Hanwell branches.",
    },
    {
      icon: <StarIcon className="w-16 h-16 text-brand-yellow" />,
      title: 'Competitive',
      description: "You'll have more cash for your trip thanks to our fantastic exchange rates, 0% commission, and no hidden fees.",
    },
    {
      icon: <ExpertIcon className="w-16 h-16 text-brand-yellow" />,
      title: 'Trusted',
      description: "As your local currency specialists, we offer friendly, expert service you can rely on for the best value.",
    },
  ];

  return (
    <div className="py-12 md:py-16 bg-white mt-12 md:mt-16 rounded-xl border border-slate-200/80 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-blue sm:text-4xl">
            Why Choose <span className="text-brand-yellow">Ealing Exchange?</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            We're dedicated to providing the best value and service for your travel money needs.
          </p>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-1 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="flex items-center justify-center h-20">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-800">{feature.title}</h3>
              <p className="mt-2 text-base text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValueProps;