import React, { useState, useEffect } from 'react';
import type { UmrahEnquiry, UmrahStatus, UmrahPackageTier } from '../../types';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import db from '../../services/firestoreService';

// Status badge component
const StatusBadge: React.FC<{ status: UmrahStatus }> = ({ status }) => {
    const colors: Record<UmrahStatus, string> = {
        'Enquiry': 'bg-blue-100 text-blue-700',
        'Quoted': 'bg-yellow-100 text-yellow-700',
        'Confirmed': 'bg-purple-100 text-purple-700',
        'Paid': 'bg-green-100 text-green-700',
        'Completed': 'bg-emerald-100 text-emerald-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
            {status}
        </span>
    );
};

// Package tier badge
const TierBadge: React.FC<{ tier: UmrahPackageTier }> = ({ tier }) => {
    const colors: Record<UmrahPackageTier, string> = {
        '3-Star': 'bg-slate-100 text-slate-700',
        '4-Star': 'bg-blue-100 text-blue-700',
        '5-Star': 'bg-amber-100 text-amber-700',
        'Custom': 'bg-purple-100 text-purple-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[tier]}`}>
            {tier}
        </span>
    );
};

// Stat card component
const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${color}`}>
        <h3 className="text-xs font-semibold text-slate-500 uppercase">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
);

// New enquiry modal
const NewEnquiryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (enquiry: Partial<UmrahEnquiry>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        email: '',
        phone: '',
        adults: 1,
        children: 0,
        preferred_dates: '',
        duration_nights: 10,
        package_tier: '4-Star' as UmrahPackageTier,
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            status: 'Enquiry',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">New Umrah Enquiry</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adults</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.adults}
                                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Children</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.children}
                                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nights</label>
                            <input
                                type="number"
                                min="5"
                                value={formData.duration_nights}
                                onChange={(e) => setFormData({ ...formData, duration_nights: parseInt(e.target.value) || 10 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Package</label>
                            <select
                                value={formData.package_tier}
                                onChange={(e) => setFormData({ ...formData, package_tier: e.target.value as UmrahPackageTier })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="3-Star">3-Star</option>
                                <option value="4-Star">4-Star</option>
                                <option value="5-Star">5-Star</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Travel Dates</label>
                        <input
                            type="text"
                            placeholder="e.g., March 2026, Ramadan, flexible"
                            value={formData.preferred_dates}
                            onChange={(e) => setFormData({ ...formData, preferred_dates: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            placeholder="Special requirements, budget range, etc."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold"
                        >
                            Save Enquiry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UmrahTab: React.FC = () => {
    const [enquiries, setEnquiries] = useState<UmrahEnquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [filter, setFilter] = useState<'all' | UmrahStatus>('all');

    useEffect(() => {
        loadEnquiries();
    }, []);

    const loadEnquiries = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'umrah_enquiries'), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
                updated_at: doc.data().updated_at instanceof Timestamp
                    ? doc.data().updated_at.toDate().toISOString()
                    : doc.data().updated_at,
            })) as UmrahEnquiry[];
            setEnquiries(data);
        } catch (error) {
            console.error('Error loading Umrah enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewEnquiry = async (enquiryData: Partial<UmrahEnquiry>) => {
        try {
            await addDoc(collection(db, 'umrah_enquiries'), {
                ...enquiryData,
                created_at: new Date(),
                updated_at: new Date(),
            });
            loadEnquiries();
        } catch (error) {
            console.error('Error creating enquiry:', error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: UmrahStatus) => {
        try {
            await updateDoc(doc(db, 'umrah_enquiries', id), {
                status: newStatus,
                updated_at: new Date(),
            });
            setEnquiries(prev => prev.map(e =>
                e.id === id ? { ...e, status: newStatus, updated_at: new Date().toISOString() } : e
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredEnquiries = filter === 'all'
        ? enquiries
        : enquiries.filter(e => e.status === filter);

    const stats = {
        total: enquiries.length,
        active: enquiries.filter(e => !['Completed', 'Cancelled'].includes(e.status)).length,
        thisMonth: enquiries.filter(e => {
            const date = new Date(e.created_at);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
        totalPax: enquiries.filter(e => !['Cancelled'].includes(e.status))
            .reduce((sum, e) => sum + e.adults + e.children, 0),
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading Umrah enquiries...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        🕌 Umrah Enquiries
                    </h2>
                    <p className="text-slate-500">Manage Umrah package enquiries and bookings</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    <span>+</span> New Enquiry
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Enquiries" value={stats.total} color="border-blue-500" />
                <StatCard title="Active" value={stats.active} color="border-yellow-500" />
                <StatCard title="This Month" value={stats.thisMonth} color="border-green-500" />
                <StatCard title="Total Pax" value={stats.totalPax} color="border-purple-500" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'Enquiry', 'Quoted', 'Confirmed', 'Paid', 'Completed', 'Cancelled'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === status
                            ? 'bg-brand-blue text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : status}
                    </button>
                ))}
            </div>

            {/* Enquiries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Group</th>
                                <th className="px-4 py-3">Package</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEnquiries.map((enquiry) => (
                                <tr key={enquiry.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800 text-sm">{enquiry.customer_name}</p>
                                        <p className="text-xs text-slate-400">{enquiry.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {enquiry.adults} adults{enquiry.children > 0 && `, ${enquiry.children} children`}
                                    </td>
                                    <td className="px-4 py-3">
                                        <TierBadge tier={enquiry.package_tier} />
                                        <span className="text-xs text-slate-400 ml-2">{enquiry.duration_nights} nights</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {enquiry.preferred_dates || 'TBD'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={enquiry.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={enquiry.status}
                                            onChange={(e) => handleStatusChange(enquiry.id, e.target.value as UmrahStatus)}
                                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue"
                                        >
                                            <option value="Enquiry">Enquiry</option>
                                            <option value="Quoted">Quoted</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredEnquiries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No enquiries found. Click "New Enquiry" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Enquiry Modal */}
            <NewEnquiryModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSave={handleNewEnquiry}
            />
        </div>
    );
};

export default UmrahTab;
