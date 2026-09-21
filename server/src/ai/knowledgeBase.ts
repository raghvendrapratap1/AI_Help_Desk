export interface ClinicKnowledge {
  clinicName: string;
  tagline: string;
  address: string;
  landmark: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  hours: string;
  consultingHours: string;
  doctors: Array<{
    name: string;
    designation: string;
    specialty: string;
    experience: string;
    procedures: string[];
  }>;
  services: Array<{
    name: string;
    description: string;
    symptomsAddressed: string[];
    typicalDuration: string;
    startingEstimate?: string;
  }>;
  policies: {
    emergencyHandling: string;
    appointmentBooking: string;
    pricingPolicy: string;
    unverifiedQueries: string;
  };
}

export const INDORE_DENTAL_KB: ClinicKnowledge = {
  clinicName: 'Indore Poly Dental Clinic',
  tagline: 'Advanced Oral & Maxillofacial Surgery & Root Canal Care Center',
  address: '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
  landmark: 'Right near the famous 56 Dukan (56 Shops) in New Palasia',
  city: 'Indore',
  pincode: '452001',
  phone: '+91 98270 12345',
  email: 'raghvendrapratapsingh505@gmail.com',
  hours: 'Monday to Saturday, 11:00 AM to 8:30 PM (Sunday Closed)',
  consultingHours: '11:00 AM to 8:30 PM',
  doctors: [
    {
      name: 'Dr. Sandesh Jain',
      designation: 'Senior Oral & Maxillofacial Surgeon',
      specialty: 'Oral & Maxillofacial Surgery, Dental Implants, TMJ, Facial Trauma',
      experience: '~25 years of specialized surgical excellence in Indore',
      procedures: [
        'Dental Implants (single tooth, multiple, full arch)',
        'Wisdom tooth surgical extraction',
        'Jaw & facial bone trauma surgery',
        'TMJ (Temporomandibular Joint) disorder therapy',
        'Bone grafting & sinus lift for implants'
      ]
    },
    {
      name: 'Dr. Saumya Jain',
      designation: 'Specialist Endodontist & Cosmetic Dentist',
      specialty: 'Microscopic Root Canal Treatment, Aesthetic Dentistry, Veneers',
      experience: '~15 years of endodontic & aesthetic clinical experience',
      procedures: [
        'Single-sitting and multi-visit Root Canal Treatments',
        'Invisible clear aligners & smile design',
        'Porcelain & composite dental veneers',
        'Zirconia & ceramic dental crowns & bridges',
        'In-office tooth whitening & cosmetic bonding',
        'Complete & partial precision dentures'
      ]
    }
  ],
  services: [
    {
      name: 'Dental Implants',
      description: 'Permanent titanium tooth root replacements for missing or extracted teeth, restored with lifelike ceramic crowns.',
      symptomsAddressed: ['missing teeth', 'difficulty chewing', 'loose bridge', 'tooth gap'],
      typicalDuration: 'Consultation 30 mins; implant placement 45-60 mins',
      startingEstimate: 'Evaluated individually following diagnostic CBCT / X-ray'
    },
    {
      name: 'Root Canal Treatment',
      description: 'Pain-relieving microscopic therapy to eliminate deep infection inside the tooth pulp while saving the natural tooth structure.',
      symptomsAddressed: ['severe toothache', 'throbbing pain while chewing', 'hot/cold sensitivity', 'swollen gum near tooth'],
      typicalDuration: '1 to 2 sittings of 30-45 mins',
      startingEstimate: 'Starting from ₹3,000 depending on tooth position and complexity'
    },
    {
      name: 'Invisible Aligners',
      description: 'Custom-molded transparent clear aligner trays that gently align and straighten crooked or crowded teeth discreetly.',
      symptomsAddressed: ['crooked teeth', 'teeth spacing', 'overbite', 'crowded smile'],
      typicalDuration: 'Treatment timeline 6 to 14 months based on digital 3D plan'
    },
    {
      name: 'Cosmetic Dentistry & Veneers',
      description: 'Ultra-thin custom porcelain or composite shells that cover chipped, discolored, or uneven teeth for a bright smile.',
      symptomsAddressed: ['yellowing/stained teeth', 'chipped teeth', 'gaps in front teeth'],
      typicalDuration: '2 visits'
    },
    {
      name: 'Dentures',
      description: 'Full or partial custom removable and implant-supported prosthetics restoring speech and eating ability.',
      symptomsAddressed: ['multiple missing teeth', 'elderly tooth loss'],
      typicalDuration: '3-4 precision measurement sittings'
    },
    {
      name: 'Jaw & Facial Trauma Surgery',
      description: 'Advanced surgical management of facial bone fractures, lacerations, and structural jaw corrections led by Dr. Sandesh Jain.',
      symptomsAddressed: ['facial injury', 'fractured jaw', 'accident trauma'],
      typicalDuration: 'Immediate surgical evaluation'
    },
    {
      name: 'TMJ Treatment',
      description: 'Diagnosis and conservative/therapeutic treatment of jaw joint pain, clicking sounds, and restricted mouth opening.',
      symptomsAddressed: ['jaw clicking', 'pain when opening mouth', 'morning jaw stiffness'],
      typicalDuration: 'Comprehensive 45 min evaluation'
    }
  ],
  policies: {
    emergencyHandling: 'For severe pain, bleeding, or acute dental trauma, walk in directly during clinic hours (11:00 AM - 8:30 PM) or call +91 98270 12345 for urgent attention.',
    appointmentBooking: 'Patients can request appointments by specifying their preferred day and time (11:00 AM - 8:30 PM Mon-Sat) along with their name and phone number.',
    pricingPolicy: 'General baseline ranges can be shared for consultation and basic procedures, but exact surgical treatment cost depends on clinical evaluation and digital X-ray.',
    unverifiedQueries: 'If asked about medical disciplines outside dental/maxillofacial care (such as cardiology, orthopedics, general medicine), or medications beyond approved clinic protocols, clearly state that Indore Poly Dental Clinic specializes strictly in dental & maxillofacial care and offer to connect them with clinic staff.'
  }
};
