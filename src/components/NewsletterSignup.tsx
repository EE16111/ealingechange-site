import React, { useState } from 'react';
import { addSubscriber } from '../services/exchangeService';
import type { SubscriberData } from '../types';
import Spinner from './ui/Spinner';
import CheckIcon from './icons/CheckIcon';

const NewsletterSignup: React.FC = () => {
    const [formData, setFormData] = useState<SubscriberData>({ firstName: '', lastName: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.email) {
            setError('Please provide at least a first name and email.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await addSubscriber(formData);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };
    
    if (success) {
        return (
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                     <div className="max-w-2xl mx-auto bg-green-50 text-green-800 p-8 rounded-lg">
                        <CheckIcon className="w-12 h-12 mx-auto text-green-500" />
                        <h2 className="text-2xl font-bold mt-4">Thank You!</h2>
                        <p className="mt-2">You've been successfully subscribed to our mailing list. Keep an eye on your inbox for great deals!</p>
                     </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-brand-blue">Sign up for <span className="text-brand-yellow">great rates</span></h2>
                    <p className="mt-4 text-slate-600">
                        Join our mailing list to stay up to date with the latest deals on rates, special travel money sales as well as news on our products and services.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full border-2 border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                            required
                        />
                         <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full border-2 border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                        />
                         <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border-2 border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-center mt-4 text-sm">{error}</p>}
                    <div className="mt-6 text-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-brand-yellow text-brand-blue font-bold py-3 px-12 rounded-md hover:bg-yellow-400 transition-colors disabled:bg-slate-400 flex items-center justify-center mx-auto"
                        >
                            {isLoading ? <Spinner /> : 'YES, SIGN ME UP!'}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-6 text-center max-w-xl mx-auto">
                        If you would like more information on how we handle your data or on how to unsubscribe from our mailing list, check our <a href="#" className="underline hover:text-slate-700">Terms and Conditions</a> and <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>. In order to send you email updates, we securely share your data with a third party email software provider who we allow to place additional cookies on your device.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default NewsletterSignup;