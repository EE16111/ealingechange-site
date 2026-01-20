import React, { useState } from 'react';
import type { LeadData } from '../types';

interface Props {
    onSubmit: (data: LeadData) => void;
    currency?: string;
    amount?: string;
}

const LeadCaptureForm: React.FC<Props> = ({ onSubmit, currency, amount }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            email,
            phone,
            currency,
            amount
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mt-2 max-w-xs">
            <h4 className="font-bold text-sm mb-3 text-slate-800">Request a Quote</h4>
            {currency && <p className="text-xs text-slate-500 mb-3">Interested in: {amount} {currency}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="sr-only">Name</label>
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                    />
                </div>
                <div>
                    <label className="sr-only">Email</label>
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                    />
                </div>
                <div>
                    <label className="sr-only">Phone</label>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-brand-blue text-white py-2 rounded text-sm font-semibold hover:bg-slate-700 transition"
                >
                    Send Request
                </button>
            </form>
        </div>
    );
};

export default LeadCaptureForm;
