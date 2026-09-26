import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import Card from '../ui/Card';

declare global {
  interface Window {
    L: unknown;
  }
}

interface PageProps {
    stores: Store[];
}

const ContactPage: React.FC<PageProps> = ({ stores }) => {
    const mapRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        // Load Leaflet from CDN if not already loaded
        if (!window.L) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => initMaps();
            document.body.appendChild(script);
        } else {
            initMaps();
        }

        function initMaps() {
            const leaflet = window.L as {
                map: (container: HTMLElement) => { setView: (center: [number, number], zoom: number) => unknown };
                tileLayer: (url: string, options: { attribution: string }) => { addTo: (map: unknown) => void };
                marker: (latlng: [number, number]) => { addTo: (map: unknown) => { bindPopup: (html: string) => { openPopup: () => void } } };
            };

            stores.forEach(store => {
                const container = mapRefs.current[store.store_id];
                if (container && !container.innerHTML) {
                const lat = store.lat || (store.name.toLowerCase().includes('west ealing') ? 51.5126 : 51.5074);
                    const lng = store.lng || (store.name.toLowerCase().includes('west ealing') ? -0.3225 : -0.3396);
                    
                    const map = leaflet.map(container).setView([lat, lng], 15);
                    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);

                    leaflet.marker([lat, lng]).addTo(map)
                        .bindPopup(`<b>${store.name}</b><br>${store.address}`)
                        .openPopup();
                }
            });
        }
    }, [stores]);

    const formatTel = (phone: string) => {
        if (!phone) return '';
        if (phone.startsWith('0')) {
            return `+44${phone.substring(1)}`.replace(/\s/g, '');
        }
        return phone.replace(/\s/g, '');
    };

    return (
        <Card>
            <Link to="/" className="flex items-center text-sm font-semibold text-brand-blue hover:text-brand-yellow transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded w-fit">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Home
            </Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-brand-blue mb-2">Contact & Locations</h1>
            <p className="text-slate-500 mb-8">Get in touch or visit us at one of our branches.</p>

            <div className="space-y-12">
                {stores.map(store => {
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
                            <div 
                                className="md:w-2/3 bg-slate-200 min-h-[300px] z-0" 
                                ref={el => mapRefs.current[store.store_id] = el}
                            >
                                {/* Map loads here */}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-8 bg-blue-50 rounded-xl text-center">
                <h3 className="text-xl font-bold text-brand-blue mb-2">Need help?</h3>
                <p className="text-slate-600 mb-6">Our team is available to answer any questions about your currency needs.</p>
                <div className="flex justify-center space-x-4">
                    <a href="mailto:info@ealingexchange.co.uk" className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors inline-block">
                        Email Us
                    </a>
                    <button onClick={() => window.open('https://wa.me/447597635092', '_blank')} className="bg-[#25D366] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center">
                        WhatsApp
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ContactPage;
