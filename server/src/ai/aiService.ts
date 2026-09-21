import { INDORE_DENTAL_KB } from './knowledgeBase.js';
import { matchesEmergencyPattern, matchesHumanRequest } from '../config/emergencyPatterns.js';
import { checkSlotsForDoctor } from '../modules/appointments/slotService.js';
import { findBestFaqMatch } from './clinicFaqKnowledge.js';

export interface AppointmentDraftData {
  patientName?: string;
  age?: number;
  phone?: string;
  patientEmail?: string;
  primaryComplaint?: string;
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  status?: 'pending' | 'confirmed';
}

export interface VisitorProfile {
  patientName?: string;
  phone?: string;
  patientEmail?: string;
  age?: number | string;
  previousTreatment?: string;
  isReturning?: boolean;
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  primaryComplaint?: string;
  appointmentDraft?: AppointmentDraftData;
}

export interface DraftCardData {
  patientName: string;
  age?: number | string;
  phone: string;
  patientEmail?: string;
  doctorName: string;
  date: string;
  time: string;
  primaryComplaint: string;
  status: 'draft' | 'confirmed' | 'pending';
  appointmentId?: string;
  confirmationToken?: string;
}

export interface AIResponse {
  reply: string;
  intent: string;
  urgency: 'Low' | 'Medium' | 'High';
  treatment?: string;
  appointmentRequested: boolean;
  patientName?: string;
  phone?: string;
  patientEmail?: string;
  preferredTime?: string;
  preferredDate?: string;
  doctorName?: string;
  leadScore: number;
  needsHuman: boolean;
  escalationReason?: string;
  summary: string;
  isFallback: boolean;
  draftCard?: DraftCardData;
  showSummaryCard?: boolean;
  draft?: AppointmentDraftData;
}

/**
 * Deterministic Backend Lead Scoring Function
 * Pure function strictly based on the rubric defined in README / Phase 2 spec:
 * - Appointment requested: +30
 * - Phone number captured: +15
 * - Specific treatment identified: +15
 * - Urgent requirement: +15
 * - Date/time specified: +10
 * - High-value procedure (Implants, Aligners, Trauma Surgery, TMJ): +10
 * - General information: +5
 */
export const calculateLeadScore = (data: {
  appointmentRequested: boolean;
  phone?: string;
  treatment?: string;
  urgency: 'Low' | 'Medium' | 'High';
  preferredTime?: string;
  isGeneral?: boolean;
}): number => {
  let score = 0;

  if (data.appointmentRequested) score += 30;
  if (data.phone && data.phone.trim().length >= 10) score += 15;
  if (data.treatment) score += 15;
  if (data.urgency === 'High') score += 15;
  if (data.preferredTime) score += 10;

  const highValueProcedures = [
    'dental implant',
    'implant',
    'aligner',
    'invisible aligner',
    'trauma',
    'surgery',
    'tmj',
    'veneer'
  ];

  if (data.treatment && highValueProcedures.some((p) => data.treatment!.toLowerCase().includes(p))) {
    score += 10;
  }

  if (data.isGeneral) score += 5;

  return Math.min(Math.max(score, 10), 100);
};

/**
 * Extract phone number if present in text
 */
const extractPhoneNumber = (text: string): string | undefined => {
  const match = text.match(/(?:\+?91[\s-]?)?[6789]\d{9}/);
  return match ? match[0].replace(/\s+/g, '') : undefined;
};

/**
 * Format string to Title Case (e.g. 'raghvendra pratap singh' -> 'Raghvendra Pratap Singh')
 */
const toTitleCase = (str: string): string =>
  str.replace(/\b[a-zA-Z]/g, (c) => c.toUpperCase());

/**
 * Identify relevant treatment from verified clinic catalog
 */
const detectTreatment = (text: string): string | undefined => {
  const lower = text.toLowerCase();

  // Jaw & Facial Trauma / Accidents / Fractures / Dislocations
  if (
    lower.includes('jaw') ||
    lower.includes('broken jaw') ||
    lower.includes('fracture') ||
    lower.includes('fractured') ||
    lower.includes('accident') ||
    lower.includes('facial injury') ||
    lower.includes('face injury') ||
    lower.includes('trauma') ||
    lower.includes('injury') ||
    lower.includes('bone break') ||
    lower.includes('broken on') ||
    lower.includes('broke my') ||
    lower.includes('hit on face')
  ) {
    if (lower.includes('tmj') || lower.includes('jaw click') || lower.includes('jaw locking') || lower.includes('mouth opening')) {
      return 'TMJ Treatment';
    }
    return 'Jaw & Facial Trauma Surgery';
  }

  if (lower.includes('tmj') || lower.includes('jaw click') || lower.includes('jaw pain') || lower.includes('jaw lock')) {
    return 'TMJ Treatment';
  }

  if (lower.includes('broken tooth') || lower.includes('broken teeth') || lower.includes('cracked tooth') || lower.includes('chipped tooth') || lower.includes('knocked out')) {
    return 'Tooth Trauma & Repair';
  }

  if (lower.includes('implant') || lower.includes('missing tooth') || lower.includes('missing teeth') || lower.includes('replace tooth') || lower.includes('fixed teeth')) {
    return 'Dental Implants';
  }

  if (lower.includes('root canal') || lower.includes('rct') || lower.includes('tooth pain') || lower.includes('toothache') || lower.includes('sensitivity') || lower.includes('teeth pain') || lower.includes('nerve pain') || lower.includes('tooth ache')) {
    return 'Root Canal Treatment';
  }

  if (lower.includes('aligner') || lower.includes('braces') || lower.includes('straighten') || lower.includes('crooked') || lower.includes('invisalign') || lower.includes('teeth gap') || lower.includes('irregular teeth')) {
    return 'Invisible Aligners';
  }

  if (lower.includes('veneer') || lower.includes('whiten') || lower.includes('cosmetic') || lower.includes('smile') || lower.includes('yellow teeth') || lower.includes('stains')) {
    return 'Cosmetic Dentistry & Veneers';
  }

  if (lower.includes('crown') || lower.includes('cap') || lower.includes('bridge')) {
    return 'Dental Crowns & Bridges';
  }

  if (lower.includes('filling') || lower.includes('cavity') || lower.includes('cavities') || lower.includes('decay') || lower.includes('hole in tooth')) {
    return 'Dental Fillings & Restorations';
  }

  if (lower.includes('cleaning') || lower.includes('scaling') || lower.includes('polishing') || lower.includes('tartar') || lower.includes('plaque') || lower.includes('bad breath')) {
    return 'Dental Cleaning & Polishing';
  }

  if (lower.includes('wisdom') || lower.includes('extraction') || lower.includes('removal') || lower.includes('remove tooth') || lower.includes('pull tooth')) {
    return 'Wisdom Tooth Surgery';
  }

  if (lower.includes('bleeding') || lower.includes('swelling') || lower.includes('gum') || lower.includes('gums') || lower.includes('pyorrhea') || lower.includes('periodont')) {
    return 'Periodontal & Gum Treatment';
  }

  if (lower.includes('denture') || lower.includes('false teeth')) {
    return 'Dentures';
  }

  if (lower.includes('checkup') || lower.includes('check up') || lower.includes('routine check') || lower.includes('consultation') || lower.includes('general check') || lower.includes('oral exam') || lower.includes('examination')) {
    return 'General Dental Consultation';
  }

  return undefined;
};

