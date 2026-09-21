import { Router, Response } from 'express';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Conversation } from '../models/Conversation.js';
import { UnansweredQuestion } from '../models/UnansweredQuestion.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = Router();

// Helper to get time boundaries
function getTimeframeBoundary(timeframe: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);

  if (timeframe === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  } else if (timeframe === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  } else if (timeframe === 'month') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  return { start: new Date(0), end };
}

// GET /api/analytics/summary - Real-time MongoDB metrics
router.get('/summary', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    const matchClinic: any = clinicId ? { clinicId: new mongoose.Types.ObjectId(clinicId) } : {};

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Run parallel aggregation queries
    const [totalLeads, newThisWeek, highIntentCount, convertedCount, appointmentsCount] = await Promise.all([
      Lead.countDocuments(matchClinic),
      Lead.countDocuments({ ...matchClinic, createdAt: { $gte: oneWeekAgo } }),
      Lead.countDocuments({ ...matchClinic, leadScore: { $gte: 70 } }),
      Lead.countDocuments({ ...matchClinic, status: { $in: ['Converted', 'Appointment Booked'] } }),
      Appointment.countDocuments(matchClinic)
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

    return res.json({
      success: true,
      data: {
        totalLeads,
        newThisWeek,
        highIntentCount,
        conversionRate,
        appointmentsCount
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/by-source - Leads & conversions grouped by acquisition source with timeframe filtering
router.get('/by-source', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    const timeframe = (req.query.timeframe as string) || 'all';
    const matchClinic: any = clinicId ? { clinicId: new mongoose.Types.ObjectId(clinicId) } : {};

    if (timeframe !== 'all') {
      const { start } = getTimeframeBoundary(timeframe);
      matchClinic.createdAt = { $gte: start };
    }

    const sourceStats = await Lead.aggregate([
      { $match: matchClinic },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [{ $in: ['$status', ['Converted', 'Appointment Booked']] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          count: 1,
          converted: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      data: sourceStats
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/visitor-trends - Time-series visitor traffic by source (today/week/month)
router.get('/visitor-trends', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    const matchClinic: any = clinicId ? { clinicId: new mongoose.Types.ObjectId(clinicId) } : {};
    const timeframe = (req.query.timeframe as string) || 'week';

    const now = new Date();
    interface Bucket {
      label: string;
      start: Date;
      end: Date;
      website: number;
      phone: number;
      whatsapp: number;
      other: number;
      total: number;
    }
    const buckets: Bucket[] = [];

    if (timeframe === 'today') {
      // 12 two-hour intervals for today (00:00 to 24:00)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      for (let hour = 0; hour < 24; hour += 2) {
        const slotStart = new Date(todayStart);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(todayStart);
        slotEnd.setHours(hour + 1, 59, 59, 999);

        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${hour12} ${ampm}`;

        buckets.push({
          label,
          start: slotStart,
          end: slotEnd,
          website: 0,
          phone: 0,
          whatsapp: 0,
          other: 0,
          total: 0
        });
      }
    } else if (timeframe === 'month') {
      // 4 weekly periods covering the past 28-30 days
      for (let w = 3; w >= 0; w--) {
        const slotStart = new Date(now);
        slotStart.setDate(now.getDate() - (w * 7 + 6));
        slotStart.setHours(0, 0, 0, 0);

        const slotEnd = new Date(now);
        slotEnd.setDate(now.getDate() - (w * 7));
        slotEnd.setHours(23, 59, 59, 999);

        const label = `Week ${4 - w} (${slotStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${slotEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

        buckets.push({
          label,
          start: slotStart,
          end: slotEnd,
          website: 0,
          phone: 0,
          whatsapp: 0,
          other: 0,
          total: 0
        });
      }
    } else {
      // 'week': 7 daily buckets from 6 days ago up to today
      for (let d = 6; d >= 0; d--) {
        const slotStart = new Date(now);
        slotStart.setDate(now.getDate() - d);
        slotStart.setHours(0, 0, 0, 0);

        const slotEnd = new Date(now);
        slotEnd.setDate(now.getDate() - d);
        slotEnd.setHours(23, 59, 59, 999);

        const label = slotStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        buckets.push({
          label,
          start: slotStart,
          end: slotEnd,
          website: 0,
          phone: 0,
          whatsapp: 0,
          other: 0,
          total: 0
        });
      }
    }

    // Overall query range
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;

    // Fetch conversations and leads in range
    const [conversations, leads] = await Promise.all([
      Conversation.find({
        ...matchClinic,
        createdAt: { $gte: rangeStart, $lte: rangeEnd }
      }),
      Lead.find({
        ...matchClinic,
        createdAt: { $gte: rangeStart, $lte: rangeEnd }
      })
    ]);

    const linkedLeadIds = new Set<string>();

    // Process conversations
    for (const conv of conversations) {
      if (conv.leadId) {
        linkedLeadIds.add(conv.leadId.toString());
      }
      const cTime = new Date(conv.createdAt).getTime();
      let sourceCategory: 'website' | 'phone' | 'whatsapp' | 'other' = 'website';
      if (conv.channel === 'phone' || conv.channel === 'voice_call') {
        sourceCategory = 'phone';
      } else if (conv.channel === 'whatsapp') {
        sourceCategory = 'whatsapp';
      } else if (conv.channel === 'web_chat') {
        sourceCategory = 'website';
      }

      for (const bucket of buckets) {
        if (cTime >= bucket.start.getTime() && cTime <= bucket.end.getTime()) {
          bucket[sourceCategory]++;
          bucket.total++;
          break;
        }
      }
    }

    // Process leads not originating from an already counted conversation
    for (const lead of leads) {
      if (linkedLeadIds.has(lead._id.toString())) {
        continue;
      }
      const lTime = new Date(lead.createdAt).getTime();
      let sourceCategory: 'website' | 'phone' | 'whatsapp' | 'other' = 'other';
      if (lead.source === 'Website') {
        sourceCategory = 'website';
      } else if (lead.source === 'Phone') {
        sourceCategory = 'phone';
      } else if (lead.source === 'WhatsApp') {
        sourceCategory = 'whatsapp';
      }

      for (const bucket of buckets) {
        if (lTime >= bucket.start.getTime() && lTime <= bucket.end.getTime()) {
          bucket[sourceCategory]++;
          bucket.total++;
          break;
        }
      }
    }

    const summary = {
      totalVisits: buckets.reduce((acc, b) => acc + b.total, 0),
      websiteVisits: buckets.reduce((acc, b) => acc + b.website, 0),
      phoneCalls: buckets.reduce((acc, b) => acc + b.phone, 0),
      whatsappInquiries: buckets.reduce((acc, b) => acc + b.whatsapp, 0),
      otherInquiries: buckets.reduce((acc, b) => acc + b.other, 0)
    };

    const trend = buckets.map(({ label, website, phone, whatsapp, other, total }) => ({
      label,
      website,
      phone,
      whatsapp,
      other,
      total
    }));

    return res.json({
      success: true,
      data: {
        timeframe,
        summary,
        trend
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/unanswered-questions - List top unanswered questions
router.get('/unanswered-questions', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    const query: any = {};
    if (clinicId) {
      query.clinicId = clinicId;
    }

    const questions = await UnansweredQuestion.find(query)
      .sort({ count: -1, lastAskedAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: questions
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/analytics/unanswered-questions/:id - "Mark as added to KB" removes the record
router.delete('/unanswered-questions/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await UnansweredQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Question record not found' });
    }

    return res.json({
      success: true,
      message: 'Question marked as indexed in Knowledge Base and removed.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
