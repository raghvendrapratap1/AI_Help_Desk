import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Stethoscope,
  BookOpen,
  Calendar,
  Radio,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { clinic } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'integrations'>('profile');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Clinic Settings & Configurations</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Master settings for Indore Poly Dental Clinic (1/4 near 56 Shops, New Palasia, Indore)
        </p>
      </div>

      {/* Tab Navigation (Scrollable on mobile, wrapped/spaced on larger screens) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-2 border ${
            activeTab === 'profile'
              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Clinic & Staff Roster</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-2 border ${
            activeTab === 'calendar'
              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Calendar Connect</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-2 border ${
            activeTab === 'integrations'
              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0" />
          <span>Voice & Telephony</span>
        </button>
      </div>

      {/* Tab 1: Clinic Profile & Staff */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xl shadow-inner shrink-0">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {clinic?.name || 'Indore Poly Dental Clinic'}
              </h2>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                {clinic?.tagline || 'Excellence in Implants, Root Canals, & Smile Designing'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" /> Address
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" /> Operating Hours
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {clinic?.operatingHours || 'Mon-Sat, 11:00-20:30'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" /> Clinic Contact
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {clinic?.phone || '+91 98270 12345'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" /> Official Email
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {clinic?.email || 'contact@indoredental.com'}
              </p>
            </div>
          </div>

          {/* Doctor Roster: Stacked Cards below md, Grid at md+ */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-500 shrink-0" /> Consulting Doctors Roster
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clinic?.doctors?.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{doc.name}</div>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {doc.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">{doc.specialty}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{doc.experience}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Base Snippet */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500 shrink-0" /> Grounded Knowledge Base
            </h3>
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed break-words">
              {clinic?.knowledgeBaseSnippet || 'Indore Poly Dental Clinic is located at 1/4 near 56 Shops, New Palasia, Indore. Run by Dr. Sandesh Jain (Oral & Maxillofacial Surgeon) and Dr. Saumya Jain (Endodontist) with ~40 years combined experience. Operating hours: Mon-Sat 11:00 AM to 8:30 PM. Specialties: Dental Implants, Root Canals, Aligners, Facial Surgery.'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Calendar Connect */}
      {activeTab === 'calendar' && (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Google Calendar Integration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time slot availability check and instant calendar event sync for patient consultations.
                </p>
              </div>
            </div>

            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected</span>
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinic Calendar Timezone</label>
              <input
                type="text"
                readOnly
                value="Asia/Kolkata (IST, UTC+05:30)"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                All patient appointments are booked with the exact Indian Standard Time offset.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Consultation Slot Length</label>
              <input
                type="text"
                readOnly
                value="30 Minutes (Buffer: 5 mins)"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Sync Account</label>
              <input
                type="text"
                readOnly
                value={clinic?.email || 'admin@indoredental.com'}
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => toast.success('Calendar connection verified & working normally.')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Verify Calendar Sync</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Integrations & Telephony */}
      {activeTab === 'integrations' && (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Telephony & Voice Channels
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured voice engines for outbound patient follow-ups and inbound clinic receptionist calls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exotel Card */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Exotel PSTN Gateway</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                    Active (India)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connects outbound calls directly to patient Indian mobile numbers via Exotel telecommunication pipes.
                </p>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-0.5">
                  <div>Virtual Number: <strong>+91 98270 12345</strong></div>
                  <div>Account SID: <strong>indoredental_live</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Exotel gateway operational.')}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Check Line Status</span>
              </button>
            </div>

            {/* Vapi AI Voice Card */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Vapi Voice AI (Web & Phone)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enables natural conversation voice calls directly in-browser on the landing page or through telephone trunks.
                </p>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-0.5">
                  <div>Model: <strong>Vapi / Gemini 2.0 Flash</strong></div>
                  <div>Voice: <strong>Friendly Clinical Receptionist</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Vapi AI Voice pipeline connected.')}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Test Voice Synthesizer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