/**
 * Extract patient name from user message: explicit intro, standalone name, or form response
 */
const extractPatientName = (text: string): string | undefined => {
  // Strip title prefixes first
  let cleaned = text.replace(/\b(?:dr|mr|ms|mrs)\.?\s+/gi, '').trim();

  // If the entire text or phrase is a known treatment, it can NEVER be a person's name
  if (detectTreatment(cleaned)) {
    return undefined;
  }

  const medicalAndStopWords = new Set([
    'i', 'a', 'the', 'dental', 'doctor', 'patient', 'user', 'yes', 'no',
    'clinic', 'the clinic', 'digital', 'receptionist', 'having', 'looking',
    'suffering', 'in', 'experiencing', 'experincing', 'interested', 'here', 'facing',
    'severe', 'tooth', 'teeth', 'pain', 'toothache', 'appointment', 'consultation',
    'root', 'canal', 'implant', 'implants', 'aligner', 'aligners', 'braces', 'invisalign',
    'crown', 'crowns', 'cap', 'caps', 'denture', 'dentures', 'bridge', 'bridges',
    'veneer', 'veneers', 'filling', 'fillings', 'scaling', 'cleaning', 'whitening',
    'extraction', 'extractions', 'surgery', 'tmj', 'gum', 'gums', 'cavity', 'cavities',
    'dentist', 'today', 'tomorrow', 'monday', 'bleeding', 'swelling', 'wisdom',
    'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'morning', 'evening',
    'feeling', 'want', 'need', 'visit', 'book', 'schedule', 'check', 'at',
    'how', 'are', 'you', 'doing', 'what', 'who', 'where', 'when', 'why', 'fine',
    'good', 'sure', 'ok', 'okay', 'alright', 'thank', 'thanks', 'hello', 'hi', 'hey',
    'start', 'please', 'help', 'price', 'cost', 'charge', 'rate', 'fees', 'fee',
    'morning', 'afternoon', 'evening', 'night',
    'my', 'email', 'mail', 'is', 'was', 'wrong', 'correct', 'correction', 'incorrect',
    'not', 'change', 'update', 'edit', 'fix', 'replace', 'number', 'phone', 'mobile',
    'contact', 'address', 'time', 'date', 'slot', 'age', 'yrs', 'years', 'old',
    'slip', 'card', 'details', 'detail', 'info', 'information', 'bro', 'brother',
    'sir', 'madam', 'dude', 'can', 'could', 'would', 'should', 'will', 'do',
    'does', 'did', 'have', 'has', 'had', 'this', 'that', 'these', 'those', 'there',
    'it', 'its', 'them', 'they', 'we', 'us', 'your', 'yours', 'mine', 'our', 'ours',
    'jaw', 'accident', 'broken', 'trauma', 'fracture', 'injury', 'process', 'procedure',
    'confirm', 'confirmed', 'confirmation', 'lock', 'done'
  ]);

  // If text contains correction or system words, never parse as standalone name
  const lowerCleaned = cleaned.toLowerCase();
  const hasNonNameKeywords = /\b(email|phone|mobile|number|wrong|correct|incorrect|change|update|edit|slot|time|date|age|years|slip|appointment|confirm|confirmed|confirmation|lock)\b/i.test(lowerCleaned);

  const patterns = [
    /(?:my name is|myself|call me)\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i,
    /(?:i am|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i,
    /(?:^|\n|\b)name\s*(?:is)?\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].replace(/[,.;!?]+$/, '').trim();
      candidate = candidate.replace(/\s+(?:and|my|phone|contact|mobile|email|number|for|with|to|age).*$/i, '').trim();

      if (detectTreatment(candidate)) {
        continue;
      }

      const words = candidate.toLowerCase().split(/\s+/);
      if (words.some((w) => medicalAndStopWords.has(w))) {
        continue;
      }
      if (/^(the|a|an)\b/i.test(candidate)) {
        continue;
      }
      if (candidate.length >= 2 && !medicalAndStopWords.has(candidate.toLowerCase())) {
        return toTitleCase(candidate);
      }
    }
  }

  // Standalone name check (e.g. 'Kaizen' or 'Raghvendra Pratap Singh') only if no correction keywords are present
  if (!hasNonNameKeywords) {
    const standaloneMatch = cleaned.match(/^([A-Za-z]+(?:\s+[A-Za-z]+){0,3})(?:,|\.|$)/i);
    if (standaloneMatch && standaloneMatch[1]) {
      const candidate = standaloneMatch[1].trim();
      if (candidate.length >= 2 && !detectTreatment(candidate)) {
        const words = candidate.toLowerCase().split(/\s+/);
        if (!words.some((w) => medicalAndStopWords.has(w))) {
          return toTitleCase(candidate);
        }
      }
    }
  }

  return undefined;
};

/**
 * Extract email address if present in text
 */
const extractEmailAddress = (text: string): string | undefined => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : undefined;
};

/**
 * Extract patient age if provided (e.g. "age 28", "28 years old", "28 yrs", or standalone "28")
 */
