import cron from 'node-cron';
import { FollowUp, IFollowUp } from '../../models/FollowUp.js';
import { Lead, ILead } from '../../models/Lead.js';
import { Clinic } from '../../models/Clinic.js';
import { EmailService } from '../notifications/emailService.js';
import { getTelephonyProvider } from '../../integrations/telephony/telephonyProvider.js';
import { getWhatsAppProvider } from '../../integrations/whatsapp/whatsappProvider.js';
import mongoose from 'mongoose';

/**
 * Automatically schedule a follow-up 2 days out for leads with score 31-80
 * where no appointment has yet been booked.
 */
export const scheduleFollowUpForLead = async (lead: ILead): Promise<IFollowUp | null> => {
  try {
    // Check score range: 31 to 80
    if (lead.leadScore < 31 || lead.leadScore > 80) {
      return null;
    }

    // Do not schedule if lead is already booked, converted, or lost
    if (['Appointment Booked', 'Converted', 'Lost'].includes(lead.status)) {
      return null;
    }

    // Check if pending follow-up already exists for this lead
    const existing = await FollowUp.findOne({
      leadId: lead._id,
      status: 'pending'
    });

    if (existing) {
      return existing;
    }

    // Schedule 2 days in the future
    const scheduledFor = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const followUp = await FollowUp.create({
      clinicId: lead.clinicId,
      leadId: lead._id,
      scheduledFor,
      status: 'pending',
      channel: 'email'
    });

    console.log(`[FOLLOW-UP] Auto-scheduled follow-up for Lead "${lead.patientName}" on ${scheduledFor.toISOString()}`);
    return followUp;
  } catch (error: any) {
    console.error('[FOLLOW-UP ERROR] Failed to schedule follow-up:', error.message);
    return null;
  }
};

/**
 * Cancel pending follow-ups when lead status becomes 'Appointment Booked' or 'Lost'
 */
export const cancelPendingFollowUpsForLead = async (
  leadId: string | mongoose.Types.ObjectId
): Promise<number> => {
  try {
    const result = await FollowUp.updateMany(
      { leadId, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[FOLLOW-UP] Cancelled ${result.modifiedCount} pending follow-up(s) for Lead ID: ${leadId}`);
    }
    return result.modifiedCount;
  } catch (error: any) {
    console.error('[FOLLOW-UP ERROR] Failed to cancel pending follow-up:', error.message);
    return 0;
  }
};

/**
 * Executes a batch run for all due follow-ups (scheduledFor <= now and status === 'pending')
 * Wrapped in per-record try/catch so one error never stops the batch.
 */
export const runFollowUpBatch = async (): Promise<{ processed: number; sent: number; failed: number }> => {
  console.log(`[FOLLOW-UP BATCH] Checking for due follow-ups at ${new Date().toISOString()}...`);
  
  const now = new Date();
  const dueFollowUps = await FollowUp.find({
    scheduledFor: { $lte: now },
    status: 'pending'
  }).populate('leadId');

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const followUp of dueFollowUps) {
    processed++;
    try {
      const lead = followUp.leadId as any;
      if (!lead) {
        followUp.status = 'cancelled';
        await followUp.save();
        continue;
      }

      // If lead was already booked or lost in the meantime, cancel
      if (['Appointment Booked', 'Converted', 'Lost'].includes(lead.status)) {
        followUp.status = 'cancelled';
        await followUp.save();
        continue;
      }

      const clinic = await Clinic.findById(followUp.clinicId);

      if (followUp.channel === 'call') {
        const telephony = getTelephonyProvider();
        await telephony.makeCall({
          to: lead.phone,
          clinicId: followUp.clinicId.toString(),
          metadata: { leadId: lead._id, reason: 'Automated Follow-up Call' }
        });
      } else if (followUp.channel === 'whatsapp') {
        const whatsapp = getWhatsAppProvider();
        await whatsapp.sendMessage({
          to: lead.phone,
          body: `Hello ${lead.patientName}! This is ${clinic?.name || 'Indore Poly Dental Clinic'}. We wanted to check in regarding your enquiry for ${lead.requirement || 'dental consultation'}. Would you like to reserve an appointment slot this week? Reply here or call ${clinic?.phone || '+91 98270 12345'}.`,
          clinicId: followUp.clinicId.toString()
        });
      } else {
        // Dispatch follow-up email via EmailService
        await EmailService.sendFollowUp(lead.email || 'patient@example.com', {
          patientName: lead.patientName,
          requirement: lead.requirement,
          clinicName: clinic?.name || 'Indore Poly Dental Clinic',
          clinicPhone: clinic?.phone || '+91 98270 12345'
        });
      }

      followUp.status = 'sent';
      await followUp.save();

      // Add audit note to lead timeline
      if (Array.isArray(lead.notes)) {
        lead.notes.push({
          content: `Automated 2-day follow-up (${followUp.channel}) dispatched to patient.`,
          author: 'Follow-Up Engine'
        });
        await lead.save();
      }

      sent++;
      console.log(`[FOLLOW-UP SENT] Sent follow-up to ${lead.patientName} (${lead._id})`);
    } catch (err: any) {
      failed++;
      console.error(`[FOLLOW-UP ERROR] Record ${followUp._id} failed:`, err.message);
    }
  }

  console.log(`[FOLLOW-UP BATCH COMPLETED] Processed: ${processed}, Sent: ${sent}, Failed: ${failed}`);
  return { processed, sent, failed };
};

/**
 * Initializes in-process node-cron scheduler running daily at 09:00 AM
 */
export const initFollowUpScheduler = () => {
  // Cron expression: 0 9 * * * (At 09:00 AM every day)
  cron.schedule('0 9 * * *', async () => {
    try {
      await runFollowUpBatch();
    } catch (err: any) {
      console.error('[CRON ERROR] Follow-up batch failed:', err.message);
    }
  });

  console.log('[CRON] Follow-up scheduler initialized (Daily 09:00 AM).');
};
