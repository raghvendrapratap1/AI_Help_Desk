import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/db.js';
import { Clinic } from '../models/Clinic.js';
import { Lead } from '../models/Lead.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

async function addHandoffRecord() {
  await connectDB();

  const clinic = await Clinic.findOne();
  if (!clinic) {
    console.error('Clinic not found');
    process.exit(1);
  }

  const patientName = 'Naveen Verma';
  const phone = '+91 98930 45678';
  const email = 'naveen.verma@gmail.com';

  // Check if already exists to avoid duplicates
  await Lead.deleteOne({ phone });
  await Conversation.deleteOne({ phone });

  const lead = await Lead.create({
    clinicId: clinic._id,
    patientName,
    phone,
    email,
    requirement: 'Denture Checkup & Teeth Cleaning (Wheelchair Access Query)',
    source: 'Website',
    status: 'New',
    leadScore: 75,
    assignedTo: 'Reception Desk',
    notes: [
      {
        content: 'Patient inquired via website chat about wheelchair ramp and elevator facility for his 72-year-old mother.',
        author: 'AI Receptionist Desk'
      }
    ]
  });

  const conv = await Conversation.create({
    clinicId: clinic._id,
    leadId: lead._id,
    visitorId: 'visitor_naveen_verma_09',
    patientName,
    phone,
    patientEmail: email,
    age: 72,
    doctorName: 'Dr. Saumya Jain',
    status: 'escalated',
    channel: 'web_chat',
    intent: 'Accessibility & Clinic Facilities',
    urgency: 'Medium',
    treatment: 'Dentures',
    leadScore: 75,
    summary: 'Patient Naveen Verma wants to bring his 72-year-old mother in a wheelchair for teeth cleaning and asks about elevator and ramp facilities.',
    lastMessage: 'Does your clinic building have elevator/lift facility and wheelchair ramp access at the entrance?',
    needsHuman: true,
    escalationReason: 'Patient asking about wheelchair accessibility, ramp and lift facilities for elderly mother.'
  });

  await Message.create([
    {
      conversationId: conv._id,
      sender: 'patient',
      text: 'Hello! I want to book an appointment for my mother tomorrow.'
    },
    {
      conversationId: conv._id,
      sender: 'assistant',
      text: 'Hello Naveen! Welcome to Indore Poly Dental Clinic. We would be glad to help your mother. Which dental concern or checkup does she need?'
    },
    {
      conversationId: conv._id,
      sender: 'patient',
      text: 'She is 72 years old and needs a general denture checkup and teeth cleaning. But she is in a wheelchair. Does your clinic building have elevator/lift facility and wheelchair ramp access at the entrance?'
    },
    {
      conversationId: conv._id,
      sender: 'assistant',
      text: 'Let me connect you directly with our front desk team so they can confirm the ground-floor ramp assistance and help arrange her smooth arrival.'
    }
  ]);

  await Notification.create({
    clinicId: clinic._id,
    type: 'human_handoff',
    conversationId: conv._id.toString(),
    leadId: lead._id.toString(),
    title: 'Staff Handoff: Naveen Verma',
    message: 'Patient Naveen Verma asking about wheelchair ramp & lift access for 72-year-old mother.',
    read: false
  });

  console.log('✅ [SUCCESS] Added simple, realistic human handoff conversation for Naveen Verma!');
  process.exit(0);
}

addHandoffRecord().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
