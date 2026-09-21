import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Lead } from '../models/Lead.js';
import { Appointment } from '../models/Appointment.js';
import { Clinic } from '../models/Clinic.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

async function run() {
  try {
    await connectDB();
    console.log('[DB] Connected to database:', mongoose.connection.name);
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('[DB] Collections in Atlas:', collections?.map(c => c.name));

    // List all leads
    const leads = await Lead.find({});
    console.log(`[DB] Leads count: ${leads.length}`);
    leads.forEach(l => console.log(`  Lead: "${l.patientName}" | Phone: "${l.phone}" | Status: "${l.status}"`));

    // List all appointments
    const apts = await Appointment.find({});
    console.log(`[DB] Appointments count: ${apts.length}`);
    apts.forEach(a => console.log(`  Appointment: "${a.patientName}" | Date: "${a.date}" | Time: "${a.startTime}"`));

    // List all conversations
    const convs = await Conversation.find({});
    console.log(`[DB] Conversations count: ${convs.length}`);

    // If --clean-dummy argument is passed, remove dummy sample leads and appointments
    if (process.argv.includes('--clean-dummy')) {
      const dummyNames = ['Rahul Sharma', 'Priya Verma', 'Vikram Joshi', 'Meena Saxena'];
      const delLeads = await Lead.deleteMany({ patientName: { $in: dummyNames } });
      const delApts = await Appointment.deleteMany({ patientName: { $in: dummyNames } });
      console.log(`[CLEANUP] Deleted ${delLeads.deletedCount} dummy leads.`);
      console.log(`[CLEANUP] Deleted ${delApts.deletedCount} dummy appointments.`);
    }

    if (process.argv.includes('--dedup')) {
      const leads = await Lead.find({ patientName: 'Raghvendra Pratap Singh' }).sort({ createdAt: -1 });
      if (leads.length > 1) {
        const toDelete = leads.slice(1).map(l => l._id);
        await Lead.deleteMany({ _id: { $in: toDelete } });
        console.log(`[DEDUP] Removed ${toDelete.length} duplicate leads.`);
      }
      const apts = await Appointment.find({ patientName: 'Raghvendra Pratap Singh' }).sort({ createdAt: -1 });
      if (apts.length > 1) {
        const toDelete = apts.slice(1).map(a => a._id);
        await Appointment.deleteMany({ _id: { $in: toDelete } });
        console.log(`[DEDUP] Removed ${toDelete.length} duplicate appointments.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err);
    process.exit(1);
  }
}

run();
