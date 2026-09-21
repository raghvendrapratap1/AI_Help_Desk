import { Router, Request, Response } from 'express';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Clinic } from '../models/Clinic.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { EmailService } from '../modules/notifications/emailService.js';
import { cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';
import { sendPatientConfirmationInvite } from '../modules/appointments/confirmationService.js';
import { checkSlotsForDoctor } from '../modules/appointments/slotService.js';

const router = Router();

/**
 * Helper to build Vapi responses for both modern `tool-calls` and older `function-call` formats
 */
function buildVapiResponse(toolCallId: string | undefined, isFunctionCall: boolean, data: { result?: string; error?: string }) {
  if (isFunctionCall) {
    if (data.error) {
      return { error: data.error };
    }
    return { result: data.result || 'Success' };
  }

  return {
    results: [
      {
        toolCallId: toolCallId || 'default_tool_call',
        result: data.error ? `Error: ${data.error}` : (data.result || 'Success')
      }
    ]
  };
}

/**
 * Match specialist doctor based on symptoms / complaint
 */
function determineAssignedDoctor(clinic: any, complaint: string): string {
  const lower = (complaint || '').toLowerCase();
  if (clinic?.staff && clinic.staff.length > 0) {
    const matched = clinic.staff.find((s: any) =>
      s.treatments?.some((t: string) =>
        lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower)
      )
    );
    if (matched) return matched.name;
  }

  if (
    lower.includes('implant') ||
    lower.includes('surgery') ||
    lower.includes('bone') ||
    lower.includes('tmj') ||
    lower.includes('wisdom') ||
    lower.includes('jaw') ||
    lower.includes('trauma')
  ) {
    return 'Dr. Sandesh Jain';
  }

  return 'Dr. Saumya Jain';
}

// Note: checkSlotsForDoctor is imported from ../modules/appointments/slotService.js

/**
 * Handle Vapi Tool Call: bookAppointment
 */
