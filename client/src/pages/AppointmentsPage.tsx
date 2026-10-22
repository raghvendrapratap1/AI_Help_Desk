import { Calendar as CalendarIcon, CheckCircle2, Clock, Filter, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import API from '../services/api';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState('All');

  const fetchAppointments = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await API.get('/appointments', {
        params: { doctorName: doctorFilter }
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await API.put(`/appointments/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Appointment status set to ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Requested':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Completed':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Clinic Appointment Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal appointment schedule for Dr. Sandesh Jain & Dr. Saumya Jain at Indore Poly Dental Clinic
          </p>
        </div>

        {/* Doctor Filter */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 min-h-[44px] text-xs text-slate-700 dark:text-slate-300 shadow-sm w-full sm:w-auto">
          <Filter className="w-4 h-4 text-teal-500 shrink-0" />
          <span className="text-slate-400 shrink-0">Specialist:</span>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="bg-transparent font-semibold text-teal-600 dark:text-teal-300 focus:outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Specialists</option>
            <option value="Dr. Sandesh Jain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Dr. Sandesh Jain (Surgeon)</option>
            <option value="Dr. Saumya Jain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Dr. Saumya Jain (Endodontist)</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingState message="Loading clinic appointments..." />
      ) : error ? (
        <ErrorState onRetry={fetchAppointments} message="Unable to load appointments." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No scheduled appointments"
          description="There are no appointments booked for this view."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {appointments.map((appt) => (
            <div key={appt._id || appt.id} className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${getStatusBadge(appt.status)}`}>
                    {appt.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    <span>{appt.status === 'Confirmed' ? 'Confirmed • Verified Attendance' : appt.status}</span>
                  </span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-mono font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{appt.date} at {appt.startTime}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{appt.patientName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appt.phone}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="text-teal-700 dark:text-teal-300 font-semibold">{appt.doctorName}</div>
                  {appt.notes && <div className="text-slate-600 dark:text-slate-400 text-[11px] break-words">{appt.notes}</div>}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(appt._id || appt.id, 'Confirmed')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center justify-center active:scale-95"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(appt._id || appt.id, 'Completed')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold border border-teal-500/30 transition-all flex items-center justify-center active:scale-95"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus(appt._id || appt.id, 'Cancelled')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all flex items-center justify-center active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
