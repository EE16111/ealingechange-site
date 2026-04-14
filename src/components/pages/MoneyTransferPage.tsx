import React from 'react';
import Card from '../ui/Card';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import { Link } from 'react-router-dom';

const MoneyTransferPage: React.FC = () => {
    return (
        <Card>
            <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-brand-blue mb-4">Money Transfer</h1>
                <p className="text-slate-600 mb-8">Send money securely and quickly to over 100 countries.</p>
                <Link to="/" className="flex items-center mx-auto text-brand-blue font-semibold hover:text-brand-yellow w-fit">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
            </div>
        </Card>
    );
};

export default MoneyTransferPage;
