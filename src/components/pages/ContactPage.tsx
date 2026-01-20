import React from 'react';
import type { Store } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import Card from '../ui/Card';

interface PageProps {
    stores: Store[];
    onNavigate: (path: string) => void;
}



interface PageProps {
    stores: Store[];
    onNavigate: (path: string) => void;
}

const ContactPage: React.FC<PageProps> = ({ stores, onNavigate }) => {
    const formatTel = (phone: string) => {
        if (!phone) return '';
        if (phone.startsWith('0')) {
            return `+44${phone.substring(1)}`.replace(/\s/g, '');
        }
        return phone.replace(/\s/g, '');
    };

    const getMapEmbedUrl = (storeName: string) => {
        // Use Google Maps Embed API (free tier/no-key logic for direct search queries if possible, but specific embeds are safer)
        // Since we don't have a backend returning embeds, we hardcode based on known branches.
        if (storeName.toLowerCase().includes('west ealing')) {
            return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.2863773199856!2d-0.3225888233764848!3d51.51261397181467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487612fd1742461d%3A0x6b00e37160759f2e!2s16%20The%20Broadway%2C%20London%20W13%200SR!5e0!3m2!1sen!2suk!4v1705600000000!5m2!1sen!2suk";
        }
        if (storeName.toLowerCase().includes('hanwell')) {
            return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.567822607997!2d-0.3396783233767891!3d51.50744997181358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876131b0a827461%3A0xe5452d24276182!2s111%20Uxbridge%20Rd%2C%20London%20W7%203ST!5e0!3m2!1sen!2suk!4v1705600000000!5m2!1sen!2suk";
        }
        return "";
    };

    return (
        <Card>
            <button onClick={() => onNavigate('/')} className="flex items-center text-sm font-semibold text-brand-blue hover:text-brand-yellow transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Home
            </button>
            <h1 className="text-3xl lg:text-4xl font-bold text-brand-blue mb-2">Contact & Locations</h1>
            <p className="text-slate-500 mb-8">Get in touch or visit us at one of our branches.</p>

            <div className="space-y-12">
                {stores.map(store => {
                    const embedUrl = getMapEmbedUrl(store.name);
                    return (
                        <div key={store.store_id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row">
                            <div className="p-8 md:w-1/3 flex flex-col justify-center">
                                <h2 className="text-2xl font-bold text-brand-blue mb-4">{store.name}</h2>
                                <div className="space-y-4 text-slate-600">
                                    <p className="flex items-start">
                                        <span className="mr-3 text-xl">📍</span>
                                        <a href={store.map_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">
                                            {store.address}
                                        </a>
                                    </p>
                                    <p className="flex items-center">
                                        <span className="mr-3 text-xl">📞</span>
                                        <a href={`tel:${formatTel(store.phone)}`} className="font-semibold hover:text-brand-yellow transition-colors">
                                            {store.phone}
                                        </a>
                                    </p>
                                    <p className="flex items-center">
                                        <span className="mr-3 text-xl">🕒</span>
                                        <span>Mon - Sat: 09:00 - 18:00</span>
                                    </p>
                                </div>
                            </div>
                            {embedUrl && (
                                <div className="md:w-2/3 bg-slate-200 min-h-[300px]">
                                    <iframe
                                        src={embedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '300px' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`Map of ${store.name}`}
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-8 bg-blue-50 rounded-xl text-center">
                <h3 className="text-xl font-bold text-brand-blue mb-2">Need help?</h3>
                <p className="text-slate-600 mb-6">Our team is available to answer any questions about your currency needs.</p>
                <div className="flex justify-center space-x-4">
                    <button className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">
                        Email Us
                    </button>
                    <button onClick={() => window.open('https://wa.me/447000000000', '_blank')} className="bg-[#25D366] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center">
                        WhatsApp
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ContactPage;
