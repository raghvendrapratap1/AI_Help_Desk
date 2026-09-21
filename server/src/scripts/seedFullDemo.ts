import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Clinic } from '../models/Clinic.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { FollowUp } from '../models/FollowUp.js';
import { UnansweredQuestion } from '../models/UnansweredQuestion.js';

async function seedFullDemo() {
  console.log('[DEMO SEED] Connecting to database...');
  await connectDB();

  const clinic = await Clinic.findOne();
  if (!clinic) {
    console.error('[DEMO SEED] Clinic not found! Please run server seed first.');
    process.exit(1);
  }
  const clinicId = clinic._id;

  console.log(`[DEMO SEED] Clinic found: ${clinic.name} (${clinicId})`);

  // Clear existing to avoid duplicate conflicts
  await Lead.deleteMany({});
  await Appointment.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  await Notification.deleteMany({});
  await FollowUp.deleteMany({});
  await UnansweredQuestion.deleteMany({});

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  console.log('[DEMO SEED] Creating 10 comprehensive patient profiles across all sections...');

  // 1. Alok Pathak (Website Chat -> Appointment Booked)
  const leadAlok = await Lead.create({
    clinicId,
    patientName: 'Alok Pathak',
    phone: '+91 98260 11223',
    email: 'alok.pathak@gmail.com',
    requirement: 'Titanium Dental Implants & Bone Grafting',
    source: 'Website',
    status: 'Appointment Booked',
    leadScore: 95,
    assignedTo: 'Dr. Sandesh Jain',
    notes: [
      { content: 'Patient visited via website chat at 11:30 AM. Inquired about full arch dental implants.', author: 'AI Receptionist Desk' }
    ]
  });

  const convAlok = await Conversation.create({
    clinicId,
    leadId: leadAlok._id,
    visitorId: 'visitor_alok_pathak_01',
    patientName: 'Alok Pathak',
    phone: '+91 98260 11223',
    patientEmail: 'alok.pathak@gmail.com',
    age: 46,
    preferredDate: tomorrowStr,
    preferredTime: '11:30',
    doctorName: 'Dr. Sandesh Jain',
    status: 'closed',
    channel: 'web_chat',
    intent: 'Booking Consultation',
    urgency: 'High',
    treatment: 'Dental Implants',
    leadScore: 95,
    summary: 'Patient Alok Pathak scheduled a surgical consultation for titanium dental implants with Dr. Sandesh Jain.',
    lastMessage: 'Appointment successfully confirmed for tomorrow at 11:30 AM. Confirmation email dispatched.',
    needsHuman: false
  });

  await Message.create([
    { conversationId: convAlok._id, sender: 'patient', text: 'Hello, I want to inquire about dental implants for my lower jaw.' },
    { conversationId: convAlok._id, sender: 'assistant', text: 'Hello Alok! Welcome to Indore Poly Dental Clinic. Dr. Sandesh Jain specializes in permanent titanium implants with bone grafting. Are you looking to replace a single tooth or multiple teeth?' },
    { conversationId: convAlok._id, sender: 'patient', text: 'Multiple teeth. I want to consult Dr. Sandesh Jain tomorrow morning.' },
    { conversationId: convAlok._id, sender: 'assistant', text: 'Certainly! Dr. Sandesh Jain has an available slot tomorrow at 11:30 AM. I have sent an email to alok.pathak@gmail.com. Please confirm to finalize your booking.' }
  ]);

  await Appointment.create({
    clinicId,
    leadId: leadAlok._id,
    patientName: 'Alok Pathak',
    phone: '+91 98260 11223',
    doctorName: 'Dr. Sandesh Jain',
    date: tomorrowStr,
    startTime: '11:30',
    endTime: '12:15',
    status: 'Confirmed',
    notes: 'Surgical implant evaluation + OPG X-ray review.'
  });

  // 2. Abhay Joshi (Phone Call -> Converted)
  const leadAbhay = await Lead.create({
    clinicId,
    patientName: 'Abhay Joshi',
    phone: '+91 98270 22334',
    email: 'abhay.joshi@gmail.com',
    requirement: 'Microscopic Painless Root Canal & Ceramic Crown',
    source: 'Phone',
    status: 'Converted',
    leadScore: 90,
    assignedTo: 'Dr. Saumya Jain',
    notes: [
      { content: 'Phone call received via AI Voice Receptionist. Severe molar sensitivity.', author: 'AI Voice Line' },
      { content: 'Root canal treatment completed successfully with ceramic crown fitting.', author: 'Dr. Saumya Jain' }
    ]
  });

  const convAbhay = await Conversation.create({
    clinicId,
    leadId: leadAbhay._id,
    visitorId: 'visitor_abhay_joshi_02',
    patientName: 'Abhay Joshi',
    phone: '+91 98270 22334',
    patientEmail: 'abhay.joshi@gmail.com',
    status: 'closed',
    channel: 'phone',
    intent: 'Root Canal Treatment',
    urgency: 'Medium',
    treatment: 'Root Canal Treatment',
    leadScore: 90,
    summary: 'Voice call consultation for pain-free endodontic therapy with Dr. Saumya Jain.',
    lastMessage: 'Call completed. Root canal procedure finalized.',
    needsHuman: false
  });

  await Appointment.create({
    clinicId,
    leadId: leadAbhay._id,
    patientName: 'Abhay Joshi',
    phone: '+91 98270 22334',
    doctorName: 'Dr. Saumya Jain',
    date: yesterdayStr,
    startTime: '16:00',
    endTime: '17:00',
    status: 'Completed',
    notes: 'Single-sitting microscopic RCT performed. Crown fitted.'
  });

  // 3. Kritanshi Bhai (Instagram -> Qualified + Follow-Up Engine)
  const leadKritanshi = await Lead.create({
    clinicId,
    patientName: 'Kritanshi Bhai',
    phone: '+91 98280 33445',
    email: 'kritanshi.bhai@gmail.com',
    requirement: 'Invisible Clear Aligners for Smile Correction',
    source: 'Instagram',
    status: 'Qualified',
    leadScore: 78,
    assignedTo: 'Dr. Saumya Jain',
    notes: [
      { content: 'Inquired from Instagram campaign about invisible aligners duration and cost.', author: 'Social Ads Bot' }
    ]
  });

  // Schedule follow-up for Kritanshi
  await FollowUp.create({
    clinicId,
    leadId: leadKritanshi._id,
    scheduledFor: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    status: 'pending',
    channel: 'email'
  });

  // 4. Zaid Khan (WhatsApp -> Human Handoff Queue / Escalated)
  const leadZaid = await Lead.create({
    clinicId,
    patientName: 'Zaid Khan',
    phone: '+91 98290 44556',
    email: 'zaid.khan@gmail.com',
    requirement: 'Impacted Wisdom Tooth Surgery with General Sedation',
    source: 'WhatsApp',
    status: 'New',
    leadScore: 82,
    assignedTo: 'Reception Desk',
    notes: [
      { content: 'Patient asked for corporate cashless insurance tie-up and twilight sedation availability.', author: 'WhatsApp Inbound' }
    ]
  });

  const convZaid = await Conversation.create({
    clinicId,
    leadId: leadZaid._id,
    visitorId: 'visitor_zaid_khan_04',
    patientName: 'Zaid Khan',
    phone: '+91 98290 44556',
    patientEmail: 'zaid.khan@gmail.com',
    age: 29,
    status: 'escalated',
    channel: 'whatsapp',
    intent: 'Insurance & Sedation Inquiry',
    urgency: 'High',
    treatment: 'Wisdom Tooth Surgery',
    leadScore: 82,
    summary: 'Patient Zaid Khan requests clarification on cashless medical insurance coverage and sedation anesthesia for deep impacted wisdom molar surgery.',
    lastMessage: 'Do you accept Medi Assist cashless corporate insurance for surgical tooth extractions?',
    needsHuman: true,
    escalationReason: 'Patient requesting corporate cashless TPA policy verification and sedation options.'
  });

  await Message.create([
    { conversationId: convZaid._id, sender: 'patient', text: 'Hi, I have severe pain in my lower left wisdom tooth. Doctor advised surgical extraction.' },
    { conversationId: convZaid._id, sender: 'assistant', text: 'Hello Zaid! Dr. Sandesh Jain is our Senior Oral & Maxillofacial Surgeon specializing in painless wisdom tooth extractions. Are you having swelling or difficulty opening your mouth?' },
    { conversationId: convZaid._id, sender: 'patient', text: 'Yes, mild swelling. Do you accept Medi Assist cashless corporate insurance for surgical tooth extractions?' },
    { conversationId: convZaid._id, sender: 'assistant', text: 'Let me connect you directly with our front desk billing specialist to confirm your specific TPA insurance desk approval immediately.' }
  ]);

  await Notification.create({
    clinicId,
    type: 'human_handoff',
    conversationId: convZaid._id.toString(),
    leadId: leadZaid._id.toString(),
    title: 'Urgent Staff Handoff: Zaid Khan',
    message: 'Patient Zaid Khan requires corporate cashless insurance and sedation anesthesia verification.',
    read: false
  });

  // 5. Vishnu Bhai (Google Search -> Appointment Booked)
  const leadVishnu = await Lead.create({
    clinicId,
    patientName: 'Vishnu Bhai',
    phone: '+91 98300 55667',
    email: 'vishnu.bhai@gmail.com',
    requirement: 'Porcelain Veneers & Aesthetic Smile Makeover',
    source: 'Google',
    status: 'Appointment Booked',
    leadScore: 88,
    assignedTo: 'Dr. Saumya Jain',
    notes: [
      { content: 'Found clinic via Google Search for Best Cosmetic Dentist in New Palasia.', author: 'Google Ad Engine' }
    ]
  });

  await Appointment.create({
    clinicId,
    leadId: leadVishnu._id,
    patientName: 'Vishnu Bhai',
    phone: '+91 98300 55667',
    doctorName: 'Dr. Saumya Jain',
    date: tomorrowStr,
    startTime: '14:30',
    endTime: '15:15',
    status: 'Confirmed',
    notes: 'Smile analysis, digital shade matching and veneer mock-up consultation.'
  });

  // 6. Suryansh Pushpakar (Phone -> Contacted)
  const leadSuryansh = await Lead.create({
    clinicId,
    patientName: 'Suryansh Pushpakar',
    phone: '+91 98310 66778',
    email: 'suryansh.pushpakar@gmail.com',
    requirement: 'Chronic TMJ Jaw Clicking & Facial Muscle Pain',
    source: 'Phone',
    status: 'Contacted',
    leadScore: 65,
    assignedTo: 'Dr. Sandesh Jain',
    notes: [
      { content: 'Called the clinic helpline. Receptionist shared conservative TMJ splint treatment overview.', author: 'Reception Desk' }
    ]
  });

  // 7. Yashashvi Maurya (Walk-in -> Converted)
  const leadYashashvi = await Lead.create({
    clinicId,
    patientName: 'Yashashvi Maurya',
    phone: '+91 98320 77889',
    email: 'yashashvi.maurya@gmail.com',
    requirement: 'Full Mouth Rehabilitation & Zirconia Bridges',
    source: 'Walk-in',
    status: 'Converted',
    leadScore: 96,
    assignedTo: 'Dr. Sandesh Jain',
    notes: [
      { content: 'Walk-in patient referred by 56 Shops neighboring clinic. Full mouth treatment plan approved.', author: 'Front Desk Admin' }
    ]
  });

  await Appointment.create({
    clinicId,
    leadId: leadYashashvi._id,
    patientName: 'Yashashvi Maurya',
    phone: '+91 98320 77889',
    doctorName: 'Dr. Sandesh Jain',
    date: todayStr,
    startTime: '18:00',
    endTime: '19:00',
    status: 'Confirmed',
    notes: 'Full mouth arch impressions and surgical guide placement.'
  });

  // 8. Raghvendra Pratap Singh (Website Chat -> High-Intent Hot Lead / Booked)
  const leadRaghvendra = await Lead.create({
    clinicId,
    patientName: 'Raghvendra Pratap Singh',
    phone: '+91 98270 99881',
    email: 'raghvendrapratapsingh505@gmail.com',
    requirement: 'Emergency Dental Trauma & Facial Bone Injury Examination',
    source: 'Website',
    status: 'Appointment Booked',
    leadScore: 98,
    assignedTo: 'Dr. Sandesh Jain',
    notes: [
      { content: 'High-urgency emergency trauma consultation captured via website AI chat.', author: 'AI Triage Protocol' }
    ]
  });

  const convRaghvendra = await Conversation.create({
    clinicId,
    leadId: leadRaghvendra._id,
    visitorId: 'visitor_raghvendra_08',
    patientName: 'Raghvendra Pratap Singh',
    phone: '+91 98270 99881',
    patientEmail: 'raghvendrapratapsingh505@gmail.com',
    age: 26,
    preferredDate: todayStr,
    preferredTime: '19:30',
    doctorName: 'Dr. Sandesh Jain',
    status: 'closed',
    channel: 'web_chat',
    intent: 'Emergency Consultation',
    urgency: 'High',
    treatment: 'Jaw & Facial Trauma & Surgery',
    leadScore: 98,
    summary: 'High priority surgical consultation scheduled with Senior Oral & Maxillofacial Surgeon Dr. Sandesh Jain.',
    lastMessage: 'Confirmation email dispatched with calendar card. Slot confirmed for today at 19:30.',
    needsHuman: false
  });

  await Message.create([
    { conversationId: convRaghvendra._id, sender: 'patient', text: 'My jaw hurts severely after a sports injury. I need to get checked by a surgeon today.' },
    { conversationId: convRaghvendra._id, sender: 'assistant', text: 'Raghvendra ji, Dr. Sandesh Jain is our Senior Oral & Maxillofacial Surgeon with 25+ years experience treating facial and jaw trauma. We are open until 8:30 PM today at 1/4 near 56 Shops, New Palasia.' },
    { conversationId: convRaghvendra._id, sender: 'patient', text: 'Can I see Dr. Sandesh Jain at 7:30 PM today?' },
    { conversationId: convRaghvendra._id, sender: 'assistant', text: 'Yes, 7:30 PM is available. I have reserved your priority emergency consultation and sent an email to raghvendrapratapsingh505@gmail.com. Please confirm.' }
  ]);

  await Appointment.create({
    clinicId,
    leadId: leadRaghvendra._id,
    patientName: 'Raghvendra Pratap Singh',
    phone: '+91 98270 99881',
    doctorName: 'Dr. Sandesh Jain',
    date: todayStr,
    startTime: '19:30',
    endTime: '20:15',
    status: 'Confirmed',
    notes: 'Priority emergency maxillofacial jaw evaluation.'
  });

  await Notification.create({
    clinicId,
    type: 'lead_alert',
    conversationId: convRaghvendra._id.toString(),
    leadId: leadRaghvendra._id.toString(),
    title: 'High-Intent Emergency: Raghvendra Pratap Singh',
    message: 'Score 98: Emergency jaw & facial trauma consultation booked for today 19:30.',
    read: false
  });

  // 9. Deepak Singh (Referral -> New)
  const leadDeepak = await Lead.create({
    clinicId,
    patientName: 'Deepak Singh',
    phone: '+91 98330 88990',
    email: 'deepak.singh@gmail.com',
    requirement: 'Routine Oral Prophylaxis & Teeth Cleaning',
    source: 'Referral',
    status: 'New',
    leadScore: 50,
    assignedTo: 'Reception Desk',
    notes: [
      { content: 'Referred by patient Vishnu Bhai for routine preventive dental cleaning.', author: 'Front Desk' }
    ]
  });

  // 10. Priyanshu Sharma (Website -> Contacted)
  const leadPriyanshu = await Lead.create({
    clinicId,
    patientName: 'Priyanshu Sharma',
    phone: '+91 98340 99001',
    email: 'priyanshu.sharma@gmail.com',
    requirement: 'Laser Teeth Whitening & Enamel Polishing',
    source: 'Website',
    status: 'Contacted',
    leadScore: 68,
    assignedTo: 'Dr. Saumya Jain',
    notes: [
      { content: 'Inquired via website chat about single-sitting laser whitening before upcoming family wedding.', author: 'AI Receptionist Desk' }
    ]
  });

  // Unanswered Questions (Knowledge Gaps on Analytics page)
  console.log('[DEMO SEED] Populating Unanswered Questions for Analytics Knowledge Gap detector...');
  await UnansweredQuestion.create([
    {
      clinicId,
      question: 'Do you offer 0% interest monthly EMI options for invisible aligner treatments?',
      count: 3,
      lastAskedAt: new Date(Date.now() - 3600 * 1000)
    },
    {
      clinicId,
      question: 'Is parking space available for cars and vintage scooters right in front of the clinic?',
      count: 2,
      lastAskedAt: new Date(Date.now() - 2 * 3600 * 1000)
    }
  ]);

  console.log('✨ [SUCCESS] All 10 patient records, appointments, conversations, notifications, and analytics data successfully populated!');
  process.exit(0);
}

seedFullDemo().catch((err) => {
  console.error('[DEMO SEED ERROR]', err);
  process.exit(1);
});
