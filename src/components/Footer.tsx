import React from 'react';
import type { Store, SiteSettings } from '../types';
import { CalculatorMode } from '../types';
import FacebookIcon from './icons/FacebookIcon';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import InstagramIcon from './icons/InstagramIcon';

interface FooterProps {
    stores: Store[];
    siteSettings: SiteSettings;
    onNavigate: (path: string, mode?: CalculatorMode) => void;
}

const Footer: React.FC<FooterProps> = ({ stores, siteSettings, onNavigate }) => {

  const linkSections = [
    {
      title: 'Travel Money',
      links: [
        { label: 'Travel Money Services', action: () => onNavigate('/') },
        { label: 'Click & Collect', action: () => onNavigate('/', CalculatorMode.BUY_FOREIGN) },
        { label: 'Click & Sell', action: () => onNavigate('/', CalculatorMode.SELL_FOREIGN) },
        { label: 'Live Exchange Rates', action: () => onNavigate('/') },
      ],
    },
    {
      title: 'Quick Links',
      links: [
        { label: 'Store Finder', action: () => onNavigate('/contact') },
        { label: 'Blog', action: () => onNavigate('/blog') },
        { label: 'FAQs', action: undefined },
        { label: 'Money Transfers', action: () => onNavigate('/money-transfer') },
      ],
    },
     {
      title: 'Information',
      links: [
        { label: 'About Us', action: undefined },
        { label: 'Contact Us', action: () => onNavigate('/contact') },
        { label: 'Careers', action: undefined },
      ],
    },
  ];
  
  const legalLinks = [
      { label: 'Website Terms of Use'},
      { label: 'Cookie Policy'},
      { label: 'Privacy Policy'},
      { label: 'Site Map'},
  ];

  const socialLinks = [
    { key: 'social_facebook', label: 'Facebook', icon: <FacebookIcon className="w-6 h-6" />, href: siteSettings['social_facebook'] },
    { key: 'social_twitter', label: 'Twitter', icon: <TwitterIcon className="w-6 h-6" />, href: siteSettings['social_twitter'] },
    { key: 'social_linkedin', label: 'LinkedIn', icon: <LinkedInIcon className="w-6 h-6" />, href: siteSettings['social_linkedin'] },
    { key: 'social_instagram', label: 'Instagram', icon: <InstagramIcon className="w-6 h-6" />, href: siteSettings['social_instagram'] },
  ];

  const reviewLink = siteSettings['google_review_link'];

  const renderLink = (link: {label: string, action?: () => void}) => {
     const hasAction = link.action !== undefined;
     const Component = hasAction ? 'a' : 'span';
     const props = hasAction 
        ? { href: '#', onClick: (e: React.MouseEvent) => { e.preventDefault(); link.action?.(); } } 
        : {};

     return (
        <Component
            {...props}
            className={`text-sm ${hasAction ? 'text-slate-400 hover:text-white transition-colors' : 'text-slate-500 cursor-default'}`}
        >
            {link.label}
        </Component>
     );
  };

  return (
    <footer className="bg-brand-blue text-slate-300">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {linkSections.map(section => (
            <div key={section.title}>
              <h3 className="font-bold text-brand-yellow uppercase tracking-wider text-sm">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map(link => (
                  <li key={link.label}>
                    {renderLink(link)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
             <h3 className="font-bold text-brand-yellow uppercase tracking-wider text-sm">Follow Us</h3>
             <div className="flex space-x-4 mt-4">
                {socialLinks.map(social => (
                  social.href ? (
                    <a 
                      key={social.key} 
                      href={social.href} 
                      aria-label={social.label} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {social.icon}
                    </a>
                  ) : null
                ))}
             </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {stores.map(store => (
              <div key={store.store_id}>
                <h3 className="font-bold text-white">{store.name}</h3>
                <a href={store.map_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-slate-400 hover:text-white transition-colors">
                  {store.address}
                </a>
                <p className="mt-2">
                  <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="font-semibold text-slate-300 hover:text-white transition-colors">
                    {store.phone}
                  </a>
                </p>
              </div>
            ))}
          </div>
          {reviewLink && (
            <div className="text-left md:text-right">
                <h4 className="font-semibold text-white">Find us on Google</h4>
                <p className="text-sm text-slate-400 mt-1">Happy with our service? Please leave a review!</p>
                <a 
                    href={reviewLink}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-3 inline-block bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-400 transition-colors"
                >
                    Leave a Review
                </a>
            </div>
           )}
        </div>
      </div>
      <div className="bg-black/20 py-4">
        <div className="container mx-auto px-4 text-center md:flex md:justify-between text-xs text-slate-500">
            <div className="space-x-4">
                {legalLinks.map(link => (
                    <span key={link.label} className="cursor-default">{link.label}</span>
                ))}
            </div>
             <div className="mt-4 md:mt-0">
                 <button onClick={() => onNavigate('/admin')} className="text-slate-500 hover:text-slate-300 transition-colors">
                    Admin Panel
                 </button>
             </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;