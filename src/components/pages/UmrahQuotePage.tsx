import React, { useState, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import db from '../../services/firestoreService';

// Package pricing structure (based on competitor analysis)
const PACKAGE_PRICING = {
    '3-star': {
        name: '3★ Economy',
        basePrice: { quad: 899, triple: 999, double: 1149, single: 1599 },
        hotels: {
            makkah: 'Elaf Ajyad Hotel (400m to Haram)',
            madinah: 'Dar Al Taqwa Hotel (300m to Masjid)'
        },
        features: ['Return flights', 'Visa assistance', 'Ground transfers', 'Breakfast included'],
        color: 'from-amber-500 to-amber-600'
    },
    '4-star': {
        name: '4★ Comfort',
        basePrice: { quad: 1099, triple: 1199, double: 1399, single: 1899 },
        hotels: {
            makkah: 'Pullman ZamZam (100m to Haram)',
            madinah: 'Crowne Plaza (200m to Masjid)'
        },
        features: ['Return flights', 'Visa assistance', 'Ground transfers', 'Breakfast + Dinner', 'Ziyarah tours'],
        color: 'from-sky-500 to-sky-600'
    },
    '5-star': {
        name: '5★ Premium',
        basePrice: { quad: 1475, triple: 1650, double: 1899, single: 2899 },
        hotels: {
            makkah: 'Jabal Omar Marriott (50m to Haram)',
            madinah: 'The Oberoi (100m to Masjid)'
        },
        features: ['Return flights', 'Visa assistance', 'Ground transfers', 'All meals included', 'Ziyarah tours', 'Group leader', 'Religious guide', 'Haramain Express train'],
        color: 'from-emerald-500 to-emerald-600'
    }
};

// Seasonal adjustments
const SEASON_MULTIPLIERS: Record<string, number> = {
    'ramadan': 1.25,    // 25% premium
    'hajj': 1.5,        // 50% premium
    'summer': 1.1,      // 10% premium (school holidays)
    'off-peak': 0.95    // 5% discount
};

// Age-based discounts
const AGE_PRICING = {
    adult: 1.0,
    youth: 0.95,   // 12-15 years
    child: 0.85,   // 2-11 years
    infant: 0.2    // Under 2
};

interface QuoteFormData {
    name: string;
    phone: string;
    email: string;
    adults: number;
    youth: number;
    children: number;
    infants: number;
    roomType: 'quad' | 'triple' | 'double' | 'single';
    packageTier: '3-star' | '4-star' | '5-star';
    preferredMonth: string;
    startCity: 'makkah' | 'madinah';
    nights: number;
}

const UmrahQuotePage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<QuoteFormData>({
        name: '',
        phone: '',
        email: '',
        adults: 2,
        youth: 0,
        children: 0,
        infants: 0,
        roomType: 'quad',
        packageTier: '4-star',
        preferredMonth: 'march',
        startCity: 'makkah',
        nights: 10
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Calculate quote
    const quote = useMemo(() => {
        const pkg = PACKAGE_PRICING[formData.packageTier];
        const basePrice = pkg.basePrice[formData.roomType];

        // Determine season
        let seasonMultiplier = 1;
        if (['february', 'march'].includes(formData.preferredMonth)) {
            seasonMultiplier = formData.preferredMonth === 'february' ? SEASON_MULTIPLIERS.ramadan : 1;
        } else if (['june', 'july', 'august'].includes(formData.preferredMonth)) {
            seasonMultiplier = SEASON_MULTIPLIERS.summer;
        } else if (formData.preferredMonth === 'hajj') {
            seasonMultiplier = SEASON_MULTIPLIERS.hajj;
        }

        // Calculate per-person prices
        const adultPrice = Math.round(basePrice * seasonMultiplier * AGE_PRICING.adult);
        const youthPrice = Math.round(basePrice * seasonMultiplier * AGE_PRICING.youth);
        const childPrice = Math.round(basePrice * seasonMultiplier * AGE_PRICING.child);
        const infantPrice = Math.round(basePrice * seasonMultiplier * AGE_PRICING.infant);

        // Calculate totals
        const totalAdults = formData.adults * adultPrice;
        const totalYouth = formData.youth * youthPrice;
        const totalChildren = formData.children * childPrice;
        const totalInfants = formData.infants * infantPrice;
        const grandTotal = totalAdults + totalYouth + totalChildren + totalInfants;
        const totalTravellers = formData.adults + formData.youth + formData.children + formData.infants;
        const deposit = totalTravellers * 200; // £200 deposit per person

        return {
            packageName: pkg.name,
            hotels: pkg.hotels,
            features: pkg.features,
            color: pkg.color,
            pricing: {
                adult: adultPrice,
                youth: youthPrice,
                child: childPrice,
                infant: infantPrice
            },
            breakdown: {
                adults: { count: formData.adults, total: totalAdults },
                youth: { count: formData.youth, total: totalYouth },
                children: { count: formData.children, total: totalChildren },
                infants: { count: formData.infants, total: totalInfants }
            },
            grandTotal,
            deposit,
            totalTravellers
        };
    }, [formData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Save to Firebase
            await addDoc(collection(db, 'umrah_enquiries'), {
                customer_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                adults: formData.adults,
                children: formData.children + formData.youth + formData.infants,
                package_tier: formData.packageTier === '3-star' ? '3★ Economy' :
                    formData.packageTier === '4-star' ? '4★ Standard' : '5★ Premium',
                preferred_dates: formData.preferredMonth,
                notes: `Room: ${formData.roomType}, Youth: ${formData.youth}, Infants: ${formData.infants}, Start: ${formData.startCity}, Nights: ${formData.nights}, Quote: £${quote.grandTotal}`,
                status: 'New',
                source: 'website_calculator',
                quoted_price: quote.grandTotal,
                created_at: new Date(),
                updated_at: new Date()
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting enquiry:', error);
        } finally {
            setLoading(false);
        }
    };

    const whatsappMessage = encodeURIComponent(
        `Assalamu Alaikum! I'd like to enquire about Umrah.\n\n` +
        `Package: ${quote.packageName}\n` +
        `Travellers: ${quote.totalTravellers}\n` +
        `Preferred Month: ${formData.preferredMonth}\n` +
        `Estimated Total: £${quote.grandTotal.toLocaleString()}\n\n` +
        `Please contact me to discuss.`
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">🕌</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">JazakAllah Khair!</h2>
                    <p className="text-slate-600 mb-6">
                        Your Umrah enquiry has been received. Our team will contact you within 24 hours
                        with a personalized quote.
                    </p>
                    <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-emerald-800 font-medium">Your Estimated Quote</p>
                        <p className="text-3xl font-bold text-emerald-600">£{quote.grandTotal.toLocaleString()}</p>
                        <p className="text-xs text-emerald-700">for {quote.totalTravellers} traveller(s)</p>
                    </div>
                    <a
                        href={`https://wa.me/447597635092?text=${whatsappMessage}`}
                        className="block w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                    >
                        💬 Chat on WhatsApp Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900">
            {/* Header */}
            <div className="text-center py-8 px-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    🕌 Umrah Quote Calculator
                </h1>
                <p className="text-emerald-200 text-lg">
                    Get an instant quote in under 30 seconds
                </p>
                <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`w-20 h-2 rounded-full transition-colors ${s <= step ? 'bg-emerald-400' : 'bg-emerald-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pb-12">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

                    {/* Step 1: Package Selection */}
                    {step === 1 && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Choose Your Package</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {(Object.entries(PACKAGE_PRICING) as [keyof typeof PACKAGE_PRICING, typeof PACKAGE_PRICING['3-star']][]).map(([key, pkg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setFormData({ ...formData, packageTier: key })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.packageTier === key
                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`text-2xl font-bold bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                                            {pkg.name}
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 mt-2">
                                            From £{pkg.basePrice.quad}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">per person, quad sharing</p>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            {pkg.features.slice(0, 4).map((f, i) => (
                                                <li key={i}>✓ {f}</li>
                                            ))}
                                        </ul>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Month</label>
                                    <select
                                        value={formData.preferredMonth}
                                        onChange={(e) => setFormData({ ...formData, preferredMonth: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="january">January 2026</option>
                                        <option value="february">February 2026 (Ramadan) +25%</option>
                                        <option value="march">March 2026</option>
                                        <option value="april">April 2026</option>
                                        <option value="may">May 2026</option>
                                        <option value="june">June 2026 (Summer) +10%</option>
                                        <option value="july">July 2026 (Summer) +10%</option>
                                        <option value="august">August 2026 (Summer) +10%</option>
                                        <option value="september">September 2026</option>
                                        <option value="october">October 2026</option>
                                        <option value="november">November 2026</option>
                                        <option value="december">December 2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
                                    <select
                                        value={formData.roomType}
                                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="quad">Quad Sharing (Best Value)</option>
                                        <option value="triple">Triple Sharing</option>
                                        <option value="double">Double Sharing</option>
                                        <option value="single">Single Room</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                            >
                                Next: Traveller Details →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Traveller Details */}
                    {step === 2 && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">How Many Travellers?</h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { key: 'adults', label: 'Adults', sublabel: '16+ years', min: 1 },
                                    { key: 'youth', label: 'Youth', sublabel: '12-15 years', min: 0 },
                                    { key: 'children', label: 'Children', sublabel: '2-11 years', min: 0 },
                                    { key: 'infants', label: 'Infants', sublabel: 'Under 2', min: 0 },
                                ].map(({ key, label, sublabel, min }) => (
                                    <div key={key} className="bg-slate-50 rounded-xl p-4 text-center">
                                        <p className="font-bold text-slate-800">{label}</p>
                                        <p className="text-xs text-slate-500 mb-2">{sublabel}</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    [key]: Math.max(min, (formData as any)[key] - 1)
                                                })}
                                                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300"
                                            >
                                                −
                                            </button>
                                            <span className="text-2xl font-bold text-slate-800 w-8">
                                                {(formData as any)[key]}
                                            </span>
                                            <button
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    [key]: (formData as any)[key] + 1
                                                })}
                                                className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Live Quote Preview */}
                            <div className={`bg-gradient-to-r ${quote.color} rounded-xl p-6 text-white mb-6`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-80">Estimated Total</p>
                                        <p className="text-4xl font-bold">£{quote.grandTotal.toLocaleString()}</p>
                                        <p className="text-sm opacity-80">
                                            {quote.packageName} • {quote.totalTravellers} traveller(s)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Deposit from</p>
                                        <p className="text-2xl font-bold">£{quote.deposit}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700"
                                >
                                    Get My Quote →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact Details */}
                    {step === 3 && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Almost There!</h2>
                            <p className="text-slate-600 mb-6">Enter your details to receive your personalized quote</p>

                            {/* Quote Summary */}
                            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-sm text-emerald-700">Your {quote.packageName} Quote</p>
                                        <p className="text-3xl font-bold text-emerald-600">£{quote.grandTotal.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-sm text-emerald-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-sm text-emerald-700 space-y-1">
                                    {quote.breakdown.adults.count > 0 && (
                                        <p>{quote.breakdown.adults.count}x Adult @ £{quote.pricing.adult} = £{quote.breakdown.adults.total}</p>
                                    )}
                                    {quote.breakdown.youth.count > 0 && (
                                        <p>{quote.breakdown.youth.count}x Youth @ £{quote.pricing.youth} = £{quote.breakdown.youth.total}</p>
                                    )}
                                    {quote.breakdown.children.count > 0 && (
                                        <p>{quote.breakdown.children.count}x Child @ £{quote.pricing.child} = £{quote.breakdown.children.total}</p>
                                    )}
                                    {quote.breakdown.infants.count > 0 && (
                                        <p>{quote.breakdown.infants.count}x Infant @ £{quote.pricing.infant} = £{quote.breakdown.infants.total}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        placeholder="07XXX XXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.name || !formData.phone || loading}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : '🕌 Get My Quote'}
                                </button>
                            </div>

                            <p className="text-center text-xs text-slate-500 mt-4">
                                ATOL Protected • Trusted local service • No spam, ever
                            </p>
                        </div>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-8 mt-8 text-emerald-300 text-sm">
                    <span>✓ ATOL Protected</span>
                    <span>✓ Local Ealing Office</span>
                    <span>✓ 24hr Response</span>
                </div>
            </div>
        </div>
    );
};

export default UmrahQuotePage;
