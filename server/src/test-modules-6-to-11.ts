import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import { Clinic } from './models/Clinic.js';
import { KnowledgeChunk } from './models/KnowledgeChunk.js';
import { getTelephonyProvider } from './integrations/telephony/telephonyProvider.js';
import { getBillingProvider } from './integrations/billing/razorpay.js';
import { getWhatsAppProvider } from './integrations/whatsapp/whatsappProvider.js';
import { getCalendarProvider } from './integrations/calendar/calendarProvider.js';
import { generateEmbedding, cosineSimilarity } from './ai/embeddingService.js';
import { processIncomingMessage } from './ai/aiService.js';

async function runTests() {
  console.log('--- STARTING MODULES 6-11 VERIFICATION TEST ---');
  await connectDB();
  await seedDatabase();

  const clinic = await Clinic.findOne({ name: /Indore Poly/i });
  if (!clinic) throw new Error('Clinic not found');
  console.log('PASS: Anchor clinic seeded with ID:', clinic._id);

  // 1. Module 6: Telephony Provider
  const telephony = getTelephonyProvider();
  const callRes = await telephony.makeCall({
    to: '+919827012345',
    clinicId: clinic._id.toString(),
    metadata: { note: 'Testing Indore Poly Dental voice follow-up' }
  });
  if (!callRes.callId) throw new Error('Telephony call failed: missing callId');
  console.log('PASS: Module 6 Telephony Provider makeCall status:', callRes.status, '| Call ID:', callRes.callId);

  // 2. Module 7: Multi-Tenant Onboarding & Billing
  if (!clinic.slug || !clinic.plan) throw new Error('Clinic missing multi-tenant fields');
  console.log('PASS: Module 7 Clinic slug:', clinic.slug, '| Plan:', clinic.plan);

  const billing = getBillingProvider();
  const order = await billing.createOrder({
    clinicId: clinic._id.toString(),
    amount: 299900,
    currency: 'INR',
    plan: 'Growth',
    receipt: 'rcpt_test_123'
  });
  if (!order.id) throw new Error('Billing order creation failed');
  console.log('PASS: Module 7 Billing Provider created order:', order.id, '| Stubbed:', order.stubbed);

  // 3. Module 8: Vector DB / RAG Embeddings
  const text1 = 'Root Canal Treatment pricing starts from Rs 3000 at Indore Dental.';
  const text2 = 'How much does root canal cost?';
  const text3 = 'Where is the clinic located near 56 shops?';

  const emb1 = await generateEmbedding(text1);
  const emb2 = await generateEmbedding(text2);
  const emb3 = await generateEmbedding(text3);

  if (emb1.length !== 384) throw new Error('Invalid embedding vector dimension: ' + emb1.length);
  const sim12 = cosineSimilarity(emb1, emb2);
  const sim13 = cosineSimilarity(emb1, emb3);
  console.log('PASS: Module 8 Vector Embeddings (384-dim) generated. Sim(RCT price, RCT query):', sim12.toFixed(3), 'vs Sim(RCT price, location):', sim13.toFixed(3));
  if (sim12 <= sim13) throw new Error('Semantic similarity failed ranking check');

  // Index chunk in DB
  await KnowledgeChunk.deleteMany({});
  const chunk = await KnowledgeChunk.create({
    clinicId: clinic._id,
    title: 'Root Canal Pricing',
    category: 'pricing',
    content: text1,
    embedding: emb1
  });
  console.log('PASS: Module 8 KnowledgeChunk indexed in DB with ID:', chunk._id);

  // 4. Module 9: WhatsApp Provider
  const whatsapp = getWhatsAppProvider();
  const waRes = await whatsapp.sendMessage({
    to: '+919827012345',
    body: 'Test appointment reminder for Indore Poly Dental Clinic'
  });
  if (!waRes.success) throw new Error('WhatsApp message dispatch failed');
  console.log('PASS: Module 9 WhatsApp Provider dispatch status:', waRes.status);

  // 5. Module 10: Calendar Sync Provider & Appointment Mirroring
  const calendar = getCalendarProvider();
  const calRes = await calendar.createEvent({
    appointmentId: 'apt_test_123',
    summary: 'Dental Consultation',
    description: 'Dr. Sandesh Jain consultation',
    doctorName: 'Dr. Sandesh Jain',
    patientName: 'Vikas Patel',
    date: '2026-09-10',
    startTime: '11:30 AM',
    endTime: '12:00 PM',
    clinicAddress: clinic.address
  });
  if (!calRes.success) throw new Error('Calendar event creation failed');
  console.log('PASS: Module 10 Calendar Sync status:', calRes.status, '| Event ID:', calRes.externalEventId);

  // 6. Module 11: Multi-Employee Treatment Routing
  if (!clinic.staff || clinic.staff.length < 2) throw new Error('Clinic missing staff routing array');
  console.log('PASS: Module 11 Clinic staff registered:', clinic.staff.map(s => s.name + ' (' + s.treatments.slice(0, 2).join(', ') + '...)').join(' | '));

  // Test AI treatment detection and staff auto-assignment
  const implantAi = await processIncomingMessage('I need a dental implant for my missing molar. My phone is 9893012345');
  const rctAi = await processIncomingMessage('I have severe tooth pain and need root canal treatment. Phone is 9893099999');

  console.log('PASS: Module 11 AI treatment detected for Implant:', implantAi.treatment, '| For RCT:', rctAi.treatment);
  if (implantAi.treatment !== 'Dental Implants') throw new Error('Implant treatment not detected properly');
  if (rctAi.treatment !== 'Root Canal Treatment') throw new Error('RCT treatment not detected properly');

  console.log('--- ALL MODULES 6-11 VERIFICATION TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('TEST FAILURE:', err);
  process.exit(1);
});