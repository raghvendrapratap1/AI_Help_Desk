import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  MessageSquare,
  Bot,
  User,
  Sparkles,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const fetchConversations = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await API.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0 && !selectedConv) {
          loadConversationMessages(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conv: any) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const res = await API.get(`/conversations/${conv._id || conv.id}`);
      if (res.data.success) {
        setMessages(res.data.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConv = (conv: any) => {
    loadConversationMessages(conv);
    setMobileView('chat');
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.patientName && c.patientName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.intent && c.intent.toLowerCase().includes(q)) ||
      (c.treatment && c.treatment.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case 'Emergency':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'Appointment Request':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Pricing Enquiry':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Treatment Enquiry':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-[calc(100vh-7.5rem)] flex flex-col">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>AI Receptionist Conversations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time chat interactions between website visitors and the Indore Poly Dental AI Receptionist
          </p>
        </div>

        <button
          onClick={fetchConversations}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <span>Refresh Threads</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading AI receptionist conversation logs..." />
      ) : error ? (
        <ErrorState onRetry={fetchConversations} message="Failed to load conversations." />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No visitor conversations yet"
          description="When a visitor chats with the AI on your clinic landing page, their transcript will stream in here automatically."
        />
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Conversation List */}
          <div
            className={`md:col-span-5 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm ${
              mobileView === 'chat' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Input */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, phone, intent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Conversation Cards Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredConversations.map((conv) => {
                const isSelected = selectedConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/10 dark:bg-teal-500/15 border-l-4 border-teal-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {conv.patientName || 'Website Chat Visitor'}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getIntentBadge(conv.intent)}`}>
                        {conv.intent}
                      </span>
                      {conv.treatment && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium truncate">
                          {conv.treatment}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {conv.lastMessage || 'Conversation initiated'}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Score: <strong className="text-slate-700 dark:text-slate-200">{conv.leadScore}/100</strong></span>
                      {conv.leadId && (
                        <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                          Lead Linked ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Transcript Viewer */}
          <div
            className={`md:col-span-7 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {selectedConv ? (
              <>
                {/* Transcript Header with mobile back button */}
                <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Mobile Back Button to return to list */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="md:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"
                      aria-label="Back to conversations list"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {selectedConv.patientName || 'Website Visitor'}
                        </h2>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${getIntentBadge(selectedConv.intent)}`}>
                          {selectedConv.intent}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedConv.phone && <span>📞 {selectedConv.phone}</span>}
                        <span>Urgency: <strong>{selectedConv.urgency}</strong></span>
                      </div>
                    </div>
                  </div>

                  {selectedConv.leadId && (
                    <Link
                      to={`/leads/${typeof selectedConv.leadId === 'object' ? selectedConv.leadId._id : selectedConv.leadId}`}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm shrink-0"
                    >
                      <span className="hidden sm:inline">View Lead Profile</span>
                      <span className="sm:hidden">Lead</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                  {loadingMessages ? (
                    <LoadingState message="Loading transcript..." rows={3} />
                  ) : (
                    messages.map((m, idx) => {
                      const isAssistant = m.sender === 'assistant';
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 sm:gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                        >
                          {isAssistant && (
                            <div className="w-7 h-7 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[80%] px-3.5 sm:px-4 py-2.5 rounded-2xl leading-relaxed shadow-sm ${
                              isAssistant
                                ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                                : 'bg-teal-500 text-slate-950 font-medium rounded-tr-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                            <span className="text-[9px] opacity-60 block mt-1 text-right">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {!isAssistant && (
                            <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs p-6 text-center">
                Select a conversation thread to view transcript
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
