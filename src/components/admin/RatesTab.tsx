import React, { useEffect, useState } from 'react';
import type { ExchangeRates, Store, SiteSettings } from '../../types';
import { getExchangeData, updateContent } from '../../services/exchangeService';

// Mock inventory for demo purposes (not in current backend schema)
const MOCK_INVENTORY: { [key: string]: number } = {
    'USD': 50000,
    'EUR': 35000,
    'AUD': 5000,
    'CAD': 8000,
    'JPY': 5000000,
};

const RatesTab: React.FC = () => {
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

    // Inventory state (Local Only)
    const [inventory, setInventory] = useState<{ [key: string]: number }>(MOCK_INVENTORY);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ buy: '', sell: '', stock: '' });

    // New Currency State
    const [isAdding, setIsAdding] = useState(false);
    const [newCurrency, setNewCurrency] = useState({ code: '', name: '', buy: '', sell: '', stock: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getExchangeData();
            setRates(data.rates);
            setStores(data.stores);
            setSiteSettings(data.siteSettings || {});
        } catch (err: unknown) {
            setError('Failed to load rates. ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (currency: string) => {
        if (!rates) return;
        setEditingCurrency(currency);
        setEditForm({
            buy: rates[currency].customerBuys.toString(),
            sell: rates[currency].customerSells.toString(),
            stock: (inventory[currency] || 0).toString()
        });
    };

    const handleSave = async () => {
        if (!editingCurrency || !rates) return;
        setSaving(true);

        try {
            const updatedRates = {
                ...rates,
                [editingCurrency]: {
                    customerBuys: parseFloat(editForm.buy),
                    customerSells: parseFloat(editForm.sell)
                }
            };

            // Call backend API
            await updateContent(updatedRates, stores, siteSettings);

            // Update local state on success
            setRates(updatedRates);
            setInventory(prev => ({
                ...prev,
                [editingCurrency]: parseInt(editForm.stock)
            }));
            setEditingCurrency(null);
        } catch (err: unknown) {
            alert('Failed to save changes: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    const handleAddCurrency = async () => {
        if (!newCurrency.code || !rates) return;
        setSaving(true);
        try {
            // Logic to add currency to backend would go here.
            // For now, we update the local rates object and push it via updateContent
            // assuming the backend accepts dynamic keys.
            const updatedRates = {
                ...rates,
                [newCurrency.code]: {
                    customerBuys: parseFloat(newCurrency.buy),
                    customerSells: parseFloat(newCurrency.sell)
                }
            };

            await updateContent(updatedRates, stores, siteSettings);

            setRates(updatedRates);
            setInventory(prev => ({
                ...prev,
                [newCurrency.code]: parseInt(newCurrency.stock)
            }));
            setIsAdding(false);
            setNewCurrency({ code: '', name: '', buy: '', sell: '', stock: '' });

        } catch (err: unknown) {
            alert('Failed to create currency: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading rates data...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!rates) return <div className="p-8 text-center">No data available.</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Rates & Inventory</h2>
                    <p className="text-slate-500">Manage daily exchange rates and branch stock levels.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                    disabled={saving}
                >
                    + Add Currency
                </button>
            </div>

            {/* Add Currency Form */}
            {isAdding && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fade-in-down">
                    <h3 className="font-bold text-lg mb-4">Add New Currency</h3>
                    <div className="grid grid-cols-5 gap-4 mb-4">
                        <input aria-label="Currency code" placeholder="Code (e.g. THB)" className="p-2 rounded border" value={newCurrency.code} onChange={e => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })} />
                        <input aria-label="Buy rate" placeholder="Buy Rate" className="p-2 rounded border" type="number" step="0.0001" value={newCurrency.buy} onChange={e => setNewCurrency({ ...newCurrency, buy: e.target.value })} />
                        <input aria-label="Sell rate" placeholder="Sell Rate" className="p-2 rounded border" type="number" step="0.0001" value={newCurrency.sell} onChange={e => setNewCurrency({ ...newCurrency, sell: e.target.value })} />
                        <input aria-label="Initial stock" placeholder="Initial Stock" className="p-2 rounded border" type="number" value={newCurrency.stock} onChange={e => setNewCurrency({ ...newCurrency, stock: e.target.value })} />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                        <button onClick={handleAddCurrency} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700" disabled={saving}>
                            {saving ? 'Saving...' : 'Save New Currency'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Currency</th>
                            <th className="px-6 py-3 text-right">We Sell (Buy Rate)</th>
                            <th className="px-6 py-3 text-right">We Buy (Sell Rate)</th>
                            <th className="px-6 py-3 text-right">Inventory Limit (Local)</th>
                            <th className="px-6 py-3 text-right">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.keys(rates).map(currency => (
                            <tr key={currency} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">{currency}</td>

                                {editingCurrency === currency ? (
                                    <>
                                        <td className="px-6 py-4 text-right">
                                            <input aria-label="Edit buy rate" className="w-24 p-1 border rounded text-right" type="number" step="0.0001" value={editForm.buy} onChange={e => setEditForm({ ...editForm, buy: e.target.value })} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <input aria-label="Edit sell rate" className="w-24 p-1 border rounded text-right" type="number" step="0.0001" value={editForm.sell} onChange={e => setEditForm({ ...editForm, sell: e.target.value })} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <input aria-label="Edit stock level" className="w-24 p-1 border rounded text-right" type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Editing</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={handleSave} className="text-green-600 font-bold mr-2 hover:underline">{saving ? '...' : 'Save'}</button>
                                            <button onClick={() => setEditingCurrency(null)} className="text-slate-400 hover:text-slate-600">Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600">{rates[currency].customerBuys.toFixed(4)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600">{rates[currency].customerSells.toFixed(4)}</td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            <span className={`${(inventory[currency] || 0) < 1000 ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                                                {(inventory[currency] || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(inventory[currency] || 0) > 0 ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">In Stock</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Out of Stock</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleEdit(currency)} className="text-brand-blue font-semibold hover:text-brand-yellow">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-8 bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <strong>Backend Connected:</strong> Rate changes will be saved to the live server. Inventory updates are currently local only.
            </div>
        </div>
    );
};

export default RatesTab;
