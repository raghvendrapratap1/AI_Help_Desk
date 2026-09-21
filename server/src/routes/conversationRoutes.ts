import { Router, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Get list of conversations for CRM Dashboard
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.clinicId) {
      query.clinicId = req.user.clinicId;
    }

    const conversations = await Conversation.find(query)
      .populate('leadId', 'patientName phone status requirement')
      .sort({ updatedAt: -1 })
      .limit(50);

    return res.json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get Handoff Queue: conversations requiring human staff intervention
router.get('/handoff-queue', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const query: any = { needsHuman: true };
    if (req.user?.clinicId) {
      query.clinicId = req.user.clinicId;
    }

    const conversations = await Conversation.find(query)
      .populate('leadId', 'patientName phone status requirement')
      .sort({ updatedAt: -1 });

    return res.json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Staff reply to conversation and clear needsHuman flag
router.post('/:id/reply', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Reply message cannot be empty' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const staffMsg = await Message.create({
      conversationId: conversation._id,
      sender: 'staff',
      text: message.trim(),
      metadata: { author: req.user?.email || 'Clinic Staff' }
    });

    conversation.needsHuman = false;
    conversation.status = 'active';
    conversation.lastMessage = `Staff: ${message.trim()}`;
    await conversation.save();

    return res.json({
      success: true,
      message: 'Staff reply sent and conversation marked as handled',
      data: { conversation, message: staffMsg }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single conversation details with messages
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('leadId');
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
