import React, { useState } from 'react';
import type { AdminUser } from '../../types';
import DashboardTab from '../admin/DashboardTab';
import FulfillmentTab from '../admin/FulfillmentTab';
import CustomersTab from '../admin/CustomersTab';
import SettingsTab from '../admin/SettingsTab';
import RatesTab from '../admin/RatesTab';
import BlogTab from '../admin/BlogTab';
import Card from '../ui/Card';

interface Props {
  user: AdminUser;
  onLogout: () => void;
}

const AdminPage: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const tabs = ['Dashboard', 'Orders', 'Rates & Inventory', 'Customers', 'Blog', 'Settings'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardTab />;
      case 'Orders':
        return <FulfillmentTab />;
      case 'Rates & Inventory':
        return <RatesTab />;
      case 'Customers':
        return <CustomersTab />;
      case 'Blog':
        return <BlogTab />;
      case 'Settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue">Admin Portal</h1>
          <p className="text-slate-500">Welcome back, <span className="font-semibold text-slate-800">{user.name}</span></p>
        </div>
        <button
          onClick={onLogout}
          className="mt-4 md:mt-0 px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-all ${activeTab === tab
                    ? 'bg-brand-blue text-white shadow-md transform scale-105'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="mt-8 px-4 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-2">System Status</p>
              <div className="flex items-center text-sm text-green-600 font-semibold mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                API Online
              </div>
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Database Connected
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Card className="min-h-[600px] p-0 overflow-hidden">
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
