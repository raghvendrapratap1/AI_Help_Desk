import { Router, Response } from 'express';
import { Appointment } from '../models/Appointment.js';
import { Lead } from '../models/Lead.js';
import { Clinic } from '../models/Clinic.js';
import { Conversation } from '../models/Conversation.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';
import { EmailService } from '../modules/notifications/emailService.js';
import { cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';
import { getCalendarProvider } from '../integrations/calendar/calendarProvider.js';
import { checkSlotsForDoctor, ALL_CLINIC_SLOTS } from '../modules/appointments/slotService.js';

const router = Router();

// Create Appointment tied to Lead or direct
router.post('/', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, patientName, phone, doctorName, date, startTime, endTime, status, notes } = req.body;

    if (!patientName || !phone || !doctorName || !date || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'Patient name, phone, doctor name, date, and start time are required'
      });
    }

    let clinicId = req.user?.clinicId;
    let clinicDoc = null;
    if (!clinicId) {
      clinicDoc = await Clinic.findOne();
      if (!clinicDoc) {
        return res.status(400).json({ success: false, error: 'No active clinic found' });
      }
      clinicId = clinicDoc._id.toString();
    } else {
      clinicDoc = await Clinic.findById(clinicId);
    }

    const appointment = await Appointment.create({
      clinicId,
      leadId: leadId || undefined,
      patientName,
      phone,
      doctorName,
      date,
      startTime,
      endTime: endTime || startTime,
      status: status || 'Requested',
      notes: notes || ''
    });

    // If tied to a lead, update lead status to Appointment Booked automatically
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) {
        lead.status = 'Appointment Booked';
        lead.notes.push({
          content: `Appointment scheduled with ${doctorName} on ${date} at ${startTime}`,
          author: req.user?.email || 'Admin',
          createdAt: new Date()
        } as any);
        await lead.save();

        // Module 4: Cancel pending follow-ups once appointment is booked
        await cancelPendingFollowUpsForLead(lead._id);

        // Module 3: Send appointment confirmation email
        await EmailService.sendAppointmentConfirmation(lead.email || '', {
          patientName,
          doctorName,
          date,
          startTime,
          clinicName: clinicDoc?.name,
          address: clinicDoc?.address
        });
      }
    }

    // Module 10: Sync with Calendar Provider (Google Calendar / Internal Fallback)
    const calendarProvider = getCalendarProvider();
    const calResult = await calendarProvider.createEvent({
      appointmentId: appointment._id.toString(),
      summary: `Dental Appointment: ${patientName} - ${doctorName}`,
      description: `Appointment for ${patientName} (${phone}). Notes: ${notes || 'None'}`,
      doctorName,
      patientName,
      date,
      startTime,
      endTime: endTime || startTime,
      clinicAddress: clinicDoc?.address || 'Indore Poly Dental Clinic'
    });
    if (calResult.externalEventId) {
      appointment.calendarEventId = calResult.externalEventId;
      await appointment.save();
    }

    return res.status(201).json({ success: true, data: appointment, calendarSync: calResult.status });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get Appointments (with optional date or leadId filter)
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { date, leadId, doctorName } = req.query;

    const query: any = {};
    if (req.user?.clinicId) {
      query.clinicId = req.user.clinicId;
    }

    if (date) query.date = date;
    if (leadId) query.leadId = leadId;
    if (doctorName && doctorName !== 'All') query.doctorName = doctorName;

    const appointments = await Appointment.find(query).sort({ date: 1, startTime: 1 });

    return res.json({ success: true, data: appointments });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update Appointment Status
