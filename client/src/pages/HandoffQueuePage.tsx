import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Conversation, Message } from '../../../shared/types';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { toast } from 'react-hot-toast';
import {
  AlertTriangle,
  Send,
  User,
  Phone,
  Clock,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HandoffQueuePage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const fetchHandoffQueue = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const res = await API.get('/conversations/handoff-queue');
      if (res.data.success) {
        const queue: Conversation[] = res.data.data;
        setConversations(queue);
        if (queue.length > 0) {
          if (!selectedConv || !queue.some((c) => c.id === selectedConv.id || (c as any)._id === (selectedConv as any)._id)) {
            setSelectedConv(queue[0]);
            loadMessages((queue[0] as any)._id || queue[0].id);
          }
        } else {
          setSelectedConv(null);
          setMessages([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch handoff queue:', err);
      setError(true);
      toast.error('Failed to load handoff queue.');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await API.get(`/conversations/${convId}`);
      if (res.data.success) {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation transcript:', err);
      toast.error('Could not load conversation messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchHandoffQueue();
  }, []);

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    loadMessages((conv as any)._id || conv.id);
    setMobileView('chat');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim() || submitting) return;

    const convId = (selectedConv as any)._id || selectedConv.id;
    setSubmitting(true);

    try {
      const res = await API.post(`/conversations/${convId}/reply`, {
        message: replyText.trim()
      });

      if (res.data.success) {
        toast.success('Reply sent to patient & marked as resolved!');
        setReplyText('');
        // Refresh queue
        await fetchHandoffQueue(true);
      } else {
        toast.error(res.data.error || 'Failed to submit staff reply.');
      }
    } catch (err: any) {
      console.error('Failed to send staff reply:', err);
      toast.error(err.response?.data?.error || 'Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading escalated conversations requiring clinic attention..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => fetchHandoffQueue()} message="Unable to load human handoff queue." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Clinic Priority Escalation Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Human Handoff Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conversations flagged by emergency patterns, explicit patient requests, or AI knowledge fallbacks.
          </p>
        </div>

        <button
          onClick={() => {
            fetchHandoffQueue();
            toast.success('Handoff queue refreshed');
          }}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span>Refresh Queue ({conversations.length})</span>
        </button>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          title="All Clear! No Escalations Pending"
          description="No conversations currently require human intervention. The AI digital receptionist is managing incoming patient inquiries."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-[580px]">
          {/* Left: Escalation List */}
          <div className={`lg:col-span-5 space-y-3 ${mobileView === 'chat' ? 'hidden lg:block' : 'block'}`}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Active Escalations ({conversations.length})
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {conversations.map((conv) => {
                const convId = (conv as any)._id || conv.id;
                const isSelected = selectedConv && ((selectedConv as any)._id || selectedConv.id) === convId;

                return (
                  <div
                    key={convId}
                    onClick={() => handleSelectConv(conv)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-400/50 shadow-md ring-1 ring-rose-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {conv.patientName || 'Web Visitor'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(conv.updatedAt || conv.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                        {conv.intent || 'Needs Staff'}
                      </span>
                    </div>

                    {/* Escalation Reason */}
                    <div className="mb-2 p-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 font-medium">
                      ⚠️ <strong>Reason:</strong> {conv.escalationReason || 'Patient inquiry requires human assistance'}
                    </div>

                    {/* AI 2-Sentence Summary */}
                    {conv.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        "{conv.summary}"
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Phone: {conv.phone || 'Not shared'}</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        Score: {conv.leadScore || 20}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Conversation Transcript & Inline Staff Reply */}
          <div
            className={`lg:col-span-7 flex flex-col h-[640px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden ${
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {selectedConv ? (
              <>
                {/* Panel Header */}
                <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40 shrink-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Mobile Back Button to return to list */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"
                      aria-label="Back to escalation queue"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                          {selectedConv.patientName || 'Web Visitor'}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                          Pending Reply
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {selectedConv.phone && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <a href={`tel:${selectedConv.phone}`} className="hover:underline">
                              {selectedConv.phone}
                            </a>
                          </span>
                        )}
                        {selectedConv.leadId && (
                          <Link
                            to={`/leads/${(selectedConv.leadId as any)._id || selectedConv.leadId}`}
                            className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                          >
                            CRM Record →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Score</div>
                    <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      {selectedConv.leadScore}/100
                    </div>
                  </div>
                </div>

                {/* AI Summary Banner */}
                {selectedConv.summary && (
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-teal-50/60 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/30 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 shrink-0">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-teal-800 dark:text-teal-300">AI Context Summary: </span>
                      <span className="break-words">{selectedConv.summary}</span>
                    </div>
                  </div>
                )}

                {/* Message Thread */}
                <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                  {loadingMessages ? (
                    <LoadingState message="Loading transcript..." />
                  ) : messages.length === 0 ? (
                    <EmptyState title="No messages found" description="No transcript messages available." />
                  ) : (
                    messages.map((msg) => {
                      const isPatient = msg.sender === 'patient';
                      const isStaff = msg.sender === 'staff';

                      return (
                        <div
                          key={msg.id || (msg as any)._id}
                          className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}
                        >
                          <div className="text-[10px] text-slate-400 mb-1 px-1 font-semibold">
                            {isPatient
                              ? selectedConv.patientName || 'Patient'
                              : isStaff
                              ? 'Clinic Staff (Human Reply)'
                              : 'AI Receptionist'}
                          </div>
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                              isPatient
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                : isStaff
                                ? 'bg-indigo-600 text-white font-medium rounded-tr-sm'
                                : 'bg-teal-600 text-white font-medium rounded-tr-sm'
                            }`}
                          >
                            <span className="break-words whitespace-pre-wrap">{msg.text}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Staff Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
                >
                  <div className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Send Direct Human Reply as Clinic Staff:</span>
                    <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                      Clears escalation flag on send
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message to the patient (e.g. 'Hello, this is Dr. Sandesh Jain's desk. We can accommodate you tomorrow at 11:30 AM...')"
                      rows={2}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 min-h-[44px] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !replyText.trim()}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                    >
                      {submitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply & Resolve</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <EmptyState
                  title="Select an Escalated Conversation"
                  description="Choose a patient conversation from the queue on the left to read their inquiry and reply."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoffQueuePage;
