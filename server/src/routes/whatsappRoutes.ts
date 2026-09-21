import { Router, Request, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { Clinic } from '../models/Clinic.js';
import { processIncomingMessage } from '../ai/aiService.js';
import { getWhatsAppProvider } from '../integrations/whatsapp/whatsappProvider.js';
import { scheduleFollowUpForLead, cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';
import { EmailService } from '../modules/notifications/emailService.js';

const router = Router();
const processedMessageIds = new Set<string>();

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Webhook verification endpoint
 */
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const provider = getWhatsAppProvider();
  const verified = provider.verifyWebhook(mode, token, challenge);

  if (verified) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * POST /api/webhooks/whatsapp
 * Inbound WhatsApp messages webhook.
 * Routes message through the EXACT same grounded AI engine, intent classifier, and lead pipeline.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const isEnabled = process.env.WHATSAPP_ENABLED === 'true';
    const body = req.body;

    // Fast 200 OK ACK for Meta Webhooks
    res.status(200).json({ status: 'received' });

    if (!isEnabled) {
      console.log('[WHATSAPP WEBHOOK] WHATSAPP_ENABLED is false. Synthetic message simulation enabled.');
    }

    // Extract message details (handles both Meta webhook shape and simple synthetic test payload)
    let from = body.from;
    let text = body.text;
    let messageId = body.id || `wa_msg_${Date.now()}`;

    // Meta Webhook JSON structure parsing
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
      const waMsg = body.entry[0].changes[0].value.messages[0];
      from = waMsg.from;
      text = waMsg.text?.body;
      messageId = waMsg.id;
    }

    if (!text || !from) {
      return;
    }

    // Idempotency check
    if (processedMessageIds.has(messageId)) {
      console.log(`[WHATSAPP WEBHOOK] Duplicate messageId ignored: ${messageId}`);
      return;
    }
    processedMessageIds.add(messageId);
    if (processedMessageIds.size > 2000) {
      const first = processedMessageIds.values().next().value;
      if (first) processedMessageIds.delete(first);
    }

    const clinic = await Clinic.findOne({});
    if (!clinic) return;

    const visitorId = `wa_${from}`;

    // Find or create active conversation
    let conversation = await Conversation.findOne({ visitorId, status: 'active' });
    if (!conversation) {
      conversation = await Conversation.create({
        clinicId: clinic._id,
        visitorId,
        channel: 'whatsapp',
        status: 'active',
        leadScore: 50
      });
    }

    // Save Inbound WhatsApp Message
    await Message.create({
      conversationId: conversation._id,
      sender: 'patient',
      text: text.trim()
    });

    // Run grounded AI Engine
    const previousMessages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    const history = previousMessages.map((m) => ({
      sender: m.sender === 'patient' ? 'user' : 'assistant',
      text: m.text
    }));

    const aiResult = await processIncomingMessage(text, history);

    // Save Outbound AI Reply
    await Message.create({
      conversationId: conversation._id,
      sender: 'assistant',
      text: aiResult.reply
    });

    // Send AI reply back via WhatsApp provider
    const provider = getWhatsAppProvider();
    await provider.sendMessage({
      to: from,
      body: aiResult.reply,
      clinicId: clinic._id.toString()
    });

    // Update conversation metadata
    conversation.leadScore = Math.max(conversation.leadScore, aiResult.leadScore);
    if (aiResult.patientName) conversation.patientName = aiResult.patientName;
    if (aiResult.phone || from) conversation.phone = aiResult.phone || from;
    if (aiResult.treatment) conversation.treatment = aiResult.treatment;
    if (aiResult.needsHuman) {
      conversation.status = 'escalated';
      conversation.needsHuman = true;
      conversation.escalationReason = aiResult.escalationReason || 'Patient requested human / complex WhatsApp query';
    }
    await conversation.save();

    // Upsert Lead
    const assignedDoctor = (aiResult.treatment && (aiResult.treatment.includes('Implant') || aiResult.treatment.includes('Surgery') || aiResult.treatment.includes('TMJ')))
      ? 'Dr. Sandesh Jain'
      : 'Dr. Saumya Jain';

    let lead = await Lead.findOne({ clinicId: clinic._id, phone: from });
    if (!lead) {
      lead = await Lead.create({
        clinicId: clinic._id,
        patientName: aiResult.patientName || `WhatsApp Patient (${from.slice(-4)})`,
        phone: from,
        requirement: aiResult.treatment || text.slice(0, 80),
        source: 'WhatsApp',
        status: aiResult.appointmentRequested ? 'Appointment Booked' : 'New',
        leadScore: aiResult.leadScore,
        assignedTo: assignedDoctor
      });

      // Dispatch real email alert to clinic admin
      await EmailService.sendLeadNotification(clinic.email, {
        patientName: lead.patientName,
        phone: lead.phone,
        requirement: lead.requirement,
        leadScore: lead.leadScore,
        source: 'WhatsApp',
        assignedTo: lead.assignedTo
      });
    } else {
      lead.leadScore = Math.max(lead.leadScore, aiResult.leadScore);
      if (aiResult.appointmentRequested) lead.status = 'Appointment Booked';
      if (aiResult.treatment) lead.requirement = aiResult.treatment;
      await lead.save();
    }

    if (aiResult.appointmentRequested) {
      await cancelPendingFollowUpsForLead(lead._id);
    } else if (lead.leadScore >= 31 && lead.leadScore <= 80 && lead.status !== 'Appointment Booked') {
      await scheduleFollowUpForLead(lead);
    }
  } catch (err) {
    console.error('[WHATSAPP WEBHOOK ERROR]', err);
  }
});

export default router;