async function handleBookAppointment(args: any, callData: any) {
  console.log('[VAPI TOOL CALL] bookAppointment received:', JSON.stringify(args, null, 2));

  const patientName = (args?.patientName || args?.name || args?.fullName || callData?.customer?.name || '').trim();
  const age = args?.age || args?.patientAge;
  const rawPhone = args?.phone || args?.phoneNumber || args?.mobileNumber || callData?.customer?.number || '';
  const cleanPhone = rawPhone ? String(rawPhone).replace(/\D/g, '').slice(-10) : '';
  const patientEmail = (args?.patientEmail || args?.email || args?.emailAddress || '').trim();
  const primaryComplaint = (args?.primaryComplaint || args?.complaint || args?.symptoms || args?.reason || 'Dental Consultation').trim();
  const preferredDate = (args?.preferredDate || args?.date || args?.appointmentDate || '').trim();
  const preferredTime = (args?.preferredTime || args?.time || args?.slot || args?.timeSlot || '').trim();
  const urgency = args?.urgency || 'routine';

  // Strict clinical validation - all mandatory fields must be present
  const missing: string[] = [];
  if (!patientName) missing.push('patient full name');
  if (!age) missing.push('patient age');
  if (!cleanPhone || cleanPhone.length !== 10) missing.push('valid 10-digit contact number');
  if (!primaryComplaint) missing.push('primary symptoms / complaint');
  if (!preferredDate) missing.push('preferred appointment date (YYYY-MM-DD in 2026)');
  if (!preferredTime) missing.push('preferred appointment time slot');

  if (missing.length > 0) {
    const errorMsg = `Cannot reserve appointment yet. Missing required information: ${missing.join(', ')}. Please ask the patient for ${missing[0]} before booking.`;
    console.warn('[VAPI VALIDATION FAILED]', errorMsg);
    return { success: false, error: errorMsg };
  }

  // Retrieve Clinic Anchor
  let clinic = await Clinic.findOne({ slug: 'indore-poly-dental' });
  if (!clinic) clinic = await Clinic.findOne();
  if (!clinic) throw new Error('No clinic configured in system');

  const doctorName = determineAssignedDoctor(clinic, primaryComplaint);

  // Check if requested slot is already taken by a manual or AI booking
  const openSlots = await checkSlotsForDoctor(preferredDate, doctorName);
  const requestedUpper = preferredTime.trim().toUpperCase();
  const isSlotAvailable = openSlots.some(s => s.toUpperCase() === requestedUpper);

  if (!isSlotAvailable && openSlots.length > 0) {
    const suggested = openSlots.slice(0, 3).join(', ');
    const slotTakenError = `The slot at ${preferredTime} on ${preferredDate} is already reserved by another patient. Available slots for ${doctorName} are: ${suggested}. Please ask the patient to pick one of these available slots.`;
    console.warn('[VAPI SLOT CONFLICT]', slotTakenError);
    return { success: false, error: slotTakenError };
  }

  // 1. Find or Create Lead in MongoDB Atlas
  let lead = await Lead.findOne({
    clinicId: clinic._id,
    $or: [{ phone: cleanPhone }, { patientName }]
  });

  const leadScore = urgency === 'emergency' ? 95 : urgency === 'urgent' ? 90 : 80;

  if (lead) {
    lead.patientName = patientName;
    lead.phone = cleanPhone;
    lead.requirement = `${primaryComplaint} (Age: ${age}, Urgency: ${urgency})`;
    lead.status = 'Appointment Booked';
    lead.leadScore = Math.max(lead.leadScore, leadScore);
    lead.assignedTo = doctorName;
    lead.notes.push({
      content: `Vapi Voice Call: Confirmed booking for ${preferredDate} at ${preferredTime}. Complaint: ${primaryComplaint}, Age: ${age}, Urgency: ${urgency}.`,
      author: 'Vapi Voice AI'
    } as any);
    await lead.save();
    console.log(`[VAPI LEAD UPDATED] ID: ${lead._id} for ${lead.patientName} (${lead.phone})`);
  } else {
    lead = await Lead.create({
      clinicId: clinic._id,
      patientName,
      phone: cleanPhone,
      requirement: `${primaryComplaint} (Age: ${age}, Urgency: ${urgency})`,
      source: 'Phone',
      status: 'Appointment Booked',
      leadScore,
      assignedTo: doctorName,
      notes: [
        {
          content: `Inbound/Outbound Vapi Voice Call: Reserved appointment for ${preferredDate} at ${preferredTime}. Complaint: ${primaryComplaint}, Age: ${age}, Urgency: ${urgency}.`,
          author: 'Vapi Voice AI'
        }
      ]
    });
    console.log(`[VAPI LEAD CREATED] ID: ${lead._id} for ${lead.patientName} (${lead.phone})`);
  }

  // Cancel any follow-ups since appointment is now confirmed
  await cancelPendingFollowUpsForLead(lead._id);

  // 2. Find or Create Appointment in MongoDB Atlas
  let appointment = await Appointment.findOne({
    clinicId: clinic._id,
    leadId: lead._id,
    date: preferredDate
  });

  if (appointment) {
    appointment.patientName = patientName;
    appointment.phone = cleanPhone;
    if (patientEmail) appointment.patientEmail = patientEmail;
    appointment.doctorName = doctorName;
    appointment.startTime = preferredTime;
    appointment.status = 'Requested';
    appointment.notes = `Updated via Vapi Voice AI Call. Age: ${age}, Urgency: ${urgency}, Reason: ${primaryComplaint}`;
    await appointment.save();
    console.log(`[VAPI APPOINTMENT UPDATED] ID: ${appointment._id} for ${appointment.date} at ${appointment.startTime}`);
  } else {
    appointment = await Appointment.create({
      clinicId: clinic._id,
      leadId: lead._id,
      patientName,
      phone: cleanPhone,
      patientEmail: patientEmail || undefined,
      doctorName,
      date: preferredDate,
      startTime: preferredTime,
      endTime: '30 mins slot',
      status: 'Requested',
      notes: `Booked via Vapi Voice AI Call. Age: ${age}, Urgency: ${urgency}, Symptoms: ${primaryComplaint}`
    });
    console.log(`[VAPI APPOINTMENT CREATED] ID: ${appointment._id} on ${appointment.date} at ${appointment.startTime}`);
  }

  // Dispatch One-Click Patient Confirmation Invite via Email & WhatsApp (non-blocking in background)
  sendPatientConfirmationInvite(appointment._id).catch((inviteErr: any) => {
    console.error('[CONFIRMATION INVITE ERROR]', inviteErr.message);
  });

  // 3. Find or Create Conversation
  const callId = callData?.id || `vapi_call_${Date.now()}`;
  let conversation = await Conversation.findOne({
    clinicId: clinic._id,
    $or: [{ visitorId: callId }, { phone: cleanPhone }]
  });

  if (!conversation) {
    conversation = await Conversation.create({
      clinicId: clinic._id,
      visitorId: callId,
      channel: 'phone',
      patientName,
      phone: cleanPhone,
      leadId: lead._id,
      intent: 'Appointment Request',
      urgency: urgency === 'emergency' ? 'High' : urgency === 'urgent' ? 'Medium' : 'Low',
      leadScore,
      status: 'active',
      summary: `Vapi Voice call booking for ${patientName}: ${primaryComplaint} on ${preferredDate} at ${preferredTime}.`
    });
  } else {
    conversation.leadId = lead._id as any;
    conversation.patientName = patientName;
    conversation.phone = cleanPhone;
    conversation.intent = 'Appointment Request';
    conversation.summary = `Vapi Voice call booking for ${patientName}: ${primaryComplaint} on ${preferredDate} at ${preferredTime}.`;
    await conversation.save();
  }

  // 4. Save call booking message in conversation timeline
  await Message.create({
    conversationId: conversation._id,
    sender: 'assistant',
    text: `Appointment reserved for ${patientName} on ${preferredDate} at ${preferredTime} with ${doctorName}. Chief complaint: ${primaryComplaint}.`,
    metadata: {
      source: 'vapi_voice_call',
      callId,
      appointmentId: appointment._id,
      leadId: lead._id,
      urgency
    }
  });

  // 5. Send Email Alert to Clinic Admin
  try {
    await EmailService.sendLeadNotification(clinic.email, {
      patientName,
      phone: cleanPhone,
      requirement: `${primaryComplaint} (Preferred Date: ${preferredDate} at ${preferredTime})`,
      leadScore,
      source: 'Phone (Vapi Voice AI)',
      assignedTo: doctorName
    });
  } catch (emailErr: any) {
    console.error('[VAPI EMAIL NOTICE ERROR]', emailErr.message);
  }

  const successMessage = `Appointment booked successfully for ${patientName} on ${preferredDate} at ${preferredTime} with ${doctorName}. Front desk will coordinate arrival details.`;
  return {
    success: true,
    result: successMessage,
    data: {
      appointmentId: appointment._id,
      patientName,
      patientEmail,
      phone: cleanPhone,
      doctorName,
      date: preferredDate,
      time: preferredTime,
      confirmationToken: appointment.confirmationToken
    }
  };
}

