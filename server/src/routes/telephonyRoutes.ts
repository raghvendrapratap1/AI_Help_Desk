import { Router, Request, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { Clinic } from '../models/Clinic.js';
import { Notification } from '../models/Notification.js';
import { processIncomingMessage } from '../ai/aiService.js';
import { getTelephonyProvider } from '../integrations/telephony/telephonyProvider.js';
import { scheduleFollowUpForLead, cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';
import { EmailService } from '../modules/notifications/emailService.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';
import { triggerVapiOutboundCall } from '../integrations/telephony/vapiService.js';
import { triggerExotelOutboundCall, handleExotelPassthruCallback } from '../integrations/telephony/exotelService.js';
import { vapiWebhookHandler } from './vapiRoutes.js';

const router = Router();
const processedCallIds = new Set<string>();

/**
 * POST /api/telephony/web-call
 * Real-time web-call endpoint from browser microphone.
 * Reuses the EXACT same AI intelligence engine, intent classifier, and lead scoring rubric as chat!
 */
router.post('/web-call', async (req: Request, res: Response) => {
  try {
    const { visitorId, transcript, patientName: providedName, phone: providedPhone } = req.body;

    if (!visitorId || !transcript || !transcript.trim()) {
      return res.status(400).json({ success: false, error: 'visitorId and transcript are required' });
    }

    const clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(500).json({ success: false, error: 'No clinic configured' });
    }

    // Find or create active voice conversation
    let conversation = await Conversation.findOne({ visitorId, status: 'active' });
    if (!conversation) {
      conversation = await Conversation.create({
        clinicId: clinic._id,
        visitorId,
        channel: 'phone', // or voice_call
        status: 'active',
        intent: 'General Enquiry',
        urgency: 'Medium',
        leadScore: 20
      });
    }

    // 1. Save patient voice utterance as Message
    await Message.create({
      conversationId: conversation._id,
      sender: 'patient',
      text: transcript.trim(),
      metadata: { channel: 'voice_web_call' }
    });

    // 2. Fetch past context
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const history = previousMessages.map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    // 3. Process utterance through Grounded AI Intelligence Engine
    const aiResult = await processIncomingMessage(transcript.trim(), history);

    // 4. Update Conversation state
    if (aiResult.patientName || providedName) conversation.patientName = aiResult.patientName || providedName;
    if (aiResult.phone || providedPhone) conversation.phone = aiResult.phone || providedPhone;
    if (aiResult.treatment) conversation.treatment = aiResult.treatment;
    conversation.intent = aiResult.intent;
    conversation.urgency = aiResult.urgency;
    conversation.leadScore = Math.max(conversation.leadScore || 0, aiResult.leadScore);
    conversation.lastMessage = aiResult.reply;
    if (aiResult.needsHuman) {
      conversation.needsHuman = true;
      conversation.escalationReason = aiResult.escalationReason || 'Voice call escalation';
    }
    if (aiResult.summary) {
      conversation.summary = aiResult.summary;
    }

    // 5. Automatic Lead Creation & Linking (Identical to Chat Lead creation)
    let linkedLead = null;
    const shouldQualifyLead =
      conversation.phone ||
      aiResult.phone ||
      aiResult.appointmentRequested ||
      aiResult.leadScore >= 50 ||
      aiResult.treatment;

    if (shouldQualifyLead) {
      if (conversation.leadId) {
        linkedLead = await Lead.findById(conversation.leadId);
        if (linkedLead) {
          if (conversation.patientName && linkedLead.patientName.includes('Visitor')) {
            linkedLead.patientName = conversation.patientName;
          }
          if (conversation.phone) linkedLead.phone = conversation.phone;
          if (aiResult.treatment) linkedLead.requirement = aiResult.treatment;
          linkedLead.leadScore = Math.max(linkedLead.leadScore, aiResult.leadScore);
          if (aiResult.appointmentRequested && linkedLead.status !== 'Appointment Booked') {
            linkedLead.status = 'Appointment Booked';
            await cancelPendingFollowUpsForLead(linkedLead._id);
          }
          linkedLead.notes.push({
            content: `Voice Call Update: "${transcript.trim()}" -> Intent: ${aiResult.intent}`,
            author: 'AI Voice Receptionist'
          } as any);
          await linkedLead.save();
        }
      } else {
        linkedLead = await Lead.create({
          clinicId: clinic._id,
          patientName: conversation.patientName || (conversation.phone ? `Voice Patient (${conversation.phone.slice(-4)})` : 'Voice Caller'),
          phone: conversation.phone || 'In voice call',
          requirement: aiResult.treatment || `Voice Consultation: ${transcript.slice(0, 60)}`,
          source: 'Phone',
          status: aiResult.appointmentRequested ? 'Appointment Booked' : 'New',
          leadScore: aiResult.leadScore,
          assignedTo: aiResult.treatment && aiResult.treatment.includes('Implant') ? 'Dr. Sandesh Jain' : 'Dr. Saumya Jain',
          notes: [
            {
              content: `Lead captured via AI Voice Web-Call. Initial Utterance: "${transcript.trim()}" | Intent: ${aiResult.intent} | Score: ${aiResult.leadScore}`,
              author: 'AI Voice Receptionist'
            }
          ]
        });

        conversation.leadId = linkedLead._id as any;

        // Dispatch email notification
        await EmailService.sendLeadNotification(clinic.email, {
          patientName: linkedLead.patientName,
          phone: linkedLead.phone,
          requirement: linkedLead.requirement,
          leadScore: linkedLead.leadScore,
          source: linkedLead.source,
          assignedTo: linkedLead.assignedTo
        });

        // Auto-schedule FollowUp 2 days out if score 31-80
        if (linkedLead.leadScore >= 31 && linkedLead.leadScore <= 80 && linkedLead.status !== 'Appointment Booked') {
          await scheduleFollowUpForLead(linkedLead);
        }
      }
    }

    // Save escalation notification if flagged
    if (aiResult.needsHuman) {
      await Notification.create({
        clinicId: clinic._id,
        type: 'human_handoff',
        conversationId: conversation._id,
        title: `Voice Escalation: ${conversation.patientName || 'Caller'}`,
        message: aiResult.escalationReason || 'Patient in voice call requested human staff',
        read: false
      });
    }

    await conversation.save();

    // 6. Save AI Voice Response Message
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      sender: 'assistant',
      text: aiResult.reply,
      metadata: {
        channel: 'voice_web_call',
        intent: aiResult.intent,
        leadScore: aiResult.leadScore,
        leadCreated: !!linkedLead
      }
    });

    return res.json({
      success: true,
      data: {
        reply: aiResult.reply,
        metadata: {
          intent: aiResult.intent,
          urgency: aiResult.urgency,
          treatment: aiResult.treatment,
          leadScore: aiResult.leadScore,
          leadCreated: !!linkedLead,
          leadId: linkedLead?._id
        },
        conversation,
        assistantMessage
      }
    });
  } catch (error: any) {
    console.error('[VOICE CALL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/webhooks/telephony
 * Webhook for inbound/outbound telephony events (e.g. Exotel, Vapi)
 * Validates signature, dedupes by providerCallId, and creates/updates Conversation
 */
router.post('/webhooks/telephony', async (req: Request, res: Response) => {
  try {
    const provider = getTelephonyProvider();
    const payload = req.body;
    const providerCallId = payload.CallSid || payload.callId || payload.CallId;

    if (providerCallId && processedCallIds.has(providerCallId)) {
      console.log(`[TELEPHONY WEBHOOK] Duplicate call ignored: ${providerCallId}`);
      return res.json({ success: true, message: 'Duplicate webhook call ignored' });
    }

    if (providerCallId) {
      processedCallIds.add(providerCallId);
    }

    const webhookResult = await provider.handleWebhook(payload, req.headers['x-telephony-signature'] as string);

    return res.json({ success: true, data: webhookResult });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/telephony/webhooks/vapi
 * Dedicated Vapi webhook endpoint within telephony router
 */
router.post('/webhooks/vapi', vapiWebhookHandler);

/**
 * ALL /api/telephony/passthru/exotel
 * Handles Exotel visual builder Passthru applet HTTP callbacks
 * Supports both GET and POST requests per Exotel configuration
 */
router.all('/passthru/exotel', async (req: Request, res: Response) => {
  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    const result = await handleExotelPassthruCallback(payload);
    return res.status(result.status).send(result.text);
  } catch (error: any) {
    console.error('[EXOTEL PASSTHRU ERROR]', error);
    return res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /api/telephony/outbound-call
 * Trigger outbound call for missed calls or scheduled follow-ups.
 * Supports:
 *  - Exotel Indian PSTN telephony (/Calls/connect.json) for automated follow-ups & recall campaigns
 *  - Vapi AI Voice (WebRTC/SIP assistant) for direct conversational AI
 */
router.post('/outbound-call', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { to, leadId, patientName, doctorName, requirement, metadata, provider: requestedProvider } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
    }

    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(400).json({ success: false, error: 'Clinic context missing' });
    }

    // Look up lead details if leadId is provided
    let resolvedLead = null;
    if (leadId) {
      resolvedLead = await Lead.findById(leadId);
    } else {
      resolvedLead = await Lead.findOne({ phone: to.replace(/\D/g, '').slice(-10) });
    }

    const effectiveName = patientName || resolvedLead?.patientName || 'Patient';
    const effectiveDoctor = doctorName || resolvedLead?.assignedTo || 'Dr. Sandesh Jain';
    const effectiveReason = requirement || resolvedLead?.requirement || 'Clinical consultation follow-up';

    // 1. If Exotel provider explicitly requested OR requested via Exotel campaign
    if (requestedProvider === 'exotel') {
      const exotelResult = await triggerExotelOutboundCall({
        to,
        patientName: effectiveName,
        doctorName: effectiveDoctor,
        requirement: effectiveReason,
        leadId: resolvedLead?._id?.toString()
      });

      if (!exotelResult.success) {
        return res.status(502).json({ success: false, error: exotelResult.error });
      }

      // Record call initiated in lead timeline note
      if (resolvedLead) {
        resolvedLead.status = 'Contacted';
        resolvedLead.notes.push({
          content: `Initiated outbound Exotel PSTN follow-up call (CallSid: ${exotelResult.callSid}, Mode: ${exotelResult.mode})`,
          author: req.user?.email || 'Clinic Staff'
        } as any);
        await resolvedLead.save();
      }

      // Create or update Conversation record
      await Conversation.create({
        clinicId,
        visitorId: exotelResult.callSid || `exotel_${Date.now()}`,
        channel: 'phone',
        patientName: effectiveName,
        phone: to.replace(/\D/g, '').slice(-10),
        leadId: resolvedLead?._id,
        intent: 'Appointment Request',
        status: 'active',
        summary: `Exotel PSTN automated follow-up call initiated to ${effectiveName} (${to}) for ${effectiveReason}.`
      });

      return res.json({
        success: true,
        data: {
          provider: 'exotel',
          callSid: exotelResult.callSid,
          status: exotelResult.status,
          mode: exotelResult.mode,
          message: `Exotel PSTN call dispatched to Indian number ${effectiveName} (${to})`
        }
      });
    }

    // 2. If Vapi credentials are configured, initiate real AI voice call via Vapi
    if (process.env.VAPI_PRIVATE_API_KEY && process.env.VAPI_ASSISTANT_ID) {
      const vapiResult = await triggerVapiOutboundCall({
        to,
        patientName: effectiveName,
        doctorName: effectiveDoctor,
        requirement: effectiveReason,
        leadId: resolvedLead?._id?.toString()
      });

      if (!vapiResult.success) {
        return res.status(502).json({ success: false, error: vapiResult.error });
      }

      // Record call initiated in lead timeline note
      if (resolvedLead) {
        resolvedLead.status = 'Contacted';
        resolvedLead.notes.push({
          content: `Initiated outbound AI Voice Call via Vapi (Call ID: ${vapiResult.callId})`,
          author: req.user?.email || 'Clinic Staff'
        } as any);
        await resolvedLead.save();
      }

      // Create or update Conversation record
      await Conversation.create({
        clinicId,
        visitorId: vapiResult.callId || `outbound_${Date.now()}`,
        channel: 'phone',
        patientName: effectiveName,
        phone: to.replace(/\D/g, '').slice(-10),
        leadId: resolvedLead?._id,
        intent: 'Appointment Request',
        status: 'active',
        summary: `Outbound AI follow-up call initiated to ${effectiveName} (${to}) for ${effectiveReason}.`
      });

      return res.json({
        success: true,
        data: {
          provider: 'vapi',
          callId: vapiResult.callId,
          status: vapiResult.status,
          message: `AI Voice call initiated to ${effectiveName} (${to})`
        }
      });
    }

    // 3. Fallback to Exotel / Telephony Provider
    const exotelResult = await triggerExotelOutboundCall({
      to,
      patientName: effectiveName,
      doctorName: effectiveDoctor,
      requirement: effectiveReason,
      leadId: resolvedLead?._id?.toString()
    });

    return res.json({ success: true, data: exotelResult });
  } catch (error: any) {
    console.error('[OUTBOUND CALL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
