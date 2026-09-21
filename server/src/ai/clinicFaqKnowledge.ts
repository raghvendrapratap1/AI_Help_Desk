/**
 * Comprehensive Indore Poly Dental Clinic FAQ & Clinical Knowledge Base
 * Over 110+ curated patient questions and suitable clinically verified answers.
 */

export interface FAQItem {
  id: string;
  category: string;
  questions: string[];
  keywords: string[];
  answer: string;
}

export const CLINIC_FAQS: FAQItem[] = [
  // ==========================================
  // CATEGORY 1: CLINIC LOCATION & DIRECTIONS (10 FAQs)
  // ==========================================
  {
    id: 'loc-1',
    category: 'Location & Access',
    questions: ['Where is Indore Poly Dental Clinic located?', 'What is the clinic address?', 'Where can I find you in Indore?'],
    keywords: ['where are you', 'address', 'location', 'where located', 'situated', 'where is clinic', 'map location'],
    answer: 'Indore Poly Dental Clinic is centrally located at 1/4, near 56 Shops (Chappan Dukan), New Palasia, Indore, Madhya Pradesh 452001.'
  },
  {
    id: 'loc-2',
    category: 'Location & Access',
    questions: ['What is the landmark near your clinic?', 'How do I reach the clinic from 56 Dukan?'],
    keywords: ['landmark', 'near 56 shops', 'near chappan', '56 dukan', 'how to reach'],
    answer: 'Our clinic is right near the famous 56 Shops (Chappan Dukan) in New Palasia, making it very easy to locate and accessible from all parts of Indore.'
  },
  {
    id: 'loc-3',
    category: 'Location & Access',
    questions: ['Is car or two-wheeler parking available at the clinic?', 'Where can I park my vehicle?'],
    keywords: ['parking', 'car park', 'park car', 'vehicle parking', 'two wheeler parking', 'bike parking'],
    answer: 'Yes, convenient vehicle and two-wheeler parking is available right outside the clinic premises and along the New Palasia lane.'
  },
  {
    id: 'loc-4',
    category: 'Location & Access',
    questions: ['Is the clinic wheelchair accessible?', 'Can elderly patients easily enter?'],
    keywords: ['wheelchair', 'accessible', 'handicapped', 'elderly', 'lift', 'ground floor', 'ramp', 'stairs'],
    answer: 'Yes, Indore Poly Dental Clinic has ground-floor accessibility and patient assistance staff ready to help elderly patients or individuals with mobility constraints.'
  },
  {
    id: 'loc-5',
    category: 'Location & Access',
    questions: ['How far is the clinic from Indore railway station?', 'Can I come directly from the station?'],
    keywords: ['railway station', 'indore station', 'train station', 'distance from station'],
    answer: 'The clinic is only about 3 to 4 km (10-15 minutes drive) from Indore Junction Railway Station via MG Road or Palasia.'
  },
  {
    id: 'loc-6',
    category: 'Location & Access',
    questions: ['How far is the clinic from Indore airport?', 'Distance from Devi Ahilya Bai airport?'],
    keywords: ['airport', 'indore airport', 'devi ahilya', 'flight'],
    answer: 'Devi Ahilyabai Holkar International Airport is approximately 11 km (about 25-30 minutes) from our New Palasia clinic.'
  },
  {
    id: 'loc-7',
    category: 'Location & Access',
    questions: ['Do you have any other branches in Indore?', 'Is there another branch in Vijay Nagar or Rajwada?'],
    keywords: ['other branch', 'branches', 'vijay nagar', 'rajwada', 'annapurna', 'bhanwarkuan', 'second branch'],
    answer: 'Our primary, fully-equipped multi-specialty surgical and dental center is situated in New Palasia near 56 Shops to ensure dedicated personal care by Dr. Sandesh Jain and Dr. Saumya Jain.'
  },
  {
    id: 'loc-8',
    category: 'Location & Access',
    questions: ['Is the clinic easily accessible by iBus or city transit?'],
    keywords: ['ibus', 'city bus', 'public transport', 'metro', 'auto rickshaw'],
    answer: 'Yes, the clinic is within short walking distance from the Palasia / Industry House iBus corridor and easily reached by city buses, cabs, and autos.'
  },
  {
    id: 'loc-9',
    category: 'Location & Access',
    questions: ['Are you located in a commercial complex or private clinic?'],
    keywords: ['commercial complex', 'building', 'private clinic', 'setup'],
    answer: 'We operate a dedicated private multi-specialty dental and maxillofacial clinic facility designed with specialized surgical and endodontic operatories.'
  },
  {
    id: 'loc-10',
    category: 'Location & Access',
    questions: ['Can you share the Google Maps location link?'],
    keywords: ['google map', 'maps link', 'directions', 'gps'],
    answer: 'You can navigate directly by searching "Indore Poly Dental Clinic" or "1/4 New Palasia near 56 Shops, Indore" on Google Maps. We also include directions in your appointment confirmation email.'
  },

  // ==========================================
  // CATEGORY 2: CLINIC HOURS & APPOINTMENTS (10 FAQs)
  // ==========================================
  {
    id: 'hrs-1',
    category: 'Timings & Booking',
    questions: ['What are the clinic opening and closing hours?', 'What are clinic timings?'],
    keywords: ['timings', 'opening hours', 'closing time', 'what time open', 'clinic hours', 'schedule'],
    answer: 'Indore Poly Dental Clinic is open Monday through Saturday from 11:00 AM to 8:30 PM.'
  },
  {
    id: 'hrs-2',
    category: 'Timings & Booking',
    questions: ['Is the clinic open on Sunday?', 'Can I visit on Sunday?'],
    keywords: ['sunday', 'open on sunday', 'sunday open', 'sunday closed', 'weekend'],
    answer: 'The clinic is closed on Sundays for routine consultations. However, emergency surgical and trauma assistance is supported on call.'
  },
  {
    id: 'hrs-3',
    category: 'Timings & Booking',
    questions: ['Can I walk in without an appointment?', 'Are walk-in consultations allowed?'],
    keywords: ['walk in', 'walk-in', 'without appointment', 'direct visit', 'can i directly come'],
    answer: 'Walk-ins are always welcomed and attended to. However, we strongly recommend reserving a slot in advance to ensure zero waiting time with your preferred doctor.'
  },
  {
    id: 'hrs-4',
    category: 'Timings & Booking',
    questions: ['Can I get an appointment in the evening after office hours?'],
    keywords: ['evening appointment', 'late evening', 'after 6 pm', 'after 7 pm', 'after office'],
    answer: 'Yes! We are open until 8:30 PM specifically so working professionals and students can comfortably schedule consultations in the evening.'
  },
  {
    id: 'hrs-5',
    category: 'Timings & Booking',
    questions: ['How do I book an appointment?', 'What is the booking process?'],
    keywords: ['how to book', 'booking process', 'reserve slot', 'schedule appointment'],
    answer: 'Booking an appointment is very easy right here! Just let me know your dental concern, preferred date, and time slot, along with your name and phone number, and we will confirm your appointment slip immediately.'
  },
  {
    id: 'hrs-6',
    category: 'Timings & Booking',
    questions: ['How can I reschedule or change my appointment time?'],
    keywords: ['reschedule', 'change appointment', 'change time', 'change date', 'postpone'],
    answer: 'You can reschedule your slot anytime by messaging us right here in this chat or calling +91 98270 12345. We will gladly adjust it to your new preferred date.'
  },
  {
    id: 'hrs-7',
    category: 'Timings & Booking',
    questions: ['What is the cancellation policy?', 'Can I cancel my appointment?'],
    keywords: ['cancel appointment', 'cancellation', 'cancel my slot'],
    answer: 'You can cancel or modify your appointment at any time without any cancellation penalty. We just request prior notice so another patient in pain may be accommodated.'
  },
  {
    id: 'hrs-8',
    category: 'Timings & Booking',
    questions: ['How early should I arrive before my appointment?'],
    keywords: ['how early', 'reporting time', 'reach early', 'arrive early'],
    answer: 'Arriving 5 to 10 minutes prior to your scheduled slot is ideal for digital registration and pre-consultation sanitization.'
  },
  {
    id: 'hrs-9',
    category: 'Timings & Booking',
    questions: ['How long does a typical first consultation take?'],
    keywords: ['how long consultation', 'duration of visit', 'time taken'],
    answer: 'A comprehensive first consultation usually takes about 20 to 30 minutes, including a clinical examination, digital X-rays if required, and a detailed discussion of your treatment plan.'
  },
  {
    id: 'hrs-10',
    category: 'Timings & Booking',
    questions: ['Are appointments running on time or is there long waiting?'],
    keywords: ['waiting time', 'delay', 'wait long', 'crowd'],
    answer: 'We operate strictly on a scheduled appointment management system to keep patient waiting times under 10-15 minutes.'
  },

  // ==========================================
  // CATEGORY 3: DOCTORS & SPECIALIZATIONS (10 FAQs)
  // ==========================================
  {
    id: 'doc-1',
    category: 'Doctors & Credentials',
    questions: ['Who are the main doctors at Indore Poly Dental Clinic?', 'Who will examine me?'],
    keywords: ['doctors', 'who are doctors', 'dentists', 'surgeons', 'team'],
    answer: 'Our clinic is headed by two senior specialists: Dr. Sandesh Jain (Senior Oral & Maxillofacial Surgeon, ~25 years experience) and Dr. Saumya Jain (Specialist Endodontist & Cosmetic Dentist, ~15 years experience).'
  },
  {
    id: 'doc-2',
    category: 'Doctors & Credentials',
    questions: ['What is Dr. Sandesh Jain specialty and experience?'],
    keywords: ['sandesh jain', 'dr sandesh', 'oral surgeon', 'maxillofacial surgeon'],
    answer: 'Dr. Sandesh Jain is a renowned Senior Oral & Maxillofacial Surgeon with ~25 years of specialized surgical experience in Indore, specializing in dental implants, complex wisdom tooth surgeries, TMJ disorders, and facial trauma.'
  },
  {
    id: 'doc-3',
    category: 'Doctors & Credentials',
    questions: ['What is Dr. Saumya Jain specialty and experience?'],
    keywords: ['saumya jain', 'dr saumya', 'endodontist', 'cosmetic dentist', 'root canal specialist'],
    answer: 'Dr. Saumya Jain is a Specialist Endodontist and Aesthetic Dentist with ~15 years of experience, specializing in pain-free microscopic Root Canal Treatments, clear invisible aligners, dental veneers, and smile makeovers.'
  },
  {
    id: 'doc-4',
    category: 'Doctors & Credentials',
    questions: ['Which doctor handles root canal treatments?'],
    keywords: ['who does rct', 'who does root canal', 'rct doctor'],
    answer: 'Root Canal Treatments are performed by Dr. Saumya Jain using modern microscopic and rotary endodontic equipment for precision and minimal discomfort.'
  },
  {
    id: 'doc-5',
    category: 'Doctors & Credentials',
    questions: ['Which doctor performs dental implant surgery?'],
    keywords: ['who does implant', 'implant doctor', 'implant specialist'],
    answer: 'Dental implants and surgical bone grafting are personally performed by Senior Oral & Maxillofacial Surgeon Dr. Sandesh Jain.'
  },
  {
    id: 'doc-6',
    category: 'Doctors & Credentials',
    questions: ['Are both doctors available every day?'],
    keywords: ['doctor availability', 'are doctors available', 'daily available'],
    answer: 'Yes, both Dr. Sandesh Jain and Dr. Saumya Jain consult daily Monday through Saturday between 11:00 AM and 8:30 PM.'
  },
  {
    id: 'doc-7',
    category: 'Doctors & Credentials',
    questions: ['Can I request a consultation specifically with a female dentist?'],
    keywords: ['female doctor', 'female dentist', 'lady doctor', 'woman dentist'],
    answer: 'Yes, Dr. Saumya Jain is available for patients who feel more comfortable being treated by a senior female dental specialist.'
  },
  {
    id: 'doc-8',
    category: 'Doctors & Credentials',
    questions: ['Do the doctors attend to pediatric or child patients?'],
    keywords: ['child', 'children', 'kids', 'pediatric', 'baby teeth'],
    answer: 'Yes, Dr. Saumya Jain routinely treats children with gentle, compassionate care for cavities, fillings, fluoride treatments, and habit counseling.'
  },
  {
    id: 'doc-9',
    category: 'Doctors & Credentials',
    questions: ['Can I consult the doctor for a second opinion?'],
    keywords: ['second opinion', 'already took opinion', 'cross check'],
    answer: 'Certainly! We frequently provide second opinions on complex surgical, implant, or orthodontic cases. Please bring your existing X-rays or reports.'
  },
  {
    id: 'doc-10',
    category: 'Doctors & Credentials',
    questions: ['Are your doctors registered with the Dental Council?'],
    keywords: ['registered', 'ida', 'dental council', 'qualification', 'mds'],
    answer: 'Yes, our doctors hold Master of Dental Surgery (MDS) degrees and are fully registered with the State and National Dental Councils.'
  },

  // ==========================================
  // CATEGORY 4: ROOT CANAL TREATMENT (RCT) (10 FAQs)
  // ==========================================
  {
    id: 'rct-1',
    category: 'Root Canal Treatment',
    questions: ['Is a Root Canal Treatment (RCT) painful?', 'Will RCT hurt?'],
    keywords: ['rct painful', 'pain in rct', 'does root canal hurt', 'is rct painful', 'painful'],
    answer: 'No, modern Root Canal Treatment at our clinic is virtually painless! We administer precise local anesthesia and use motorized rotary files so you feel comfortable throughout the procedure.'
  },
  {
    id: 'rct-2',
    category: 'Root Canal Treatment',
    questions: ['How many sittings or visits are required for a root canal?'],
    keywords: ['how many sittings', 'single sitting rct', 'visits for rct', 'rct sessions', 'sessions'],
    answer: 'Most straightforward cases can be completed in a single sitting (approx. 45 minutes) by Dr. Saumya Jain. Severe infections may require 2 visits to ensure complete sterilization.'
  },
  {
    id: 'rct-3',
    category: 'Root Canal Treatment',
    questions: ['Why is a dental crown or cap required after an RCT?'],
    keywords: ['why crown', 'is cap necessary', 'cap after rct', 'crown needed', 'why cap'],
    answer: 'After a root canal, the tooth loses its internal blood supply and becomes brittle over time. A ceramic or zirconia crown protects the tooth from cracking under normal chewing force.'
  },
  {
    id: 'rct-4',
    category: 'Root Canal Treatment',
    questions: ['How much does a Root Canal Treatment cost?'],
    keywords: ['rct cost', 'root canal price', 'cost of rct', 'how much rct'],
    answer: 'At Indore Poly Dental Clinic, specialized microscopic root canal treatments by Dr. Saumya Jain typically start from ₹3,000, depending on tooth position (front tooth vs. molar) and infection severity.'
  },
  {
    id: 'rct-5',
    category: 'Root Canal Treatment',
    questions: ['What symptoms indicate that I need a root canal?'],
    keywords: ['symptoms of rct', 'signs of root canal', 'do i need rct', 'throbbing pain', 'nerve pain'],
    answer: 'Common signs include severe throbbing tooth pain (especially at night), prolonged sensitivity to hot/cold liquids, pain while chewing, deep cavities, or a pimple-like bump on the gum.'
  },
  {
    id: 'rct-6',
    category: 'Root Canal Treatment',
    questions: ['Can I eat immediately after a root canal?'],
    keywords: ['eat after rct', 'eating after root canal', 'food after rct'],
    answer: 'You should wait until the numbness from anesthesia wears off (about 1-2 hours) to avoid biting your cheek. Avoid chewing hard foods on the treated side until the final crown is placed.'
  },
  {
    id: 'rct-7',
    category: 'Root Canal Treatment',
    questions: ['Is a root canal better than pulling or extracting the tooth?'],
    keywords: ['rct vs extraction', 'save tooth vs remove', 'better than pulling'],
    answer: 'Saving your natural tooth via Root Canal Treatment is always the best choice whenever clinically possible. Natural teeth maintain proper jawbone structure, chewing efficiency, and prevent adjacent teeth from shifting.'
  },
  {
    id: 'rct-8',
    category: 'Root Canal Treatment',
    questions: ['Can a previously root-canaled tooth get reinfected? (Re-RCT)'],
    keywords: ['re rct', 'reinfection', 'repeat root canal', 'rct failed'],
    answer: 'While rare, reinfection can occur if the original seal leaks or untreated canals were missed. Dr. Saumya Jain specializes in microscopic Re-RCT to clean, re-sterilize, and save the tooth.'
  },
  {
    id: 'rct-9',
    category: 'Root Canal Treatment',
    questions: ['How long will a root-canaled tooth last?'],
    keywords: ['how long rct lasts', 'durability of rct', 'life of rct'],
    answer: 'With proper crown restoration and daily brushing and flossing, a root-canaled tooth can easily last 15 to 20 years or even a lifetime.'
  },
  {
    id: 'rct-10',
    category: 'Root Canal Treatment',
    questions: ['Will I get swelling after a root canal?'],
    keywords: ['swelling after rct', 'face swollen rct', 'post rct pain'],
    answer: 'Mild tenderness for 24-48 hours while the surrounding ligament heals is normal and managed with mild analgesics. Marked swelling is uncommon with our modern sterilization protocols.'
  },

  // ==========================================
  // CATEGORY 5: DENTAL IMPLANTS & MISSING TEETH (10 FAQs)
  // ==========================================
  {
    id: 'imp-1',
    category: 'Dental Implants',
    questions: ['What is a dental implant?', 'How do dental implants work?'],
    keywords: ['what is implant', 'how implant works', 'dental implant explained'],
    answer: 'A dental implant is a biocompatible titanium screw surgically placed into your jawbone to replace the root of a missing tooth. Once fused with the bone, a natural-looking ceramic crown is placed on top.'
  },
  {
    id: 'imp-2',
    category: 'Dental Implants',
    questions: ['How long do dental implants last?'],
    keywords: ['how long implant lasts', 'lifespan of implant', 'permanent'],
    answer: 'Dental implants are the most durable tooth replacement option available. With proper oral hygiene and regular dental checkups, implants can last 25 years to a lifetime.'
  },
  {
    id: 'imp-3',
    category: 'Dental Implants',
    questions: ['Is dental implant surgery painful?'],
    keywords: ['implant surgery painful', 'does implant hurt', 'pain during implant'],
    answer: 'No, the procedure is performed under local anesthesia and is surprisingly gentle—most patients report feeling less discomfort than having a tooth extracted.'
  },
  {
    id: 'imp-4',
    category: 'Dental Implants',
    questions: ['Dental implant vs dental bridge: Which is better?'],
    keywords: ['implant vs bridge', 'bridge or implant', 'difference bridge implant'],
    answer: 'Implants are superior because they preserve your jawbone and do not require grinding down healthy adjacent teeth like traditional bridges do.'
  },
  {
    id: 'imp-5',
    category: 'Dental Implants',
    questions: ['Can diabetic patients get dental implants?'],
    keywords: ['diabetic', 'diabetes', 'sugar patient', 'diabetic implant', 'diabetes implant', 'sugar patient implant'],
    answer: 'Yes! Patients with well-controlled blood sugar levels (HbA1c below 7.0-7.5) can safely receive dental implants with excellent success rates.'
  },
  {
    id: 'imp-6',
    category: 'Dental Implants',
    questions: ['What if I have less bone in my jaw for implants?'],
    keywords: ['low bone', 'bone grafting', 'less bone', 'sinus lift'],
    answer: 'Dr. Sandesh Jain is an experienced maxillofacial surgeon specializing in advanced bone grafting and sinus lift procedures to rebuild adequate bone foundation for stable implants.'
  },
  {
    id: 'imp-7',
    category: 'Dental Implants',
    questions: ['Can all missing teeth be replaced with implants? (Full mouth / All-on-4)'],
    keywords: ['all on 4', 'all-on-4', 'full mouth implant', 'all teeth missing', 'all on 6'],
    answer: 'Yes! We perform Full-Arch and All-on-4 / All-on-6 implant rehabilitations, allowing completely toothless patients to receive a full set of fixed, permanent teeth.'
  },
  {
    id: 'imp-8',
    category: 'Dental Implants',
    questions: ['What is the recovery time after dental implant surgery?'],
    keywords: ['recovery time implant', 'healing time implant', 'how long to heal'],
    answer: 'Most patients resume normal work and daily activities the very next day. Complete bone fusion (osseointegration) occurs over 2 to 4 months before placing the permanent crown.'
  },
  {
    id: 'imp-9',
    category: 'Dental Implants',
    questions: ['Which implant brands do you use?'],
    keywords: ['implant brand', 'straumann', 'nobel biocare', 'osstem', 'korean implant', 'swiss implant'],
    answer: 'We use internationally certified, clinically proven implant systems including Nobel Biocare, Straumann, and premium Korean/US FDA-approved systems with authentic manufacturer warranties.'
  },
  {
    id: 'imp-10',
    category: 'Dental Implants',
    questions: ['How much does a dental implant cost?'],
    keywords: ['implant cost', 'implant price', 'how much implant', 'cost of implant'],
    answer: 'Implant costs vary based on implant brand, bone volume, and crown type (metal-free zirconia). A 3D CBCT scan during your consultation allows Dr. Sandesh Jain to provide an exact transparent estimate.'
  },

  // ==========================================
  // CATEGORY 6: INVISIBLE ALIGNERS & BRACES (10 FAQs)
  // ==========================================
  {
    id: 'alg-1',
    category: 'Invisible Aligners',
    questions: ['What are invisible clear aligners?'],
    keywords: ['what are aligners', 'clear aligners', 'invisible braces', 'invisalign'],
    answer: 'Clear aligners are custom-made, transparent medical-grade plastic trays that fit snugly over your teeth to straighten crooked or spaced teeth without visible metal wires or brackets.'
  },
  {
    id: 'alg-2',
    category: 'Invisible Aligners',
    questions: ['Are clear aligners better than metal braces?'],
    keywords: ['aligners vs braces', 'metal braces vs aligners', 'which is better braces aligners'],
    answer: 'Aligners are virtually invisible, removable for eating and brushing, cause far fewer mouth sores than metal brackets, and require fewer emergency clinic visits.'
  },
  {
    id: 'alg-3',
    category: 'Invisible Aligners',
    questions: ['How many hours a day do I have to wear aligners?'],
    keywords: ['how many hours', 'hours a day', 'hours per day', 'how many hours aligner', 'wear aligner duration', '22 hours'],
    answer: 'You should wear your aligners for 20 to 22 hours per day, taking them out only while eating, drinking hot beverages, and brushing.'
  },
  {
    id: 'alg-4',
    category: 'Invisible Aligners',
    questions: ['How long does clear aligner treatment take?'],
    keywords: ['how long aligners take', 'treatment duration aligners', 'months for aligner'],
    answer: 'Treatment duration generally ranges from 6 to 14 months depending on whether your teeth require mild spacing correction or complex rotational realignment.'
  },
  {
    id: 'alg-5',
    category: 'Invisible Aligners',
    questions: ['Is there an age limit for invisible aligners? Can adults get them?'],
    keywords: ['age limit aligners', 'adult braces', 'am i too old for aligners', 'adults'],
    answer: 'There is no upper age limit! As long as your gums and bone are healthy, adults in their 20s, 30s, 40s, and beyond achieve fantastic results.'
  },
  {
    id: 'alg-6',
    category: 'Invisible Aligners',
    questions: ['Can I eat normal food during aligner treatment?'],
    keywords: ['eating with aligners', 'food restrictions aligners', 'diet aligners'],
    answer: 'Yes! Unlike metal braces which ban hard or sticky foods, you simply remove your aligners before meals and enjoy all your favorite foods freely.'
  },
  {
    id: 'alg-7',
    category: 'Invisible Aligners',
    questions: ['Do clear aligners hurt?'],
    keywords: ['do aligners hurt', 'aligner pain', 'pain from aligner'],
    answer: 'You will feel mild pressure for the first 1 to 2 days after switching to a new tray, which indicates your teeth are gently moving into their desired positions.'
  },
  {
    id: 'alg-8',
    category: 'Invisible Aligners',
    questions: ['How do you make the custom aligners?'],
    keywords: ['how aligners made', '3d scan', 'digital impression'],
    answer: 'Dr. Saumya Jain takes a painless digital 3D scan of your mouth. Advanced orthodontic software maps your entire tooth movement timeline before your custom trays are fabricated.'
  },
  {
    id: 'alg-9',
    category: 'Invisible Aligners',
    questions: ['Will I need to wear a retainer after aligners?'],
    keywords: ['retainer after aligners', 'will teeth move back', 'retainers'],
    answer: 'Yes, wearing a nighttime retainer after completing treatment is essential to keep your newly straightened teeth locked permanently in place.'
  },
  {
    id: 'alg-10',
    category: 'Invisible Aligners',
    questions: ['How much do invisible aligners cost?'],
    keywords: ['aligner cost', 'cost of aligners', 'invisalign price', 'aligner price'],
    answer: 'Aligner pricing depends on case complexity and the total number of tray stages required. We provide flexible installment options following your digital 3D evaluation.'
  },

  // ==========================================
  // CATEGORY 7: WISDOM TEETH & SURGICAL EXTRACTIONS (10 FAQs)
  // ==========================================
  {
    id: 'ext-1',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Do all wisdom teeth have to be extracted?'],
    keywords: ['must wisdom tooth be removed', 'do all wisdom teeth need removal', 'wisdom necessary'],
    answer: 'Not all wisdom teeth need removal. Extractions are recommended only if the tooth is impacted (stuck in bone), growing crooked, causing recurrent gum infections, or damaging adjacent molars.'
  },
  {
    id: 'ext-2',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Is wisdom tooth removal painful?'],
    keywords: ['wisdom tooth pain', 'does wisdom extraction hurt', 'painful wisdom removal'],
    answer: 'No, Dr. Sandesh Jain uses profound local anesthesia so you do not experience pain during the surgery. Post-procedure discomfort is well controlled with targeted medication.'
  },
  {
    id: 'ext-3',
    category: 'Wisdom Teeth & Surgery',
    questions: ['What can I eat after a tooth extraction?'],
    keywords: ['what to eat after extraction', 'food after tooth removal', 'diet after extraction'],
    answer: 'Eat soft, cool foods such as ice cream, curd/yogurt, khichdi, dalia, or smoothies. Avoid hot foods, spicy dishes, and hard/crunchy snacks for the first 24 to 48 hours.'
  },
  {
    id: 'ext-4',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Can I use a drinking straw after tooth extraction?'],
    keywords: ['use straw', 'drinking straw extraction', 'straw after tooth removal'],
    answer: 'No! Never use a drinking straw for at least 3 to 5 days. The suction pressure can dislodge the protective blood clot and trigger a painful condition called dry socket.'
  },
  {
    id: 'ext-5',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Can I smoke or consume tobacco after tooth extraction?'],
    keywords: ['smoking after extraction', 'tobacco after extraction', 'cigarette', 'gutkha'],
    answer: 'Strictly avoid smoking or chewing tobacco for at least 72 hours. Tobacco severely impairs blood supply, delays healing, and significantly increases dry socket risk.'
  },
  {
    id: 'ext-6',
    category: 'Wisdom Teeth & Surgery',
    questions: ['How long does it take to recover from wisdom tooth surgery?'],
    keywords: ['recovery from wisdom tooth', 'how many days to heal wisdom', 'healing time'],
    answer: 'Most patients return to routine college or office work within 1 to 2 days. Complete gum healing takes about 7 to 10 days.'
  },
  {
    id: 'ext-7',
    category: 'Wisdom Teeth & Surgery',
    questions: ['What should I do if bleeding continues after extraction?'],
    keywords: ['bleeding after extraction', 'blood from socket', 'how to stop bleeding extraction'],
    answer: 'Bite firmly on a clean, damp sterile gauze or a wet black tea bag directly over the extraction site for 30 minutes without spitting. If heavy bleeding persists, call our clinic at +91 98270 12345.'
  },
  {
    id: 'ext-8',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Are stitches/sutures placed after wisdom tooth surgery?'],
    keywords: ['stitches wisdom tooth', 'sutures extraction', 'stitches removal'],
    answer: 'Yes, surgical wisdom tooth removals often utilize fine sutures to promote rapid healing. These are either self-dissolving or painlessly removed after 7 days.'
  },
  {
    id: 'ext-9',
    category: 'Wisdom Teeth & Surgery',
    questions: ['What is a dry socket and how can I prevent it?'],
    keywords: ['dry socket', 'what is dry socket', 'alveolitis', 'socket pain'],
    answer: 'A dry socket occurs if the protective blood clot dislodges prematurely. Prevent it by not spitting vigorously, not using straws, avoiding hot foods, and avoiding smoking for 72 hours.'
  },
  {
    id: 'ext-10',
    category: 'Wisdom Teeth & Surgery',
    questions: ['Why does my face swell after wisdom tooth removal?'],
    keywords: ['cheek swelling', 'face swelling after wisdom', 'swollen jaw surgery'],
    answer: 'Mild cheek swelling peaks around 48 hours and is a natural physiological healing response. Applying cold ice packs on the outside of your cheek for 15 minutes at a time helps minimize it.'
  },

  // ==========================================
  // CATEGORY 8: COSMETIC DENTISTRY, VENEERS & WHITENING (10 FAQs)
  // ==========================================
  {
    id: 'cos-1',
    category: 'Cosmetic Dentistry',
    questions: ['What is teeth whitening and does it damage enamel?'],
    keywords: ['teeth whitening', 'does whitening damage enamel', 'bleaching teeth', 'yellow teeth'],
    answer: 'Professional in-office teeth whitening by Dr. Saumya Jain safely lifts stubborn stains without damaging your natural enamel using pH-balanced, dental-approved brightening formulations.'
  },
  {
    id: 'cos-2',
    category: 'Cosmetic Dentistry',
    questions: ['How long does professional teeth whitening last?'],
    keywords: ['how long whitening lasts', 'duration of whitening', 'whitening results'],
    answer: 'Professional whitening results typically last 1 to 3 years depending on dietary habits (reducing excessive tea, coffee, wine, or smoking helps prolong brightness).'
  },
  {
    id: 'cos-3',
    category: 'Cosmetic Dentistry',
    questions: ['What are porcelain dental veneers?'],
    keywords: ['what are veneers', 'porcelain veneers', 'dental veneers', 'veneers explained'],
    answer: 'Veneers are custom-crafted, ultra-thin shells of durable ceramic or porcelain bonded over the front surface of teeth to conceal chips, severe stains, gaps, or minor misalignment.'
  },
  {
    id: 'cos-4',
    category: 'Cosmetic Dentistry',
    questions: ['Composite veneers vs Porcelain veneers: What is the difference?'],
    keywords: ['composite vs porcelain', 'difference composite porcelain', 'types of veneers'],
    answer: 'Composite veneers can be sculpted in a single visit at lower cost. Porcelain veneers are custom-fabricated in a lab, offer unmatched lifelike translucency, and resist staining for 15+ years.'
  },
  {
    id: 'cos-5',
    category: 'Cosmetic Dentistry',
    questions: ['Can you close gaps between my front teeth?'],
    keywords: ['gap between teeth', 'diastema', 'front teeth gap', 'close teeth gap'],
    answer: 'Yes! Gaps between front teeth can be closed either with invisible aligners, composite bonding in just one sitting, or ceramic veneers depending on your preferred timeline.'
  },
  {
    id: 'cos-6',
    category: 'Cosmetic Dentistry',
    questions: ['What is a digital smile makeover / smile design?'],
    keywords: ['smile makeover', 'smile design', 'hollywood smile', 'digital smile design'],
    answer: 'A Smile Makeover combines cosmetic procedures (aligners, whitening, veneers, or gum contouring) scientifically customized to your facial symmetry and lip line.'
  },
  {
    id: 'cos-7',
    category: 'Cosmetic Dentistry',
    questions: ['Do veneers look fake or unnatural?'],
    keywords: ['do veneers look fake', 'natural looking veneers', 'fake smile'],
    answer: 'Not at all! Dr. Saumya Jain matches veneer shade, translucency, and surface texture precisely to your natural teeth so nobody can tell they are veneers.'
  },
  {
    id: 'cos-8',
    category: 'Cosmetic Dentistry',
    questions: ['Will teeth whitening make my teeth sensitive?'],
    keywords: ['sensitivity after whitening', 'sensitive teeth whitening', 'cold sensitivity'],
    answer: 'Some patients experience mild temporary sensitivity for 24 to 48 hours. We apply a post-whitening remineralizing desensitizer gel to minimize any discomfort.'
  },
  {
    id: 'cos-9',
    category: 'Cosmetic Dentistry',
    questions: ['Can you fix a chipped or broken front tooth?'],
    keywords: ['chipped front tooth', 'broken front tooth', 'tooth cracked front'],
    answer: 'Yes! A chipped front tooth can be beautifully restored in a single 30-minute visit using shade-matched aesthetic composite bonding.'
  },
  {
    id: 'cos-10',
    category: 'Cosmetic Dentistry',
    questions: ['How should I care for my teeth after teeth whitening?'],
    keywords: ['after whitening care', 'white diet', 'post whitening food'],
    answer: 'Follow the "white diet" for 48 hours: avoid dark curries, turmeric, tea, coffee, cola, and red wine, as freshly whitened teeth are momentarily porous.'
  },

  // ==========================================
  // CATEGORY 9: GUMS, SCALING & CLEANING (10 FAQs)
  // ==========================================
  {
    id: 'gum-1',
    category: 'Gum Care & Cleaning',
    questions: ['Does ultrasonic dental cleaning / scaling make teeth loose?'],
    keywords: ['does scaling loosen teeth', 'does cleaning make teeth loose', 'scaling weak teeth'],
    answer: 'No, this is a complete myth! Ultrasonic scaling removes harmful tartar and bacterial calculus deposits. It strengthens gums and actually prevents teeth from loosening.'
  },
  {
    id: 'gum-2',
    category: 'Gum Care & Cleaning',
    questions: ['Why do my gums bleed when I brush or floss?'],
    keywords: ['bleeding gums', 'gums bleed brushing', 'blood while brushing', 'gingivitis'],
    answer: 'Bleeding gums are an early sign of gingivitis caused by plaque accumulation. A professional cleaning and proper brushing technique typically resolves the bleeding within a few days.'
  },
  {
    id: 'gum-3',
    category: 'Gum Care & Cleaning',
    questions: ['How often should I get my teeth cleaned by a dentist?'],
    keywords: ['how often clean teeth', 'frequency of scaling', 'yearly cleaning'],
    answer: 'Dentists universally recommend a routine scaling and preventive dental checkup every 6 months to prevent cavities and gum disease.'
  },
  {
    id: 'gum-4',
    category: 'Gum Care & Cleaning',
    questions: ['What causes bad breath (halitosis) and how is it treated?'],
    keywords: ['bad breath', 'halitosis', 'mouth odor', 'smelly mouth'],
    answer: 'Bad breath is commonly caused by trapped food debris, tongue coating, gum disease, or hidden cavities. Professional scaling along with tongue cleaning resolves most cases.'
  },
  {
    id: 'gum-5',
    category: 'Gum Care & Cleaning',
    questions: ['Is dental scaling painful?'],
    keywords: ['is scaling painful', 'does teeth cleaning hurt', 'pain during cleaning'],
    answer: 'Ultrasonic cleaning is gentle and non-invasive. You will feel a mild vibration and water spray. Sensitive areas can be treated with a topical numbing gel.'
  },
  {
    id: 'gum-6',
    category: 'Gum Care & Cleaning',
    questions: ['Why do my teeth feel sensitive after a cleaning?'],
    keywords: ['sensitive after scaling', 'sensitivity after cleaning'],
    answer: 'Mild sensitivity to cold liquids can occur for 1 to 2 days because previously tartar-covered root areas are newly exposed to air and water. It settles rapidly.'
  },
  {
    id: 'gum-7',
    category: 'Gum Care & Cleaning',
    questions: ['What is pyorrhea and can it be cured?'],
    keywords: ['pyorrhea', 'periodontitis', 'gum recession', 'bone loss in gums'],
    answer: 'Pyorrhea (periodontitis) is advanced gum disease causing bone loss. With deep scaling, root planing, and antimicrobial therapy, we can stop its progression and save loose teeth.'
  },
  {
    id: 'gum-8',
    category: 'Gum Care & Cleaning',
    questions: ['Can gum disease affect overall health like heart or diabetes?'],
    keywords: ['gum disease heart', 'gum disease diabetes', 'systemic health'],
    answer: 'Yes! Scientific research confirms strong links between chronic gum inflammation and diabetes, cardiovascular diseases, and low birth weight during pregnancy.'
  },
  {
    id: 'gum-9',
    category: 'Gum Care & Cleaning',
    questions: ['What is gum depigmentation / dark gum treatment?'],
    keywords: ['dark gums', 'black gums', 'gum depigmentation', 'pink gums'],
    answer: 'Excess melanin in gums causing black or dark patches can be safely lightened to a natural healthy pink shade using gentle aesthetic laser or surgical peeling.'
  },
  {
    id: 'gum-10',
    category: 'Gum Care & Cleaning',
    questions: ['Which toothbrush is best: manual or electric?'],
    keywords: ['electric toothbrush', 'manual toothbrush', 'which brush is best'],
    answer: 'Both are effective if used with soft bristles and proper circular technique for 2 minutes. Electric brushes are especially beneficial for thorough plaque removal.'
  },

  // ==========================================
  // CATEGORY 10: TMJ, JAW PAIN & ACCIDENTS (10 FAQs)
  // ==========================================
  {
    id: 'tmj-1',
    category: 'TMJ & Facial Trauma',
    questions: ['Why does my jaw make a clicking or popping sound when opening?'],
    keywords: ['jaw click', 'clicking jaw', 'jaw popping', 'tmj sound', 'clicking sound'],
    answer: 'Clicking or popping sounds indicate a displacement of the joint disc in your TMJ (Temporomandibular Joint). Dr. Sandesh Jain specializes in diagnosing and treating TMJ joint issues.'
  },
  {
    id: 'tmj-2',
    category: 'TMJ & Facial Trauma',
    questions: ['What should I do if my jaw locks or I cannot open my mouth?'],
    keywords: ['jaw lock', 'locked jaw', 'cannot open mouth', 'restricted mouth opening', 'lockjaw'],
    answer: 'Do not force your mouth open. Apply a warm compress gently to the joint and visit Indore Poly Dental Clinic right away for gentle manual reduction and clinical evaluation.'
  },
  {
    id: 'tmj-3',
    category: 'TMJ & Facial Trauma',
    questions: ['What causes morning jaw pain and headaches?'],
    keywords: ['morning jaw pain', 'teeth grinding', 'bruxism', 'clenched jaw morning'],
    answer: 'Morning jaw soreness and temple headaches are commonly caused by nocturnal teeth grinding (bruxism) or clenching under stress. A custom night guard provides rapid relief.'
  },
  {
    id: 'tmj-4',
    category: 'TMJ & Facial Trauma',
    questions: ['How are TMJ disorders treated without surgery?'],
    keywords: ['tmj treatment without surgery', 'conservative tmj', 'splint therapy'],
    answer: 'Over 90% of TMJ issues are treated conservatively using custom stabilization splints, muscle relaxants, jaw physiotherapy, and stress management.'
  },
  {
    id: 'tmj-5',
    category: 'TMJ & Facial Trauma',
    questions: ['What should I do in case of a broken jaw from a road accident?'],
    keywords: ['broken jaw accident', 'jaw fracture emergency', 'road accident jaw', 'trauma protocol'],
    answer: 'Immediately support the lower jaw with a soft cloth wrapped gently around the head. Do not chew. Visit Indore Poly Dental Clinic or call +91 98270 12345 for Senior Surgeon Dr. Sandesh Jain.'
  },
  {
    id: 'tmj-6',
    category: 'TMJ & Facial Trauma',
    questions: ['What should I do if a tooth is completely knocked out in an accident?'],
    keywords: ['knocked out tooth', 'avulsed tooth', 'tooth fell out accident', 'fallen tooth'],
    answer: 'Find the tooth, hold it by the crown (do NOT touch the root), rinse gently in milk or saline without scrubbing, place it in a cup of cold milk, and rush to our clinic within 60 minutes to save the tooth!'
  },
  {
    id: 'tmj-7',
    category: 'TMJ & Facial Trauma',
    questions: ['Does Dr. Sandesh Jain perform facial bone fracture surgery?'],
    keywords: ['facial fracture', 'bone surgery face', 'cheekbone fracture', 'mandible fracture'],
    answer: 'Yes! Dr. Sandesh Jain is an Oral & Maxillofacial Surgeon with ~25 years surgical experience managing complex mandibular, maxillary, and zygomatic facial fractures with titanium miniplates.'
  },
  {
    id: 'tmj-8',
    category: 'TMJ & Facial Trauma',
    questions: ['Can chewing gutkha or areca nut cause mouth opening restriction (OSMF)?'],
    keywords: ['osmf', 'oral submucous fibrosis', 'gutkha mouth opening', 'supari mouth'],
    answer: 'Yes, areca nut and gutkha cause Oral Submucous Fibrosis (OSMF), leading to stiff bands and restricted mouth opening. We provide medical and surgical management for OSMF.'
  },
  {
    id: 'tmj-9',
    category: 'TMJ & Facial Trauma',
    questions: ['Are TMJ treatments covered under insurance?'],
    keywords: ['tmj insurance', 'tmj mediclaim', 'jaw surgery insurance'],
    answer: 'Surgical management of facial trauma and hospitalized TMJ joint surgeries are frequently covered under health insurance policies. We assist with complete medical documentation.'
  },
  {
    id: 'tmj-10',
    category: 'TMJ & Facial Trauma',
    questions: ['What is jaw corrective surgery (Orthognathic surgery)?'],
    keywords: ['orthognathic surgery', 'jaw correction', 'protruding jaw', 'uneven jaw'],
    answer: 'Orthognathic surgery corrects severe skeletal discrepancies between upper and lower jaws (such as severe underbites or asymmetrical jaws) for improved chewing and facial aesthetics.'
  },

  // ==========================================
  // CATEGORY 11: SAFETY, STERILIZATION & TECH (10 FAQs)
  // ==========================================
  {
    id: 'saf-1',
    category: 'Safety & Technology',
    questions: ['How do you sterilize dental instruments? Is it safe?'],
    keywords: ['sterilize', 'sterilising', 'sterilized', 'sterilization', 'autoclave', 'infection control', 'sterile', 'is it safe hygiene', 'instruments clean', 'clean instruments'],
    answer: 'We follow stringent hospital-grade infection control protocols with Class-B vacuum autoclaves, biological spore testing, and single-use disposable kits for every patient.'
  },
  {
    id: 'saf-2',
    category: 'Safety & Technology',
    questions: ['Are digital X-rays safe? What about radiation exposure?'],
    keywords: ['x ray safe', 'radiation in dental x ray', 'digital x ray safety', 'rvg'],
    answer: 'Our clinic uses advanced digital RVG sensors that reduce radiation exposure by up to 90% compared to traditional film X-rays. Protective lead aprons and thyroid collars are always provided.'
  },
  {
    id: 'saf-3',
    category: 'Safety & Technology',
    questions: ['Is dental treatment safe during pregnancy?'],
    keywords: ['pregnancy', 'pregnant', 'expecting mother', 'pregnant dental treatment', 'pregnancy teeth', 'safe in pregnancy', 'dental in pregnancy'],
    answer: 'Yes! Preventive dental cleanings and essential emergency treatments are completely safe, particularly during the second trimester. We use pregnancy-safe local anesthetics.'
  },
  {
    id: 'saf-4',
    category: 'Safety & Technology',
    questions: ['I am very anxious or terrified of dentists. How can you help?'],
    keywords: ['fear of dentist', 'dental phobia', 'scared of dentist', 'nervous patient', 'anxiety'],
    answer: 'We completely understand dental anxiety! Our doctors take time to explain each step gently, use profound painless anesthesia, and take breaks whenever you need.'
  },
  {
    id: 'saf-5',
    category: 'Safety & Technology',
    questions: ['Do you treat elderly patients with high blood pressure or heart conditions?'],
    keywords: ['blood pressure', 'hypertension', 'heart patient dental', 'blood thinner', 'cardiac'],
    answer: 'Yes, Dr. Sandesh Jain routinely manages medically compromised patients. We review your medications (including blood thinners like Aspirin/Ecosprin) and coordinate with your physician.'
  },
  {
    id: 'saf-6',
    category: 'Safety & Technology',
    questions: ['Do you have 3D CBCT digital scanning facilities?'],
    keywords: ['cbct', '3d scan', '3d x ray', 'cone beam ct'],
    answer: 'Yes, we utilize high-resolution 3D CBCT imaging for ultra-precise implant planning, surgical wisdom tooth evaluation, and nerve mapping.'
  },
  {
    id: 'saf-7',
    category: 'Safety & Technology',
    questions: ['What water is used in your dental chairs?'],
    keywords: ['water in dental chair', 'clean water chair', 'water contamination'],
    answer: 'We use autonomous distilled water reservoir systems with integrated antimicrobial filters to ensure zero municipal contamination during procedures.'
  },
  {
    id: 'saf-8',
    category: 'Safety & Technology',
    questions: ['Can I bring a family member with me into the consultation operatory?'],
    keywords: ['family member allowed', 'accompanying person', 'can my spouse come'],
    answer: 'Yes, one family member is always welcome inside the consultation operatory to take part in treatment discussions.'
  },
  {
    id: 'saf-9',
    category: 'Safety & Technology',
    questions: ['Do you keep digital dental records of my treatments?'],
    keywords: ['digital records', 'past history', 'x ray records', 'emr'],
    answer: 'Yes, all clinical notes, digital X-rays, and treatment slips are securely stored in our cloud EMR system so your records are always accessible.'
  },
  {
    id: 'saf-10',
    category: 'Safety & Technology',
    questions: ['What protocols do you follow for patients with latex allergies?'],
    keywords: ['latex allergy', 'nitrile gloves', 'allergy'],
    answer: 'We maintain 100% latex-free nitrile gloves and hypoallergenic materials for any patient with known latex sensitivities.'
  },

  // ==========================================
  // CATEGORY 12: PAYMENTS, INSURANCE & FEES (10 FAQs)
  // ==========================================
  {
    id: 'pay-1',
    category: 'Payments & Insurance',
    keywords: ['payment modes', 'pay upi', 'accept google pay', 'phonepe', 'credit card', 'cash', 'paytm'],
    questions: ['Which payment modes do you accept?', 'Can I pay by UPI, Google Pay, or Credit Card?'],
    answer: 'We accept all payment modes including UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard credit & debit cards, Net Banking, and cash.'
  },
  {
    id: 'pay-2',
    category: 'Payments & Insurance',
    keywords: ['insurance', 'mediclaim', 'reimbursement', 'tpa', 'cashless insurance'],
    questions: ['Does health insurance or mediclaim cover dental procedures?'],
    answer: 'Routine dental care is typically not covered by standard OPD policies, but hospitalized surgeries, accidental jaw trauma, and cyst removals are eligible. We provide full itemized medical documentation for your reimbursement claim.'
  },
  {
    id: 'pay-3',
    category: 'Payments & Insurance',
    keywords: ['emi', 'installment', 'no cost emi', 'pay in parts', 'installments'],
    questions: ['Do you offer EMI or installment payment plans for expensive treatments?'],
    answer: 'Yes, we offer zero-interest EMI and flexible stage-wise installment plans for high-value treatments like dental implants, full arch rehabilitations, and clear aligners.'
  },
  {
    id: 'pay-4',
    category: 'Payments & Insurance',
    keywords: ['consultation fee', 'doctor fee', 'how much consultation', 'visiting charge'],
    questions: ['What is the first consultation fee at the clinic?'],
    answer: 'Initial consultation fees are very reasonable and include a comprehensive clinical oral examination by Dr. Sandesh Jain or Dr. Saumya Jain. Treatment estimates are provided transparently.'
  },
  {
    id: 'pay-5',
    category: 'Payments & Insurance',
    keywords: ['tax invoice', 'gst bill', 'receipt', 'itemized bill'],
    questions: ['Do you provide official tax invoices and receipts for medical reimbursement?'],
    answer: 'Yes, every treatment is accompanied by an official printed invoice detailing the procedures performed, medications prescribed, and doctor registration numbers.'
  },
  {
    id: 'pay-6',
    category: 'Payments & Insurance',
    keywords: ['hidden charges', 'extra fees', 'transparent pricing'],
    questions: ['Are there any hidden costs or surprise charges?'],
    answer: 'Never. We uphold 100% pricing transparency. Your complete treatment plan, material options, and total costs are discussed and agreed upon prior to starting any procedure.'
  },
  {
    id: 'pay-7',
    category: 'Payments & Insurance',
    keywords: ['advance payment', 'deposit', 'booking fee'],
    questions: ['Do I need to pay an advance fee while booking online?'],
    answer: 'No online advance payment is needed! You can book your appointment slot for free right here in chat and pay at the clinic front desk upon arrival.'
  },
  {
    id: 'pay-8',
    category: 'Payments & Insurance',
    keywords: ['cghs', 'echs', 'railway panel', 'government panel'],
    questions: ['Are you empaneled with government schemes like CGHS or ECHS?'],
    answer: 'We operate as a private specialty clinic. However, we provide detailed stamped medical reimbursement bills that central or state government employees can submit for claim approval.'
  },
  {
    id: 'pay-9',
    category: 'Payments & Insurance',
    keywords: ['discount', 'senior citizen discount', 'family discount'],
    questions: ['Do you offer senior citizen or family dental packages?'],
    answer: 'Yes, we provide senior citizen considerations and comprehensive family preventive checkup packages. Please ask our front desk reception upon your visit.'
  },
  {
    id: 'pay-10',
    category: 'Payments & Insurance',
    keywords: ['warranty', 'crown warranty', 'implant warranty', 'guarantee'],
    questions: ['Do dental crowns and implants come with a warranty?'],
    answer: 'Yes! Our high-grade Zirconia crowns and internationally branded dental implants come with authentic manufacturer warranty cards ranging from 10 years to lifetime warranties.'
  }
];

