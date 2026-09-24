import React, { useEffect, useState } from 'react';
import type { Store, SiteSettings } from '../../types';
import { getExchangeData, updateContent } from '../../services/exchangeService';
import type { ExchangeRates } from '../../types';

const SettingsTab: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
    const [rates, setRates] = useState<ExchangeRates>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
    const [storeForm, setStoreForm] = useState({ name: '', address: '', phone: '', map_url: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getExchangeData();
            setStores(data.stores);
            setSiteSettings(data.siteSettings || {});
            setRates(data.rates);
        } catch (err: unknown) {
            setError((err instanceof Error ? err.message : String(err)) || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStore = (store: Store) => {
        setEditingStoreId(store.store_id);
        setStoreForm({
            name: store.name,
            address: store.address,
            phone: store.phone,
            map_url: store.map_url
        });
    };

    const handleSaveStore = async () => {
        if (editingStoreId === null) return;
        setSaving(true);
        try {
            const updatedStores = stores.map(s =>
                s.store_id === editingStoreId
                    ? { ...s, ...storeForm }
                    : s
            );
            await updateContent(rates, updatedStores, siteSettings);
            setStores(updatedStores);
            setEditingStoreId(null);
            setSuccessMessage('Store details updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: unknown) {
            alert('Failed to save: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    const handleSocialLinkChange = (key: string, value: string) => {
        setSiteSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSocialLinks = async () => {
        setSaving(true);
        try {
            await updateContent(rates, stores, siteSettings);
            setSuccessMessage('Social links updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: unknown) {
            alert('Failed to save: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading settings...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 space-y-8">
            {successMessage && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg font-bold">
                    ✓ {successMessage}
                </div>
            )}

            {/* Store Locations */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Store Locations</h2>
                <div className="space-y-4">
                    {stores.map(store => (
                        <div key={store.store_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            {editingStoreId === store.store_id ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Store Name</label>
                                        <input className="w-full p-2 border rounded" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Address</label>
                                        <input className="w-full p-2 border rounded" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Phone</label>
                                            <input className="w-full p-2 border rounded" value={storeForm.phone} onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Google Maps URL</label>
                                            <input className="w-full p-2 border rounded" value={storeForm.map_url} onChange={e => setStoreForm({ ...storeForm, map_url: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button onClick={() => setEditingStoreId(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                                        <button onClick={handleSaveStore} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{store.name}</h3>
                                        <p className="text-slate-600">{store.address}</p>
                                        <p className="text-slate-500 text-sm mt-1">📞 {store.phone}</p>
                                    </div>
                                    <button onClick={() => handleEditStore(store)} className="text-brand-blue font-semibold hover:text-brand-yellow">
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Social Links */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Social Media & Links</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Facebook Page URL</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={siteSettings['social_facebook'] || ''}
                            onChange={e => handleSocialLinkChange('social_facebook', e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Twitter/X URL</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={siteSettings['social_twitter'] || ''}
                            onChange={e => handleSocialLinkChange('social_twitter', e.target.value)}
                            placeholder="https://twitter.com/yourhandle"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Google Review Link</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={siteSettings['google_review_link'] || ''}
                            onChange={e => handleSocialLinkChange('google_review_link', e.target.value)}
                            placeholder="https://g.page/r/your-review-link"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSaveSocialLinks} disabled={saving} className="px-4 py-2 bg-brand-blue text-white rounded font-bold hover:bg-slate-700">
                            {saving ? 'Saving...' : 'Save Social Links'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Admin Info */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">System Information</h2>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500 font-bold uppercase text-xs">Platform</p>
                            <p className="text-slate-800">React + Vite + TailwindCSS</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase text-xs">Backend</p>
                            <p className="text-slate-800">Firebase Firestore</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase text-xs">Hosting</p>
                            <p className="text-slate-800">Firebase Hosting</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase text-xs">Domain</p>
                            <p className="text-slate-800">ealingexchange.co.uk</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SettingsTab;
