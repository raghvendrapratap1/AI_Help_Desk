import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  User,
  Phone,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LoadingState } from '../components/common/LoadingState';

export const PatientConfirmationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!token) {
        setError('Missing confirmation token.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/appointments/verify/${token}`);
        if (res.data.success) {
          setAppointment(res.data.data);
          if (res.data.data.status === 'Confirmed') {
            setIsConfirmed(true);
          }
        } else {
          setError(res.data.error || 'Appointment not found.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired confirmation link.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setConfirming(true);
    try {
      const res = await axios.post(`/api/appointments/confirm/${token}`);
      if (res.data.success) {
        setIsConfirmed(true);
        setAppointment((prev: any) => ({ ...prev, status: 'Confirmed' }));
      } else {
        setError(res.data.error || 'Could not confirm appointment.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm appointment. Please call the clinic.');
    } finally {
      setConfirming(false);
    }
  };

  const generateGoogleCalendarLink = () => {
    if (!appointment) return '#';
    const title = encodeURIComponent(`Dental Consultation - ${appointment.clinicName || 'Indore Poly Dental Clinic'}`);
    const details = encodeURIComponent(`Consultation with ${appointment.doctorName} for ${appointment.patientName}.`);
    const location = encodeURIComponent(appointment.address || '1/4, near 56 Shops, New Palasia, Indore');
    const dateClean = (appointment.date || '').replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateClean}T060000Z/${dateClean}T070000Z`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <LoadingState message="Verifying your appointment details with Indore Poly Dental Clinic..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                {appointment?.clinicName || 'Indore Poly Dental Clinic'}
              </h1>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                Patient Self-Service Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 w-full">
        {error ? (
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Appointment Link Issue</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <a
                href="tel:+919827012345"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md"
              >
                <Phone className="w-4 h-4" />
                Call Clinic Reception: +91 98270 12345
              </a>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Clinical Slot</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {isConfirmed ? 'Your Appointment is Confirmed!' : 'Confirm Your Dental Appointment'}
              </h2>
              <p className="text-xs text-teal-100 mt-1 max-w-sm mx-auto">
                {isConfirmed
                  ? 'We have reserved your clinic chair. See your consultation details below.'
                  : 'Please review your consultation details and click confirm to lock in your appointment.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <User className="w-4 h-4 text-teal-500" />
                    <span>Patient Name</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {appointment.patientName}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-4 h-4 text-teal-500" />
                    <span>Specialist Doctor</span>
                  </div>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {appointment.doctorName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                      <span>Date</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {appointment.date}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-teal-500" />
                      <span>Time Slot</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {appointment.startTime}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {appointment.clinicName || 'Indore Poly Dental Clinic'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block mt-0.5">
                        {appointment.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001'}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Indore Poly Dental Clinic, 1/4 near 56 Shops, New Palasia, Indore')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {isConfirmed ? (
                <div className="space-y-3 pt-2 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Appointment Status: Confirmed</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <a
                      href={generateGoogleCalendarLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <Calendar className="w-4 h-4 text-teal-500" />
                      <span>Add to Google Calendar</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <Link
                      to="/"
                      className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
                    >
                      <span>Return to Website</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{confirming ? 'Confirming Your Slot...' : '✅ Yes, Confirm My Appointment'}</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                    By confirming, your slot will be officially booked with clinic staff. Need changes? Call{' '}
                    <a href="tel:+919827012345" className="text-teal-600 dark:text-teal-400 font-bold underline">
                      +91 98270 12345
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 Indore Poly Dental Clinic. Advanced Oral Surgery & Endodontic Care Center.</p>
      </footer>
    </div>
  );
};
