import React, { useState, useEffect } from 'react';
import type { TravelBooking, TravelStatus, TravelBookingType } from '../../types';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import db from '../../services/firestoreService';

// Status badge component
const StatusBadge: React.FC<{ status: TravelStatus }> = ({ status }) => {
    const colors: Record<TravelStatus, string> = {
        'Enquiry': 'bg-blue-100 text-blue-700',
        'Searching': 'bg-cyan-100 text-cyan-700',
        'Quoted': 'bg-yellow-100 text-yellow-700',
        'Booked': 'bg-green-100 text-green-700',
        'Completed': 'bg-emerald-100 text-emerald-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
            {status}
        </span>
    );
};

// Booking type badge
const TypeBadge: React.FC<{ type: TravelBookingType }> = ({ type }) => {
    const colors: Record<TravelBookingType, string> = {
        'Flight': 'bg-sky-100 text-sky-700',
        'Hotel': 'bg-purple-100 text-purple-700',
        'Package': 'bg-amber-100 text-amber-700',
        'Other': 'bg-slate-100 text-slate-700',
    };
    const icons: Record<TravelBookingType, string> = {
        'Flight': '✈️',
        'Hotel': '🏨',
        'Package': '📦',
        'Other': '📋',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[type]}`}>
            {icons[type]} {type}
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

// New booking modal
const NewBookingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (booking: Partial<TravelBooking>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        email: '',
        phone: '',
        booking_type: 'Flight' as TravelBookingType,
        destination: '',
        departure_date: '',
        return_date: '',
        passengers: 1,
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
                    <h2 className="text-xl font-bold text-slate-800">New Travel Booking</h2>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Booking Type</label>
                            <select
                                value={formData.booking_type}
                                onChange={(e) => setFormData({ ...formData, booking_type: e.target.value as TravelBookingType })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="Flight">✈️ Flight</option>
                                <option value="Hotel">🏨 Hotel</option>
                                <option value="Package">📦 Package</option>
                                <option value="Other">📋 Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Passengers</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.passengers}
                                onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Dubai, Istanbul, Pakistan"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
                            <input
                                type="date"
                                value={formData.departure_date}
                                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
                            <input
                                type="date"
                                value={formData.return_date}
                                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            placeholder="Special requests, budget, airline preferences, etc."
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
                            Save Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TravelTab: React.FC = () => {
    const [bookings, setBookings] = useState<TravelBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [filter, setFilter] = useState<'all' | TravelBookingType>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | TravelStatus>('all');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'travel_bookings'), orderBy('created_at', 'desc'));
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
            })) as TravelBooking[];
            setBookings(data);
        } catch (error) {
            console.error('Error loading travel bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewBooking = async (bookingData: Partial<TravelBooking>) => {
        try {
            await addDoc(collection(db, 'travel_bookings'), {
                ...bookingData,
                created_at: new Date(),
                updated_at: new Date(),
            });
            loadBookings();
        } catch (error) {
            console.error('Error creating booking:', error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: TravelStatus) => {
        try {
            await updateDoc(doc(db, 'travel_bookings', id), {
                status: newStatus,
                updated_at: new Date(),
            });
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, status: newStatus, updated_at: new Date().toISOString() } : b
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredBookings = bookings
        .filter(b => filter === 'all' || b.booking_type === filter)
        .filter(b => statusFilter === 'all' || b.status === statusFilter);

    const stats = {
        total: bookings.length,
        flights: bookings.filter(b => b.booking_type === 'Flight').length,
        hotels: bookings.filter(b => b.booking_type === 'Hotel').length,
        packages: bookings.filter(b => b.booking_type === 'Package').length,
        active: bookings.filter(b => !['Completed', 'Cancelled'].includes(b.status)).length,
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading travel bookings...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        ✈️ Flights & Hotels
                    </h2>
                    <p className="text-slate-500">Manage flight and hotel booking requests</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    <span>+</span> New Booking
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Total Bookings" value={stats.total} color="border-blue-500" />
                <StatCard title="✈️ Flights" value={stats.flights} color="border-sky-500" />
                <StatCard title="🏨 Hotels" value={stats.hotels} color="border-purple-500" />
                <StatCard title="📦 Packages" value={stats.packages} color="border-amber-500" />
                <StatCard title="Active" value={stats.active} color="border-green-500" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                    <span className="text-sm font-medium text-slate-500 py-1">Type:</span>
                    {(['all', 'Flight', 'Hotel', 'Package', 'Other'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === type
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {type === 'all' ? 'All' : type}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <span className="text-sm font-medium text-slate-500 py-1">Status:</span>
                    {(['all', 'Enquiry', 'Searching', 'Quoted', 'Booked'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Destination</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3">Pax</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800 text-sm">{booking.customer_name}</p>
                                        <p className="text-xs text-slate-400">{booking.phone}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <TypeBadge type={booking.booking_type} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                                        {booking.destination}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {booking.departure_date || 'TBD'}
                                        {booking.return_date && ` - ${booking.return_date}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {booking.passengers}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(booking.id, e.target.value as TravelStatus)}
                                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue"
                                        >
                                            <option value="Enquiry">Enquiry</option>
                                            <option value="Searching">Searching</option>
                                            <option value="Quoted">Quoted</option>
                                            <option value="Booked">Booked</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        No bookings found. Click "New Booking" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Booking Modal */}
            <NewBookingModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSave={handleNewBooking}
            />
        </div>
    );
};

export default TravelTab;
