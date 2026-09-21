export type UserRole = 'clinic_admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicId: string;
  createdAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
}

export interface Clinic {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  operatingHours: string;
  doctors: Doctor[];
  services: string[];
  knowledgeBaseSnippet?: string;
  createdAt?: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Appointment Booked'
  | 'Converted'
  | 'Lost';

export type LeadSource =
  | 'Google'
  | 'Instagram'
  | 'Facebook'
  | 'Website'
  | 'Referral'
  | 'Phone'
  | 'Walk-in';

export interface LeadNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  clinicId: string;
  patientName: string;
  phone: string;
  email?: string;
  requirement: string;
  source: LeadSource;
  status: LeadStatus;
  leadScore: number;
  assignedTo?: string;
  notes: LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'Requested'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Completed';

export interface Appointment {
  id: string;
  clinicId: string;
  leadId?: string;
  patientName: string;
  phone: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export type MessageSender = 'patient' | 'assistant' | 'system' | 'staff';

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  metadata?: any;
  createdAt: string;
}

export interface StructuredIntent {
  intent: string;
  urgency: 'Low' | 'Medium' | 'High';
  treatment?: string;
  appointmentRequested: boolean;
  patientName?: string;
  phone?: string;
  preferredTime?: string;
}

export interface Conversation {
  id: string;
  clinicId: string;
  leadId?: string;
  visitorId: string;
  patientName?: string;
  phone?: string;
  status: 'active' | 'closed' | 'escalated';
  channel: 'web_chat' | 'phone';
  intent: string;
  urgency: string;
  treatment?: string;
  leadScore: number;
  summary?: string;
  lastMessage?: string;
  needsHuman?: boolean;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  clinic: Clinic;
}

export interface Notification {
  id: string;
  clinicId: string;
  type: 'human_handoff' | 'lead_alert' | 'followup_due';
  conversationId?: string;
  leadId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  clinicId: string;
  leadId: string | Lead;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'cancelled';
  channel: 'email';
  createdAt: string;
}

export interface UnansweredQuestion {
  id: string;
  clinicId: string;
  question: string;
  count: number;
  lastAskedAt: string;
}

export interface AnalyticsSummary {
  totalLeads: number;
  newThisWeek: number;
  highIntentCount: number;
  conversionRate: number;
  appointmentsCount: number;
}

export interface SourceAnalytics {
  source: string;
  count: number;
  converted: number;
}

export interface VisitorTrendPoint {
  label: string;
  website: number;
  phone: number;
  whatsapp: number;
  other: number;
  total: number;
}

export interface VisitorTrendsData {
  timeframe: 'today' | 'week' | 'month';
  summary: {
    totalVisits: number;
    websiteVisits: number;
    phoneCalls: number;
    whatsappInquiries: number;
    otherInquiries: number;
  };
  trend: VisitorTrendPoint[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

