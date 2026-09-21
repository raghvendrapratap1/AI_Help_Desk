import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Users,
  Calendar,
  Building2,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  Stethoscope,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  BellRing,
  Play
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { clinic, fetchClinicInfo } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, bookedAppointments: 0 });
  const [dueFollowUps, setDueFollowUps] = useState<any[]>([]);
  const [runningBatch, setRunningBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      await fetchClinicInfo();
      const [res, followUpRes] = await Promise.all([
        API.get('/clinic'),
        API.get('/follow-ups/due-today').catch(() => ({ data: { success: false, data: { followUps: [] } } }))
      ]);

      if (res.data.success && res.data.data.stats) {
        setStats(res.data.data.stats);
      }
      if (followUpRes.data.success && followUpRes.data.data) {
        setDueFollowUps(followUpRes.data.data.followUps || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatch = async () => {
    setRunningBatch(true);
    try {
      const res = await API.post('/follow-ups/run-batch');
      if (res.data.success) {
        toast.success(`Follow-up batch processed! ${res.data.data.sent} sent.`);
        // Reload list
        const followUpRes = await API.get('/follow-ups/due-today');
        if (followUpRes.data.success && followUpRes.data.data) {
          setDueFollowUps(followUpRes.data.data.followUps || []);
        }
      } else {
        toast.error(res.data.error || 'Batch processing failed.');
      }
    } catch (err: any) {
      console.error('Failed to run batch:', err);
      toast.error('Failed to trigger follow-up batch.');
    } finally {
      setRunningBatch(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading Indore Poly Dental Clinic dashboard..." />;
  if (error) return <ErrorState onRetry={loadDashboardData} message="Failed to load clinic statistics." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Anchor Clinic Banner Card */}
      <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Anchor Clinic — Real Indore Data</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {clinic?.name || 'Indore Poly Dental Clinic'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
              <span>{clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001'}</span>
            </p>
            <div className="flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                {clinic?.operatingHours || 'Mon-Sat, 11:00-20:30'}
              </span>
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                {clinic?.phone || '+91 98270 12345'}
              </span>
              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                ~40 Years Combined Excellence
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              to="/conversations"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-teal-500 shrink-0" />
              <span>AI Conversations</span>
            </Link>
            <Link
              to="/leads"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Manage Leads</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Shell Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalLeads}</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Captured in CRM
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Leads</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.newLeads}</div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Awaiting follow-up</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Appointments Booked</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.bookedAppointments}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Confirmed consultations</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Anchor Specialists</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{clinic?.doctors?.length || 2}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Surgeon & Endodontist</div>
        </div>
      </div>

      {/* Module 4: Follow-ups Due Today Widget */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Follow-ups Due Today
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {dueFollowUps.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interested patient inquiries (Score 31–80) awaiting appointment confirmation
              </p>
            </div>
          </div>

          {dueFollowUps.length > 0 && (
            <button
              onClick={handleRunBatch}
              disabled={runningBatch}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all w-full sm:w-auto"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{runningBatch ? 'Dispatching...' : 'Dispatch Follow-up Batch'}</span>
            </button>
          )}
        </div>

        {dueFollowUps.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>No pending automated follow-ups scheduled for today.</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">Engine Active (Daily 09:00 AM)</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueFollowUps.map((fu) => {
              const lead = fu.leadId;
              const leadId = lead ? (lead._id || lead.id) : null;

              return (
                <div
                  key={fu._id || fu.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {lead?.patientName || 'Patient'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lead?.phone || 'No phone'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                      Score: {lead?.leadScore || 50}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    Requirement: <span className="font-medium text-slate-800 dark:text-slate-200">{lead?.requirement || 'General'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Scheduled 2 days out</span>
                    {leadId ? (
                      <Link
                        to={`/leads/${leadId}`}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5 min-h-[36px] py-1 px-2"
                      >
                        <span>Lead Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-slate-400">Lead Record</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Anchor Clinic Doctors Roster & Services Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Doctors Card */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            Indore Poly Dental Specialists
          </h2>
          <div className="space-y-3">
            {clinic?.doctors?.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{doc.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{doc.experience}</p>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  {doc.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Services & Knowledge Base Preview */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            Core Treatment Offerings
          </h2>
          <div className="flex flex-wrap gap-2">
            {clinic?.services?.map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-300 transition-colors shadow-sm min-h-[36px] inline-flex items-center"
              >
                {service}
              </span>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Knowledge Base Status</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 font-mono text-[11px] break-words">
              {clinic?.knowledgeBaseSnippet || 'Indexed with Indore Poly Dental Clinic details: 1/4 near 56 Shops, New Palasia, Indore.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
