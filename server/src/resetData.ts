import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import { Lead } from './models/Lead.js';
import { Appointment } from './models/Appointment.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';
import { FollowUp } from './models/FollowUp.js';
import { Notification } from './models/Notification.js';
import { UnansweredQuestion } from './models/UnansweredQuestion.js';
import { KnowledgeChunk } from './models/KnowledgeChunk.js';
import { seedDatabase } from './seed.js';

async function resetAllData() {
  console.log('[RESET] Connecting to database...');
  await connectDB();

  console.log('[RESET] Wiping patient and activity collections...');
  const resLeads = await Lead.deleteMany({});
  const resAppts = await Appointment.deleteMany({});
  const resConvs = await Conversation.deleteMany({});
  const resMsgs = await Message.deleteMany({});
  const resFollowUps = await FollowUp.deleteMany({});
  const resNotifs = await Notification.deleteMany({});
  const resUnanswered = await UnansweredQuestion.deleteMany({});
  const resKB = await KnowledgeChunk.deleteMany({});

  console.log(`[DELETED] Leads: ${resLeads.deletedCount}`);
  console.log(`[DELETED] Appointments: ${resAppts.deletedCount}`);
  console.log(`[DELETED] Conversations: ${resConvs.deletedCount}`);
  console.log(`[DELETED] Messages: ${resMsgs.deletedCount}`);
  console.log(`[DELETED] Follow-ups: ${resFollowUps.deletedCount}`);
  console.log(`[DELETED] Notifications: ${resNotifs.deletedCount}`);
  console.log(`[DELETED] Unanswered Questions: ${resUnanswered.deletedCount}`);
  console.log(`[DELETED] Knowledge Chunks: ${resKB.deletedCount}`);

  console.log('[RESET] Re-verifying anchor clinic and admin user...');
  await seedDatabase();

  console.log('✨ [SUCCESS] All collections have been wiped clean! Database is fresh and ready.');
  process.exit(0);
}

resetAllData().catch((err) => {
  console.error('[RESET ERROR]', err);
  process.exit(1);
});
