import React, { useEffect, useState } from 'react';
import type { AdminData } from '../../types';
import { getAdminData } from '../../services/exchangeService';

const StatCard: React.FC<{ title: string; value: string; subtext?: string; color: string }> = ({ title, value, subtext, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'bg-slate-100 text-slate-600';
    if (status === 'Completed') colorClass = 'bg-green-100 text-green-700';
    else if (status === 'Pending Collection') colorClass = 'bg-yellow-100 text-yellow-700';
    else if (status === 'Cancelled') colorClass = 'bg-red-100 text-red-700';
    else if (status === 'Chat Lead') colorClass = 'bg-blue-100 text-blue-700';

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            {status}
        </span>
    );
};

const DashboardTab: React.FC = () => {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getAdminData();
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Today's Overview</h2>
                <p className="text-slate-500">Here's what's happening at Ealing Exchange today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Orders Today"
                    value={data.dashboard.totalOrdersToday.toString()}
                    subtext="Processing"
                    color="border-brand-blue"
                />
                <StatCard
                    title="Volume (GBP)"
                    value={`£${data.dashboard.totalGbpToday.toLocaleString()}`}
                    subtext="Total transaction value"
                    color="border-brand-yellow"
                />
                <StatCard
                    title="Top Currency"
                    value="EUR"
                    subtext="Most traded today"
                    color="border-green-500"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Recent Orders</h3>
                    <button onClick={loadData} className="text-sm text-brand-blue hover:text-brand-yellow font-medium">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.recentOrders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{order.order_id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 text-sm">{order.customer_name}</p>
                                        <p className="text-xs text-slate-400">{order.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {order.currency_code ? `${order.currency_code}` : 'Lead'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-800">
                                        {order.gbp_amount > 0 ? `£${order.gbp_amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {data.recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No recent orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
