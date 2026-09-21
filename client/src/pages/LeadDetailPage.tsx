import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  ChevronLeft,
  Phone,
  Mail,
  User,
  Sparkles,
  Calendar,
  MessageSquare,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { toast } from 'react-hot-toast';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Appointment Modal State
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptData, setApptData] = useState({
    doctorName: 'Dr. Sandesh Jain',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    notes: 'Consultation at Indore Poly Dental Clinic'
  });
  const [bookingAppt, setBookingAppt] = useState(false);
  const [callingExotel, setCallingExotel] = useState(false);
  const [callingVapi, setCallingVapi] = useState(false);

  const handleTriggerCall = async (provider: 'exotel' | 'vapi') => {
    if (!lead?.phone) {
      toast.error('No phone number available for this lead');
      return;
    }

    if (provider === 'exotel') setCallingExotel(true);
    if (provider === 'vapi') setCallingVapi(true);

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
        const provName = provider === 'exotel' ? 'Exotel PSTN' : 'Vapi Voice AI';
        toast.success(`${provName} Call initiated to ${lead.patientName}! Call ID: ${id}`);
        fetchLeadDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to place ${provider} call`);
    } finally {
      if (provider === 'exotel') setCallingExotel(false);
      if (provider === 'vapi') setCallingVapi(false);
    }
  };

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await API.get(`/leads/${id}`);
      if (res.data.success) {
        setLead(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLeadDetails();
  }, [id]);

  const handleStatusTransition = async (newStatus: string) => {
    try {
      const res = await API.put(`/leads/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setLead(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await API.post(`/leads/${id}/notes`, { content: newNote });
      if (res.data.success) {
        toast.success('Timeline note recorded');
        setLead(res.data.data);
        setNewNote('');
      }
    } catch (err: any) {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingAppt(true);
    try {
      const res = await API.post('/appointments', {
        leadId: lead._id || lead.id,
        patientName: lead.patientName,
        phone: lead.phone,
        doctorName: apptData.doctorName,
        date: apptData.date,
        startTime: apptData.startTime,
        notes: apptData.notes
      });

      if (res.data.success) {
        toast.success(`Appointment booked with ${apptData.doctorName}`);
        setShowApptModal(false);
        fetchLeadDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setBookingAppt(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('Are you sure you want to delete this patient lead record?')) return;

    try {
      await API.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch (err: any) {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) return <LoadingState message="Loading patient lead timeline..." />;
  if (error || !lead) return <ErrorState onRetry={fetchLeadDetails} message="Lead record not found." />;

  const statusOptions = ['New', 'Contacted', 'Qualified', 'Appointment Booked', 'Converted', 'Lost'];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Back Nav & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Leads List</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerCall('exotel')}
            disabled={callingExotel}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            title="Place Exotel PSTN Automated Follow-up Call"
          >
            <Phone className={`w-3.5 h-3.5 ${callingExotel ? 'animate-spin' : ''}`} />
            <span>{callingExotel ? 'Calling Exotel...' : '📞 Exotel PSTN Call'}</span>
          </button>

          <button
            onClick={() => handleTriggerCall('vapi')}
            disabled={callingVapi}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50 border border-emerald-400/30 active:scale-95"
            title="Trigger Outbound AI Voice Follow-up Call via Vapi"
          >
            <Sparkles className={`w-3.5 h-3.5 ${callingVapi ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{callingVapi ? 'Calling Vapi...' : '🎙️ Vapi Voice AI'}</span>
          </button>

          <button
            onClick={() => setShowApptModal(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={handleDeleteLead}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shadow-sm flex items-center justify-center"
            title="Delete Record"
            aria-label="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xl shadow-inner shrink-0">
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">{lead.patientName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400 text-[11px] font-mono font-bold">
                  Score: {lead.leadScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">{lead.requirement}</p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  {lead.phone}
                </span>
                {lead.email && (
                  <span className="flex items-center gap-1 font-medium">
                    <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    {lead.email}
                  </span>
                )}
                <span>Source: <strong className="text-slate-700 dark:text-slate-300">{lead.source}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Assigned Specialist</span>
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {lead.assignedTo || 'Dr. Sandesh Jain'}
            </span>
          </div>
        </div>

        {/* Manual Status Pipeline Transition Bar */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Manual Status Transitions Pipeline</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((st) => {
              const isActive = lead.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusTransition(st)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
                  }`}
                >
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />}
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline & Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Timeline Log */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Activity & Notes Timeline</span>
          </h2>

          {/* Add Note Input */}
          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Write a timeline note or follow-up comment..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              type="submit"
              disabled={addingNote || !newNote.trim()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Notes Feed */}
          <div className="space-y-3 pt-2">
            {lead.notes && lead.notes.length > 0 ? (
              lead.notes.map((n: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-700 dark:text-teal-400">{n.author || 'Admin'}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 break-words">{n.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No timeline notes recorded yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Linked Appointment & Verified Attendance Card */}
          {lead.appointment && (
            <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-teal-500/30 dark:border-teal-500/30 bg-teal-50/60 dark:bg-teal-950/20 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Booked Appointment
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verified Attendance</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Doctor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.appointment.doctorName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Scheduled Slot</span>
                  <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                    {lead.appointment.date} at {lead.appointment.startTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">Attendance Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Verified Attendance</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <Link
                  to="/appointments"
                  className="w-full min-h-[38px] py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View All Clinic Appointments</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Clinic Info Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200">Indore Poly Dental Details</h2>
            <div className="text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Clinic Hours</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300">Mon-Sat: 11:00 AM - 8:30 PM</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Consulting Specialists</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Dr. Sandesh Jain (Surgeon)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Dr. Saumya Jain (Endodontist)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Address</span>
                <span className="text-slate-700 dark:text-slate-300">1/4, near 56 Shops, New Palasia, Indore</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md overflow-y-auto p-5 sm:p-6 rounded-none sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-4 shadow-2xl animate-in zoom-in-95 flex flex-col justify-between sm:justify-start">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500 shrink-0" />
                <span>Book Appointment for {lead.patientName}</span>
              </h2>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Specialist Doctor</label>
                <select
                  value={apptData.doctorName}
                  onChange={(e) => setApptData({ ...apptData, doctorName: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                >
                  <option value="Dr. Sandesh Jain">Dr. Sandesh Jain (Oral & Maxillofacial Surgeon)</option>
                  <option value="Dr. Saumya Jain">Dr. Saumya Jain (Endodontist)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={apptData.date}
                    onChange={(e) => setApptData({ ...apptData, date: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={apptData.startTime}
                    onChange={(e) => setApptData({ ...apptData, startTime: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Appointment Notes</label>
                <textarea
                  rows={2}
                  value={apptData.notes}
                  onChange={(e) => setApptData({ ...apptData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingAppt}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center active:scale-95"
                >
                  {bookingAppt ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
