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
import Chatbot from './components/Chatbot';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import { blogPosts } from './data/blogPosts';
import LiveRatesTable from './components/LiveRatesTable';
import ReviewsSection from './components/ReviewsSection';
import FAQSection from './components/FAQSection';
import SEO from './components/SEO';

// Lazy-loaded page components for code splitting
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const AdminPage = lazy(() => import('./components/pages/AdminPage'));
const MoneyTransferPage = lazy(() => import('./components/pages/MoneyTransferPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('./components/pages/BlogPostPage'));
const UmrahQuotePage = lazy(() => import('./components/pages/UmrahQuotePage'));

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState(window.location.pathname);
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>(CalculatorMode.BUY_FOREIGN);
  const [selectedCurrencyForCalc, setSelectedCurrencyForCalc] = useState<string>('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  const handlePopState = () => {
    setPath(window.location.pathname);
  };

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
        if (path === '/admin') {
          setPath('/');
          window.history.pushState({}, '', '/');
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
    if (newPath === '/admin') {
      if (adminUser) {
        setPath('/admin');
        window.history.pushState({}, '', '/admin');
      } else {
        setShowAdminLogin(true);
      }
      return;
    }

    if (newMode) {
      setCalculatorMode(newMode);
    }

    if (path !== newPath) {
      setPath(newPath);
      window.history.pushState({}, '', newPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setShowAdminLogin(false);
    setPath('/admin');
    window.history.pushState({}, '', '/admin');
  }

  const handleAdminLogout = async () => {
    await firebaseLogout();
    setAdminUser(null);
    setPath('/');
    window.history.pushState({}, '', '/');
  }

  const handleSelectCurrencyFromTable = (currency: Currency, mode: CalculatorMode) => {
    setSelectedCurrencyForCalc(currency.code);
    setCalculatorMode(mode);
    const heroElement = document.querySelector('section');
    heroElement?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dynamic SEO based on current path
  const getPageSEO = () => {
    if (path === '/') {
      return { title: 'Ealing Exchange | Best Currency Exchange Rates in West London' };
    }
    if (path.startsWith('/contact')) {
      return { title: 'Contact Us | Ealing Exchange', description: 'Visit our branches in West Ealing or Hanwell. Get directions, opening hours, and contact details.' };
    }
    if (path.startsWith('/money-transfer')) {
      return { title: 'International Money Transfer | Western Union Agent | Ealing Exchange', description: 'Send money worldwide with Western Union at Ealing Exchange. Fast, reliable international transfers.' };
    }
    if (path.startsWith('/blog/')) {
      const slug = path.split('/blog/')[1];
      const post = blogPosts.find(p => p.slug === slug);
      if (post) return { title: `${post.title} | Ealing Exchange Blog`, description: post.description };
    }
    if (path.startsWith('/blog')) {
      return { title: 'Travel Money Tips & Guides | Ealing Exchange Blog', description: 'Expert advice on currency exchange, travel budgeting, and getting the best rates.' };
    }
    if (path.startsWith('/umrah')) {
      return { title: 'Umrah Quote Calculator | Instant Umrah Package Prices | Travel Time Global', description: 'Get an instant Umrah quote in 30 seconds. 3-star, 4-star, and 5-star packages available. ATOL protected.' };
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

    if (path === '/') {
      return renderHomePage();
    }

    // Full-screen pages (no container wrapper)
    if (path.startsWith('/umrah')) {
      return <UmrahQuotePage />;
    }

    const pageContent = () => {
      if (path.startsWith('/admin') && adminUser) {
        return <AdminPage user={adminUser} onLogout={handleAdminLogout} />;
      }
      if (path.startsWith('/contact')) {
        return <ContactPage stores={appData.stores} onNavigate={handleNavigate} />;
      }
      if (path.startsWith('/money-transfer')) {
        return <MoneyTransferPage onNavigate={handleNavigate} />;
      }
      if (path.startsWith('/blog/')) {
        const slug = path.split('/blog/')[1];
        const post = blogPosts.find(p => p.slug === slug);
        return <BlogPostPage post={post} onNavigate={handleNavigate} />;
      }
      if (path.startsWith('/blog')) {
        return <BlogPage posts={blogPosts} onNavigate={handleNavigate} />;
      }
      return renderHomePage();
    };

    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        {pageContent()}
      </div>
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
      <Chatbot appData={appData} />
    </div>
  );
};

export default App;
