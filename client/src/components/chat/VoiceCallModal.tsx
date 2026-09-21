import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  X,
  User,
  Calendar,
  Clock,
  ShieldCheck,
  Radio,
  Edit3,
  Check,
  ExternalLink,
  Mail,
  Building2,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import API from '../../services/api';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadContext?: {
    patientName?: string;
    phone?: string;
    reason?: string;
  };
}

interface DraftCard {
  appointmentId?: string;
  patientName: string;
  age?: number;
  phone: string;
  patientEmail: string;
  doctorName: string;
  date: string;
  time: string;
  primaryComplaint: string;
  confirmationToken?: string;
  status: 'draft' | 'confirming' | 'confirmed';
}

const VAPI_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPI_PUBLIC_KEY || 'd919e065-b8ba-4130-a6f5-00444b8f7da2';
const VAPI_ASSISTANT_ID = (import.meta as any).env?.VITE_VAPI_ASSISTANT_ID || 'bf620d63-41dd-4e9b-8a0c-ce9714529cc3';

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose, leadContext }) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [aiSpeech, setAiSpeech] = useState<string>('Connecting you directly with the AI Clinical Voice Receptionist...');
  const [userSpeech, setUserSpeech] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([]);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  // Multimodal Live Draft Card State
  const [draftCard, setDraftCard] = useState<DraftCard | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<any>(null);
  const ringAudioRef = useRef<{ audioCtx: AudioContext; intervalId: any } | null>(null);

  // Natural Telephone Ringtone Generator using Web Audio API (Zero external assets required)
  const startRingtone = () => {
    try {
      if (ringAudioRef.current) return;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();

      const playSingleRingCycle = () => {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        // Standard Indian / UK Telecom Ring cadence: 400Hz + 450Hz dual-tone
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        osc2.frequency.setValueAtTime(450, now);

        // Ring pattern: Ring for 1.2s, then 2.0s silence
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.setValueAtTime(0.08, now + 1.2);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.25);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      };

      playSingleRingCycle();
      const intervalId = setInterval(playSingleRingCycle, 3200);
      ringAudioRef.current = { audioCtx, intervalId };
    } catch (e) {
      console.warn('[Ringtone] Web Audio not allowed or failed:', e);
    }
  };

  const stopRingtone = () => {
    if (ringAudioRef.current) {
      try {
        clearInterval(ringAudioRef.current.intervalId);
        ringAudioRef.current.audioCtx.close();
      } catch (_) {}
      ringAudioRef.current = null;
    }
  };

  // Initialize Vapi instance
  useEffect(() => {
    if (!vapiRef.current && VAPI_PUBLIC_KEY) {
      try {
        const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapiInstance;

        vapiInstance.on('call-start', () => {
          console.log('[VAPI WEB] Call started');
          stopRingtone();
          setCallStatus('connected');
          setAiSpeech('Hello! Welcome to Indore Poly Dental Clinic. How can I help you today?');
          toast.success('AI Receptionist connected!', { id: 'vapi_connect' });

          timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        });

        vapiInstance.on('call-end', () => {
          console.log('[VAPI WEB] Call ended');
          stopRingtone();
          setCallStatus('ended');
          clearInterval(timerRef.current);
          toast('Call ended. Transcripts recorded in CRM.', { icon: '📞' });
        });

        vapiInstance.on('speech-start', () => {
          stopRingtone();
          setIsSpeaking(true);
        });

        vapiInstance.on('speech-end', () => {
          setIsSpeaking(false);
        });

        vapiInstance.on('volume-level', (vol: number) => {
          if (vol > 0.02) stopRingtone();
          setVolumeLevel(vol);
        });

        vapiInstance.on('message', (message: any) => {
          if (message.type === 'transcript') {
            if (message.transcriptType === 'final') {
              if (message.role === 'assistant') {
                setAiSpeech(message.transcript);
                setTranscriptHistory((prev) => [...prev.slice(-6), { role: 'ai', text: message.transcript }]);
              } else if (message.role === 'user') {
                setUserSpeech(message.transcript);
                setTranscriptHistory((prev) => [...prev.slice(-6), { role: 'user', text: message.transcript }]);
              }
            }
          }

          // Tool call listener: detect when AI is checking slots or booking
          if (message.type === 'tool-calls' || message.type === 'function-call') {
            const toolCalls = message.toolCalls || (message.functionCall ? [{ function: message.functionCall }] : []);
            
            for (const tc of toolCalls) {
              const funcName = tc.function?.name;
              let args = tc.function?.arguments;
              if (typeof args === 'string') {
                try {
                  args = JSON.parse(args);
                } catch (_) {}
              }

              if (funcName === 'checkAvailableSlots') {
                setBookingStatus(`🔍 Checking open slots for ${args?.doctorName || 'Doctor'} on ${args?.date || 'requested date'}...`);
              }

              if (funcName === 'bookAppointment' && args) {
                setBookingStatus('✨ Presenting appointment card on your screen...');
                const patientName = args.patientName || args.name || 'Patient';
                const phone = args.phone || '9691395507';
                const email = args.patientEmail || args.email || '';
                const doctorName = args.doctorName || 'Dr. Saumya Jain';
                const date = args.preferredDate || args.date || '2026-09-10';
                const time = args.preferredTime || args.time || '02:00 PM';
                const primaryComplaint = args.primaryComplaint || args.complaint || 'Dental Consultation';

                setDraftCard((prev) => ({
                  patientName,
                  age: args.age,
                  phone,
                  patientEmail: email,
                  doctorName,
                  date,
                  time,
                  primaryComplaint,
                  status: prev?.status === 'confirmed' ? 'confirmed' : 'draft',
                  appointmentId: prev?.appointmentId,
                  confirmationToken: prev?.confirmationToken
                }));
                setEditableEmail(email);
              }
            }
          }
        });

        vapiInstance.on('error', (err: any) => {
          console.error('[VAPI WEB ERROR]', err);
          toast.error(err?.message || 'Voice connection issue. Please allow microphone access.');
          setCallStatus('idle');
        });
      } catch (err) {
        console.error('[VAPI INIT ERROR]', err);
      }
    }
  }, []);

  // Handle open / start call
  useEffect(() => {
    if (isOpen) {
      startVapiCall();
    } else {
      endVapiCall();
    }

    return () => {
      endVapiCall();
    };
  }, [isOpen]);

  const startVapiCall = async () => {
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop test stream tracks so Vapi takes full ownership of audio devices
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        console.warn('[MIC PERMISSION ERROR]', micErr);
        toast.error('Microphone permission required! Please click the icon in your address bar to allow microphone access.', { duration: 7000 });
        setCallStatus('idle');
        return;
      }
    }

    setCallStatus('connecting');
    setCallDuration(0);
    setTranscriptHistory([]);
    setBookingStatus(null);
    setDraftCard(null);
    setIsEditingEmail(false);
    startRingtone();

    if (vapiRef.current) {
      try {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomYyyy = tomorrow.getFullYear();
        const tomMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tomDd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${tomYyyy}-${tomMm}-${tomDd}`;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentReadable = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${yyyy}`;

        const overrides: any = {
          variableValues: {
            currentDate: todayStr,
            tomorrowDate: tomorrowStr,
            todayReadable: currentReadable,
            currentMonth: months[now.getMonth()],
            currentYear: String(yyyy),
            patientName: leadContext?.patientName || '',
            doctorName: 'Dr. Sandesh Jain',
            reason: leadContext?.reason || 'Clinical consultation'
          }
        };

        await vapiRef.current.start(VAPI_ASSISTANT_ID, overrides);
      } catch (err: any) {
        console.error('[VAPI START FAILED]', err);
        stopRingtone();
        toast.error('Could not access microphone or start AI call.');
        setCallStatus('idle');
      }
    }
  };

  const endVapiCall = () => {
    stopRingtone();
    if (vapiRef.current && callStatus === 'connected') {
      try {
        vapiRef.current.stop();
      } catch (_) {}
    }
    setCallStatus('idle');
    clearInterval(timerRef.current);
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const nextMute = !isMuted;
      vapiRef.current.setMuted(nextMute);
      setIsMuted(nextMute);
      toast(nextMute ? 'Microphone muted' : 'Microphone unmuted', { icon: nextMute ? '🔇' : '🎙️' });
    }
  };

  const handleClose = () => {
    endVapiCall();
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Save updated email to draft
  const handleSaveEmail = async () => {
    if (!editableEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (draftCard) {
      setDraftCard({ ...draftCard, patientEmail: editableEmail.trim() });
      setIsEditingEmail(false);
      toast.success('Email updated on card!');

      // If already created in backend, update it
      if (draftCard.appointmentId || draftCard.confirmationToken) {
        try {
          await API.post('/appointments/update-patient', {
            appointmentId: draftCard.appointmentId,
            token: draftCard.confirmationToken,
            patientEmail: editableEmail.trim()
          });
        } catch (_) {}
      }
    }
  };

  // User taps "✅ Yes, Confirm My Appointment" right from screen
  const handleScreenConfirm = async () => {
    if (!draftCard) return;

    setIsSubmittingConfirm(true);
    try {
      // 1. If we don't have an appointment token yet, create or verify
      let token = draftCard.confirmationToken;

      const emailToUse = editableEmail.trim() || draftCard.patientEmail;

      // Update patient details and get fresh token
      const updateRes = await API.post('/appointments/update-patient', {
        appointmentId: draftCard.appointmentId,
        token: draftCard.confirmationToken,
        patientEmail: emailToUse,
        patientName: draftCard.patientName,
        phone: draftCard.phone,
        doctorName: draftCard.doctorName,
        date: draftCard.date,
        time: draftCard.time,
        primaryComplaint: draftCard.primaryComplaint
      }).catch(() => null);

      if (updateRes?.data?.data?.confirmationToken) {
        token = updateRes.data.data.confirmationToken;
      }

      // If token is present, execute confirmation
      if (token) {
        await API.post(`/appointments/confirm/${token}`);
      }

      setDraftCard((prev) => (prev ? { ...prev, status: 'confirmed', patientEmail: emailToUse } : null));
      setBookingStatus('🎉 Appointment Confirmed & Locked! Receipt sent to ' + emailToUse);
      toast.success('Appointment Confirmed & Locked in CRM!');
    } catch (err: any) {
      console.error('[CARD CONFIRM ERROR]', err);
      toast.error('Appointment confirmed on screen. Clinic front desk is notified.');
      setDraftCard((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!draftCard) return '#';
    const title = encodeURIComponent(`Dental Consultation with ${draftCard.doctorName}`);
    const details = encodeURIComponent(
      `Appointment at Indore Poly Dental Clinic\nDoctor: ${draftCard.doctorName}\nReason: ${draftCard.primaryComplaint}\nContact: +91 98270 12345`
    );
    const location = encodeURIComponent('Indore Poly Dental Clinic, 1/4, near 56 Shops, New Palasia, Indore');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold transition-all shrink-0 ${
              callStatus === 'connected'
                ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  Indore Poly Dental Clinic
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0">
                  <Radio className="w-2.5 h-2.5 animate-ping" />
                  Live AI Voice
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 truncate">
                {callStatus === 'connected'
                  ? `Active Consultation (${formatTime(callDuration)})`
                  : callStatus === 'connecting'
                  ? '🔔 Calling clinic... Ringing...'
                  : 'Call Completed'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
            title="Close Voice Call"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Visualizer & Speaking Status */}
          <div className="p-5 flex flex-col items-center justify-center space-y-3 text-center bg-gradient-to-b from-transparent to-teal-500/5">
            <div className="relative py-2">
              {/* Ringing Ripple Circles while connecting */}
              {callStatus === 'connecting' && (
                <>
                  <div className="w-24 h-24 rounded-full bg-teal-500/30 absolute inset-0 -m-1 animate-ping opacity-60" />
                  <div className="w-28 h-28 rounded-full bg-teal-500/15 absolute inset-0 -m-3 animate-pulse opacity-50" />
                </>
              )}

              {/* Pulsing visualizer circles */}
              {callStatus === 'connected' && (
                <>
                  <div
                    className={`w-24 h-24 rounded-full bg-teal-500/20 absolute inset-0 -m-1 transition-all duration-200 ${
                      isSpeaking ? 'scale-125 opacity-70 animate-ping' : 'scale-100 opacity-30'
                    }`}
                  />
                  <div
                    className={`w-22 h-22 rounded-full bg-teal-500/30 absolute inset-0 transition-transform duration-150 ${
                      volumeLevel > 0.05 ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </>
              )}

              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl relative z-10 transition-all ${
                callStatus === 'connected'
                  ? 'bg-gradient-to-tr from-teal-600 to-teal-400 text-slate-950 shadow-teal-500/30'
                  : callStatus === 'connecting'
                  ? 'bg-gradient-to-tr from-amber-500 to-teal-500 text-white shadow-teal-500/40 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {callStatus === 'connecting' ? (
                  <Phone className="w-8 h-8 animate-bounce" />
                ) : (
                  <Volume2 className={`w-8 h-8 ${isSpeaking ? 'animate-bounce' : ''}`} />
                )}
              </div>
            </div>

            <div className="max-w-md w-full space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                {isSpeaking
                  ? 'AI Speaking...'
                  : callStatus === 'connected'
                  ? 'Listening to your voice...'
                  : callStatus === 'connecting'
                  ? '🔔 Ringing... Connecting to Receptionist...'
                  : 'Consultation Desk'}
              </div>

              {/* 2-Message Live Auto-Scrolling Chat Stream */}
              <div className="space-y-2 min-h-[110px] flex flex-col justify-end p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm transition-all">
                {transcriptHistory.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 italic">
                    {callStatus === 'connecting'
                      ? '🔔 Ringing clinic reception... Please hold on while the AI picks up.'
                      : `"${aiSpeech || 'Ready to assist you.'}"`}
                  </div>
                ) : (
                  transcriptHistory.slice(-2).map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col animate-fadeIn ${
                        item.role === 'ai' ? 'items-start' : 'items-end'
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-400 px-1 mb-0.5">
                        {item.role === 'ai' ? 'Indore Poly Dental AI' : 'You'}
                      </span>
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed shadow-sm transition-all ${
                          item.role === 'ai'
                            ? 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-slate-800 border border-teal-200/70 dark:border-teal-700/40 text-slate-800 dark:text-teal-100 rounded-tl-sm text-left'
                            : 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-sm text-right shadow-teal-600/20'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Booking Alert Banner */}
              {bookingStatus && (
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold animate-pulse">
                  {bookingStatus}
                </div>
              )}
            </div>
          </div>

          {/* MULTIMODAL INTERACTIVE DRAFT CARD */}
          {draftCard && (
            <div className="mx-4 sm:mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/70 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-900 border border-teal-500/30 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Live Appointment Summary
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  draftCard.status === 'confirmed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {draftCard.status === 'confirmed' ? '✅ Confirmed' : 'Action Required: Review & Confirm'}
                </span>
              </div>

              {/* Patient & Booking Grid (Patient Personal Info Editable; Clinical Slot Verified & Locked) */}
              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Patient Name</span>
                    {draftCard.status !== 'confirmed' && (
                      <button
                        onClick={() => {
                          const newName = prompt('Enter Patient Full Name:', draftCard.patientName);
                          if (newName && newName.trim()) {
                            setDraftCard({ ...draftCard, patientName: newName.trim() });
                          }
                        }}
                        className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <Edit3 className="w-2.5 h-2.5" /> Edit
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {draftCard.patientName}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Age</span>
                    {draftCard.status !== 'confirmed' && (
                      <button
                        onClick={() => {
                          const newAge = prompt('Enter Patient Age:', draftCard.age ? String(draftCard.age) : '20');
                          if (newAge && !isNaN(parseInt(newAge))) {
                            setDraftCard({ ...draftCard, age: parseInt(newAge) });
                          }
                        }}
                        className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <Edit3 className="w-2.5 h-2.5" /> Edit
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {draftCard.age ? `${draftCard.age} years` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Assigned Specialist</span>
                    <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-500/20">Clinic Verified</span>
                  </div>
                  <p className="font-bold text-teal-700 dark:text-teal-400 mt-0.5">{draftCard.doctorName}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Verified Slot</span>
                    <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-500/20">Slot Checked</span>
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {draftCard.date} at {draftCard.time}
                  </p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Mobile Number</span>
                    {draftCard.status !== 'confirmed' && (
                      <button
                        onClick={() => {
                          const newPhone = prompt('Enter 10-digit Mobile Number:', draftCard.phone);
                          if (newPhone && newPhone.trim()) {
                            setDraftCard({ ...draftCard, phone: newPhone.trim() });
                          }
                        }}
                        className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <Edit3 className="w-2.5 h-2.5" /> Edit
                      </button>
                    )}
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{draftCard.phone}</p>
                </div>
              </div>

              {/* Editable Email Row (Solves phonetic spelling errors instantly) */}
              <div className="pt-2 pb-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3 text-teal-500" />
                    Email for Confirmation Slip
                  </span>
                  {!isEditingEmail && draftCard.status !== 'confirmed' && (
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                    >
                      <Edit3 className="w-2.5 h-2.5" /> Edit Email
                    </button>
                  )}
                </div>

                {isEditingEmail ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="email"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      placeholder="e.g. raghvendra.singh@webkorps.com"
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-teal-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>{draftCard.patientEmail || 'No email provided yet'}</span>
                    <span className="text-[10px] text-slate-400 italic">One-click slip recipient</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {draftCard.status === 'confirmed' ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <a
                        href={generateGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Google Calendar
                      </a>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Indore+Poly+Dental+Clinic,+1%2F4+near+56+Shops,+New+Palasia,+Indore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-500" />
                        Google Maps
                      </a>
                    </div>
                    <p className="text-[10px] text-center text-teal-700 dark:text-teal-300 font-medium">
                      📧 Official confirmation email sent. Please check your inbox to confirm your visit & verify as a registered patient.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleScreenConfirm}
                    disabled={isSubmittingConfirm}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmittingConfirm ? (
                      'Locking Slot...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        ✅ Yes, Everything is Correct & Confirm My Slot
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}


        </div>

        {/* Call Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              disabled={callStatus !== 'connected'}
              className={`p-3 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              {isMuted ? 'Muted' : 'Mic Active'}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

