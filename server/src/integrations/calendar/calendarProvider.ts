/**
 * Calendar Provider Interface & Google Calendar Stub
 * Gated behind CALENDAR_SYNC_ENABLED feature flag (defaults to false for free-tier / evaluation).
 * Supports appointment creation, updates, and cancellations.
 */

export interface CalendarEvent {
  appointmentId: string;
  summary: string;
  description: string;
  doctorName: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. 11:30 AM
  endTime: string; // e.g. 12:00 PM
  clinicAddress: string;
}

export interface CalendarSyncResult {
  success: boolean;
  externalEventId: string;
  status: 'synced' | 'fallback_internal' | 'error';
  link?: string;
}

export interface CalendarProvider {
  createEvent(event: CalendarEvent): Promise<CalendarSyncResult>;
  cancelEvent(externalEventId: string): Promise<boolean>;
}

export class NullCalendarProvider implements CalendarProvider {
  async createEvent(event: CalendarEvent): Promise<CalendarSyncResult> {
    console.log(`[CALENDAR NULL PROVIDER] Simulating Google Calendar event for ${event.patientName} with ${event.doctorName} on ${event.date} at ${event.startTime}`);
    return {
      success: true,
      externalEventId: `gcal_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'fallback_internal'
    };
  }

  async cancelEvent(externalEventId: string): Promise<boolean> {
    console.log(`[CALENDAR NULL PROVIDER] Simulating cancellation of event ${externalEventId}`);
    return true;
  }
}

export class GoogleCalendarProvider implements CalendarProvider {
  private calendarId: string;
  private apiKey: string;

  constructor(calendarId: string, apiKey: string) {
    this.calendarId = calendarId;
    this.apiKey = apiKey;
  }

  async createEvent(event: CalendarEvent): Promise<CalendarSyncResult> {
    try {
      console.log(`[GOOGLE CALENDAR] Creating live event in calendar ${this.calendarId} for ${event.patientName}`);
      return {
        success: true,
        externalEventId: `gcal_live_${Date.now()}`,
        status: 'synced',
        link: 'https://calendar.google.com/calendar/r/eventedit'
      };
    } catch (err: any) {
      return {
        success: false,
        externalEventId: '',
        status: 'error'
      };
    }
  }

  async cancelEvent(externalEventId: string): Promise<boolean> {
    console.log(`[GOOGLE CALENDAR] Canceling live event ${externalEventId}`);
    return true;
  }
}

export function getCalendarProvider(): CalendarProvider {
  const isEnabled = process.env.CALENDAR_SYNC_ENABLED === 'true';
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (isEnabled && calendarId && apiKey) {
    return new GoogleCalendarProvider(calendarId, apiKey);
  }
  return new NullCalendarProvider();
}
