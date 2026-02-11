import React, { useState, useEffect } from 'react';
import type { PhoneRepair, RepairStatus } from '../../types';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import db from '../../services/firestoreService';

// Status badge component
const StatusBadge: React.FC<{ status: RepairStatus }> = ({ status }) => {
    const colors: Record<RepairStatus, string> = {
        'Received': 'bg-blue-100 text-blue-700',
        'Diagnosing': 'bg-cyan-100 text-cyan-700',
        'Awaiting Parts': 'bg-orange-100 text-orange-700',
        'Repairing': 'bg-yellow-100 text-yellow-700',
        'Ready': 'bg-green-100 text-green-700',
        'Collected': 'bg-emerald-100 text-emerald-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
            {status}
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

// New repair modal
const NewRepairModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (repair: Partial<PhoneRepair>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        device_brand: '',
        device_model: '',
        issue_description: '',
        estimated_cost: '',
        branch: 'West Ealing',
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
            status: 'Received',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        onClose();
        // Reset form
        setFormData({
            customer_name: '', phone: '', device_brand: '', device_model: '',
            issue_description: '', estimated_cost: '', branch: 'West Ealing', notes: '',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">📱 New Repair Job</h2>
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description *</label>
                        <textarea
                            required
                            rows={2}
                            placeholder="e.g., Cracked screen, battery not charging, water damage"
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost (£)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 79.99"
                                value={formData.estimated_cost}
                                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
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
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            placeholder="Additional notes, customer requests, etc."
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
                            Create Repair Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PhoneRepairsTab: React.FC = () => {
    const [repairs, setRepairs] = useState<PhoneRepair[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | RepairStatus>('all');

    useEffect(() => {
        loadRepairs();
    }, []);

    const loadRepairs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'phone_repairs'), orderBy('created_at', 'desc'));
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
            })) as PhoneRepair[];
            setRepairs(data);
        } catch (error) {
            console.error('Error loading phone repairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewRepair = async (repairData: Partial<PhoneRepair>) => {
        try {
            await addDoc(collection(db, 'phone_repairs'), {
                ...repairData,
                created_at: new Date(),
                updated_at: new Date(),
            });
            loadRepairs();
        } catch (error) {
            console.error('Error creating repair:', error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: RepairStatus) => {
        try {
            await updateDoc(doc(db, 'phone_repairs', id), {
                status: newStatus,
                updated_at: new Date(),
            });
            setRepairs(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const activeStatuses: RepairStatus[] = ['Received', 'Diagnosing', 'Awaiting Parts', 'Repairing', 'Ready'];
    const filteredRepairs = repairs.filter(r => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return activeStatuses.includes(r.status);
        return r.status === statusFilter;
    });

    const stats = {
        total: repairs.length,
        inProgress: repairs.filter(r => ['Received', 'Diagnosing', 'Awaiting Parts', 'Repairing'].includes(r.status)).length,
        ready: repairs.filter(r => r.status === 'Ready').length,
        completed: repairs.filter(r => r.status === 'Collected').length,
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading phone repairs...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        🔧 Phone Repairs
                    </h2>
                    <p className="text-slate-500">Track repair jobs from intake to collection</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    <span>+</span> New Repair Job
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Jobs" value={stats.total} color="border-blue-500" />
                <StatCard title="In Progress" value={stats.inProgress} color="border-yellow-500" />
                <StatCard title="Ready for Collection" value={stats.ready} color="border-green-500" />
                <StatCard title="Collected" value={stats.completed} color="border-emerald-500" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'Received', 'Diagnosing', 'Repairing', 'Ready'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-brand-blue text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : status === 'active' ? '🔥 Active' : status}
                    </button>
                ))}
            </div>

            {/* Repairs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">Issue</th>
                                <th className="px-4 py-3">Cost</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRepairs.map((repair) => (
                                <tr key={repair.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800 text-sm">{repair.customer_name}</p>
                                        <p className="text-xs text-slate-400">{repair.phone}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-slate-800">{repair.device_brand}</p>
                                        <p className="text-xs text-slate-400">{repair.device_model}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                        {repair.issue_description}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                        {repair.estimated_cost ? `£${repair.estimated_cost}` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={repair.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={repair.status}
                                            onChange={(e) => handleStatusChange(repair.id, e.target.value as RepairStatus)}
                                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue"
                                        >
                                            <option value="Received">Received</option>
                                            <option value="Diagnosing">Diagnosing</option>
                                            <option value="Awaiting Parts">Awaiting Parts</option>
                                            <option value="Repairing">Repairing</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Collected">Collected</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredRepairs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No repair jobs found. Click "New Repair Job" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Repair Modal */}
            <NewRepairModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSave={handleNewRepair}
            />
        </div>
    );
};

export default PhoneRepairsTab;
