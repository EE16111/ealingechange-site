import React, { useEffect, useState } from 'react';
import type { AdminOrder } from '../../types';
import { getAdminData, updateOrderStatus } from '../../services/exchangeService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'bg-slate-100 text-slate-600';
    if (status === 'Completed') colorClass = 'bg-green-100 text-green-700';
    else if (status === 'Pending Collection') colorClass = 'bg-yellow-100 text-yellow-700';
    else if (status === 'Cancelled') colorClass = 'bg-red-100 text-red-700';
    else if (status === 'Chat Lead') colorClass = 'bg-blue-100 text-blue-700';
    else if (status === 'Processing') colorClass = 'bg-purple-100 text-purple-700';

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            {status}
        </span>
    );
};

const FulfillmentTab: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getAdminData();
            setOrders(data.recentOrders);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        } catch (err: any) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const statusOptions = ['Pending Collection', 'Processing', 'Completed', 'Cancelled'];

    if (loading) return <div className="p-12 text-center text-slate-500">Loading orders...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Order Fulfillment</h2>
                    <p className="text-slate-500">Manage pending orders and update their status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-slate-600">Filter:</label>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="p-2 border rounded-lg text-sm font-semibold"
                    >
                        <option>All</option>
                        {statusOptions.map(s => <option key={s}>{s}</option>)}
                        <option>Chat Lead</option>
                    </select>
                    <button onClick={loadOrders} className="ml-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200">
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Currency</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Branch</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map(order => (
                                <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm text-slate-600">{order.order_id}</p>
                                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 text-sm">{order.customer_name}</p>
                                        <p className="text-xs text-slate-400">{order.email}</p>
                                        <p className="text-xs text-slate-400">{order.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {order.currency_code || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.foreign_amount > 0 && (
                                            <p className="font-mono text-sm">{order.foreign_amount.toLocaleString()} {order.currency_code}</p>
                                        )}
                                        {order.gbp_amount > 0 && (
                                            <p className="text-xs text-slate-500">£{order.gbp_amount.toLocaleString()}</p>
                                        )}
                                        {order.gbp_amount === 0 && '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {order.collection_branch || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {order.status !== 'Completed' && order.status !== 'Cancelled' && order.status !== 'Chat Lead' && (
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusChange(order.order_id, e.target.value)}
                                                disabled={updatingOrderId === order.order_id}
                                                className="p-1 border rounded text-xs font-semibold"
                                            >
                                                {statusOptions.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        )}
                                        {order.status === 'Completed' && <span className="text-green-600 text-xs font-bold">Done</span>}
                                        {order.status === 'Cancelled' && <span className="text-red-400 text-xs">Cancelled</span>}
                                        {order.status === 'Chat Lead' && <span className="text-blue-500 text-xs">Lead</span>}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No orders found matching the current filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FulfillmentTab;
