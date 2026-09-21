import { Router, Response } from 'express';
import { FollowUp } from '../models/FollowUp.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';
import { runFollowUpBatch } from '../modules/followUps/scheduler.js';

const router = Router();

// GET /api/follow-ups/due-today - Get follow-ups due today / pending for the dashboard widget
router.get('/due-today', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    const query: any = {
      status: 'pending'
    };

    if (clinicId) {
      query.clinicId = clinicId;
    }

    // End of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    query.scheduledFor = { $lte: endOfToday };

    const dueFollowUps = await FollowUp.find(query)
      .populate('leadId', 'patientName phone email requirement status leadScore')
      .sort({ scheduledFor: 1 })
      .limit(20);

    return res.json({
      success: true,
      data: {
        count: dueFollowUps.length,
        followUps: dueFollowUps
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/follow-ups/run-batch - Manually trigger follow-up batch
router.post('/run-batch', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await runFollowUpBatch();
    return res.json({
      success: true,
      message: `Follow-up batch executed: ${stats.sent} sent, ${stats.failed} failed`,
      data: stats
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
