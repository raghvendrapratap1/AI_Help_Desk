import crypto from 'crypto';
import { Appointment } from '../../models/Appointment.js';
import { EmailService } from '../notifications/emailService.js';
import { getWhatsAppProvider } from '../../integrations/whatsapp/whatsappProvider.js';
import { Clinic } from '../../models/Clinic.js';
import { Lead } from '../../models/Lead.js';

export function generateConfirmationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function buildConfirmationUrl(token: string): string {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl}/confirm-appointment/${token}`;
}

export async function sendPatientConfirmationInvite(appointmentId: string | any): Promise<{ success: boolean; token?: string }> {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return { success: false };

    let clinic = await Clinic.findById(appointment.clinicId);
    if (!clinic) clinic = await Clinic.findOne();

    const clinicName = clinic?.name || 'Indore Poly Dental Clinic';
    const clinicPhone = clinic?.phone || '+91 98270 12345';
    const clinicAddress = clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001';

    if (!appointment.confirmationToken) {
      appointment.confirmationToken = generateConfirmationToken();
      await appointment.save();
    }

    const token = appointment.confirmationToken;
    const confirmUrl = buildConfirmationUrl(token);

    console.log(`[CONFIRMATION INVITE] Generated token for ${appointment.patientName}: ${confirmUrl}`);

    if (appointment.patientEmail) {
      const subject = `Action Required: Confirm Your Appointment at ${clinicName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 24px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px;">${clinicName}</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">1/4, near 56 Shops, New Palasia, Indore</p>
          </div>
          <div style="padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; background: #ffffff;">
            <h2 style="color: #0f766e; margin-top: 0;">Please Confirm Your Appointment Slot</h2>
            <p>Dear <strong>${appointment.patientName}</strong>,</p>
            <p>Our AI Digital Receptionist has reserved your consultation with <strong>${appointment.doctorName}</strong>. Please confirm your attendance with one click below to lock in your chair time:</p>
            
            <div style="background-color: #f0fdfa; border-left: 4px solid #0f766e; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
              ${appointment.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${appointment.phone}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Doctor:</strong> ${appointment.doctorName}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${appointment.startTime}</p>
              ${appointment.notes ? `<p style="margin: 4px 0;"><strong>Treatment / Notes:</strong> ${appointment.notes}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Location:</strong> ${clinicAddress}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background-color: #0d9488; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
                ✅ Yes, Confirm My Appointment
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
              Or copy this link to your browser: <br/>
              <a href="${confirmUrl}" style="color: #0f766e; word-break: break-all;">${confirmUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              Need to reschedule? Call our front desk directly at ${clinicPhone}.
            </p>
          </div>
        </div>
      `;

      const { dispatchEmail } = await import('../../integrations/email/nodemailerTransport.js');
      await dispatchEmail({ to: appointment.patientEmail, subject, html });
      console.log(`[CONFIRMATION EMAIL SENT] Sent invite to ${appointment.patientEmail}`);
    }

    if (appointment.phone) {
      const whatsapp = getWhatsAppProvider();
      const message = `Hello ${appointment.patientName}! Your consultation with ${appointment.doctorName} at ${clinicName} is reserved for ${appointment.date} at ${appointment.startTime}. Please click here to confirm your slot: ${confirmUrl}`;
      await whatsapp.sendMessage({
        to: appointment.phone,
        body: message,
        clinicId: appointment.clinicId.toString()
      });
    }

    return { success: true, token };
  } catch (err: any) {
    console.error('[CONFIRMATION INVITE ERROR]', err);
    return { success: false };
  }
}

export async function confirmAppointmentByToken(token: string) {
  const appointment = await Appointment.findOne({ confirmationToken: token });
  if (!appointment) {
    return { success: false, error: 'Invalid or expired confirmation link.' };
  }

  let clinic = await Clinic.findById(appointment.clinicId);
  if (!clinic) clinic = await Clinic.findOne();

  appointment.status = 'Confirmed';
  appointment.confirmedAt = new Date();
  await appointment.save();

  if (appointment.leadId) {
    const lead = await Lead.findById(appointment.leadId);
    if (lead) {
      lead.status = 'Appointment Booked';
      lead.leadScore = 100;
      lead.notes.push({
        content: `Patient verified attendance via one-click confirmation link for ${appointment.date} at ${appointment.startTime}.`,
        author: 'Patient Self-Service'
      } as any);
      await lead.save();
    }
  }

  if (appointment.patientEmail) {
    await EmailService.sendAppointmentConfirmation(appointment.patientEmail, {
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: appointment.date,
      startTime: appointment.startTime,
      clinicName: clinic?.name || 'Indore Poly Dental Clinic',
      address: clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001'
    });
  }

  return {
    success: true,
    data: {
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: appointment.date,
      startTime: appointment.startTime,
      status: appointment.status,
      clinicName: clinic?.name || 'Indore Poly Dental Clinic',
      address: clinic?.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
      phone: clinic?.phone || '+91 98270 12345'
    }
  };
}
