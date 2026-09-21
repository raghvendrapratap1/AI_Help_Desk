import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import followUpRoutes from './routes/followUpRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import telephonyRoutes from './routes/telephonyRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import vapiRoutes from './routes/vapiRoutes.js';
import { initFollowUpScheduler } from './modules/followUps/scheduler.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/telephony', telephonyRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/webhooks/whatsapp', whatsappRoutes);
app.use('/api/vapi-webhook', vapiRoutes);
app.use('/api/webhooks/vapi', vapiRoutes);

// Health check endpoints (supports both /health and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'online',
    clinic: 'Indore Poly Dental Clinic',
    time: new Date().toISOString()
  });
});

// Self-ping keep-alive interval to prevent Render free instance from spinning down
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || 'https://ai-help-desk-receptionist.onrender.com';
setInterval(() => {
  try {
    fetch(`${RENDER_EXTERNAL_URL}/api/health`).catch(() => {});
  } catch (_) {}
}, 5 * 60 * 1000); // ping every 5 minutes

// Serve frontend static build for mobile/public confirmation testing
import path from 'path';
const clientDistPath = path.resolve(process.cwd(), '../client/dist');

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Central error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Initialize DB and Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();
  initFollowUpScheduler();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Front Desk Server Running on http://localhost:${PORT}`);
    console.log(`🏥 Anchor Clinic: Indore Poly Dental Clinic`);
    console.log(`====================================================`);
  });
};

startServer().catch(err => {
  console.error('[STARTUP ERROR]', err);
});

export default app;
