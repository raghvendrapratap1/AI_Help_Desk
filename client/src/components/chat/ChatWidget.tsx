import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Calendar,
  ShieldCheck,
  Building2,
  RotateCcw
} from 'lucide-react';
import { VoiceCallModal } from './VoiceCallModal';

export interface DraftCard {
  draftId?: string;
  patientName: string;
  age?: number | string;
  phone: string;
  patientEmail?: string;
  doctorName: string;
  date: string;
  time: string;
  primaryComplaint: string;
  status: 'pending' | 'confirmed' | 'draft';
  appointmentId?: string;
  confirmationToken?: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'patient' | 'assistant' | 'system';
  text: string;
  metadata?: any;
  card?: DraftCard;
}

export interface ChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen: controlledIsOpen,
  onClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = typeof controlledIsOpen === 'boolean' ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setInternalIsOpen(false);
  };

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [visitorId, setVisitorId] = useState(() => {
    let id = localStorage.getItem('indore_visitor_id');
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('indore_visitor_id', id);
    }
    return id;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [activeDraft, setActiveDraft] = useState<DraftCard | null>(null);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, activeDraft]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen]);

  const initChat = async () => {
    try {
      const res = await API.post('/chat/start', { visitorId });
      if (res.data.success && res.data.data.messages) {
        let foundDraft: DraftCard | null = null;
        const loadedMessages: ChatMessage[] = res.data.data.messages.map((m: any, idx: number) => {
          const cardData = m.metadata?.draftCard || (m.metadata?.showSummaryCard ? m.metadata?.draft : null);
          if (cardData) {
            foundDraft = {
              draftId: cardData.draftId || `draft_${idx}`,
              patientName: cardData.patientName || '',
              age: cardData.age,
              phone: cardData.phone || '',
              patientEmail: cardData.patientEmail || '',
              doctorName: cardData.doctorName || 'Dr. Saumya Jain',
              date: cardData.date || cardData.preferredDate || '',
              time: cardData.time || cardData.preferredTime || '',
              primaryComplaint: cardData.primaryComplaint || '',
              status: cardData.status || 'pending',
              appointmentId: cardData.appointmentId,
              confirmationToken: cardData.confirmationToken
            };
          }
          return {
            id: m._id || `msg_${idx}`,
            sender: m.sender,
            text: m.text,
            metadata: m.metadata,
            card: cardData ? foundDraft! : undefined
          };
        });

        setMessages(loadedMessages);
        if (foundDraft) {
          setActiveDraft(foundDraft);
        }
      }
    } catch (err) {
      console.error('Failed to init chat:', err);
      setMessages([
        {
          id: 'welcome_err',
          sender: 'assistant',
          text: "Hello! How can I help you today?"
        }
      ]);
    }
  };

  const resetChat = async () => {
    const newId = 'vis_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('indore_visitor_id', newId);
    setVisitorId(newId);
    setMessages([]);
    setActiveDraft(null);
    setLeadCreated(false);
    toast.success('Chat restarted from scratch!', { icon: '🔄' });
    try {
      const res = await API.post('/chat/start', { visitorId: newId });
      if (res.data.success && res.data.data.messages) {
        setMessages(
          res.data.data.messages.map((m: any, idx: number) => ({
            id: m._id || `msg_${idx}`,
            sender: m.sender,
            text: m.text,
            metadata: m.metadata
          }))
        );
      }
    } catch (_) {
      setMessages([
        {
          id: 'welcome_restart',
          sender: 'assistant',
          text: 'Hello! How can I help you today?'
        }
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'patient',
      text: text.trim()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await API.post('/chat/message', {
        visitorId,
        message: text.trim()
      });

      if (res.data.success) {
        const reply = res.data.data.reply;
        const meta = res.data.data.metadata;

        let newDraftCard: DraftCard | undefined = undefined;
        if (meta?.draftCard || meta?.showSummaryCard) {
          const raw = meta.draftCard || meta.draft;
          newDraftCard = {
            draftId: raw.draftId || `draft_${Date.now()}`,
            patientName: raw.patientName || '',
            age: raw.age,
            phone: raw.phone || '',
            patientEmail: raw.patientEmail || '',
            doctorName: raw.doctorName || 'Dr. Saumya Jain',
            date: raw.date || raw.preferredDate || '',
            time: raw.time || raw.preferredTime || '',
            primaryComplaint: raw.primaryComplaint || '',
            status: raw.status === 'confirmed' ? 'confirmed' : 'pending',
            appointmentId: raw.appointmentId,
            confirmationToken: raw.confirmationToken
          };
          setActiveDraft(newDraftCard);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: 'assistant',
            text: reply,
            metadata: meta,
            card: newDraftCard
          }
        ]);

        if (meta?.leadCreated) {
          setLeadCreated(true);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I apologize, our digital receptionist is having a brief connection pause. Please call Indore Poly Dental Clinic directly at +91 98270 12345."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // In-Place Confirmation: Confirms appointment draft without creating duplicate messages or new cards
  const handleConfirmSlot = async () => {
    if (!activeDraft) return;

    if (!activeDraft.patientEmail || !activeDraft.patientEmail.includes('@')) {
      const inputEmail = prompt('Please enter your email address to receive your official confirmation slip:', activeDraft.patientEmail || '');
      if (!inputEmail || !inputEmail.trim()) {
        toast.error('Email address is required to receive your confirmation slip!');
        return;
      }
      activeDraft.patientEmail = inputEmail.trim();
      setActiveDraft({ ...activeDraft });
    }

    setIsSubmittingConfirm(true);
    try {
      const res = await API.post('/appointments/confirm-draft', {
        patientName: activeDraft.patientName,
        phone: activeDraft.phone,
        patientEmail: activeDraft.patientEmail,
        doctorName: activeDraft.doctorName,
        date: activeDraft.date,
        time: activeDraft.time,
        primaryComplaint: activeDraft.primaryComplaint,
        appointmentId: activeDraft.appointmentId
      });

      if (res.data.success) {
        const updatedData = res.data.data;

        // In-place mutation: update active draft state to confirmed
        setActiveDraft((prev) => prev ? {
          ...prev,
          status: 'confirmed',
          confirmationToken: updatedData?.confirmationToken,
          appointmentId: updatedData?.appointmentId
        } : null);

        const targetEmail = activeDraft.patientEmail || updatedData?.patientEmail || 'your email';
        const confirmBotMsg = `📧 We have sent you an email at ${targetEmail}—please confirm your appointment to verify as a registered patient!\n\nYour consultation with ${activeDraft.doctorName} is scheduled for ${activeDraft.date} at ${activeDraft.time}. You can also click 'Add to Google Calendar' on your appointment slip above so you never miss your slot!`;

        // Also mutate the existing card in the messages array in-place and append the confirmation assistant message
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.card) {
              return {
                ...m,
                card: {
                  ...m.card,
                  status: 'confirmed' as const,
                  confirmationToken: updatedData?.confirmationToken,
                  appointmentId: updatedData?.appointmentId
                }
              };
            }
            return m;
          });
          return [
            ...updated,
            {
              id: 'conf-' + Date.now(),
              sender: 'assistant' as const,
              text: confirmBotMsg
            }
          ];
        });

        toast.success('Appointment confirmed! Check your email inbox.', { duration: 5000 });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Could not confirm appointment. Please try again.');
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  /**
   * Google Calendar URL strictly using local IST format without UTC offset shift:
   * Dates formatted as YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS with ctz=Asia/Kolkata
   */
  const generateGoogleCalendarUrl = () => {
    if (!activeDraft) return '#';
    const title = encodeURIComponent(`Dental Appointment: ${activeDraft.primaryComplaint} with ${activeDraft.doctorName}`);
    const details = encodeURIComponent(
      `Indore Poly Dental Clinic Appointment\nDoctor: ${activeDraft.doctorName}\nPatient: ${activeDraft.patientName} (${activeDraft.phone})\nClinic Address: 1/4 near 56 Shops, New Palasia, Indore\nClinic Phone: +91 98270 12345`
    );
    const location = encodeURIComponent('Indore Poly Dental Clinic, 1/4 near 56 Shops, New Palasia, Indore');

    const cleanDate = (activeDraft.date || '').replace(/-/g, '');
    let hour = 11;
    let min = 0;
    if (activeDraft.time) {
      const match = activeDraft.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (match) {
        hour = parseInt(match[1], 10);
        if (match[3]?.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (match[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        if (match[2]) min = parseInt(match[2], 10);
      }
    }

    const startHStr = String(hour).padStart(2, '0');
    const startMStr = String(min).padStart(2, '0');
    const endHour = hour + (min >= 30 ? 1 : 0);
    const endMin = (min + 30) % 60;
    const endHStr = String(endHour).padStart(2, '0');
    const endMStr = String(endMin).padStart(2, '0');

    // Local time representation with explicit Indian Standard Time timezone parameter
    const dtStart = `${cleanDate}T${startHStr}${startMStr}00`;
    const dtEnd = `${cleanDate}T${endHStr}${endMStr}00`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&ctz=Asia/Kolkata&details=${details}&location=${location}`;
  };

  const quickPrompts = [
    'Returning Patient? Enter your mobile number',
    'I want to book an appointment',
    'Where is the clinic located?',
    'What are your operating hours?'
  ];

  // Find the index of the message holding the active summary card so exactly one card is shown
  const cardMessageIndex = messages.reduce((lastIdx, m, idx) => {
    return (m.card || m.metadata?.draftCard || m.metadata?.showSummaryCard) ? idx : lastIdx;
  }, -1);

  return (
    <>
      {/* Open Chat Window (Full Screen on Mobile < sm, Fixed Docked Card on sm+) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[410px] h-full sm:h-[600px] sm:max-h-[88vh] z-50 flex flex-col rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-tight truncate">
                  Indore Poly Dental Clinic
                </h2>
                <p className="text-[10px] sm:text-[11px] text-teal-100 flex items-center gap-1 font-medium mt-0.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  24/7 AI Receptionist Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={resetChat}
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-xl hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                title="Restart Chat From Scratch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Start Voice Call with AI Receptionist"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Voice Call</span>
              </button>
              <button
                onClick={handleClose}
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-xl hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clinic Micro Header Banner */}
          <div className="px-3.5 sm:px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2 shrink-0">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
              <span className="truncate">1/4 near 56 Shops, New Palasia</span>
            </span>
            <span className="flex items-center gap-1 shrink-0 font-medium">
              <Clock className="w-3 h-3 text-teal-500" />
              11:00–20:30
            </span>
          </div>

          {/* CRM Notification Banner when lead is captured */}
          {leadCreated && (
            <div className="mx-3 mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Enquiry auto-logged in CRM! Dr. Sandesh Jain's team notified.</span>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg, index) => {
              const isAssistant = msg.sender === 'assistant';
              const shouldRenderCard = isAssistant && activeDraft && index === cardMessageIndex;
              const isConfirmed = activeDraft?.status === 'confirmed';

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                        : 'bg-teal-500 text-slate-950 font-medium rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Single Interactive Summary Card (In-Place Mutation: State A -> State B) */}
                    {shouldRenderCard && (
                      <div className="mt-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/30 shadow-lg overflow-hidden text-slate-900 dark:text-slate-100 animate-fadeIn">
                        {/* Header: State A -> "Appointment Slip Preview (Review Details)", State B -> "✅ Confirmed" */}
                        <div className="px-4 py-2.5 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100">
                              {isConfirmed ? 'Appointment Slip' : 'Appointment Slip Preview (Review Details)'}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {isConfirmed ? '✅ Confirmed' : 'Ready to Lock'}
                          </span>
                        </div>

                        {/* Card Details */}
                        <div className="p-3.5 space-y-2.5 text-xs">
                          {/* Doctor & Slot Highlight Banner */}
                          <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-slate-950/60 border border-teal-200/60 dark:border-slate-800 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Assigned Doctor</span>
                              <span className="font-bold text-teal-800 dark:text-teal-200 text-xs flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                {activeDraft.doctorName || 'Dr. Saumya Jain'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Date & Time</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                {activeDraft.date || '2026-09-09'} • {activeDraft.time || '11:00 AM'}
                              </span>
                            </div>
                          </div>

                          {/* Primary Complaint / Treatment */}
                          <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Primary Concern</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {activeDraft.primaryComplaint || 'Consultation'}
                            </span>
                          </div>

                          {/* Patient Info Rows */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                              <span className="text-slate-400 text-[11px]">Patient Name</span>
                              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                                <span>{activeDraft.patientName || 'Patient'}</span>
                                {!isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newName = prompt('Update Patient Name:', activeDraft.patientName || '');
                                      if (newName && newName.trim()) {
                                        setActiveDraft({ ...activeDraft, patientName: newName.trim() });
                                      }
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-500 font-medium underline"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                              <span className="text-slate-400 text-[11px]">Age</span>
                              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                                <span>{activeDraft.age || '28'} yrs</span>
                                {!isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newAge = prompt('Update Age:', String(activeDraft.age || ''));
                                      if (newAge && newAge.trim()) {
                                        setActiveDraft({ ...activeDraft, age: parseInt(newAge.trim(), 10) || activeDraft.age });
                                      }
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-500 font-medium underline"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                              <span className="text-slate-400 text-[11px]">Mobile Number</span>
                              <div className="flex items-center gap-2 font-semibold font-mono text-slate-800 dark:text-slate-200">
                                <span>{activeDraft.phone || '9691395507'}</span>
                                {!isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPhone = prompt('Update Phone Number:', activeDraft.phone || '');
                                      if (newPhone && newPhone.trim()) {
                                        setActiveDraft({ ...activeDraft, phone: newPhone.trim() });
                                      }
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-500 font-medium underline"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1">
                              <span className="text-slate-400 text-[11px]">Email for Slip</span>
                              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                                <span className="max-w-[170px] truncate text-[11px]">
                                  {activeDraft.patientEmail || 'raghvendrapratapsingh505@gmail.com'}
                                </span>
                                {!isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEmail = prompt('Update Confirmation Email:', activeDraft.patientEmail || '');
                                      if (newEmail && newEmail.trim()) {
                                        setActiveDraft({ ...activeDraft, patientEmail: newEmail.trim() });
                                      }
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-500 font-medium underline"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Primary Action Button (State A: [ Confirm My Slot ] -> State B: [ Add to Google Calendar ]) */}
                          <div className="pt-2">
                            {isConfirmed ? (
                              <div className="space-y-1.5">
                                <div className="flex gap-2">
                                  <a
                                    href={generateGoogleCalendarUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    Calendar
                                  </a>
                                  <a
                                    href="https://www.google.com/maps/search/?api=1&query=Indore+Poly+Dental+Clinic,+1%2F4+near+56+Shops,+New+Palasia,+Indore"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                    Google Maps
                                  </a>
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-center text-teal-700 dark:text-teal-300 font-medium leading-tight pt-0.5">
                                  📧 Official confirmation email sent. Please check your inbox to confirm your visit & verify as a registered patient.
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleConfirmSlot}
                                disabled={isSubmittingConfirm}
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                              >
                                {isSubmittingConfirm ? (
                                  'Confirming...'
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm My Slot
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-500">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1">
                    Checking clinic availability...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about treatments, pricing, appointments..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-teal-500/20 flex items-center justify-center shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Real-time Vapi Voice Call Modal */}
      <VoiceCallModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </>
  );
};

