import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Calendar,
  MessageSquare,
  Award,
  ChevronRight,
  ArrowUpRight,
  LogIn
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { ChatWidget } from '../components/chat/ChatWidget';
import { VoiceCallModal } from '../components/chat/VoiceCallModal';
export const PublicLandingPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const doctors = [
    {
      name: 'Dr. Sandesh Jain',
      title: 'Senior Oral & Maxillofacial Surgeon',
      experience: '~25 Years Clinical & Surgical Experience',
      focus: 'Dental Implants, Bone Grafting, Wisdom Tooth Surgery, TMJ Disorder & Facial Trauma',
      photo: 'https://i.postimg.cc/MZt4tHnK/samdesh-jain.jpg'
    },
    {
      name: 'Dr. Saumya Jain',
      title: 'Specialist Endodontist & Cosmetic Dentist',
      experience: '~15 Years Microscopic Endodontics Experience',
      focus: 'Single-Sitting Root Canal Treatments, Invisible Clear Aligners, Ceramic Veneers, Smile Design',
      photo: 'https://i.postimg.cc/fbFz1LVT/soumya.jpg'
    }
  ];

  const services = [
    {
      title: 'Dental Implants',
      desc: 'Lifelong permanent tooth replacements engineered with titanium precision and natural zirconia crowns.',
      icon: '🦷'
    },
    {
      title: 'Root Canal Treatment',
      desc: 'Pain-free microscopic therapy that preserves your natural tooth structure and eliminates deep pulp infection.',
      icon: '✨'
    },
    {
      title: 'Invisible Aligners',
      desc: 'Discreet, transparent clear aligners digitally mapped to straighten crowded or misaligned teeth without metal braces.',
      icon: '💎'
    },
    {
      title: 'Cosmetic Dentistry & Veneers',
      desc: 'Ultra-thin porcelain smile veneers, professional whitening, and aesthetic composite tooth bonding.',
      icon: '🌟'
    },
    {
      title: 'TMJ Joint Therapy',
      desc: 'Comprehensive diagnosis and therapeutic solutions for jaw joint pain, clicking sounds, and restricted opening.',
      icon: '🩺'
    },
    {
      title: 'Jaw & Facial Trauma Surgery',
      desc: 'Expert surgical management of facial bone fractures, lacerations, and corrective jaw alignment by Dr. Sandesh Jain.',
      icon: '🏥'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white truncate">
              Indore Poly Dental Clinic
            </h1>
            <p className="text-[10px] sm:text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 truncate">
              Oral Surgery & Root Canal Care
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            About Clinic
          </a>
          <a
            href="#doctors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Specialist Doctors
          </a>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Treatments
          </a>
          <a
            href="#location"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Location & Hours
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Link
            to="/login"
            className="min-h-[40px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden xs:inline sm:inline">Staff </span>Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-[11px] sm:text-xs font-bold shadow-sm max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="truncate">Indore's Trusted Dental Specialists — New Palasia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            World-Class Smiles Backed by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">
              40 Years of Excellence
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Providing specialized Dental Implants, Microscopic Root Canal Treatments, Invisible Aligners,
            and Facial Surgery right in the heart of Indore at New Palasia (near 56 Shops).
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Chat With AI Receptionist</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/30"
            >
              <Phone className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Talk to Us (AI Voice Call)</span>
            </button>
          </div>

          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl mx-auto text-left">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="text-lg sm:text-xl font-extrabold text-teal-600 dark:text-teal-400">~40 Yrs</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Combined Presence</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="text-lg sm:text-xl font-extrabold text-teal-600 dark:text-teal-400">Near 56</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Prime Location</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="text-lg sm:text-xl font-extrabold text-teal-600 dark:text-teal-400">2 Specialists</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Surgeon & Endodontist</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="text-lg sm:text-xl font-extrabold text-teal-600 dark:text-teal-400">24/7 AI</div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Instant Enquiry Care</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Doctors Section */}
      <section id="doctors" className="py-16 px-6 bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Lead Consulting Specialists
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Meet our distinguished team dedicated to advanced surgical excellence and gentle endodontic care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-teal-500/30 shadow-md shrink-0"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{doc.experience}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Clinical Specialties:</span>
                    {doc.focus}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Senior Consultant
                  </span>
                  <span className="text-slate-500 font-medium">New Palasia, Indore</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Comprehensive Dental Treatments
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Specialized Care for Every Smile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            From emergency toothache relief to full-mouth dental implants and aesthetic invisible aligners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-teal-500/40 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {srv.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{srv.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location, Contact & Hours Section */}
      <section id="location" className="py-16 px-6 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">Indore Poly Dental Clinic</span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Visit Our Clinic in New Palasia</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conveniently situated right near the 56 Shops food hub (~40 Years Combined Clinical Legacy).</p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Indore+Poly+Dental+Clinic,+1%2F4+near+56+Shops,+New+Palasia,+Indore"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700 shadow-md hover:border-teal-500/50"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight className="w-4 h-4 text-teal-400" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Full Address
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">1/4, near 56 Shops, New Palasia, Indore, MP 452001</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Indore+Poly+Dental+Clinic,+1%2F4+near+56+Shops,+New+Palasia,+Indore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold pt-1"
              >
                <span>Get Directions</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Consulting Hours
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Mon–Sat: 11:00 AM – 8:30 PM (Sunday Closed)</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> Direct Contact
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                <a href="tel:+919827012345" className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">+91 98270 12345</a> / contact@indoredental.com
              </p>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm aspect-video sm:aspect-[21/9] w-full relative bg-slate-100 dark:bg-slate-900">
            <iframe
              title="Indore Poly Dental Clinic Location"
              src="https://maps.google.com/maps?q=Indore+Poly+Dental+Clinic,+1/4,+New+Palasia,+Indore&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 Indore Poly Dental Clinic. All clinical rights reserved. 1/4 near 56 Shops, New Palasia, Indore, MP.</p>
        <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-500 font-medium">
          Powered by AI Digital Front Desk & Patient Opportunity Management System
        </p>
      </footer>

      {/* 24/7 AI Receptionist Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Voice Call Modal */}
      <VoiceCallModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </div>
  );
};
