import { ArrowRight, Building2, CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import API from '../services/api';

export const ClinicOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('Indore');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('Mon-Sat 10:00 AM - 8:30 PM');

  // Admin details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Growth' | 'Enterprise'>('Free');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/onboarding/register', {
        clinicName,
        city,
        address,
        phone,
        email,
        operatingHours,
        adminName,
        adminEmail,
        adminPassword,
        services: ['Dental Checkup', 'Dental Implants', 'Root Canal Treatment', 'Teeth Cleaning', 'Invisible Aligners'],
        doctors: [
          {
            name: adminName || 'Chief Dental Surgeon',
            title: 'Lead Specialist',
            specialty: 'Oral Surgery & Comprehensive Dentistry',
            experience: '10+ Years Experience'
          }
        ]
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(`Welcome aboard, ${clinicName}! Your AI Front Desk is ready.`);

        if (selectedPlan !== 'Free') {
          setStep(3);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Clinic registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatePayment = async () => {
    setSubmitting(true);
    try {
      const checkoutRes = await API.post('/onboarding/checkout', { plan: selectedPlan });
      if (checkoutRes.data.success) {
        const verifyRes = await API.post('/onboarding/verify-payment', {
          orderId: checkoutRes.data.order.id,
          paymentId: `pay_${Date.now()}`,
          signature: 'sig_simulated_razorpay',
          plan: selectedPlan
        });
        if (verifyRes.data.success) {
          toast.success(`Upgraded to ${selectedPlan} Plan!`);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              AI Front Desk
            </h1>
            <p className="text-[10px] sm:text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
              Multi-Tenant Clinic Self-Onboarding
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-500 min-h-[44px] inline-flex items-center px-2 py-1"
          >
            <span className="hidden sm:inline">Already have an account? Log in</span>
            <span className="sm:hidden font-bold">Log in</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-12 w-full">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-2 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step >= 1 ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>1</div>
            <span className="text-xs font-semibold hidden sm:inline">Clinic Info</span>
            <span className="text-[11px] font-semibold sm:hidden">Clinic</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step >= 2 ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>2</div>
            <span className="text-xs font-semibold hidden sm:inline">Admin Account</span>
            <span className="text-[11px] font-semibold sm:hidden">Admin</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step >= 3 ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>3</div>
            <span className="text-xs font-semibold hidden sm:inline">Plan & Billing</span>
            <span className="text-[11px] font-semibold sm:hidden">Plan</span>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/70">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500 shrink-0" /> Clinic Registration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your clinic details to automatically generate your 24/7 AI Receptionist knowledge base.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Dental Care"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102 Metro Towers, Vijay Nagar, Indore"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!clinicName || !phone || !address}
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <span>Continue to Admin Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" /> Admin Account & Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Create the owner account for {clinicName} and select your subscription tier.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor / Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Rajesh Mehta"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setSelectedPlan('Free')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex sm:flex-col justify-between sm:justify-start items-center sm:items-start min-h-[56px] ${selectedPlan === 'Free' ? 'border-teal-500 bg-teal-500/10 shadow-sm shadow-teal-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Free Tier</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Evaluation & Testing</div>
                      </div>
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400 sm:mt-2">₹0 / month</div>
                    </div>
                    <div
                      onClick={() => setSelectedPlan('Growth')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex sm:flex-col justify-between sm:justify-start items-center sm:items-start min-h-[56px] ${selectedPlan === 'Growth' ? 'border-teal-500 bg-teal-500/10 shadow-sm shadow-teal-500/20 ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <div>
                        <div className="font-bold text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          Growth Plan
                          <span className="text-[9px] px-1.5 py-0.2 bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded font-semibold">Popular</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Full AI reception + WhatsApp</div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white sm:mt-2">₹2,999 / mo</div>
                    </div>
                    <div
                      onClick={() => setSelectedPlan('Enterprise')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex sm:flex-col justify-between sm:justify-start items-center sm:items-start min-h-[56px] ${selectedPlan === 'Enterprise' ? 'border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <div>
                        <div className="font-bold text-xs text-purple-600 dark:text-purple-400">Enterprise</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Multi-branch + custom voice</div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white sm:mt-2">₹5,999 / mo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !adminEmail || !adminPassword}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-500 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Confirm Subscription: {selectedPlan} Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Razorpay payment gateway integration stub. In evaluation mode, payment is simulated safely.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold">{selectedPlan} Plan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold">{selectedPlan === 'Growth' ? '₹2,999' : '₹5,999'} / mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-bold text-teal-500">Razorpay (Test Mode)</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSimulatePayment}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center active:scale-95"
                >
                  {submitting ? 'Processing Payment...' : 'Authorize & Upgrade'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 px-4">
        © 2026 AI Front Desk Platform. Multi-Tenant Architecture.
      </footer>
    </div>
  );
};

