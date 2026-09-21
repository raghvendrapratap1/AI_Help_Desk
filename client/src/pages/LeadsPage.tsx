import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Users, Search, Filter, Plus, ChevronLeft, ChevronRight, Phone, Mail, Sparkles, ExternalLink } from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { toast } from 'react-hot-toast';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    requirement: '',
    source: 'Phone',
    status: 'New',
    leadScore: 65,
    assignedTo: 'Dr. Sandesh Jain',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await API.get('/leads', {
        params: { search, status: statusFilter, source: sourceFilter, assignedTo: staffFilter, page }
      });
      if (res.data.success) {
        setLeads(res.data.data.leads);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, staffFilter, page]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/leads', formData);
      if (res.data.success) {
        toast.success(`Lead created for ${formData.patientName}`);
        setShowAddModal(false);
        setFormData({
          patientName: '',
          phone: '',
          email: '',
          requirement: '',
          source: 'Phone',
          status: 'New',
          leadScore: 65,
          assignedTo: 'Dr. Sandesh Jain',
          note: ''
        });
        fetchLeads();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerCall = async (lead: any, provider: 'exotel' | 'vapi' = 'exotel') => {
    if (!lead.phone) {
      toast.error('No phone number for this lead');
      return;
    }

    try {
      const res = await API.post('/telephony/outbound-call', {
        to: lead.phone,
        leadId: lead._id || lead.id,
        patientName: lead.patientName,
        requirement: lead.requirement,
        doctorName: lead.assignedTo,
        provider
      });
      if (res.data.success) {
        const id = res.data.data?.callSid || res.data.data?.callId || 'active';
        const provName = provider === 'exotel' ? 'Exotel PSTN' : 'Vapi AI Voice';
        toast.success(`${provName} call dispatched to ${lead.patientName}! (Call ID: ${id})`);
        fetchLeads();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place call');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'Contacted':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'Qualified':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Appointment Booked':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Converted':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Lost':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Patient Opportunity Leads
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage patient enquiries for Indore Poly Dental Clinic (Dental Implants, Root Canal, Aligners)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, phone, requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 flex-nowrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0">
            <Filter className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-teal-600 dark:text-teal-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Statuses</option>
              <option value="New" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">New</option>
              <option value="Contacted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Contacted</option>
              <option value="Qualified" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Qualified</option>
              <option value="Appointment Booked" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Appointment Booked</option>
              <option value="Converted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Converted</option>
              <option value="Lost" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0">
            <span className="text-slate-400 whitespace-nowrap">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent font-semibold text-teal-600 dark:text-teal-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Sources</option>
              <option value="Website" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Website Chat</option>
              <option value="Google" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Google</option>
              <option value="Instagram" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Instagram</option>
              <option value="Facebook" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Facebook</option>
              <option value="Referral" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Referral</option>
              <option value="Phone" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Phone</option>
              <option value="Walk-in" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Walk-in</option>
            </select>
          </div>

          {/* Module 11: Staff / Doctor Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0">
            <span className="text-slate-400 whitespace-nowrap">Doctor:</span>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-transparent font-semibold text-teal-600 dark:text-teal-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Doctors</option>
              <option value="Dr. Sandesh Jain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Dr. Sandesh Jain</option>
              <option value="Dr. Saumya Jain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Dr. Saumya Jain</option>
              <option value="Reception Desk" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Reception Desk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Container */}
      {loading ? (
        <LoadingState message="Fetching patient leads..." />
      ) : error ? (
        <ErrorState onRetry={fetchLeads} message="Unable to load leads." />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads match your filter"
          description="Try clearing search queries or add a manual lead."
          actionLabel="Add Lead"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="glass-panel rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Mobile / Tablet Stacked Cards (<md) */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800/60">
            {leads.map((lead) => (
              <div key={lead._id || lead.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/leads/${lead._id || lead.id}`}
                      className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center gap-1.5"
                    >
                      <span className="truncate">{lead.patientName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.phone}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Score: {lead.leadScore}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Concern: </span>
                  <span className="font-medium">{lead.requirement}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-semibold">
                    👨‍⚕️ {lead.assignedTo || 'Reception Desk'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {lead.source}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    onClick={() => handleTriggerCall(lead, 'exotel')}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-500/30 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                    title={`Place Exotel PSTN Call to ${lead.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-500" />
                    <span>Exotel Call</span>
                  </button>
                  <button
                    onClick={() => handleTriggerCall(lead, 'vapi')}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-500/30 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                    title={`Place Vapi Voice Call to ${lead.patientName}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Vapi Call</span>
                  </button>
                  <Link
                    to={`/leads/${lead._id || lead.id}`}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors shadow-sm inline-flex items-center"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">Patient Info</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Treatment Requirement</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Assigned Doctor</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Source</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Score</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {leads.map((lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-colors group">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link to={`/leads/${lead._id || lead.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5">
                        {lead.patientName}
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1 max-w-[220px] lg:max-w-xs">{lead.requirement}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-semibold text-[11px]">
                        👨‍⚕️ {lead.assignedTo || 'Reception Desk'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {lead.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              lead.leadScore >= 80
                                ? 'bg-teal-500'
                                : lead.leadScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{lead.leadScore}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap shadow-sm ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleTriggerCall(lead, 'exotel')}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-500/30 transition-all text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          title={`Place Exotel PSTN Follow-up Call to Indian Number ${lead.phone}`}
                        >
                          <Phone className="w-3 h-3 text-teal-500" />
                          <span>Exotel Call</span>
                        </button>
                        <button
                          onClick={() => handleTriggerCall(lead, 'vapi')}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-500/30 transition-all text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          title={`Place Vapi AI Voice Call to ${lead.patientName}`}
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>Vapi Call</span>
                        </button>
                        <Link
                          to={`/leads/${lead._id || lead.id}`}
                          className="min-h-[36px] inline-flex items-center px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} leads)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual "Add Lead" Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg overflow-y-auto p-5 sm:p-6 rounded-none sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-4 shadow-2xl animate-in zoom-in-95 flex flex-col justify-between sm:justify-start">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-500 shrink-0" />
                Add New Patient Lead (Manual CRUD)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Register a new enquiry for Indore Poly Dental Clinic directly from the front desk.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98270 XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Treatment Requirement *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Dental Implant consultation for lower molar / Root Canal pain"
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enquiry Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="Website">Website Chat</option>
                    <option value="Google">Google Search</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Referral">Doctor Referral</option>
                    <option value="Phone">Direct Call</option>
                    <option value="Walk-in">Clinic Walk-in</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Doctor</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="Dr. Sandesh Jain">Dr. Sandesh Jain (Surgeon)</option>
                    <option value="Dr. Saumya Jain">Dr. Saumya Jain (Endodontist)</option>
                    <option value="Front Desk">Front Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Timeline Note</label>
                <input
                  type="text"
                  placeholder="Patient prefers morning appointment"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center active:scale-95"
                >
                  {submitting ? 'Saving...' : 'Save Patient Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
