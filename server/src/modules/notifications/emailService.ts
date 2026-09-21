import { dispatchEmail } from '../../integrations/email/nodemailerTransport.js';

export interface IEmailService {
  sendLeadNotification(clinicEmail: string, leadData: {
    patientName: string;
    phone: string;
    requirement: string;
    leadScore: number;
    source: string;
    assignedTo?: string;
    age?: number | string;
    email?: string;
    date?: string;
    time?: string;
  }): Promise<void>;

  sendAppointmentConfirmation(patientEmail: string, appointmentData: {
    patientName: string;
    doctorName: string;
    date: string;
    startTime: string;
    clinicName?: string;
    address?: string;
  }): Promise<void>;

  sendFollowUp(patientEmail: string, followUpData: {
    patientName: string;
    requirement: string;
    clinicName?: string;
    clinicPhone?: string;
  }): Promise<void>;

  sendHumanHandoff(clinicEmail: string, handoffData: {
    patientName?: string;
    phone?: string;
    reason: string;
    summary?: string;
    conversationId: string;
    lastMessage?: string;
  }): Promise<void>;
}

class EmailServiceImpl implements IEmailService {
  /**
   * 1. Alert clinic admin/receptionists when a new patient lead is captured
   */
  async sendLeadNotification(clinicEmail: string, leadData: {
    patientName: string;
    phone: string;
    requirement: string;
    leadScore: number;
    source: string;
    assignedTo?: string;
    age?: number | string;
    email?: string;
    date?: string;
    time?: string;
  }): Promise<void> {
    try {
      // If clinic email is missing or dummy unconfigured domain, use configured SMTP admin email
      let recipient = clinicEmail;
      if (!recipient || recipient.includes('indoredental.com')) {
        recipient = process.env.SMTP_USER || 'raghvendrapratapsingh505@gmail.com';
      }

      const subject = `[New Patient Lead] ${leadData.patientName} - Score: ${leadData.leadScore}/100`;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const crmLeadsUrl = `${clientUrl}/leads`;

      const scoreColor = leadData.leadScore >= 80 ? '#0f766e' : leadData.leadScore >= 50 ? '#d97706' : '#64748b';
      const scoreBadge = leadData.leadScore >= 80 ? '🔥 High Priority' : leadData.leadScore >= 50 ? '⚡ Warm Lead' : '❄️ Enquiry';

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; background: #f8fafc; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 24px; border-radius: 16px 16px 0 0; text-align: center; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              AI Clinical Lead Alert
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Indore Poly Dental Clinic</h1>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">1/4, near 56 Shops, New Palasia, Indore</p>
          </div>

          <div style="padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">New Patient Captured</span>
                <h2 style="margin: 4px 0 0; color: #0f172a; font-size: 20px; font-weight: 800;">${leadData.patientName}</h2>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; background: #f0fdfa; color: ${scoreColor}; border: 1px solid ${scoreColor}40; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  Score: ${leadData.leadScore}/100 • ${scoreBadge}
                </span>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 35%; font-weight: 600;">👤 Patient Name:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${leadData.patientName}</td>
                </tr>
                ${leadData.age ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">🎂 Patient Age:</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${leadData.age} Years</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">📞 Contact Phone:</td>
                  <td style="padding: 8px 0; font-weight: 700;">
                    <a href="tel:${leadData.phone}" style="color: #0f766e; text-decoration: none; font-size: 15px;">${leadData.phone}</a>
                  </td>
                </tr>
                ${leadData.email ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">✉️ Email Address:</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">
                    <a href="mailto:${leadData.email}" style="color: #0f766e; text-decoration: none;">${leadData.email}</a>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">🩺 Dental Concern:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${leadData.requirement}</td>
                </tr>
                ${(leadData.date || leadData.time) ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">📅 Preferred Slot:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #0f766e;">${leadData.date || ''} ${leadData.time ? `at ${leadData.time}` : ''}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">👨‍⚕️ Assigned Specialist:</td>
                  <td style="padding: 8px 0; color: #0f766e; font-weight: 700;">${leadData.assignedTo || 'Clinical Team'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">📡 Channel Source:</td>
                  <td style="padding: 8px 0; color: #475569; font-weight: 600;">${leadData.source}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0 10px;">
              <a href="${crmLeadsUrl}" style="background: linear-gradient(135deg, #0f766e, #0d9488); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
                Open Lead in Clinic CRM →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              Indore Poly Dental Clinic AI Operating System • Automated Clinical Notification
            </p>
          </div>
        </div>
      `;

      await dispatchEmail({ to: recipient, subject, html });
    } catch (error: any) {
      console.error('[EMAIL SERVICE ERROR] sendLeadNotification failed safely:', error.message);
    }
  }

  /**
   * 2. Confirm booking to patient with doctor & clinic details
   */
  async sendAppointmentConfirmation(patientEmail: string, appointmentData: {
    patientName: string;
    doctorName: string;
    date: string;
    startTime: string;
    clinicName?: string;
    address?: string;
  }): Promise<void> {
    try {
      if (!patientEmail) return;

      const clinic = appointmentData.clinicName || 'Indore Poly Dental Clinic';
      const address = appointmentData.address || '1/4, near 56 Shops, New Palasia, Indore, MP 452001';
      const subject = `Appointment Confirmed: ${clinic} on ${appointmentData.date}`;

      const title = encodeURIComponent(`Dental Consultation with ${appointmentData.doctorName}`);
      const details = encodeURIComponent(`Appointment at ${clinic}\nDoctor: ${appointmentData.doctorName}\nAddress: ${address}\nContact: +91 98270 12345`);
      const location = encodeURIComponent(address);
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; background: #f8fafc; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 16px 16px 0 0; text-align: center; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ✅ Appointment Confirmed
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">${clinic}</h1>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">1/4, near 56 Shops, New Palasia, Indore</p>
          </div>

          <div style="padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #059669; margin-top: 0; font-size: 18px;">Your Consultation Is Officially Booked</h2>
            <p>Dear <strong>${appointmentData.patientName}</strong>,</p>
            <p>Thank you for confirming your visit. We have locked in your chair time with <strong>${appointmentData.doctorName}</strong>.</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 4px 0; color: #475569; width: 35%;"><strong>Doctor:</strong></td><td style="font-weight: 600; color: #0f172a;">${appointmentData.doctorName}</td></tr>
                <tr><td style="padding: 4px 0; color: #475569;"><strong>Date:</strong></td><td style="font-weight: 600; color: #0f172a;">${appointmentData.date}</td></tr>
                <tr><td style="padding: 4px 0; color: #475569;"><strong>Time Slot:</strong></td><td style="font-weight: 700; color: #059669;">${appointmentData.startTime}</td></tr>
                <tr><td style="padding: 4px 0; color: #475569;"><strong>Location:</strong></td><td style="color: #475569;">${address}</td></tr>
              </table>
            </div>

            <div style="text-align: center; margin: 26px 0;">
              <a href="${googleCalendarUrl}" target="_blank" style="background: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
              Please arrive 10 minutes prior to your scheduled slot.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              Need to reschedule? Call our front desk directly at +91 98270 12345.
            </p>
          </div>
        </div>
      `;

      await dispatchEmail({ to: patientEmail, subject, html });
    } catch (error: any) {
      console.error('[EMAIL SERVICE ERROR] sendAppointmentConfirmation failed safely:', error.message);
    }
  }

  /**
   * 3. Send automated check-in / follow-up email to interested patient
   */
  async sendFollowUp(patientEmail: string, followUpData: {
    patientName: string;
    requirement: string;
    clinicName?: string;
    clinicPhone?: string;
  }): Promise<void> {
    try {
      if (!patientEmail) return;

      const clinic = followUpData.clinicName || 'Indore Poly Dental Clinic';
      const phone = followUpData.clinicPhone || '+91 98270 12345';
      const subject = `Following up regarding your ${followUpData.requirement || 'dental enquiry'} - ${clinic}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0f766e;">Following up on your visit to ${clinic}</h2>
          <p>Dear ${followUpData.patientName},</p>
          <p>
            We noticed you inquired about <strong>${followUpData.requirement || 'specialized dental care'}</strong> with our team at ${clinic}.
            Dr. Sandesh Jain and Dr. Saumya Jain are available this week for detailed consultations.
          </p>
          <p>
            Would you like us to reserve a convenient slot for you? You can reply to this email, or call our clinic desk directly at <strong>${phone}</strong>.
          </p>
          <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
            Indore Poly Dental Clinic | 1/4, near 56 Shops, New Palasia, Indore, MP 452001
          </p>
        </div>
      `;

      await dispatchEmail({ to: patientEmail, subject, html });
    } catch (error: any) {
      console.error('[EMAIL SERVICE ERROR] sendFollowUp failed safely:', error.message);
    }
  }

  /**
   * 4. Urgent Human Handoff notification to clinic admin
   */
  async sendHumanHandoff(clinicEmail: string, handoffData: {
    patientName?: string;
    phone?: string;
    reason: string;
    summary?: string;
    conversationId: string;
    lastMessage?: string;
  }): Promise<void> {
    try {
      let recipient = clinicEmail;
      if (!recipient || recipient.includes('indoredental.com')) {
        recipient = process.env.SMTP_USER || 'raghvendrapratapsingh505@gmail.com';
      }

      const subject = `🚨 [URGENT HUMAN HANDOFF] Patient Requires Assistance (${handoffData.patientName || 'Visitor'})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #b91c1c; border-bottom: 2px solid #b91c1c; padding-bottom: 8px;">
            ⚠️ Human Handoff Escalation Alert
          </h2>
          <p>A conversation on the AI Front Desk has been escalated for direct human staff attention:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Patient Name:</td><td>${handoffData.patientName || 'Anonymous Web Visitor'}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Contact Phone:</td><td>${handoffData.phone ? `<a href="tel:${handoffData.phone}">${handoffData.phone}</a>` : 'Not provided yet'}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #b91c1c;">Escalation Reason:</td><td><strong>${handoffData.reason}</strong></td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Conversation Summary:</td><td>${handoffData.summary || 'Visitor inquired on website chat.'}</td></tr>
            ${handoffData.lastMessage ? `<tr><td style="padding: 6px; font-weight: bold;">Last Message:</td><td><em>"${handoffData.lastMessage}"</em></td></tr>` : ''}
          </table>
          <div style="margin-top: 24px;">
            <a href="http://localhost:5173/handoff" style="background-color: #0f766e; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Open Handoff Queue in CRM
            </a>
          </div>
        </div>
      `;

      await dispatchEmail({ to: recipient, subject, html });
    } catch (error: any) {
      console.error('[EMAIL SERVICE ERROR] sendHumanHandoff failed safely:', error.message);
    }
  }
}

export const EmailService: IEmailService = new EmailServiceImpl();
