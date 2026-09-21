import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, Mail, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { toast } from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@indoredental.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Dr. Sandesh Jain!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@indoredental.com');
    setPassword('admin123');
    setLoading(true);
    try {
      await login('admin@indoredental.com', 'admin123');
      toast.success('Logged in as Indore Poly Dental Admin');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Demo login error: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] max-w-full h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Controls */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Public Clinic Website</span>
          <span className="sm:hidden">Website</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-xl shadow-teal-500/20 text-slate-950">
            <Building2 className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Indore Poly Dental Clinic
        </h2>
        <p className="mt-1 text-center text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          AI Front Desk & CRM Staff Login
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          {/* Quick Demo Login Preset Button */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Demo Shortcut
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-800 dark:text-teal-300 font-mono font-bold">
                Indore Dental Anchor
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              One-click instant admin login to access Indore Poly Dental Clinic's front desk dashboard and CRM.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95 flex items-center justify-center"
            >
              🚀 Quick Demo Login (Dr. Sandesh Jain)
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">Or log in with credentials</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full min-h-[44px] pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full min-h-[44px] pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors border border-slate-700 mt-2 shadow-sm flex items-center justify-center"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-3 text-center">
            <Link
              to="/onboard"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 min-h-[36px]"
            >
              Need to set up a new clinic? Self-Onboard Here →
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Indore Poly Dental Clinic — 1/4, near 56 Shops, New Palasia, Indore, MP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
