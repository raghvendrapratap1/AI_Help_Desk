import {
  Calendar,
  CheckCircle2,
  Globe,
  HelpCircle,
  Layers,
  MessageSquare,
  PhoneCall,
  PieChart,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AnalyticsSummary, SourceAnalytics, UnansweredQuestion, VisitorTrendsData } from '../../../shared/types';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sourceData, setSourceData] = useState<SourceAnalytics[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([]);
  const [visitorTrends, setVisitorTrends] = useState<VisitorTrendsData | null>(null);
  const [trendTimeframe, setTrendTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [sourceTimeframe, setSourceTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnalyticsData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [summaryRes, sourceRes, questionsRes, trendsRes] = await Promise.all([
        API.get('/analytics/summary'),
        API.get('/analytics/by-source', { params: { timeframe: sourceTimeframe } }),
        API.get('/analytics/unanswered-questions'),
        API.get('/analytics/visitor-trends', { params: { timeframe: trendTimeframe } })
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (sourceRes.data.success) {
        setSourceData(sourceRes.data.data);
      }
      if (questionsRes.data.success) {
        setUnansweredQuestions(questionsRes.data.data);
      }
      if (trendsRes.data.success) {
        setVisitorTrends(trendsRes.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load analytics data:', err);
      setError(true);
      toast.error('Failed to load clinic analytics.');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  const handleTrendTimeframeChange = async (tf: 'today' | 'week' | 'month') => {
    setTrendTimeframe(tf);
    setTrendLoading(true);
    try {
      const res = await API.get('/analytics/visitor-trends', { params: { timeframe: tf } });
      if (res.data.success) {
        setVisitorTrends(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load visitor trends:', err);
      toast.error('Failed to update visitor trend chart.');
    } finally {
      setTrendLoading(false);
    }
  };

  const handleSourceTimeframeChange = async (tf: 'all' | 'today' | 'week' | 'month') => {
    setSourceTimeframe(tf);
    setSourceLoading(true);
    try {
      const res = await API.get('/analytics/by-source', { params: { timeframe: tf } });
      if (res.data.success) {
        setSourceData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load source metrics:', err);
      toast.error('Failed to update channel acquisition chart.');
    } finally {
      setSourceLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleMarkAsAddedToKb = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await API.delete(`/analytics/unanswered-questions/${id}`);
      if (res.data.success) {
        toast.success('Marked as added to Knowledge Base and removed!');
        setUnansweredQuestions((prev) => prev.filter((q) => ((q as any)._id || q.id) !== id));
      } else {
        toast.error(res.data.error || 'Failed to remove question record.');
      }
    } catch (err: any) {
      console.error('Failed to remove unanswered question:', err);
      toast.error('Failed to mark question as added.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Computing real-time clinic analytics & patient acquisition metrics..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => fetchAnalyticsData()} message="Failed to load clinic analytics." />;
  }

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1">
            <PieChart className="w-3.5 h-3.5 shrink-0" />
            <span>Clinic Intelligence & Acquisition ROI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Clinic Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time patient inquiry and visitor acquisition metrics for Indore Poly Dental Clinic.
          </p>
        </div>

        <button
          onClick={() => {
            fetchAnalyticsData();
            toast.success('Analytics metrics recomputed');
          }}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.totalLeads || 0}
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">All recorded enquiries</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New This Week</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.newThisWeek || 0}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Recent 7 days</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High-Intent Leads</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.highIntentCount || 0}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Lead Score ≥ 70</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.conversionRate || 0}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Booked / Total</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Consultations</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.appointmentsCount || 0}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Appointments booked</div>
        </div>
      </div>

      {/* NEW: Patient Visits & Inquiries Trend Graph (Today / Week / Month by Source) */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Users className="w-4 h-4 shrink-0" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Patient Traffic & Enquiries by Source
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time graph of how many patients visit or reach out via Website Chat, Phone Calls, or other channels.
            </p>
          </div>

          {/* Timeframe Selector Pills (Today / This Week / This Month) */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shrink-0">
            <button
              onClick={() => handleTrendTimeframeChange('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${trendTimeframe === 'today'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Today
            </button>
            <button
              onClick={() => handleTrendTimeframeChange('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${trendTimeframe === 'week'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleTrendTimeframeChange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${trendTimeframe === 'month'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Breakdown Stat Badges */}
        {visitorTrends && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {trendTimeframe === 'today' ? "Today's Total Traffic" : trendTimeframe === 'week' ? "This Week's Traffic" : "This Month's Traffic"}
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {visitorTrends.summary.totalVisits}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">patients</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal-700 dark:text-teal-300">
                <Globe className="w-3.5 h-3.5" />
                <span>Website Chat</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-teal-800 dark:text-teal-200 mt-0.5">
                {visitorTrends.summary.websiteVisits}{' '}
                <span className="text-xs font-normal text-teal-600 dark:text-teal-400">
                  ({visitorTrends.summary.totalVisits > 0 ? Math.round((visitorTrends.summary.websiteVisits / visitorTrends.summary.totalVisits) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Phone Voice Calls</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-indigo-800 dark:text-indigo-200 mt-0.5">
                {visitorTrends.summary.phoneCalls}{' '}
                <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
                  ({visitorTrends.summary.totalVisits > 0 ? Math.round((visitorTrends.summary.phoneCalls / visitorTrends.summary.totalVisits) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp & Others</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-200 mt-0.5">
                {(visitorTrends.summary.whatsappInquiries || 0) + (visitorTrends.summary.otherInquiries || 0)}{' '}
                <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                  ({visitorTrends.summary.totalVisits > 0 ? Math.round((((visitorTrends.summary.whatsappInquiries || 0) + (visitorTrends.summary.otherInquiries || 0)) / visitorTrends.summary.totalVisits) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Stacked Chart */}
        {trendLoading ? (
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Updating {trendTimeframe} traffic graph...</span>
            </div>
          </div>
        ) : !visitorTrends || visitorTrends.trend.length === 0 ? (
          <EmptyState
            title="No Traffic Data Found"
            description="No visitor interactions or enquiries recorded for this period."
          />
        ) : (
          <div className="h-64 sm:h-80 w-full pt-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visitorTrends.trend}
                margin={{ top: 15, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  interval={trendTimeframe === 'today' ? 1 : 0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: any) => {
                    const labelMap: Record<string, string> = {
                      website: 'Website Chat',
                      phone: 'Phone Calls',
                      whatsapp: 'WhatsApp',
                      other: 'Other Sources',
                      total: 'Total Patients'
                    };
                    return [value, labelMap[name] || name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="website" name="Website Chat" stackId="sourceStack" fill="#0d9488" radius={[0, 0, 0, 0]} />
                <Bar dataKey="phone" name="Phone Calls" stackId="sourceStack" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="whatsapp" name="WhatsApp" stackId="sourceStack" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" name="Other Sources" stackId="sourceStack" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bar Chart: Leads & Conversions by Source with Timeframe Filter */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4 shrink-0" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Patient Acquisition & Conversions by Channel
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comparison of incoming inquiries vs booked consultations across marketing sources.
            </p>
          </div>

          {/* Timeframe Filter for Acquisition Channels */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shrink-0">
            <button
              onClick={() => handleSourceTimeframeChange('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sourceTimeframe === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              All Time
            </button>
            <button
              onClick={() => handleSourceTimeframeChange('today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sourceTimeframe === 'today'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Today
            </button>
            <button
              onClick={() => handleSourceTimeframeChange('week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sourceTimeframe === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleSourceTimeframeChange('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sourceTimeframe === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              This Month
            </button>
          </div>
        </div>

        {sourceLoading ? (
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Updating channel conversion metrics...</span>
            </div>
          </div>
        ) : sourceData.length === 0 ? (
          <EmptyState
            title="No Source Data Available"
            description={`No patient leads recorded for ${sourceTimeframe === 'all' ? 'this clinic' : sourceTimeframe}.`}
          />
        ) : (
          <div className="h-64 sm:h-72 w-full pt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceData}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="source"
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" name="Total Inquiries" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="converted" name="Converted / Booked" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Unanswered Questions Table & Mobile Cards */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Unanswered Patient Questions (Knowledge Gaps)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questions that triggered AI receptionist fallbacks. Add these answers to your clinic knowledge base.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 self-start sm:self-auto shrink-0">
            {unansweredQuestions.length} Pending Topics
          </span>
        </div>

        {unansweredQuestions.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No Unanswered Questions"
              description="The AI receptionist has successfully answered all patient inquiries within the verified Indore Poly Dental Clinic knowledge base."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Mobile Stacked Cards (<md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {unansweredQuestions.map((q) => {
                const qId = (q as any)._id || q.id;
                const isDeleting = deletingId === qId;

                return (
                  <div key={qId} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 break-words">
                        "{q.question}"
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                        {q.count} {q.count === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Last asked: {new Date(q.lastAskedAt).toLocaleDateString()} {new Date(q.lastAskedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <button
                        onClick={() => handleMarkAsAddedToKb(qId)}
                        disabled={isDeleting}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500 hover:text-slate-950 dark:hover:bg-teal-400 font-semibold text-xs transition-all shadow-sm disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{isDeleting ? 'Removing...' : 'Mark as added to KB'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <tr>
                    <th className="py-3 px-4">Patient Question / Inquiry</th>
                    <th className="py-3 px-4 text-center">Times Asked</th>
                    <th className="py-3 px-4">Last Inquired</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {unansweredQuestions.map((q) => {
                    const qId = (q as any)._id || q.id;
                    const isDeleting = deletingId === qId;

                    return (
                      <tr
                        key={qId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-md">
                          "{q.question}"
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            {q.count} {q.count === 1 ? 'time' : 'times'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(q.lastAskedAt).toLocaleDateString()}{' '}
                          {new Date(q.lastAskedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleMarkAsAddedToKb(qId)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500 hover:text-slate-950 dark:hover:bg-teal-400 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isDeleting ? 'Removing...' : 'Mark as added to KB'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
