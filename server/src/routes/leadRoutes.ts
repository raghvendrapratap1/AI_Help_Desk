import { Router, Response } from 'express';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Clinic } from '../models/Clinic.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';
import { scheduleFollowUpForLead, cancelPendingFollowUpsForLead } from '../modules/followUps/scheduler.js';

const router = Router();

// Create Lead (Manual CRUD)
router.post('/', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { patientName, phone, email, requirement, source, status, leadScore, assignedTo, note } = req.body;

    if (!patientName || !phone || !requirement) {
      return res.status(400).json({ success: false, error: 'Patient name, phone, and requirement are required' });
    }

    let clinicId = req.user?.clinicId;
    if (!clinicId) {
      const defaultClinic = await Clinic.findOne();
      if (!defaultClinic) {
        return res.status(400).json({ success: false, error: 'No active clinic found' });
      }
      clinicId = defaultClinic._id.toString();
    }

    const notesArray = note ? [{ content: note, author: req.user?.email || 'Admin' }] : [];

    const lead = await Lead.create({
      clinicId,
      patientName,
      phone,
      email: email || '',
      requirement,
      source: source || 'Phone',
      status: status || 'New',
      leadScore: leadScore || 65,
      assignedTo: assignedTo || 'Front Desk',
      notes: notesArray
    });

    // Module 4: Auto-schedule follow-up 2 days out if score is 31–80 and not booked
    if (lead.leadScore >= 31 && lead.leadScore <= 80 && lead.status !== 'Appointment Booked') {
      await scheduleFollowUpForLead(lead);
    }

    return res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Leads with Search, Filter & Pagination
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, source, assignedTo, page = '1', limit = '20' } = req.query;

    const query: any = {};
    if (req.user?.clinicId) {
      query.clinicId = req.user.clinicId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { patientName: searchRegex },
        { phone: searchRegex },
        { requirement: searchRegex },
        { email: searchRegex }
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      data: {
        leads,
        pagination: {
          total: totalLeads,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalLeads / limitNum)
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get Single Lead by ID
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '').slice(-10) : '';
    const appointment = await Appointment.findOne({
      $or: [
        { leadId: lead._id },
        ...(cleanPhone && cleanPhone.length >= 10 ? [{ phone: { $regex: cleanPhone } }] : [])
      ]
    }).sort({ createdAt: -1 });

    const leadObj = lead.toObject();
    return res.json({
      success: true,
      data: {
        ...leadObj,
        appointment: appointment ? {
          id: appointment._id,
          date: appointment.date,
          startTime: appointment.startTime,
          doctorName: appointment.doctorName,
          status: appointment.status,
          confirmationToken: appointment.confirmationToken,
          confirmedAt: appointment.confirmedAt
        } : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update Lead (Status Transition / Detail Edit)
router.put('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { patientName, phone, email, requirement, source, status, leadScore, assignedTo } = req.body;

    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Record status transition in timeline if changed
    if (status && status !== existingLead.status) {
      existingLead.notes.push({
        content: `Status updated from ${existingLead.status} to ${status}`,
        author: req.user?.email || 'Admin',
        createdAt: new Date()
      } as any);
      existingLead.status = status;

      // Module 4: Cancel pending follow-ups if appointment booked or lost
      if (status === 'Appointment Booked' || status === 'Lost') {
        await cancelPendingFollowUpsForLead(existingLead._id);
      }
    }

    if (patientName) existingLead.patientName = patientName;
    if (phone) existingLead.phone = phone;
    if (email !== undefined) existingLead.email = email;
    if (requirement) existingLead.requirement = requirement;
    if (source) existingLead.source = source;
    if (leadScore !== undefined) existingLead.leadScore = leadScore;
    if (assignedTo) existingLead.assignedTo = assignedTo;

    await existingLead.save();

    return res.json({ success: true, data: existingLead });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Add Timeline Note to Lead
router.post('/:id/notes', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    lead.notes.push({
      content,
      author: req.user?.email || 'Admin',
      createdAt: new Date()
    } as any);

    await lead.save();

    return res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Lead
router.delete('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