const extractAge = (text: string): number | undefined => {
  const match = text.match(/\b(?:age\s*[:=-]?\s*(\d{1,2})|(\d{1,2})\s*(?:years|yrs|year|yr)(?:\s*old)?)\b/i);
  if (match) {
    const ageNum = parseInt(match[1] || match[2], 10);
    if (ageNum > 0 && ageNum < 120) return ageNum;
  }
  // If the user entered just a 1-2 digit number (e.g. "28", "25.")
  const standaloneMatch = text.trim().match(/^(\d{1,2})\.?$/);
  if (standaloneMatch) {
    const ageNum = parseInt(standaloneMatch[1], 10);
    if (ageNum >= 1 && ageNum <= 110) return ageNum;
  }
  return undefined;
};

/**
 * Grounded AI Intelligence Engine for Indore Poly Dental Clinic
 * Strict guardrails: Answers strictly from clinic verified knowledge.
 * Zero medical hallucinations.
 */
export const processIncomingMessage = async (
  userMessage: string,
  history: Array<{ sender: string; text: string }> = [],
  visitorProfile?: VisitorProfile
): Promise<AIResponse> => {
  const lower = userMessage.toLowerCase();
  // Filter history strictly to patient messages so assistant self-introductions are never parsed as patient names
  const patientHistory = history.filter((h) => h.sender === 'patient' || h.sender === 'user');
  
  // Initialize draft from visitor profile memory if available
  const existingDraft = visitorProfile?.appointmentDraft || {};

  // Simultaneously extract any fields present in userMessage or history
  const extractedPhone = extractPhoneNumber(userMessage) || patientHistory.map((h) => extractPhoneNumber(h.text)).find(Boolean);
  const phone = extractedPhone || existingDraft.phone || visitorProfile?.phone;

  // If user already has a known name in draft, only change it if user explicitly asked to change/update name or introduced with "my name is"
  let extractedName: string | undefined;
  if (existingDraft.patientName) {
    const explicitChange = userMessage.match(/(?:change|update|correct)\s+(?:my\s+)?name\s+(?:to|is)?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i);
    const explicitIntro = userMessage.match(/(?:my name is|myself|call me)\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i);
    if (explicitChange && explicitChange[1]) {
      extractedName = toTitleCase(explicitChange[1].trim());
    } else if (explicitIntro && explicitIntro[1]) {
      extractedName = toTitleCase(explicitIntro[1].trim());
    }
  } else {
    extractedName = extractPatientName(userMessage) || patientHistory.map((h) => extractPatientName(h.text)).find(Boolean);
  }
  const patientName = extractedName || existingDraft.patientName || visitorProfile?.patientName;

  const extractedEmail = extractEmailAddress(userMessage) || patientHistory.map((h) => extractEmailAddress(h.text)).find(Boolean);
  const patientEmail = extractedEmail || existingDraft.patientEmail || visitorProfile?.patientEmail;

  const extractedAge = extractAge(userMessage) || patientHistory.map((h) => extractAge(h.text)).find(Boolean);
  const age = (extractedAge !== undefined && extractedAge !== null)
    ? extractedAge
    : ((existingDraft.age !== undefined && existingDraft.age !== null) ? existingDraft.age : visitorProfile?.age);

  const detectedPrimaryComplaint = detectTreatment(userMessage) || patientHistory.map((h) => detectTreatment(h.text)).find(Boolean);
  const primaryComplaint = detectedPrimaryComplaint || existingDraft.primaryComplaint || visitorProfile?.primaryComplaint || visitorProfile?.previousTreatment;

  // Helper to format a Date strictly in Asia/Kolkata timezone (YYYY-MM-DD)
  const formatISTDate = (d: Date): string => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  };

  // Resolve current date in Indian Standard Time (IST)
  const now = new Date();
  const todayStr = formatISTDate(now);
  const [curY, curM, curD] = todayStr.split('-').map(Number);
  // Noon in IST as safe base date for day offsets
  const baseISTDate = new Date(Date.UTC(curY, curM - 1, curD, 12, 0, 0));

  const tom = new Date(baseISTDate);
  tom.setUTCDate(tom.getUTCDate() + 1);
  const tomorrowStr = formatISTDate(tom);

  // Multi-turn date and time extraction
  const extractDateFromText = (text: string, refDate: Date = baseISTDate): string | undefined => {
    const l = text.toLowerCase();
    const explicitMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (explicitMatch) return explicitMatch[1];

    // Natural month format e.g. "11 september", "11th september", "september 11", "11 sept"
    const monthMap: Record<string, number> = {
      january: 1, jan: 1,
      february: 2, feb: 2,
      march: 3, mar: 3,
      april: 4, apr: 4,
      may: 5,
      june: 6, jun: 6,
      july: 7, jul: 7,
      august: 8, aug: 8,
      september: 9, sept: 9, sep: 9,
      october: 10, oct: 10,
      november: 11, nov: 11,
      december: 12, dec: 12
    };
    const monthRegex = '(?:january|february|march|april|may|june|july|august|september|sept|sep|october|november|december|jan|feb|mar|apr|jun|jul|aug|oct|nov|dec)';

    // Pattern A: "11 september", "11th september", "11 sept 2026"
    const patternA = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthRegex})(?:\\s+(\\d{4}))?\\b`, 'i');
    // Pattern B: "september 11", "september 11th", "sept 11, 2026"
    const patternB = new RegExp(`\\b(${monthRegex})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'i');

    const matchA = l.match(patternA);
    if (matchA) {
      const day = parseInt(matchA[1], 10);
      const mStr = matchA[2].toLowerCase();
      const month = monthMap[mStr];
      const yr = matchA[3] ? parseInt(matchA[3], 10) : curY;
      if (day >= 1 && day <= 31 && month) {
        return `${yr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    const matchB = l.match(patternB);
    if (matchB) {
      const mStr = matchB[1].toLowerCase();
      const day = parseInt(matchB[2], 10);
      const month = monthMap[mStr];
      const yr = matchB[3] ? parseInt(matchB[3], 10) : curY;
      if (day >= 1 && day <= 31 && month) {
        return `${yr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    if (l.includes('day after tomorrow')) {
      const d = new Date(refDate);
      d.setUTCDate(d.getUTCDate() + 2);
      return formatISTDate(d);
    }
    if (l.includes('tomorrow')) {
      const d = new Date(refDate);
      d.setUTCDate(d.getUTCDate() + 1);
      return formatISTDate(d);
    }
    if (l.includes('today')) {
      return formatISTDate(refDate);
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < 7; i++) {
      if (new RegExp('\\b' + daysOfWeek[i] + '\\b', 'i').test(l)) {
        const cur = refDate.getUTCDay();
        let diff = i - cur;
        if (diff <= 0) diff += 7;
        const d = new Date(refDate);
        d.setUTCDate(d.getUTCDate() + diff);
        return formatISTDate(d);
      }
    }
    return undefined;
  };

  const extractTimeFromText = (text: string): string | undefined => {
    const l = text.toLowerCase();
    const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
    if (timeMatch) return timeMatch[1].toUpperCase();
    if (l.includes('morning')) return '11:00 AM';
    if (l.includes('evening')) return '05:00 PM';
    if (l.includes('afternoon')) return '02:00 PM';
    return undefined;
  };

  const newDateInMessage = extractDateFromText(userMessage, baseISTDate);
  const preferredDate = newDateInMessage || existingDraft.preferredDate || visitorProfile?.preferredDate || patientHistory.map((h) => extractDateFromText(h.text, baseISTDate)).find(Boolean);
  
  // If a new date was explicitly mentioned in this turn that is different from previous draft date, reset preferredTime
  let preferredTime = extractTimeFromText(userMessage);
  if (!preferredTime) {
    if (newDateInMessage && existingDraft.preferredDate && newDateInMessage !== existingDraft.preferredDate) {
      preferredTime = undefined;
    } else {
      preferredTime = existingDraft.preferredTime || visitorProfile?.preferredTime || patientHistory.map((h) => extractTimeFromText(h.text)).find(Boolean);
    }
  }

  // Multi-doctor surgical triage mapping
  let doctorName = existingDraft.doctorName || visitorProfile?.doctorName;
  if (!doctorName && primaryComplaint) {
    doctorName = (
      primaryComplaint.includes('Implant') ||
      primaryComplaint.includes('Surgery') ||
      primaryComplaint.includes('TMJ') ||
      primaryComplaint.includes('Trauma') ||
      primaryComplaint.includes('Wisdom') ||
      primaryComplaint.includes('Jaw') ||
      primaryComplaint.includes('Fracture')
    )
      ? 'Dr. Sandesh Jain'
      : 'Dr. Saumya Jain';
  }

  // 1. Emergency Pattern Check from external config
  const emergencyCheck = matchesEmergencyPattern(userMessage);
  // 2. Explicit Human Request Check
  const humanCheck = matchesHumanRequest(userMessage);

  const hasAppointmentInHistory = patientHistory.some((h) => {
    const ht = h.text.toLowerCase();
    return ht.includes('appointment') || ht.includes('book') || ht.includes('consultation') || ht.includes('schedule') || ht.includes('slot');
  });

  const lastAssistantMessage = history.filter((h) => h.sender === 'assistant').pop()?.text.toLowerCase() || '';
  const wasAskedForContact =
    lastAssistantMessage.includes('share your name') ||
    lastAssistantMessage.includes('contact phone number') ||
    lastAssistantMessage.includes('connect you with the clinic team') ||
    lastAssistantMessage.includes('may i have your full name');

  let intent = 'General Enquiry';
  let urgency: 'Low' | 'Medium' | 'High' = 'Medium';
  let appointmentRequested = false;
  let needsHuman = false;
  let escalationReason: string | undefined;
  let isFallback = false;

  if (emergencyCheck.matched) {
    intent = 'Emergency';
    urgency = 'High';
    needsHuman = true;
    escalationReason = emergencyCheck.reason || 'Dental emergency detected';
    if (
      lower.includes('appointment') ||
      lower.includes('book') ||
      lower.includes('visit') ||
      lower.includes('consult') ||
      lower.includes('doctor') ||
      lower.includes('check') ||
      hasAppointmentInHistory
    ) {
      appointmentRequested = true;
    }
  } else if (humanCheck.requested) {
    intent = 'Human Handoff';
    urgency = 'High';
    needsHuman = true;
    escalationReason = humanCheck.reason || 'Patient requested human staff';
  } else if (lower.includes('emergency') || lower.includes('severe pain') || lower.includes('bleeding') || lower.includes('swelling') || lower.includes('accident') || lower.includes('unbearable')) {
    intent = 'Emergency';
    urgency = 'High';
    needsHuman = true;
    escalationReason = 'Acute pain or emergency mentioned';
    if (
      lower.includes('appointment') ||
      lower.includes('book') ||
      lower.includes('visit') ||
      lower.includes('consult') ||
      lower.includes('doctor') ||
      lower.includes('check') ||
      hasAppointmentInHistory
    ) {
      appointmentRequested = true;
    }
  } else if (
    lower.includes('appointment') ||
    lower.includes('book') ||
    lower.includes('visit') ||
    lower.includes('consultation') ||
    lower.includes('schedule') ||
    lower.includes('slot') ||
    hasAppointmentInHistory ||
    !!(primaryComplaint && (preferredDate || preferredTime || patientName || phone))
  ) {
    intent = 'Appointment Request';
    appointmentRequested = true;
    urgency = 'High';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('charge') || lower.includes('rate') || lower.includes('how much')) {
    intent = 'Pricing Enquiry';
  } else if (primaryComplaint) {
    intent = 'Treatment Enquiry';
  }

  // Compute deterministic score
  const leadScore = calculateLeadScore({
    appointmentRequested,
    phone,
    treatment: primaryComplaint,
    urgency,
    preferredTime,
    isGeneral: intent === 'General Enquiry'
  });

  // Guardrail check: Non-dental or unauthorized query check
  const nonDentalKeywords = ['cardiac surgery', 'chemotherapy', 'brain tumor', 'kidney transplant', 'liver transplant', 'eye surgery', 'orthopedic surgery', 'skin rash', 'gynecologist'];
  const hasDentalContext = lower.includes('dental') || lower.includes('tooth') || lower.includes('teeth') || lower.includes('mouth') || lower.includes('clinic') || lower.includes('doctor') || lower.includes('treatment') || lower.includes('cleaning') || lower.includes('rct') || lower.includes('implant');
  const isOutOfScope = nonDentalKeywords.some((k) => lower.includes(k)) && !hasDentalContext;

  let reply = '';
  let draftCard: DraftCardData | undefined = undefined;
  let showSummaryCard = false;

  const isConfirmWord = /^(confirm|confirm it|yes confirm|yes please|confirm appointment|lock slot|confirm slot|yes)\b/i.test(lower.trim());

  const currentDraft: AppointmentDraftData = {
    primaryComplaint: primaryComplaint || undefined,
    doctorName: doctorName || (primaryComplaint ? ((primaryComplaint.includes('Implant') || primaryComplaint.includes('Surgery') || primaryComplaint.includes('TMJ') || primaryComplaint.includes('Trauma') || primaryComplaint.includes('Wisdom') || primaryComplaint.includes('Jaw') || primaryComplaint.includes('Fracture')) ? 'Dr. Sandesh Jain' : 'Dr. Saumya Jain') : undefined),
    preferredDate: preferredDate || undefined,
    preferredTime: preferredTime || undefined,
    patientName: patientName || undefined,
    age: (age !== undefined && age !== null) ? Number(age) : undefined,
    phone: phone || undefined,
    patientEmail: patientEmail || undefined,
    status: isConfirmWord ? 'confirmed' : 'pending'
  };

  if (isOutOfScope) {
    reply = `Indore Poly Dental Clinic specializes strictly in advanced dental, oral, and maxillofacial surgery led by Dr. Sandesh Jain and Dr. Saumya Jain. We do not provide treatments for general medical or non-dental conditions. If you have dental questions or would like to speak with our front desk team, please call us directly at ${INDORE_DENTAL_KB.phone}.`;
  } else if (humanCheck.requested) {
    reply = `I understand you would like to speak directly with our clinic team. Let me connect you with the clinic team at Indore Poly Dental Clinic right away. Our front desk staff will review your conversation and follow up immediately.`;
  } else if (intent === 'Emergency') {
    const assignedDoc = currentDraft.doctorName || 'Dr. Sandesh Jain';
    const isWantingDoctorOrBooking =
      lower.includes('doctor') ||
      lower.includes('check') ||
      lower.includes('book') ||
      lower.includes('appointment') ||
      lower.includes('visit') ||
      lower.includes('consult') ||
      appointmentRequested;

    if (isWantingDoctorOrBooking) {
      reply = `If you or the patient is experiencing acute dental trauma, severe pain, or a broken jaw, please visit Indore Poly Dental Clinic directly at ${INDORE_DENTAL_KB.address} (Mon–Sat until 8:30 PM) or call us immediately at ${INDORE_DENTAL_KB.phone} for emergency assistance.\n\nSince you would like to consult our doctor, Senior Oral & Maxillofacial Surgeon ${assignedDoc} specializes in jaw trauma and facial fractures. Which date (e.g. today or tomorrow) would you prefer to visit?`;
    } else {
      reply = `If you or the patient is experiencing acute dental trauma, severe pain, or bleeding, please visit Indore Poly Dental Clinic directly at ${INDORE_DENTAL_KB.address} (near 56 Shops, New Palasia). We are open Mon–Sat until 8:30 PM. You can also call us immediately at ${INDORE_DENTAL_KB.phone} for emergency assistance. If you would like to book a priority consultation with Dr. Sandesh Jain or Dr. Saumya Jain, please let me know.`;
    }
  } else if (appointmentRequested) {
    // Check for explicit field corrections requested by user
    const isEmailCorrection =
      /\b(?:my\s+)?email\s+(?:is\s+)?(?:wrong|incorrect|invalid|not|different)\b/i.test(lower) ||
      /\b(?:change|update|correct|edit|fix|replace)\s+(?:my\s+)?email\b/i.test(lower) ||
      /\b(?:wrong|incorrect)\s+email\b/i.test(lower);

    const isPhoneCorrection =
      /\b(?:my\s+)?(?:phone|mobile|number)\s+(?:is\s+)?(?:wrong|incorrect|invalid|not|different)\b/i.test(lower) ||
      /\b(?:change|update|correct|edit|fix|replace)\s+(?:my\s+)?(?:phone|mobile|number)\b/i.test(lower) ||
      /\b(?:wrong|incorrect)\s+(?:phone|mobile|number)\b/i.test(lower);

    const isNameCorrection =
      /\b(?:my\s+)?name\s+(?:is\s+)?(?:wrong|incorrect|misspelled|not|different)\b/i.test(lower) ||
      /\b(?:change|update|correct|edit|fix|replace)\s+(?:my\s+)?name\b/i.test(lower) ||
      /\b(?:wrong|incorrect)\s+name\b/i.test(lower);

    const isDateCorrection =
      /\b(?:my\s+)?date\s+(?:is\s+)?(?:wrong|incorrect|not|different)\b/i.test(lower) ||
      /\b(?:change|update|reschedule|switch|different)\s+(?:my\s+)?(?:date|day)\b/i.test(lower) ||
      /\b(?:wrong|incorrect)\s+(?:date|day)\b/i.test(lower);

    const isTimeCorrection =
      /\b(?:my\s+)?time\s+(?:is\s+)?(?:wrong|incorrect|not|different)\b/i.test(lower) ||
      /\b(?:change|update|reschedule|switch|different)\s+(?:my\s+)?(?:time|slot)\b/i.test(lower) ||
      /\b(?:wrong|incorrect)\s+(?:time|slot)\b/i.test(lower);

    if (isEmailCorrection) {
      const newEmailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (newEmailMatch) {
        currentDraft.patientEmail = newEmailMatch[0].toLowerCase();
        reply = `I have updated your email address to ${currentDraft.patientEmail}. Please review your updated appointment slip below. Click 'Confirm My Slot' to lock your appointment.`;
        showSummaryCard = true;
        draftCard = {
          patientName: currentDraft.patientName || 'Patient',
          age: currentDraft.age,
          phone: currentDraft.phone || '',
          patientEmail: currentDraft.patientEmail,
          doctorName: currentDraft.doctorName || 'Dr. Saumya Jain',
          date: currentDraft.preferredDate || todayStr,
          time: currentDraft.preferredTime || '11:00 AM',
          primaryComplaint: currentDraft.primaryComplaint || 'Consultation',
          status: 'pending'
        };
      } else {
        currentDraft.patientEmail = undefined;
        reply = `No problem! What is your correct email address so we can update your appointment slip?`;
        showSummaryCard = false;
      }
    } else if (isPhoneCorrection) {
      const newPhoneMatch = userMessage.match(/(?:\+?91[\s-]?)?([6789]\d{9})/);
      if (newPhoneMatch) {
        currentDraft.phone = newPhoneMatch[1];
        reply = `I have updated your mobile number to ${currentDraft.phone}. Please review your updated appointment slip below. Click 'Confirm My Slot' to lock your appointment.`;
        showSummaryCard = true;
        draftCard = {
          patientName: currentDraft.patientName || 'Patient',
          age: currentDraft.age,
          phone: currentDraft.phone,
          patientEmail: currentDraft.patientEmail || '',
          doctorName: currentDraft.doctorName || 'Dr. Saumya Jain',
          date: currentDraft.preferredDate || todayStr,
          time: currentDraft.preferredTime || '11:00 AM',
          primaryComplaint: currentDraft.primaryComplaint || 'Consultation',
          status: 'pending'
        };
      } else {
        currentDraft.phone = undefined;
        reply = `Got it! Please share your correct 10-digit mobile number.`;
        showSummaryCard = false;
      }
    } else if (isNameCorrection) {
      const explicitName = userMessage.match(/(?:change|update|correct)\s+(?:my\s+)?name\s+(?:to|is)?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})/i);
      if (explicitName && explicitName[1]) {
        currentDraft.patientName = toTitleCase(explicitName[1].trim());
        reply = `I have updated your name to ${currentDraft.patientName}. Please review your updated appointment slip below. Click 'Confirm My Slot' to lock your appointment.`;
        showSummaryCard = true;
        draftCard = {
          patientName: currentDraft.patientName,
          age: currentDraft.age,
          phone: currentDraft.phone || '',
          patientEmail: currentDraft.patientEmail || '',
          doctorName: currentDraft.doctorName || 'Dr. Saumya Jain',
          date: currentDraft.preferredDate || todayStr,
          time: currentDraft.preferredTime || '11:00 AM',
          primaryComplaint: currentDraft.primaryComplaint || 'Consultation',
          status: 'pending'
        };
      } else {
        currentDraft.patientName = undefined;
        reply = `Understood! May I have your correct full name?`;
        showSummaryCard = false;
      }
    } else if (isDateCorrection) {
      currentDraft.preferredDate = undefined;
      currentDraft.preferredTime = undefined;
      reply = `Which date would you prefer to reschedule your appointment for?`;
      showSummaryCard = false;
    } else if (isTimeCorrection) {
      currentDraft.preferredTime = undefined;
      const targetDoctor = currentDraft.doctorName || 'Dr. Saumya Jain';
      const openSlots = await checkSlotsForDoctor(currentDraft.preferredDate || todayStr, targetDoctor);
      const topSlots = openSlots.slice(0, 3);
      reply = `Which time works best for you? Available slots for ${targetDoctor} on ${currentDraft.preferredDate || todayStr} are: ${topSlots.join(', ')}.`;
      showSummaryCard = false;
    } else if (!currentDraft.primaryComplaint) {
      if (lower.includes('process') || lower.includes('how to') || lower.includes('how can i') || lower.includes('how do i') || lower.includes('procedure')) {
        reply = `Booking an appointment at Indore Poly Dental Clinic is quick and simple! In just a few steps, we'll confirm your doctor, preferred date, and time slot.\n\nTo get started, what dental concern or symptoms are you experiencing (e.g. toothache, root canal, dental implants, aligners, broken tooth/jaw)?`;
      } else {
        reply = `What dental concern or treatment are you experiencing (e.g. toothache, root canal, dental implants, aligners)?`;
      }
    } else if (!currentDraft.preferredDate) {
      const doc = currentDraft.doctorName || 'our dental specialist';
      if (currentDraft.primaryComplaint && (currentDraft.primaryComplaint.toLowerCase().includes('jaw') || currentDraft.primaryComplaint.toLowerCase().includes('trauma') || currentDraft.primaryComplaint.toLowerCase().includes('accident'))) {
        reply = `For your jaw trauma consultation with Senior Surgeon ${doc}, which date would you prefer to visit our clinic (e.g. today or tomorrow)?`;
      } else {
        reply = `Which date would you prefer to visit our clinic?`;
      }
    } else if (!currentDraft.preferredTime) {
      const targetDoctor = currentDraft.doctorName || 'Dr. Saumya Jain';
      const openSlots = await checkSlotsForDoctor(currentDraft.preferredDate, targetDoctor);
      const topSlots = openSlots.slice(0, 3);
      if (topSlots.length > 0) {
        reply = `${targetDoctor} has open slots on ${currentDraft.preferredDate} at ${topSlots.join(', ')}. Which time works best for you?`;
      } else {
        reply = `All standard slots for ${targetDoctor} on ${currentDraft.preferredDate} are fully booked. Would you like to check another date?`;
      }
    } else if (!currentDraft.patientName) {
      reply = `May I have your full name?`;
    } else if (currentDraft.age === undefined || currentDraft.age === null) {
      reply = `What is your age in years?`;
    } else if (!currentDraft.phone) {
      reply = `Please share your 10-digit mobile number.`;
    } else if (!currentDraft.patientEmail) {
      reply = `Could you please share your email address so we can send your appointment confirmation slip and clinic directions?`;
    } else {
      // All 8 fields satisfied! Output EXACTLY ONE summary review card without repetitive text.
      showSummaryCard = true;
      const targetDoctor = currentDraft.doctorName || 'Dr. Saumya Jain';
      
      if (isConfirmWord) {
        currentDraft.status = 'confirmed';
        reply = `📧 We have sent you an email at ${currentDraft.patientEmail}—please confirm your appointment to verify as a registered patient!\n\nYour consultation with ${targetDoctor} is scheduled for ${currentDraft.preferredDate} at ${currentDraft.preferredTime}. You can also click 'Add to Google Calendar' on your appointment slip below so you never miss your slot!`;
        draftCard = {
          patientName: currentDraft.patientName,
          age: currentDraft.age,
          phone: currentDraft.phone,
          patientEmail: currentDraft.patientEmail,
          doctorName: targetDoctor,
          date: currentDraft.preferredDate,
          time: currentDraft.preferredTime,
          primaryComplaint: currentDraft.primaryComplaint,
          status: 'confirmed'
        };
      } else {
        reply = `Please review your appointment slip below. If you need any corrections, let me know. Otherwise, click 'Confirm My Slot' to lock your slot.`;
        draftCard = {
          patientName: currentDraft.patientName,
          age: currentDraft.age,
          phone: currentDraft.phone,
          patientEmail: currentDraft.patientEmail,
          doctorName: targetDoctor,
          date: currentDraft.preferredDate,
          time: currentDraft.preferredTime,
          primaryComplaint: currentDraft.primaryComplaint,
          status: 'draft'
        };
      }
    }
  } else if (intent === 'Pricing Enquiry') {
    if (primaryComplaint === 'Root Canal Treatment') {
      reply = `At Indore Poly Dental Clinic, specialized microscopic Root Canal Treatments by Dr. Saumya Jain typically start from ₹3,000 depending on whether it is an anterior or molar tooth and whether a crown is required. We recommend a quick digital X-ray consultation to give you an exact estimate. Would you like to schedule a visit?`;
    } else if (primaryComplaint === 'Dental Implants') {
      reply = `Dental implant treatments are performed by Senior Oral & Maxillofacial Surgeon Dr. Sandesh Jain (~25 years experience). Pricing depends on bone density, implant brand (such as Nobel Biocare or Straumann), and crown material. We invite you for a 3D CBCT diagnostic evaluation at our New Palasia clinic to review your customized plan.`;
    } else {
      reply = `At Indore Poly Dental Clinic, we maintain transparent pricing for all procedures. Basic consultations begin with a thorough clinical examination. For an exact cost estimate tailored to your requirements, would you like to schedule an appointment with Dr. Sandesh Jain or Dr. Saumya Jain?`;
    }
  } else if (!appointmentRequested && findBestFaqMatch(userMessage)) {
    const faqResult = findBestFaqMatch(userMessage)!;
    reply = `${faqResult.match.answer}\n\nWould you like to schedule a consultation with Dr. Sandesh Jain or Dr. Saumya Jain, or check available appointment slots?`;
    isFallback = false;
    needsHuman = false;
    intent = faqResult.match.category;
  } else if (primaryComplaint) {
    if (primaryComplaint === 'Dental Implants') {
      reply = `Dental Implants at Indore Poly Dental Clinic are led by Dr. Sandesh Jain, Senior Oral & Maxillofacial Surgeon with over 25 years of surgical experience. Implants replace missing teeth permanently with titanium fixtures and natural-looking crowns. Would you like to check available appointment times for an implant consultation?`;
    } else if (primaryComplaint === 'Root Canal Treatment') {
      reply = `Our Root Canal Treatments are headed by Endodontist Dr. Saumya Jain, specializing in pain-free microscopic root canal procedures that preserve your natural tooth. If you are experiencing pain or sensitivity, we can prioritize an appointment for you today or tomorrow.`;
    } else if (primaryComplaint === 'Invisible Aligners') {
      reply = `We provide custom invisible clear aligners to straighten teeth comfortably without visible metal wires. Treatment plans are digitally mapped out by Dr. Saumya Jain. Would you like to schedule an aligner assessment?`;
    } else if (primaryComplaint === 'TMJ Treatment') {
      reply = `Jaw pain, clicking sounds, and restricted mouth opening (TMJ disorders) are surgically and therapeutically diagnosed and managed by Dr. Sandesh Jain at our New Palasia clinic. Would you like to book a TMJ consultation?`;
    } else {
      reply = `Indore Poly Dental Clinic provides comprehensive care for ${primaryComplaint} backed by ~40 years combined expertise from Dr. Sandesh Jain (Oral Surgeon) and Dr. Saumya Jain (Endodontist). May I arrange a consultation for you?`;
    }
  } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
    reply = `Indore Poly Dental Clinic is conveniently located at ${INDORE_DENTAL_KB.address} (${INDORE_DENTAL_KB.landmark}). Clinic hours are Monday through Saturday, 11:00 AM to 8:30 PM.`;
  } else if (lower.includes('doctor') || lower.includes('who') || lower.includes('surgeon')) {
    reply = `The clinic is headed by two senior specialists: Dr. Sandesh Jain (Senior Oral & Maxillofacial Surgeon with ~25 years experience) and Dr. Saumya Jain (Specialist Endodontist & Cosmetic Dentist with ~15 years experience).`;
  } else if (lower.includes('hours') || lower.includes('timing') || lower.includes('open') || lower.includes('time')) {
    reply = `Indore Poly Dental Clinic is open Monday to Saturday from 11:00 AM to 8:30 PM (Sunday closed). Walk-ins and appointments are welcome during these hours.`;
  } else if (
    lower.includes('information of your clinic') ||
    lower.includes('information about your clinic') ||
    lower.includes('information of the clinic') ||
    lower.includes('information about the clinic') ||
    lower.includes('about your clinic') ||
    lower.includes('about the clinic') ||
    lower.includes('clinic information') ||
    lower.includes('clinic info') ||
    lower.includes('clinic details') ||
    lower.includes('tell me about your clinic') ||
    lower.includes('tell me about the clinic') ||
    lower.includes('share details of your clinic') ||
    lower.includes('share clinic details') ||
    lower.includes('share the information') ||
    lower.includes('share information') ||
    lower.includes('services do you offer') ||
    lower.includes('services do you provide') ||
    lower.includes('what treatments do you') ||
    lower.includes('treatments available') ||
    lower.includes('treatments offered') ||
    lower.includes('what does your clinic do') ||
    lower.includes('facilities') ||
    lower.includes('clinic profile')
  ) {
    reply = `Welcome to Indore Poly Dental Clinic! We are a leading multi-specialty dental & maxillofacial center located at ${INDORE_DENTAL_KB.address} (${INDORE_DENTAL_KB.landmark}). We have ~40 years of combined clinical excellence headed by Dr. Sandesh Jain (Senior Oral & Maxillofacial Surgeon, ~25 years exp) and Dr. Saumya Jain (Specialist Endodontist & Cosmetic Dentist, ~15 years exp). Our specialties include Dental Implants, Microscopic Root Canal Treatments, Invisible Clear Aligners, Smile Makeovers, Wisdom Tooth Surgery, and TMJ Therapy. Operating hours: Monday to Saturday, 11:00 AM to 8:30 PM. Would you like to consult for a specific treatment or schedule an appointment?`;
    isFallback = false;
    needsHuman = false;
  } else if (
    lower.includes('how are you') ||
    lower.includes('how r u') ||
    lower.includes('how are u') ||
    lower.includes('how are you doing') ||
    lower.includes("how's it going") ||
    lower.includes('how do you do')
  ) {
    reply = `I'm doing well, thank you for asking! Welcome to Indore Poly Dental Clinic. How can Dr. Sandesh Jain, Dr. Saumya Jain, or our dental team assist you today? Are you experiencing any tooth pain or looking to schedule a consultation?`;
  } else if (
    lower.includes('thank you') ||
    lower.includes('thanks') ||
    lower === 'ok' ||
    lower === 'okay' ||
    lower === 'sure' ||
    lower === 'alright' ||
    lower === 'got it'
  ) {
    reply = `You're very welcome! Please let me know how Dr. Sandesh Jain, Dr. Saumya Jain, or our clinic team can help you today. What dental concern or treatment would you like to discuss?`;
  } else if (
    lower.includes('who are you') ||
    lower.includes('what can you do') ||
    lower.includes('what do you do') ||
    lower.includes('help me')
  ) {
    reply = `I am the AI Digital Receptionist for Indore Poly Dental Clinic (1/4 near 56 Shops, New Palasia). I can help you schedule consultations with Dr. Sandesh Jain (Oral & Maxillofacial Surgeon) and Dr. Saumya Jain (Endodontist & Cosmetic Dentist), check open appointment slots, explain treatments (Root Canal, Implants, Aligners, Extractions), and provide clinic hours. How can I assist you today?`;
  } else if (currentDraft.patientName && (wasAskedForContact || lower.includes('name is') || lower.includes('myself') || lower.startsWith('i am') || !currentDraft.primaryComplaint)) {
    if (wasAskedForContact && !currentDraft.phone) {
      reply = `Thank you, ${currentDraft.patientName}. Could you also share your 10-digit mobile number so Dr. Sandesh Jain or Dr. Saumya Jain's front desk staff can reach you directly?`;
      needsHuman = true;
      isFallback = false;
    } else if (wasAskedForContact && currentDraft.phone) {
      reply = `Thank you, ${currentDraft.patientName}! I've noted your contact number (${currentDraft.phone}). Dr. Sandesh Jain and Dr. Saumya Jain's team will contact you directly. What dental concern or appointment day can we assist you with in the meantime?`;
      needsHuman = true;
      isFallback = false;
    } else {
      reply = `Pleasure to meet you, ${currentDraft.patientName}! Welcome to Indore Poly Dental Clinic. How can Dr. Sandesh Jain, Dr. Saumya Jain, or our dental team assist you today? Are you experiencing any tooth pain, or looking for treatments like Implants, Root Canal, or Invisible Aligners?`;
    }
  } else if (wasAskedForContact && currentDraft.phone) {
    reply = `Thank you! I've noted your phone number (${currentDraft.phone}). Our front desk team will contact you shortly. What dental concern or treatment can we help you with in the meantime?`;
    needsHuman = true;
    isFallback = false;
  } else if (
    lower.includes('hi') ||
    lower.includes('hello') ||
    lower.includes('hey') ||
    lower.includes('start') ||
    lower.includes('good morning') ||
    lower.includes('good afternoon') ||
    lower.includes('good evening') ||
    lower.trim().length <= 5
  ) {
    reply = `Hello! Welcome to Indore Poly Dental Clinic. How can Dr. Sandesh Jain, Dr. Saumya Jain, or our dental team assist you today?`;
  } else {
    // Check if RAG Vector search is enabled
    let vectorMatch: any = null;
    if (process.env.KB_MODE === 'vector') {
      try {
        const { KnowledgeChunk } = await import('../models/KnowledgeChunk.js');
        const { generateEmbedding, cosineSimilarity } = await import('./embeddingService.js');
        const qVec = await generateEmbedding(userMessage);
        const allChunks = await KnowledgeChunk.find({});
        if (allChunks.length > 0) {
          const scored = allChunks.map(c => ({ chunk: c, score: cosineSimilarity(qVec, c.embedding) }));
          scored.sort((a, b) => b.score - a.score);
          if (scored[0] && scored[0].score >= 0.35) {
            vectorMatch = scored[0].chunk;
          }
        }
      } catch (ragErr) {
        console.warn('[RAG RETRIEVAL ERROR]', ragErr);
      }
    }

    const fallbackFaq = findBestFaqMatch(userMessage);
    if (vectorMatch) {
      reply = `${vectorMatch.content} Would you like to schedule an appointment with our specialist team?`;
      isFallback = false;
      needsHuman = false;
    } else if (fallbackFaq) {
      reply = `${fallbackFaq.match.answer}\n\nWould you like to schedule a consultation with Dr. Sandesh Jain or Dr. Saumya Jain, or ask about another treatment?`;
      isFallback = false;
      needsHuman = false;
      intent = fallbackFaq.match.category;
    } else if (currentDraft.patientName) {
      reply = `Pleasure to meet you, ${currentDraft.patientName}! Welcome to Indore Poly Dental Clinic. How can Dr. Sandesh Jain or Dr. Saumya Jain assist you today? Would you like to schedule a consultation or ask about any dental treatment?`;
      isFallback = false;
      needsHuman = false;
    } else {
      // Verified AI fallback path for unverified / unanswered queries
      isFallback = true;
      needsHuman = true;
      escalationReason = `Unanswered query: "${userMessage.slice(0, 60)}"`;
      reply = `I'm not completely certain about that specific detail. Let me connect you with the clinic team so Dr. Sandesh Jain or Dr. Saumya Jain's front desk staff can help you directly. Could you please share your name and contact phone number?`;
    }
  }

  // 2-sentence structured summary for the conversation
  const summaryPart1 = currentDraft.patientName
    ? `Patient ${currentDraft.patientName} inquired regarding ${currentDraft.primaryComplaint || intent} at Indore Poly Dental Clinic.`
    : `Website visitor inquired regarding ${currentDraft.primaryComplaint || intent}.`;
  const summaryPart2 = needsHuman
    ? `Conversation flagged for human clinic attention due to ${escalationReason || 'patient requirement'}.`
    : `Digital receptionist provided clinic information and recorded enquiry details.`;
  const summary = `${summaryPart1} ${summaryPart2}`;

  return {
    reply,
    intent,
    urgency,
    treatment: currentDraft.primaryComplaint,
    appointmentRequested,
    patientName: currentDraft.patientName,
    phone: currentDraft.phone,
    patientEmail: currentDraft.patientEmail,
    preferredTime: currentDraft.preferredTime,
    preferredDate: currentDraft.preferredDate,
    doctorName: currentDraft.doctorName,
    leadScore,
    needsHuman,
    escalationReason,
    summary,
    isFallback,
    draftCard,
    showSummaryCard,
    draft: currentDraft
  };
};
