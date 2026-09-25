
import React, { useState } from 'react';
import { firebaseLogin } from '../services/firebase';
import type { AdminUser } from '../types';
import CloseIcon from './icons/CloseIcon';
import Spinner from './ui/Spinner';
import Card from './ui/Card';

interface Props {
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

const AdminLoginModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const firebaseUser = await firebaseLogin(email, password);
      // Convert Firebase user to AdminUser format
      const adminUser: AdminUser = {
        email: firebaseUser.email || email,
        name: firebaseUser.displayName || 'Admin User',
        role: 'Admin'
      };
      onSuccess(adminUser);
    } catch (err: unknown) {
      // Format Firebase error messages
      let message = 'Login failed.';
      if (err && typeof err === 'object' && 'code' in err) {
          const errorCode = (err as { code: string }).code;
          if (errorCode === 'auth/user-not-found') {
            message = 'No account found with this email.';
          } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            message = 'Invalid email or password.';
          } else if (errorCode === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Please try again later.';
          }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const { sendPasswordResetEmail, getAuth } = await import('firebase/auth');
      await sendPasswordResetEmail(getAuth(), email);
      setResetSent(true);
    } catch (err: unknown) {
      let message = 'Failed to send reset email.';
      if (err instanceof Error) message = err.message;
      setError(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Admin Access</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-yellow rounded-full p-1" aria-label="Close dialog">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <p className="mt-2 text-sm text-slate-500">Please enter your credentials to access the admin panel.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            {resetSent && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">Password reset email sent! Check your inbox.</p>}
            
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-slate-600 ml-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1 bg-slate-100 border-2 border-slate-200 rounded-lg p-3 font-medium focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline ml-1">
                <label htmlFor="password" className="text-sm font-semibold text-slate-600">Password</label>
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-xs font-semibold text-brand-blue hover:text-brand-yellow transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mt-1 bg-slate-100 border-2 border-slate-200 rounded-lg p-3 font-medium focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition"
                required={!resetSent}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-brand-blue text-white font-bold text-lg py-3 rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : 'Login'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginModal;
