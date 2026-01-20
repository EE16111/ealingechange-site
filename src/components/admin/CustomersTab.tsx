import React, { useEffect, useState } from 'react';
import type { CustomerData, AdminOrder } from '../../types';
import { getAdminData, getCustomerDetails } from '../../services/exchangeService';

const CustomersTab: React.FC = () => {
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Detail view
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAdminData();
            setCustomers(data.customers);
        } catch (err: any) {
            setError(err.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCustomer = async (email: string) => {
        setLoadingDetail(true);
        try {
            const data = await getCustomerDetails(email);
            setSelectedCustomer(data.customer);
            setCustomerOrders(data.orders);
        } catch (err: any) {
            alert('Failed to load customer details: ' + err.message);
        } finally {
            setLoadingDetail(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (loading) return <div className="p-12 text-center text-slate-500">Loading customers...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    // Detail View
    if (selectedCustomer) {
        return (
            <div className="p-6">
                <button
                    onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }}
                    className="mb-6 text-brand-blue font-semibold hover:text-brand-yellow flex items-center"
                >
                    ← Back to Customers
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-2xl font-bold">
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                            <p className="text-slate-500">{selectedCustomer.email}</p>
                            <p className="text-slate-400 text-sm">{selectedCustomer.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-brand-blue">{selectedCustomer.order_count}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">£{selectedCustomer.total_gbp_spent.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Lifetime Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-slate-700">{new Date(selectedCustomer.last_order_date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Last Order</p>
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 mb-4">Order History</h3>
                {loadingDetail ? (
                    <p className="text-slate-500">Loading orders...</p>
                ) : customerOrders.length === 0 ? (
                    <p className="text-slate-500">No orders found for this customer.</p>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Order ID</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Currency</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customerOrders.map(order => (
                                    <tr key={order.order_id}>
                                        <td className="px-4 py-3 font-mono text-sm">{order.order_id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-bold">{order.currency_code || '-'}</td>
                                        <td className="px-4 py-3 text-right font-mono">£{order.gbp_amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // List View
    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Customer Database</h2>
                    <p className="text-slate-500">View customer profiles and order history.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border rounded-lg w-full md:w-72"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3 text-center">Orders</th>
                            <th className="px-6 py-3 text-right">Total Spent</th>
                            <th className="px-6 py-3">Last Order</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.email} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">{customer.name}</p>
                                    <p className="text-xs text-slate-400">{customer.email}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{customer.phone}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 bg-brand-blue text-white rounded-full text-sm font-bold">{customer.order_count}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-green-600 font-bold">
                                    £{customer.total_gbp_spent.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(customer.last_order_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleViewCustomer(customer.email)}
                                        className="text-brand-blue font-semibold hover:text-brand-yellow"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersTab;