/**
 * Handle Vapi End-of-Call Report
 */
async function handleEndOfCallReport(messageData: any) {
  const call = messageData?.call;
  const callId = call?.id;
  const transcript = messageData?.transcript || messageData?.messages?.map((m: any) => `${m.role}: ${m.message}`).join('\n') || '';
  const summary = messageData?.summary || '';
  const recordingUrl = messageData?.recordingUrl || messageData?.stereoRecordingUrl;
  const duration = messageData?.durationSeconds || call?.duration || 0;
  const customerNumber = call?.customer?.number?.replace(/\D/g, '').slice(-10);

  console.log(`[VAPI CALL ENDED] Call ID: ${callId} | Duration: ${duration}s | Phone: ${customerNumber}`);

  if (!callId && !customerNumber) return;

  const conversation = await Conversation.findOne({
    $or: [{ visitorId: callId }, { phone: customerNumber }]
  });

  if (conversation) {
    conversation.status = 'closed';
    if (summary) conversation.summary = summary;
    if (recordingUrl) conversation.recordingUrl = recordingUrl;
    conversation.duration = Math.round(duration);
    await conversation.save();

    // Store transcript lines into Messages if not already stored
    if (transcript && (!conversation.lastMessage || conversation.lastMessage.length < 20)) {
      conversation.lastMessage = transcript.slice(-200);
      await conversation.save();

      await Message.create({
        conversationId: conversation._id,
        sender: 'system',
        text: `Call completed (${Math.round(duration)}s). Full Voice Transcript:\n\n${transcript}`,
        metadata: {
          recordingUrl,
          duration,
          summary
        }
      });
    }

    // Attach summary note to linked Lead
    if (conversation.leadId && summary) {
      const lead = await Lead.findById(conversation.leadId);
      if (lead) {
        lead.notes.push({
          content: `Call Completed (${Math.round(duration)}s): ${summary}`,
          author: 'Vapi Call System'
        } as any);
        await lead.save();
      }
    }
  }
}

