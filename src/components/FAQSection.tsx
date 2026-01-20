import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './ui/Motion';
import Card from './ui/Card';

const faqs = [
    {
        question: "Do I need ID to exchange money?",
        answer: "Yes, for security and regulation purposes, we require a valid government-issued photo ID (like a Passport or Driving License) for all transactions over £1,000, or if you are selling back currency to us."
    },
    {
        question: "Is there a commission fee?",
        answer: "No! We are proud to offer 0% commission on all foreign currency transactions. The rate you see is the rate you get."
    },
    {
        question: "Can I pay by card?",
        answer: "Yes, we accept debit cards. However, please note that your bank may charge a 'cash advance' fee for currency transactions. We recommend checking with your bank or paying in cash for the absolute best value."
    },
    {
        question: "How long do you hold my reserved rate?",
        answer: "When you reserve online, we hold your rate until the close of business on the same day. If you cannot make it, please give us a call to let us know."
    },
    {
        question: "Where are you located?",
        answer: "We have two convenient branches. One in West Ealing (16 The Broadway) and one in Hanwell (111 Uxbridge Rd). You can choose whichever is easiest for you."
    }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 text-left flex justify-between items-center focus:outline-none group"
            >
                <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-brand-yellow' : 'text-slate-700 group-hover:text-brand-blue'}`}>
                    {question}
                </span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-yellow' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-slate-600 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQSection: React.FC = () => {
    return (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-12 gap-12">
                    <FadeIn className="md:col-span-4 lg:col-span-3">
                        <h2 className="text-3xl font-bold text-brand-blue mb-4">Frequently Asked <span className="text-brand-yellow">Questions</span></h2>
                        <p className="text-slate-600 mb-6">Can't find what you're looking for? Feel free to call us or pop into one of our branches.</p>
                        <a href="tel:02088406420" className="inline-flex items-center text-brand-blue font-bold hover:text-brand-yellow transition-colors">
                            <span className="mr-2">📞</span> Call West Ealing
                        </a>
                        <br />
                        <a href="tel:02033363633" className="inline-flex items-center text-brand-blue font-bold hover:text-brand-yellow transition-colors mt-2">
                            <span className="mr-2">📞</span> Call Hanwell
                        </a>
                    </FadeIn>

                    <div className="md:col-span-8 lg:col-span-9">
                        <Card className="p-2 sm:p-6 md:p-8">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
