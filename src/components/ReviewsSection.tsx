import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer } from './ui/Motion';
import StarIcon from './icons/StarIcon';
import Card from './ui/Card';

const reviews = [
    {
        id: 1,
        author: "Sarah Jenkins",
        location: "West Ealing",
        date: "2 weeks ago",
        rating: 5,
        text: "Absolutely the best rates in Ealing! I checked 3 other places and Ealing Exchange beat them all. The staff were friendly and the transaction was super quick.",
        avatarColor: "bg-purple-100 text-purple-600"
    },
    {
        id: 2,
        author: "David Miller",
        location: "Hanwell",
        date: "1 month ago",
        rating: 5,
        text: "So convenient to verify the rate online and then just pick it up. No hidden fees or commissions which is rare these days. Highly recommend!",
        avatarColor: "bg-blue-100 text-blue-600"
    },
    {
        id: 3,
        author: "Priya Patel",
        location: "Ealing Broadway",
        date: "3 weeks ago",
        rating: 5,
        text: "Used them for my holiday money to Japan. Got a great rate on Yen. The reserve and collect service is brilliant.",
        avatarColor: "bg-green-100 text-green-600"
    },
    {
        id: 4,
        author: "James Thompson",
        location: "Acton",
        date: "1 week ago",
        rating: 5,
        text: "Professional service and excellent rates for Euros. Much better than the Post Office down the road. Will definitely use again.",
        avatarColor: "bg-orange-100 text-orange-600"
    },
    {
        id: 5,
        author: "Maria Gonzalez",
        location: "South Ealing",
        date: "2 days ago",
        rating: 5,
        text: "Quick, easy, and secure. I set a rate alert for USD and bought when it hit my target. Saved me about £40 on my trip money.",
        avatarColor: "bg-red-100 text-red-600"
    },
    {
        id: 6,
        author: "Robert Chen",
        location: "West Ealing",
        date: "3 days ago",
        rating: 4,
        text: "Very competitive rates. Store can get busy at lunch times but the staff work efficiently. Good experience overall.",
        avatarColor: "bg-teal-100 text-teal-600"
    }
];

const ReviewsSection: React.FC = () => {
    return (
        <section className="py-16 bg-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl opacity-50"></div>

            <div className="container mx-auto px-4 relative z-10">
                <FadeIn className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-blue sm:text-4xl">
                        Trusted by <span className="text-brand-yellow">Locals</span>
                    </h2>
                    <p className="mt-2 text-lg text-slate-500 max-w-2xl mx-auto">
                        Don't just take our word for it. See what our customers in West Ealing and Hanwell have to say.
                    </p>
                    <div className="flex items-center justify-center mt-4 space-x-1">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <StarIcon key={i} className="w-6 h-6 text-brand-yellow fill-current" />
                            ))}
                        </div>
                        <span className="font-bold text-slate-800 ml-2">4.9/5</span>
                        <span className="text-slate-500 text-sm ml-1">(based on Google Reviews)</span>
                    </div>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                        >
                            <Card className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-brand-yellow">
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4 ${review.avatarColor}`}>
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{review.author}</h4>
                                        <p className="text-xs text-slate-500">{review.location} • {review.date}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <StarIcon key={i} className="w-4 h-4 text-brand-yellow fill-current" />
                                    ))}
                                </div>
                                <p className="text-slate-600 italic flex-grow">"{review.text}"</p>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400 font-medium">
                                    <svg className="w-4 h-4 mr-1.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                                    </svg>
                                    Posted on Google
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </StaggerContainer>

                {/* Link to Google Reviews */}
                <div className="text-center mt-10">
                    <a
                        href="https://www.google.com/search?q=Ealing+Exchange+West+Ealing+reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                        </svg>
                        Read All Reviews on Google
                    </a>
                </div>

                {/* Google Maps Embed with Business Info */}
                <FadeIn className="mt-12">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 text-center">Find Us on Google Maps</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* West Ealing Branch */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2 text-center">West Ealing Branch</h4>
                                <div className="rounded-xl overflow-hidden shadow-md h-72">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1888.210659816967!2d-0.322891288742646!3d51.510897971696565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760d865cc07bb7%3A0xf264ea993783acdc!2sEaling%20Exchange!5e1!3m2!1sen!2suk!4v1768862211901!5m2!1sen!2suk"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ealing Exchange West Ealing"
                                    ></iframe>
                                </div>
                            </div>
                            {/* Hanwell Branch */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2 text-center">Hanwell Branch</h4>
                                <div className="rounded-xl overflow-hidden shadow-md h-72">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1888.2943523937474!2d-0.33875178874278045!3d51.50887867169607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760d55f28a99c3%3A0xa7100a882dbf98cc!2sEaling%20Exchange!5e1!3m2!1sen!2suk!4v1768862262959!5m2!1sen!2suk"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ealing Exchange Hanwell"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-slate-500 text-sm mt-4">
                            Click on a map to see our reviews and get directions
                        </p>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

export default ReviewsSection;
