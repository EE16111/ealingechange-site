import React, { useState, useEffect } from 'react';
import type { PhoneBuyback, BuybackStatus } from '../../types';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import db from '../../services/firestoreService';

// Status badge component
const StatusBadge: React.FC<{ status: BuybackStatus }> = ({ status }) => {
    const colors: Record<BuybackStatus, string> = {
        'Quote Given': 'bg-blue-100 text-blue-700',
        'Accepted': 'bg-yellow-100 text-yellow-700',
        'Paid': 'bg-green-100 text-green-700',
        'Resold': 'bg-emerald-100 text-emerald-700',
        'Rejected': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
            {status}
        </span>
    );
};

// Condition badge
const ConditionBadge: React.FC<{ condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' }> = ({ condition }) => {
    const colors = {
        'Excellent': 'bg-emerald-100 text-emerald-700',
        'Good': 'bg-green-100 text-green-700',
        'Fair': 'bg-yellow-100 text-yellow-700',
        'Poor': 'bg-orange-100 text-orange-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[condition]}`}>
            {condition}
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

// New buyback modal
const NewBuybackModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (buyback: Partial<PhoneBuyback>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        device_brand: '',
        device_model: '',
        storage_gb: 64,
        condition: 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor',
        quoted_price: '',
        branch: 'West Ealing',
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            quoted_price: parseFloat(formData.quoted_price) || 0,
            status: 'Quote Given',
            created_at: new Date().toISOString(),
        });
        onClose();
        // Reset form
        setFormData({
            customer_name: '', phone: '', device_brand: '', device_model: '',
            storage_gb: 64, condition: 'Good', quoted_price: '', branch: 'West Ealing', notes: '',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">💰 New Phone Trade-In</h2>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Device Brand *</label>
                            <select
                                required
                                value={formData.device_brand}
                                onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="">Select brand...</option>
                                <option value="Apple">Apple</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Google">Google</option>
                                <option value="Huawei">Huawei</option>
                                <option value="OnePlus">OnePlus</option>
                                <option value="Xiaomi">Xiaomi</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Device Model *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., iPhone 14 Pro, Galaxy S23"
                                value={formData.device_model}
                                onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Storage (GB)</label>
                            <select
                                value={formData.storage_gb}
                                onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="32">32 GB</option>
                                <option value="64">64 GB</option>
                                <option value="128">128 GB</option>
                                <option value="256">256 GB</option>
                                <option value="512">512 GB</option>
                                <option value="1024">1 TB</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quote (£) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1"
                                placeholder="e.g., 250"
                                value={formData.quoted_price}
                                onChange={(e) => setFormData({ ...formData, quoted_price: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                        <select
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        >
                            <option value="West Ealing">West Ealing</option>
                            <option value="Hanwell">Hanwell</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            placeholder="Any scratches, issues, accessories included, etc."
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
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                        >
                            💰 Create Trade-In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PhoneBuybackTab: React.FC = () => {
    const [buybacks, setBuybacks] = useState<PhoneBuyback[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | BuybackStatus>('all');

    useEffect(() => {
        loadBuybacks();
    }, []);

    const loadBuybacks = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'phone_buyback'), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
            })) as PhoneBuyback[];
            setBuybacks(data);
        } catch (error) {
            console.error('Error loading phone buybacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewBuyback = async (buybackData: Partial<PhoneBuyback>) => {
        try {
            await addDoc(collection(db, 'phone_buyback'), {
                ...buybackData,
                created_at: new Date(),
            });
            loadBuybacks();
        } catch (error) {
            console.error('Error creating buyback:', error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: BuybackStatus, paidPrice?: number) => {
        try {
            const updates: any = { status: newStatus };
            if (newStatus === 'Paid' && paidPrice) {
                updates.paid_price = paidPrice;
            }
            await updateDoc(doc(db, 'phone_buyback', id), updates);
            setBuybacks(prev => prev.map(b =>
                b.id === id ? { ...b, status: newStatus, paid_price: paidPrice } : b
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredBuybacks = statusFilter === 'all'
        ? buybacks
        : buybacks.filter(b => b.status === statusFilter);

    const stats = {
        total: buybacks.length,
        pending: buybacks.filter(b => b.status === 'Quote Given').length,
        purchased: buybacks.filter(b => b.status === 'Paid').length,
        totalSpent: buybacks
            .filter(b => b.paid_price)
            .reduce((sum, b) => sum + (b.paid_price || 0), 0),
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading phone trade-ins...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        💰 Phone Buyback
                    </h2>
                    <p className="text-slate-500">Instant cash for phones - track trade-ins</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2"
                >
                    <span>+</span> New Trade-In
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Quotes" value={stats.total} color="border-blue-500" />
                <StatCard title="Pending" value={stats.pending} color="border-yellow-500" />
                <StatCard title="Purchased" value={stats.purchased} color="border-green-500" />
                <StatCard title="Total Spent" value={`£${stats.totalSpent}`} color="border-purple-500" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'Quote Given', 'Accepted', 'Paid', 'Resold', 'Rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : status}
                    </button>
                ))}
            </div>

            {/* Buybacks Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">Condition</th>
                                <th className="px-4 py-3">Quote</th>
                                <th className="px-4 py-3">Paid</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBuybacks.map((buyback) => (
                                <tr key={buyback.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800 text-sm">{buyback.customer_name}</p>
                                        <p className="text-xs text-slate-400">{buyback.phone}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-slate-800">{buyback.device_brand} {buyback.device_model}</p>
                                        <p className="text-xs text-slate-400">{buyback.storage_gb} GB</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <ConditionBadge condition={buyback.condition} />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                                        £{buyback.quoted_price}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                        {buyback.paid_price ? `£${buyback.paid_price}` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={buyback.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={buyback.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as BuybackStatus;
                                                if (newStatus === 'Paid' && !buyback.paid_price) {
                                                    handleStatusChange(buyback.id, newStatus, buyback.quoted_price);
                                                } else {
                                                    handleStatusChange(buyback.id, newStatus);
                                                }
                                            }}
                                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="Quote Given">Quote Given</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Resold">Resold</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredBuybacks.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        No trade-ins found. Click "New Trade-In" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Buyback Modal */}
            <NewBuybackModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSave={handleNewBuyback}
            />
        </div>
    );
};

export default PhoneBuybackTab;
