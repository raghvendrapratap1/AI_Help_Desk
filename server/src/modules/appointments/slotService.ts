import { Appointment } from '../../models/Appointment.js';

export const ALL_CLINIC_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

/**
 * Check open 30-minute consultation slots for a doctor on a specific date (YYYY-MM-DD)
 */
export async function checkSlotsForDoctor(date: string, doctorName?: string): Promise<string[]> {
  const filter: any = {
    date,
    status: { $in: ['Requested', 'Confirmed'] }
  };

  if (doctorName) {
    const cleanDoc = doctorName.replace(/dr\.?/i, '').trim();
    filter.doctorName = new RegExp(cleanDoc, 'i');
  }

  const existingAppointments = await Appointment.find(filter);
  const bookedTimes = new Set(
    existingAppointments.map(a => (a.startTime || '').trim().toUpperCase())
  );

  return ALL_CLINIC_SLOTS.filter(slot => !bookedTimes.has(slot.toUpperCase()));
}
