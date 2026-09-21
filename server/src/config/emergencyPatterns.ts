/**
 * Emergency pattern keywords for Indore Poly Dental Clinic
 * Matches critical dental trauma, acute pain, bleeding, or accidents
 * that require immediate emergency triage or human clinic staff handoff.
 */
export const EMERGENCY_PATTERNS: string[] = [
  'severe pain',
  'unbearable pain',
  'extreme pain',
  'tooth pain and swelling',
  'tooth pain + swelling',
  'swelling and pain',
  'face swelling',
  'facial swelling',
  'gum swelling',
  'bleeding',
  'profuse bleeding',
  'continuous bleeding',
  'blood from mouth',
  'trauma',
  'dental trauma',
  'facial trauma',
  'accident',
  'road accident',
  'broken jaw',
  'jaw fracture',
  'fractured jaw',
  'knocked out tooth',
  'avulsed tooth',
  'broken front tooth',
  'tooth cracked in half',
  'pus discharge',
  'abscess',
  'cannot open mouth',
  'unable to swallow'
];

/**
 * Checks if a message text contains any emergency pattern keyword
 */
export const matchesEmergencyPattern = (text: string): { matched: boolean; reason?: string } => {
  const lower = text.toLowerCase();
  
  // Check combination of pain + swelling
  if (lower.includes('pain') && (lower.includes('swell') || lower.includes('swelling'))) {
    return { matched: true, reason: 'Severe tooth pain combined with swelling' };
  }

  for (const pattern of EMERGENCY_PATTERNS) {
    if (lower.includes(pattern)) {
      return { matched: true, reason: `Emergency keyword matched: "${pattern}"` };
    }
  }

  return { matched: false };
};

/**
 * Checks if patient explicitly requests a human / real person
 */
export const matchesHumanRequest = (text: string): { requested: boolean; reason?: string } => {
  const lower = text.toLowerCase();
  const humanKeywords = [
    'talk to human',
    'speak to human',
    'real human',
    'real person',
    'talk to a person',
    'speak to a person',
    'human please',
    'talk to doctor',
    'speak to doctor',
    'connect to doctor',
    'talk to receptionist',
    'speak to receptionist',
    'front desk staff',
    'connect to staff',
    'call me back',
    'human agent',
    'agent please'
  ];

  for (const kw of humanKeywords) {
    if (lower.includes(kw)) {
      return { requested: true, reason: `Patient explicitly requested human assistance ("${kw}")` };
    }
  }

  return { requested: false };
};