/**
 * Universal Vapi Webhook Handler:
 * Accepts requests at both /api/vapi-webhook and /api/telephony/webhooks/vapi
 */
export const vapiWebhookHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const message = body.message || body;
    const messageType = message.type;

    console.log(`[VAPI WEBHOOK EVENT] Type: "${messageType}"`);

    // 1. Tool Calls Event (Vapi Tool format)
    if (messageType === 'tool-calls' && message.toolCalls && message.toolCalls.length > 0) {
      const results = [];
      for (const toolCall of message.toolCalls) {
        const functionName = toolCall.function?.name;
        let args = toolCall.function?.arguments;
        if (typeof args === 'string') {
          try {
            args = JSON.parse(args);
          } catch (_) {}
        }

        if (functionName === 'bookAppointment') {
          const outcome = await handleBookAppointment(args, message.call);
          results.push({
            toolCallId: toolCall.id,
            result: outcome.success ? outcome.result : `Error: ${outcome.error}`
          });
        } else if (functionName === 'checkAvailableSlots') {
          const targetDate = args?.date || '2026-09-12';
          const doctor = args?.doctorName;
          const openSlots = await checkSlotsForDoctor(targetDate, doctor);
          const topSlots = openSlots.slice(0, 3);
          const reply = openSlots.length > 0
            ? `Open slots for ${doctor || 'our specialist'} on ${targetDate} include ${topSlots.join(', ')}.`
            : `Sorry, there are no open consultation slots available for ${doctor || 'the clinic'} on ${targetDate}. All slots are booked.`;
          results.push({
            toolCallId: toolCall.id,
            result: reply
          });
        } else {
          results.push({
            toolCallId: toolCall.id,
            result: `Tool ${functionName} executed.`
          });
        }
      }

      return res.json({ results });
    }

    // 2. Legacy Function Call Event
    if (messageType === 'function-call' && message.functionCall) {
      const functionName = message.functionCall.name;
      let params = message.functionCall.parameters;
      if (typeof params === 'string') {
        try {
          params = JSON.parse(params);
        } catch (_) {}
      }

      if (functionName === 'bookAppointment') {
        const outcome = await handleBookAppointment(params, message.call);
        return res.json(buildVapiResponse(undefined, true, outcome));
      } else if (functionName === 'checkAvailableSlots') {
        const targetDate = params?.date || '2026-09-08';
        const doctor = params?.doctorName;
        const openSlots = await checkSlotsForDoctor(targetDate, doctor);
        const reply = openSlots.length > 0
          ? `Available slots on ${targetDate}: ${openSlots.join(', ')}.`
          : `No open slots on ${targetDate}.`;
        return res.json({ result: reply });
      }

      return res.json({ result: `Function ${functionName} executed.` });
    }

    // 3. End of Call Report
    if (messageType === 'end-of-call-report') {
      await handleEndOfCallReport(message);
      return res.json({ success: true, message: 'End of call report processed' });
    }

    // 4. Status Update / Speech Update / Transcript Update
    if (messageType === 'status-update' || messageType === 'transcript' || messageType === 'conversation-update') {
      return res.json({ success: true, received: true });
    }

    return res.json({ success: true, message: 'Webhook event received' });
  } catch (error: any) {
    console.error('[VAPI WEBHOOK FATAL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

router.post('/', vapiWebhookHandler);

export default router;
