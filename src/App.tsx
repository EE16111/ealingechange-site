import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getExchangeData, IS_MOCK_MODE } from './services/exchangeService';
import { onAuthChange, firebaseLogout } from './services/firebase';
import type { AppData, AdminUser, Currency } from './types';
import { CalculatorMode } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/ui/Spinner';
import ValueProps from './components/ValueProps';
import AdminLoginModal from './components/AdminLoginModal';
import NewsletterSignup from './components/NewsletterSignup';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import { blogPosts } from './data/blogPosts';
import LiveRatesTable from './components/LiveRatesTable';
import ReviewsSection from './components/ReviewsSection';
import FAQSection from './components/FAQSection';
import SEO from './components/SEO';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

// Lazy-loaded page components for code splitting
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const AdminPage = lazy(() => import('./components/pages/AdminPage'));
const MoneyTransferPage = lazy(() => import('./components/pages/MoneyTransferPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('./components/pages/BlogPostPage'));

// Helper component to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>(CalculatorMode.BUY_FOREIGN);
  const [selectedCurrencyForCalc, setSelectedCurrencyForCalc] = useState<string>('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  // Verify admin session via Firebase Auth (not localStorage)
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setAdminUser({
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Admin User',
          role: 'Admin'
        });
      } else {
        setAdminUser(null);
        if (location.pathname === '/admin') {
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getExchangeData();
        setAppData(data);
        if (data.currencies.length > 1) {
          const defaultCurrency = data.currencies.find((c: Currency) => c.code === 'USD') || data.currencies.find((c: Currency) => c.code !== 'GBP');
          if (defaultCurrency) {
            setSelectedCurrencyForCalc(defaultCurrency.code);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleNavigate = (newPath: string, newMode?: CalculatorMode) => {
    if (newPath === '/admin' && !adminUser) {
      setShowAdminLogin(true);
      return;
    }

    if (newMode) {
      setCalculatorMode(newMode);
    }

    navigate(newPath);
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setShowAdminLogin(false);
    navigate('/admin');
  }

  const handleAdminLogout = async () => {
    await firebaseLogout();
    setAdminUser(null);
    navigate('/');
  }

  const handleSelectCurrencyFromTable = (currency: Currency, mode: CalculatorMode) => {
    setSelectedCurrencyForCalc(currency.code);
    setCalculatorMode(mode);
    const heroElement = document.querySelector('section');
    heroElement?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dynamic SEO based on current path
  const getPageSEO = () => {
    const { pathname } = location;
    if (pathname === '/') {
      return { title: 'Ealing Exchange | Best Currency Exchange Rates in West London' };
    }
    if (pathname.startsWith('/contact')) {
      return { title: 'Contact Us | Ealing Exchange', description: 'Visit our branches in West Ealing or Hanwell. Get directions, opening hours, and contact details.' };
    }
    if (pathname.startsWith('/money-transfer')) {
      return { title: 'International Money Transfer | Western Union Agent | Ealing Exchange', description: 'Send money worldwide with Western Union at Ealing Exchange. Fast, reliable international transfers.' };
    }
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.split('/blog/')[1];
      const post = blogPosts.find(p => p.slug === slug);
      if (post) return { title: `${post.title} | Ealing Exchange Blog`, description: post.description };
    }
    if (pathname.startsWith('/blog')) {
      return { title: 'Travel Money Tips & Guides | Ealing Exchange Blog', description: 'Expert advice on currency exchange, travel budgeting, and getting the best rates.' };
    }
    return {};
  };

  const renderHomePage = () => {
    if (!appData) return null;
    return (
      <>
        <Hero
          currencies={appData.currencies}
          rates={appData.rates}
          stores={appData.stores}
          mode={calculatorMode}
          setMode={setCalculatorMode}
          initialSelectedCurrency={selectedCurrencyForCalc}
        />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <ValueProps />
          <HowItWorks />
          <LiveRatesTable
            currencies={appData.currencies}
            rates={appData.rates}
            onSelectCurrency={handleSelectCurrencyFromTable}
          />
        </div>
        <ReviewsSection />
        <FAQSection />
      </>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Spinner />
          <p className="mt-4 text-lg text-slate-600">Fetching Latest Rates...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-xl font-semibold text-red-700">Error Fetching Data</p>
          <p className="mt-2 text-red-600">{error}</p>
          <p className="mt-4 text-sm text-slate-500">Please try again later. If the problem persists, contact us on <a href="tel:+442088406420" className="font-semibold text-slate-600 hover:underline">020 8840 6420</a>.</p>
        </div>
      );
    }

    if (!appData) return null;

    return (
      <Routes>
        <Route path="/" element={renderHomePage()} />
        <Route path="/contact" element={<div className="container mx-auto px-4 py-8 md:py-12"><ContactPage stores={appData.stores} /></div>} />
        <Route path="/money-transfer" element={<div className="container mx-auto px-4 py-8 md:py-12"><MoneyTransferPage /></div>} />
        <Route path="/blog" element={<div className="container mx-auto px-4 py-8 md:py-12"><BlogPage posts={blogPosts} /></div>} />
        <Route path="/blog/:slug" element={<div className="container mx-auto px-4 py-8 md:py-12"><BlogPostPage /></div>} />
        <Route
          path="/admin"
          element={
            adminUser ? (
              <div className="container mx-auto px-4 py-8 md:py-12"><AdminPage user={adminUser} onLogout={handleAdminLogout} /></div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SEO {...getPageSEO()} />
      {IS_MOCK_MODE && (
        <div className="bg-red-600 text-white text-center py-2 font-semibold shadow-lg">
          DEMO MODE - NOT CONNECTED TO LIVE BACKEND
        </div>
      )}
      <ScrollToTop />
      <Header onNavigate={handleNavigate} />
      <main className="flex-grow">
        <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>}>
          {renderContent()}
        </Suspense>
      </main>
      <NewsletterSignup />
      <Footer stores={appData?.stores || []} siteSettings={appData?.siteSettings || {}} onNavigate={handleNavigate} />
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={handleAdminLoginSuccess}
        />
      )}
    </div>
  );
};

export default App;
