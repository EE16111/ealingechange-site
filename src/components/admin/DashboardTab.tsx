import React, { useEffect, useState } from 'react';
import type { AdminData } from '../../types';
import { getAdminData } from '../../services/exchangeService';

// Stat card component with icon support
const StatCard: React.FC<{
    title: string;
    value: string;
    subtext?: string;
    color: string;
    icon?: string;
}> = ({ title, value, subtext, color, icon }) => (
    <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase">{title}</h3>
                <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
                {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
            {icon && <span className="text-2xl opacity-60">{icon}</span>}
        </div>
    </div>
);

// Recent activity item
const ActivityItem: React.FC<{
    icon: string;
    text: string;
    time: string;
    type: string;
}> = ({ icon, text, time, type }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 font-medium truncate">{text}</p>
            <p className="text-xs text-slate-400">{type} • {time}</p>
        </div>
    </div>
);

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
            const currencyData = await getAdminData();
            setData(currencyData);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    const topCurrencies = data?.dashboard.volumeByCurrency
        ? Object.entries(data.dashboard.volumeByCurrency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
        : [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ealing Exchange Dashboard</h2>
                    <p className="text-slate-500">Currency exchange overview</p>
                </div>
                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    title="Orders Today"
                    value={data?.dashboard.totalOrdersToday.toString() || '0'}
                    subtext="Currency reservations"
                    color="border-blue-500"
                    icon="💱"
                />
                <StatCard
                    title="Volume Today"
                    value={`£${data?.dashboard.totalGbpToday.toLocaleString() || 0}`}
                    subtext="GBP exchanged"
                    color="border-green-500"
                    icon="💷"
                />
                <StatCard
                    title="Total Customers"
                    value={data?.customers.length.toString() || '0'}
                    subtext="All time"
                    color="border-amber-500"
                    icon="👥"
                />
            </div>

            {/* Top Currencies & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">Recent Orders</h3>
                    </div>
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {data?.recentOrders.slice(0, 10).map((order, idx) => (
                            <ActivityItem
                                key={idx}
                                icon="💱"
                                text={`${order.customer_name} — ${order.currency_code} £${order.gbp_amount}`}
                                time={new Date(order.created_at).toLocaleDateString()}
                                type={`${order.collection_branch} • ${order.status}`}
                            />
                        ))}
                        {(!data?.recentOrders || data.recentOrders.length === 0) && (
                            <p className="text-slate-500 text-center py-8">No recent orders</p>
                        )}
                    </div>
                </div>

                {/* Top Currencies */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">📊 Top Currencies</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {topCurrencies.map(([code, volume]) => (
                            <div key={code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="font-bold text-slate-700">{code}</span>
                                <span className="text-sm font-medium text-slate-600">£{volume.toLocaleString()}</span>
                            </div>
                        ))}
                        {topCurrencies.length === 0 && (
                            <p className="text-slate-500 text-center py-4">No volume data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
