import { Router, Request, Response } from 'express';
import { Clinic } from '../models/Clinic.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';

const router = Router();

// Public / Authenticated route to get Anchor Clinic Info
router.get('/', async (req: Request, res: Response) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'No clinic found' });
    }

    const totalLeads = await Lead.countDocuments({ clinicId: clinic._id });
    const newLeads = await Lead.countDocuments({ clinicId: clinic._id, status: 'New' });
    const bookedAppointments = await Appointment.countDocuments({ clinicId: clinic._id, status: 'Confirmed' });

    return res.json({
      success: true,
      data: {
        id: clinic._id,
        name: clinic.name,
        tagline: clinic.tagline,
        address: clinic.address,
        city: clinic.city,
        phone: clinic.phone,
        email: clinic.email,
        operatingHours: clinic.operatingHours,
        doctors: clinic.doctors,
        services: clinic.services,
        stats: {
          totalLeads,
          newLeads,
          bookedAppointments
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
