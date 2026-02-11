import React, { useEffect, useState } from 'react';
import type { AdminData, UmrahEnquiry, TravelBooking, PhoneRepair, PhoneBuyback } from '../../types';
import { getAdminData } from '../../services/exchangeService';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import db from '../../services/firestoreService';

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

// Service section card
const ServiceSection: React.FC<{
    title: string;
    icon: string;
    stats: { label: string; value: string | number; highlight?: boolean }[];
    color: string;
}> = ({ title, icon, stats, color }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`}>
        <div className={`px-4 py-3 ${color} flex items-center gap-2`}>
            <span className="text-xl">{icon}</span>
            <h3 className="font-bold text-white">{title}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
            {stats.map((stat, idx) => (
                <div key={idx} className={stat.highlight ? 'col-span-2 bg-slate-50 rounded-lg p-2' : ''}>
                    <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                    <p className={`font-bold ${stat.highlight ? 'text-lg text-slate-800' : 'text-slate-700'}`}>
                        {stat.value}
                    </p>
                </div>
            ))}
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

interface DashboardStats {
    currency: AdminData | null;
    umrah: UmrahEnquiry[];
    travel: TravelBooking[];
    repairs: PhoneRepair[];
    buyback: PhoneBuyback[];
}

const DashboardTab: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        currency: null,
        umrah: [],
        travel: [],
        repairs: [],
        buyback: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load currency data
            const currencyData = await getAdminData();

            // Load Umrah enquiries
            const umrahSnapshot = await getDocs(query(collection(db, 'umrah_enquiries'), orderBy('created_at', 'desc'), limit(20)));
            const umrahData = umrahSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
            })) as UmrahEnquiry[];

            // Load Travel bookings
            const travelSnapshot = await getDocs(query(collection(db, 'travel_bookings'), orderBy('created_at', 'desc'), limit(20)));
            const travelData = travelSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
            })) as TravelBooking[];

            // Load Phone repairs
            const repairsSnapshot = await getDocs(query(collection(db, 'phone_repairs'), orderBy('created_at', 'desc'), limit(20)));
            const repairsData = repairsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
            })) as PhoneRepair[];

            // Load Phone buyback
            const buybackSnapshot = await getDocs(query(collection(db, 'phone_buyback'), orderBy('created_at', 'desc'), limit(20)));
            const buybackData = buybackSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at instanceof Timestamp
                    ? doc.data().created_at.toDate().toISOString()
                    : doc.data().created_at,
            })) as PhoneBuyback[];

            setStats({
                currency: currencyData,
                umrah: umrahData,
                travel: travelData,
                repairs: repairsData,
                buyback: buybackData,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    // Calculate stats
    const activeUmrah = stats.umrah.filter(e => !['Completed', 'Cancelled'].includes(e.status)).length;
    const activeTravel = stats.travel.filter(b => !['Completed', 'Cancelled'].includes(b.status)).length;
    const activeRepairs = stats.repairs.filter(r => !['Collected', 'Cancelled'].includes(r.status)).length;
    const pendingBuyback = stats.buyback.filter(b => b.status === 'Quote Given').length;

    const totalPax = stats.umrah.reduce((sum, e) => sum + e.adults + (e.children || 0), 0);
    const repairRevenue = stats.repairs.reduce((sum, r) => sum + (r.final_cost || r.estimated_cost || 0), 0);
    const buybackSpent = stats.buyback.filter(b => b.paid_price).reduce((sum, b) => sum + (b.paid_price || 0), 0);

    // Build recent activity feed
    const recentActivity: { icon: string; text: string; time: string; type: string; date: Date }[] = [];

    // Add currency orders
    stats.currency?.recentOrders.slice(0, 5).forEach(order => {
        recentActivity.push({
            icon: '💱',
            text: `${order.customer_name} - ${order.currency_code} £${order.gbp_amount}`,
            time: new Date(order.created_at).toLocaleDateString(),
            type: 'Currency',
            date: new Date(order.created_at)
        });
    });

    // Add Umrah
    stats.umrah.slice(0, 3).forEach(e => {
        recentActivity.push({
            icon: '🕌',
            text: `${e.customer_name} - ${e.adults + (e.children || 0)} pax ${e.package_tier}`,
            time: new Date(e.created_at).toLocaleDateString(),
            type: 'Umrah',
            date: new Date(e.created_at)
        });
    });

    // Add Travel
    stats.travel.slice(0, 3).forEach(b => {
        recentActivity.push({
            icon: '✈️',
            text: `${b.customer_name} - ${b.destination}`,
            time: new Date(b.created_at).toLocaleDateString(),
            type: 'Travel',
            date: new Date(b.created_at)
        });
    });

    // Add Repairs
    stats.repairs.slice(0, 3).forEach(r => {
        recentActivity.push({
            icon: '🔧',
            text: `${r.customer_name} - ${r.device_brand} ${r.device_model}`,
            time: new Date(r.created_at).toLocaleDateString(),
            type: 'Repair',
            date: new Date(r.created_at)
        });
    });

    // Sort by date
    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Travel Time Global Dashboard</h2>
                    <p className="text-slate-500">Unified view of all business services</p>
                </div>
                <button
                    onClick={loadAllData}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    🔄 Refresh All
                </button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                    title="Currency Orders"
                    value={stats.currency?.dashboard.totalOrdersToday.toString() || '0'}
                    subtext="Today"
                    color="border-blue-500"
                    icon="💱"
                />
                <StatCard
                    title="Umrah Pipeline"
                    value={activeUmrah.toString()}
                    subtext={`${totalPax} pax total`}
                    color="border-emerald-500"
                    icon="🕌"
                />
                <StatCard
                    title="Travel Active"
                    value={activeTravel.toString()}
                    subtext="Bookings in progress"
                    color="border-sky-500"
                    icon="✈️"
                />
                <StatCard
                    title="Repairs Queue"
                    value={activeRepairs.toString()}
                    subtext="In progress"
                    color="border-orange-500"
                    icon="🔧"
                />
                <StatCard
                    title="Buyback Pending"
                    value={pendingBuyback.toString()}
                    subtext="Awaiting decision"
                    color="border-green-500"
                    icon="💰"
                />
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServiceSection
                    title="Currency Exchange"
                    icon="💱"
                    color="bg-blue-600"
                    stats={[
                        { label: 'Today Volume', value: `£${stats.currency?.dashboard.totalGbpToday.toLocaleString() || 0}`, highlight: true },
                        { label: 'Orders Today', value: stats.currency?.dashboard.totalOrdersToday || 0 },
                        { label: 'Total Customers', value: stats.currency?.customers.length || 0 },
                    ]}
                />
                <ServiceSection
                    title="Umrah Packages"
                    icon="🕌"
                    color="bg-emerald-600"
                    stats={[
                        { label: 'Total Enquiries', value: stats.umrah.length, highlight: true },
                        { label: 'Active', value: activeUmrah },
                        { label: 'Total Passengers', value: totalPax },
                    ]}
                />
                <ServiceSection
                    title="Flights & Hotels"
                    icon="✈️"
                    color="bg-sky-600"
                    stats={[
                        { label: 'Total Bookings', value: stats.travel.length, highlight: true },
                        { label: 'Active', value: activeTravel },
                        { label: 'Flights', value: stats.travel.filter(t => t.booking_type === 'Flight').length },
                    ]}
                />
                <ServiceSection
                    title="Phone Services"
                    icon="📱"
                    color="bg-orange-600"
                    stats={[
                        { label: 'Repair Revenue', value: `£${repairRevenue}`, highlight: true },
                        { label: 'Active Repairs', value: activeRepairs },
                        { label: 'Buyback Spent', value: `£${buybackSpent}` },
                    ]}
                />
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">Recent Activity</h3>
                    </div>
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {recentActivity.slice(0, 10).map((activity, idx) => (
                            <ActivityItem key={idx} {...activity} />
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-slate-500 text-center py-8">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">⚡ Needs Attention</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {activeRepairs > 0 && (
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>🔧</span>
                                    <span className="text-sm font-medium text-orange-800">{activeRepairs} repairs in queue</span>
                                </div>
                            </div>
                        )}
                        {pendingBuyback > 0 && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>💰</span>
                                    <span className="text-sm font-medium text-green-800">{pendingBuyback} quotes pending</span>
                                </div>
                            </div>
                        )}
                        {activeUmrah > 0 && (
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>🕌</span>
                                    <span className="text-sm font-medium text-emerald-800">{activeUmrah} Umrah enquiries</span>
                                </div>
                            </div>
                        )}
                        {activeTravel > 0 && (
                            <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>✈️</span>
                                    <span className="text-sm font-medium text-sky-800">{activeTravel} travel bookings</span>
                                </div>
                            </div>
                        )}
                        {activeRepairs === 0 && pendingBuyback === 0 && activeUmrah === 0 && activeTravel === 0 && (
                            <p className="text-slate-500 text-center py-4">✅ All caught up!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