router.put('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { status, date, startTime, endTime, doctorName, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (startTime) appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    if (doctorName) appointment.doctorName = doctorName;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    return res.json({ success: true, data: appointment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete / Cancel Appointment
router.delete('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (appointment.calendarEventId) {
      const calendarProvider = getCalendarProvider();
      await calendarProvider.cancelEvent(appointment.calendarEventId);
    }

    return res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public Endpoint: GET /api/appointments/verify/:token
 * Used by patient confirmation page to display appointment details before confirming
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const appointment = await Appointment.findOne({ confirmationToken: token });
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found or link has expired' });
    }

    let clinic = await Clinic.findById(appointment.clinicId);
    if (!clinic) clinic = await Clinic.findOne();

    return res.json({
      success: true,
      data: {
        appointmentId: appointment._id,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        patientEmail: appointment.patientEmail,
        phone: appointment.phone,
        confirmedAt: appointment.confirmedAt,
        clinicName: clinic?.name || 'Indore Poly Dental Clinic',
        address: clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
        clinicPhone: clinic?.phone || '+91 98270 12345'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public Endpoint: POST /api/appointments/confirm/:token
 * Patient clicks "Confirm My Appointment" -> transitions to Confirmed and sends confirmation receipt
 */
router.post('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { confirmAppointmentByToken } = await import('../modules/appointments/confirmationService.js');
    const result = await confirmAppointmentByToken(token);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public Endpoint: POST /api/appointments/confirm-draft
 * Directly confirms an appointment from the in-chat draft card, creates/updates record, and dispatches email
 */
router.post('/confirm-draft', async (req, res) => {
  try {
    const payload = req.body.draft ? { ...req.body.draft, ...req.body } : req.body;
    const patientName = payload.patientName;
    const phone = payload.phone;
    const patientEmail = payload.patientEmail;
    const doctorName = payload.doctorName;
    const date = payload.date || payload.preferredDate;
    const time = payload.time || payload.preferredTime;
    const primaryComplaint = payload.primaryComplaint;
    const notes = payload.notes;
    const appointmentId = payload.appointmentId;
    const conversationId = payload.conversationId;

    let clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(500).json({ success: false, error: 'Clinic not configured' });
    }

    const { generateConfirmationToken, sendPatientConfirmationInvite } = await import('../modules/appointments/confirmationService.js');

    let appointment;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
    }

    if (!appointment && phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      appointment = await Appointment.findOne({ phone: cleanPhone }).sort({ createdAt: -1 });
    }

    if (!appointment) {
      const token = generateConfirmationToken();
      appointment = await Appointment.create({
        clinicId: clinic._id,
        patientName: patientName || 'Patient',
        phone: phone || '9691395507',
        patientEmail: patientEmail || '',
        doctorName: doctorName || 'Dr. Sandesh Jain',
        date: date || new Date().toISOString().split('T')[0],
        startTime: time || '11:00 AM',
        endTime: '30 mins slot',
        status: 'Confirmed',
        notes: notes || primaryComplaint || 'Confirmed via AI Chat Widget',
        confirmationToken: token,
        confirmedAt: new Date()
      });
    } else {
      if (patientName) appointment.patientName = patientName;
      if (phone) appointment.phone = phone;
      if (patientEmail) appointment.patientEmail = patientEmail;
      if (doctorName) appointment.doctorName = doctorName;
      if (date) appointment.date = date;
      if (time) appointment.startTime = time;
      if (notes || primaryComplaint) appointment.notes = notes || primaryComplaint;
      appointment.status = 'Confirmed';
      appointment.confirmedAt = new Date();
      if (!appointment.confirmationToken) {
        appointment.confirmationToken = generateConfirmationToken();
      }
      await appointment.save();
    }

    // Dispatch confirmation email to patient
    if (appointment.patientEmail) {
      try {
        await sendPatientConfirmationInvite(appointment._id);
      } catch (e: any) {
        console.warn('[CONFIRM DRAFT EMAIL WARNING]', e.message);
      }
    }

    if (conversationId) {
      try {
        await Conversation.findByIdAndUpdate(conversationId, {
          'appointmentDraft.status': 'confirmed'
        });
      } catch (convErr: any) {
        console.warn('[CONFIRM DRAFT CONVERSATION SYNC WARNING]', convErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Appointment confirmed successfully!',
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
        patientName: appointment.patientName,
        phone: appointment.phone,
        patientEmail: appointment.patientEmail,
        doctorName: appointment.doctorName,
        date: appointment.date,
        time: appointment.startTime,
        confirmationToken: appointment.confirmationToken,
        confirmedAt: appointment.confirmedAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public / Authenticated Endpoint: GET /api/appointments/check-slots
 * Queries existing bookings for a doctor and date, returning open 30-min slots
 */
router.get('/check-slots', async (req, res) => {
  try {
    const { date, doctorName } = req.query as { date: string; doctorName?: string };
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date (YYYY-MM-DD) is required' });
    }

    const availableSlots = await checkSlotsForDoctor(date, doctorName);
    const bookedCount = ALL_CLINIC_SLOTS.length - availableSlots.length;

    return res.json({
      success: true,
      data: {
        date,
        doctorName: doctorName || 'Any Specialist',
        totalSlots: ALL_CLINIC_SLOTS.length,
        bookedCount,
        availableSlots
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public Endpoint: POST /api/appointments/update-patient
 * Allows real-time correction of email or phone from the interactive screen card
 */
router.post('/update-patient', async (req, res) => {
  try {
    const {
      token,
      appointmentId,
      patientEmail,
      patientName,
      phone,
      doctorName,
      date,
      time,
      primaryComplaint,
      notes
    } = req.body;

    let appointment;
    if (token) {
      appointment = await Appointment.findOne({ confirmationToken: token });
    } else if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      appointment = await Appointment.findOne({ phone: cleanPhone }).sort({ createdAt: -1 });
    }

    if (!appointment) {
      appointment = await Appointment.findOne().sort({ createdAt: -1 });
    }

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (patientEmail !== undefined) appointment.patientEmail = patientEmail.trim();
    if (patientName !== undefined) appointment.patientName = patientName.trim();
    if (phone !== undefined) appointment.phone = phone.trim();
    if (doctorName !== undefined) appointment.doctorName = doctorName.trim();
    if (date !== undefined) appointment.date = date.trim();
    if (time !== undefined) appointment.startTime = time.trim();
    if (notes !== undefined || primaryComplaint !== undefined) {
      appointment.notes = notes || primaryComplaint;
    }

    await appointment.save();

    // Re-dispatch confirmation invite with the updated details
    const { sendPatientConfirmationInvite } = await import('../modules/appointments/confirmationService.js');
    await sendPatientConfirmationInvite(appointment._id);

    return res.json({
      success: true,
      message: 'All appointment details updated and confirmation email re-dispatched!',
      data: {
        appointmentId: appointment._id,
        patientEmail: appointment.patientEmail,
        patientName: appointment.patientName,
        phone: appointment.phone,
        doctorName: appointment.doctorName,
        date: appointment.date,
        time: appointment.startTime,
        status: appointment.status,
        confirmationToken: appointment.confirmationToken
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