/**
 * Intelligent FAQ Matcher
 * Combines token overlap, regex keyword scoring, and semantic ranking to find
 * the most accurate, natural clinic answer for any patient question.
 */
export function findBestFaqMatch(query: string): { match: FAQItem; score: number } | null {
  const clean = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const queryTokens = new Set(clean.split(/\s+/).filter(w => w.length >= 2));

  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of CLINIC_FAQS) {
    let score = 0;

    // 1. Exact phrase / substring matches on known question variations
    for (const q of item.questions) {
      const qLower = q.toLowerCase();
      if (clean === qLower) {
        score += 80;
      } else if (clean.includes(qLower) || qLower.includes(clean)) {
        score += 50;
      }
    }

    // 2. Keyword matching with stem resilience
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (clean.includes(kwLower)) {
        score += 40;
      } else {
        const kwWords = kwLower.split(/\s+/);
        if (kwWords.length > 1 && kwWords.every(w => Array.from(queryTokens).some(t => t.startsWith(w.slice(0, 5)) || w.startsWith(t.slice(0, 5))))) {
          score += 30;
        } else if (kwWords.length === 1 && kwWords[0].length >= 5) {
          const stem = kwWords[0].slice(0, 5);
          if (Array.from(queryTokens).some(t => t.startsWith(stem))) {
            score += 25;
          }
        }
      }
    }

    // 3. Token overlap with question sentences (ignoring filler stop words)
    for (const q of item.questions) {
      const qWords = q.toLowerCase().split(/\s+/).filter(w => w.length >= 3 && !['what', 'when', 'where', 'which', 'who', 'does', 'your', 'have', 'from', 'with', 'about'].includes(w));
      let overlaps = 0;
      for (const qw of qWords) {
        if (queryTokens.has(qw) || Array.from(queryTokens).some(t => t.startsWith(qw.slice(0, 5)) || qw.startsWith(t.slice(0, 5)))) {
          overlaps++;
        }
      }
      if (overlaps >= 2) {
        score += overlaps * 12;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // A score of 25+ ensures a confident, relevant match
  if (bestMatch && highestScore >= 25) {
    return { match: bestMatch, score: highestScore };
  }

  return null;
}
