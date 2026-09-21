import { Router, Request, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Clinic } from '../models/Clinic.js';
import { Notification } from '../models/Notification.js';
import { UnansweredQuestion } from '../models/UnansweredQuestion.js';
import { EmailService } from '../modules/notifications/emailService.js';
import { scheduleFollowUpForLead, cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';
import { processIncomingMessage } from '../ai/aiService.js';

const router = Router();

// Start or resume chat session with visitor memory
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { visitorId, channel = 'web_chat' } = req.body;

    if (!visitorId) {
      return res.status(400).json({ success: false, error: 'visitorId is required' });
    }

    let clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(500).json({ success: false, error: 'Clinic not configured' });
    }

    // Check if visitor has prior conversations or linked lead to personalize experience
    const pastConversations = await Conversation.find({ visitorId }).sort({ createdAt: -1 });
    let knownName = pastConversations.find(c => c.patientName && !c.patientName.includes('Visitor'))?.patientName;
    let knownPhone = pastConversations.find(c => c.phone && c.phone !== 'In chat conversation')?.phone;
    let knownTreatment = pastConversations.find(c => c.treatment)?.treatment;

    // Also check past appointment or lead
    if (!knownName || !knownPhone) {
      const pastLead = await Lead.findOne({
        $or: [
          { _id: { $in: pastConversations.map(c => c.leadId).filter(Boolean) } },
          ...(knownPhone ? [{ phone: knownPhone }] : [])
        ]
      }).sort({ createdAt: -1 });

      if (pastLead) {
        if (!knownName && pastLead.patientName && !pastLead.patientName.includes('Visitor')) {
          knownName = pastLead.patientName;
        }
        if (!knownPhone && pastLead.phone && pastLead.phone !== 'In chat conversation') {
          knownPhone = pastLead.phone;
        }
        if (!knownTreatment && pastLead.requirement) {
          knownTreatment = pastLead.requirement;
        }
      }
    }

    let conversation = await Conversation.findOne({ visitorId, status: 'active' });

    if (!conversation) {
      conversation = await Conversation.create({
        clinicId: clinic._id,
        visitorId,
        channel,
        patientName: knownName,
        phone: knownPhone,
        treatment: knownTreatment,
        intent: 'General Enquiry',
        urgency: 'Low',
        leadScore: knownPhone ? 35 : 10,
        status: 'active'
      });

      // Tailor welcome message based on visitor memory
      let welcomeText = '';
      if (knownName && knownPhone) {
        welcomeText = `Welcome back, ${knownName}! How can our clinic team assist you today?`;
      } else {
        welcomeText = `Hello! How can I help you today?`;
      }

      await Message.create({
        conversationId: conversation._id,
        sender: 'assistant',
        text: welcomeText
      });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: {
        conversation,
        messages,
        visitorProfile: {
          patientName: knownName || conversation.patientName,
          phone: knownPhone || conversation.phone,
          isReturning: !!(knownName || knownPhone)
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Process visitor message & run AI receptionist
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { visitorId, message } = req.body;

    if (!visitorId || !message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'visitorId and message are required' });
    }

    let clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(500).json({ success: false, error: 'Clinic not configured' });
    }

    let conversation = await Conversation.findOne({ visitorId, status: 'active' });
    if (!conversation) {
      conversation = await Conversation.create({
        clinicId: clinic._id,
        visitorId,
        channel: 'web_chat',
        status: 'active'
      });
    }

    // 1. Save visitor message
    await Message.create({
      conversationId: conversation._id,
      sender: 'patient',
      text: message.trim()
    });

    // 2. Fetch past conversation messages for context
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const history = previousMessages.map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    // Construct visitor profile memory
    let knownName = conversation.patientName;
    let knownPhone = conversation.phone;
    let knownEmail = '';
    let previousTreatment = conversation.treatment;

    // Detect if patient provided a 10-digit phone number in this message or history
    const phoneMatch = message.match(/(?:\+?91[\s-]?)?([6789]\d{9})/);
    const candidatePhone = phoneMatch ? phoneMatch[1] : undefined;

    let recognizedFromPhone = false;
    if (candidatePhone && candidatePhone !== knownPhone) {
      // Cross-device lookup by phone in Leads & Appointments
      const existingLead = await Lead.findOne({ phone: new RegExp(candidatePhone) }).sort({ createdAt: -1 });
      const existingApt = await Appointment.findOne({ phone: new RegExp(candidatePhone) }).sort({ createdAt: -1 });

      if (existingLead || existingApt) {
        recognizedFromPhone = true;
        knownPhone = candidatePhone;
        if (!knownName || knownName.includes('Visitor')) {
          knownName = existingLead?.patientName || existingApt?.patientName;
        }
        if (existingApt?.patientEmail) {
          knownEmail = existingApt.patientEmail;
        }
        if (!previousTreatment) {
          previousTreatment = existingLead?.requirement || existingApt?.notes;
        }

        // Link current conversation to this known lead
        if (existingLead) {
          conversation.leadId = existingLead._id as any;
        }
        conversation.patientName = knownName;
        conversation.phone = knownPhone;
      }
    }

    const visitorProfile = {
      patientName: knownName,
      phone: knownPhone,
      patientEmail: knownEmail || conversation.patientEmail,
      age: conversation.age,
      previousTreatment: previousTreatment,
      preferredDate: conversation.preferredDate,
      preferredTime: conversation.preferredTime,
      doctorName: conversation.doctorName,
      primaryComplaint: conversation.treatment,
      appointmentDraft: conversation.appointmentDraft ? {
        patientName: conversation.appointmentDraft.patientName,
        age: conversation.appointmentDraft.age,
        phone: conversation.appointmentDraft.phone,
        patientEmail: conversation.appointmentDraft.patientEmail,
        primaryComplaint: conversation.appointmentDraft.primaryComplaint,
        preferredDate: conversation.appointmentDraft.preferredDate,
        preferredTime: conversation.appointmentDraft.preferredTime,
        doctorName: conversation.appointmentDraft.doctorName,
        status: conversation.appointmentDraft.status
      } : undefined,
      isReturning: !!(knownName || knownPhone)
    };

    // 3. Process message with Grounded AI Intelligence Engine
    const aiResult = await processIncomingMessage(message.trim(), history, visitorProfile);

    // If user just provided their phone on a new device and got recognized, prepend warm recognition cleanly
    if (recognizedFromPhone && knownName) {
      if (!aiResult.reply.toLowerCase().includes('welcome back')) {
        aiResult.reply = `Welcome back, ${knownName}! I've found your records under ${knownPhone}.\n\n${aiResult.reply}`;
      }
    }

    // 4. Update Conversation state & appointmentDraft
    if (aiResult.patientName) conversation.patientName = aiResult.patientName;
    if (aiResult.phone) conversation.phone = aiResult.phone;
    if (aiResult.patientEmail) conversation.patientEmail = aiResult.patientEmail;
    if (aiResult.preferredDate) conversation.preferredDate = aiResult.preferredDate;
    if (aiResult.preferredTime) conversation.preferredTime = aiResult.preferredTime;
    if (aiResult.doctorName) conversation.doctorName = aiResult.doctorName;
    if (aiResult.draftCard?.age) conversation.age = Number(aiResult.draftCard.age);
    if (aiResult.treatment) conversation.treatment = aiResult.treatment;
    if (aiResult.draft) {
      conversation.appointmentDraft = {
        patientName: aiResult.draft.patientName || conversation.patientName,
        age: aiResult.draft.age !== undefined ? Number(aiResult.draft.age) : conversation.age,
        phone: aiResult.draft.phone || conversation.phone,
        patientEmail: aiResult.draft.patientEmail || conversation.patientEmail,
        primaryComplaint: aiResult.draft.primaryComplaint || conversation.treatment,
        preferredDate: aiResult.draft.preferredDate || conversation.preferredDate,
        preferredTime: aiResult.draft.preferredTime || conversation.preferredTime,
        doctorName: aiResult.draft.doctorName || conversation.doctorName,
        status: aiResult.draft.status || 'pending'
      };
    }
    conversation.intent = aiResult.intent;
    conversation.urgency = aiResult.urgency;
    conversation.leadScore = Math.max(conversation.leadScore || 0, aiResult.leadScore);
    conversation.lastMessage = aiResult.reply;
    if (aiResult.needsHuman) {
      conversation.needsHuman = true;
      conversation.escalationReason = aiResult.escalationReason || 'Flagged for human assistance';
    }
    if (aiResult.summary) {
      conversation.summary = aiResult.summary;
    }

    // Module 3: Human Handoff Escalation (Email + Dashboard Notification)
    if (aiResult.needsHuman) {
      // 1. Send alert email to clinic admin
      await EmailService.sendHumanHandoff(clinic.email, {
        patientName: conversation.patientName,
        phone: conversation.phone,
        reason: aiResult.escalationReason || 'Patient inquiry requires human staff attention',
        summary: aiResult.summary,
        conversationId: conversation._id.toString(),
        lastMessage: message.trim()
      });

      // 2. Create in-app Notification record
      await Notification.create({
        clinicId: clinic._id,
        type: 'human_handoff',
        conversationId: conversation._id,
        title: `Human Handoff: ${conversation.patientName || 'Web Visitor'}`,
        message: aiResult.escalationReason || 'Patient inquiry requires human staff attention',
        read: false
      });
    }

    // Module 5: Unanswered Questions Tracking in AI Fallback Path
    if (aiResult.isFallback) {
      try {
        const cleanQ = message.trim().toLowerCase();
        const allQuestions = await UnansweredQuestion.find({ clinicId: clinic._id });
        const existingQ = allQuestions.find((q) => {
          const existingClean = q.question.trim().toLowerCase();
          return cleanQ.includes(existingClean) || existingClean.includes(cleanQ);
        });

        if (existingQ) {
          existingQ.count += 1;
          existingQ.lastAskedAt = new Date();
          await existingQ.save();
        } else {
          await UnansweredQuestion.create({
            clinicId: clinic._id,
            question: message.trim(),
            count: 1,
            lastAskedAt: new Date()
          });
        }
      } catch (err: any) {
        console.error('[UNANSWERED QUESTION ERROR]', err.message);
      }
    }

    // 5. Automatic Lead Creation & Linking (M2.6)
    let linkedLead = null;
    let isNewLeadCreated = false;
    const shouldQualifyLead =
      aiResult.phone ||
      aiResult.appointmentRequested ||
      aiResult.leadScore >= 50 ||
      aiResult.treatment;

    if (shouldQualifyLead) {
      if (conversation.leadId) {
        // Update existing lead
        linkedLead = await Lead.findById(conversation.leadId);
        if (linkedLead) {
          const prevHadContact = Boolean(linkedLead.phone && linkedLead.phone !== 'In chat conversation');
          const prevHadName = Boolean(linkedLead.patientName && linkedLead.patientName !== 'Website Chat Visitor' && !linkedLead.patientName.startsWith('Patient ('));

          if (aiResult.patientName && aiResult.patientName !== linkedLead.patientName) {
            linkedLead.patientName = aiResult.patientName;
          }
          if (aiResult.phone && (linkedLead.phone === 'In chat conversation' || !linkedLead.phone || aiResult.phone !== linkedLead.phone)) {
            linkedLead.phone = aiResult.phone;
          }
          if (aiResult.patientEmail && !linkedLead.email) {
            linkedLead.email = aiResult.patientEmail;
          }
          if (aiResult.treatment) linkedLead.requirement = aiResult.treatment;
          linkedLead.leadScore = Math.max(linkedLead.leadScore, aiResult.leadScore);
          if (aiResult.appointmentRequested && linkedLead.status !== 'Appointment Booked') {
            linkedLead.status = 'Appointment Booked';
            // Module 4: Cancel pending follow-ups when appointment is booked
            await cancelPendingFollowUpsForLead(linkedLead._id);
          }
          linkedLead.notes.push({
            content: `AI Receptionist Update: "${message.trim()}" -> Intent: ${aiResult.intent}, Urgency: ${aiResult.urgency}`,
            author: 'AI Receptionist'
          } as any);
          await linkedLead.save();

          const nowHasContact = Boolean(linkedLead.phone && linkedLead.phone !== 'In chat conversation');
          const nowHasName = Boolean(linkedLead.patientName && linkedLead.patientName !== 'Website Chat Visitor' && !linkedLead.patientName.startsWith('Patient ('));

          // Dispatch notification to clinic when real contact info arrives
          if ((!prevHadContact && nowHasContact) || (!prevHadName && nowHasName && nowHasContact)) {
            await EmailService.sendLeadNotification(clinic.email, {
              patientName: linkedLead.patientName,
              phone: linkedLead.phone,
              email: linkedLead.email || aiResult.patientEmail,
              age: aiResult.draft?.age,
              requirement: linkedLead.requirement,
              leadScore: linkedLead.leadScore,
              source: linkedLead.source,
              assignedTo: linkedLead.assignedTo,
              date: aiResult.preferredDate,
              time: aiResult.preferredTime
            });
          }
        }
      } else {
        // Module 11: Multi-Employee Treatment Routing
        let assignedStaff = 'Reception Desk';
        if (clinic.staff && clinic.staff.length > 0) {
          const matched = clinic.staff.find((s: any) =>
            s.treatments?.some((t: string) =>
              aiResult.treatment?.toLowerCase().includes(t.toLowerCase()) ||
              t.toLowerCase().includes(aiResult.treatment?.toLowerCase() || '')
            )
          );
          if (matched) {
            assignedStaff = matched.name;
          } else {
            assignedStaff = clinic.staff[0].name;
          }
        } else if (aiResult.treatment && (aiResult.treatment.includes('Implant') || aiResult.treatment.includes('Surgery') || aiResult.treatment.includes('TMJ'))) {
          assignedStaff = 'Dr. Sandesh Jain';
        } else {
          assignedStaff = 'Dr. Saumya Jain';
        }

        // Create new lead in CRM
        linkedLead = await Lead.create({
          clinicId: clinic._id,
          patientName: aiResult.patientName || (aiResult.phone ? `Patient (${aiResult.phone.slice(-4)})` : 'Website Chat Visitor'),
          phone: aiResult.phone || 'In chat conversation',
          email: aiResult.patientEmail || '',
          requirement: aiResult.treatment || `${aiResult.intent}: ${message.slice(0, 80)}`,
          source: 'Website',
          status: aiResult.appointmentRequested ? 'Appointment Booked' : 'New',
          leadScore: aiResult.leadScore,
          assignedTo: assignedStaff,
          notes: [
            {
              content: `Lead auto-created by AI Receptionist. Initial Enquiry: "${message.trim()}" | Intent: ${aiResult.intent} | Score: ${aiResult.leadScore} | Assigned: ${assignedStaff}`,
              author: 'AI Digital Receptionist'
            }
          ]
        });

        conversation.leadId = linkedLead._id as any;
        isNewLeadCreated = true;

        // Only send clinic alert email when real contact phone or name has been collected
        const hasRealContact = Boolean(aiResult.phone && aiResult.phone !== 'In chat conversation');
        const hasRealName = Boolean(aiResult.patientName && aiResult.patientName !== 'Website Chat Visitor');
        if (hasRealContact || hasRealName) {
          await EmailService.sendLeadNotification(clinic.email, {
            patientName: linkedLead.patientName,
            phone: linkedLead.phone,
            email: linkedLead.email || aiResult.patientEmail,
            age: aiResult.draft?.age,
            requirement: linkedLead.requirement,
            leadScore: linkedLead.leadScore,
            source: linkedLead.source,
            assignedTo: linkedLead.assignedTo,
            date: aiResult.preferredDate,
            time: aiResult.preferredTime
          });
        }

        // Module 4: Auto-schedule FollowUp 2 days out if score is 31–80 and not booked
        if (linkedLead.leadScore >= 31 && linkedLead.leadScore <= 80 && linkedLead.status !== 'Appointment Booked') {
          await scheduleFollowUpForLead(linkedLead);
        }
      }

      // Only create or confirm an Appointment record when all fields are collected AND patient confirms
      if (aiResult.draftCard && aiResult.draftCard.status === 'confirmed' && linkedLead) {
        const card = aiResult.draftCard;
        let existingApt = await Appointment.findOne({
          $or: [
            { leadId: linkedLead._id },
            { phone: card.phone, status: { $in: ['Requested', 'Confirmed'] } }
          ]
        });

        if (existingApt) {
          existingApt.patientName = card.patientName;
          existingApt.phone = card.phone;
          if (card.patientEmail) existingApt.patientEmail = card.patientEmail;
          existingApt.doctorName = card.doctorName;
          existingApt.date = card.date;
          existingApt.startTime = card.time;
          existingApt.status = 'Confirmed';
          existingApt.confirmedAt = new Date();
          existingApt.notes = `Confirmed via AI Chat. Treatment: ${card.primaryComplaint}.`;
          await existingApt.save();
          console.log(`[APPOINTMENT CONFIRMED & UPDATED] ID: ${existingApt._id} for ${existingApt.patientName}`);

          try {
            const { sendPatientConfirmationInvite } = await import('../modules/appointments/confirmationService.js');
            await sendPatientConfirmationInvite(existingApt._id);
          } catch (invErr: any) {
            console.error('[CHAT CONFIRMATION INVITE ERROR]', invErr.message);
          }
        } else {
          const newApt = await Appointment.create({
            clinicId: clinic._id,
            leadId: linkedLead._id,
            patientName: card.patientName,
            phone: card.phone,
            patientEmail: card.patientEmail || '',
            doctorName: card.doctorName,
            date: card.date,
            startTime: card.time,
            endTime: '30 mins slot',
            status: 'Confirmed',
            confirmedAt: new Date(),
            notes: `Confirmed via AI Chat. Treatment: ${card.primaryComplaint}.`
          });
          console.log(`[APPOINTMENT CONFIRMED & CREATED] ID: ${newApt._id} for ${newApt.patientName} (${newApt.phone}) on ${newApt.date} at ${newApt.startTime}`);

          try {
            const { sendPatientConfirmationInvite } = await import('../modules/appointments/confirmationService.js');
            await sendPatientConfirmationInvite(newApt._id);
          } catch (invErr: any) {
            console.error('[CHAT CONFIRMATION INVITE ERROR]', invErr.message);
          }
        }
      }
    }

    await conversation.save();

    // 6. Save AI reply message
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      sender: 'assistant',
      text: aiResult.reply,
      metadata: {
        intent: aiResult.intent,
        urgency: aiResult.urgency,
        treatment: aiResult.treatment,
        appointmentRequested: aiResult.appointmentRequested,
        leadScore: aiResult.leadScore,
        leadCreated: !!linkedLead,
        draftCard: aiResult.draftCard,
        showSummaryCard: aiResult.showSummaryCard,
        draft: aiResult.draft
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
          appointmentRequested: aiResult.appointmentRequested,
          leadScore: aiResult.leadScore,
          leadCreated: !!linkedLead,
          leadId: linkedLead?._id,
          draftCard: aiResult.draftCard,
          showSummaryCard: aiResult.showSummaryCard,
          draft: aiResult.draft
        },
        conversation,
        assistantMessage
      }
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
