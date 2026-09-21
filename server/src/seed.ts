import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Clinic } from './models/Clinic.js';
import { User } from './models/User.js';
import { Lead } from './models/Lead.js';
import { Appointment } from './models/Appointment.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('[SEED] Checking Indore Poly Dental Clinic configuration...');
  await connectDB();

  // 1. Ensure Anchor Clinic: Indore Poly Dental Clinic
  let clinic = await Clinic.findOne({ slug: 'indore-poly-dental' });
  const clinicData = {
    name: 'Indore Poly Dental Clinic',
    tagline: 'Advanced Oral & Maxillofacial Surgery & Root Canal Center',
    address: '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
    city: 'Indore',
    phone: '+91 98270 12345',
    email: process.env.SMTP_USER || 'raghvendrapratapsingh505@gmail.com',
    operatingHours: 'Mon-Sat, 11:00-20:30',
    doctors: [
      {
        name: 'Dr. Sandesh Jain',
        title: 'Senior Specialist',
        specialty: 'Oral & Maxillofacial Surgeon',
        experience: '~25 years experience'
      },
      {
        name: 'Dr. Saumya Jain',
        title: 'Endodontic Specialist',
        specialty: 'Endodontist & Root Canal Specialist',
        experience: '~15 years experience'
      }
    ],
    services: [
      'Dental Implants',
      'Root Canal Treatment',
      'Cosmetic Dentistry',
      'Invisible Aligners',
      'Veneers & Crowns',
      'Dentures',
      'Jaw & Facial Trauma & Surgery',
      'TMJ Treatment'
    ],
    slug: 'indore-poly-dental',
    plan: 'Enterprise',
    subscriptionStatus: 'active',
    staff: [
      {
        name: 'Dr. Sandesh Jain',
        role: 'Senior Oral & Maxillofacial Surgeon',
        treatments: ['Dental Implants', 'Jaw & Facial Trauma & Surgery', 'TMJ Treatment', 'Bone Grafting', 'Wisdom Tooth Surgery']
      },
      {
        name: 'Dr. Saumya Jain',
        role: 'Specialist Endodontist & Cosmetic Dentist',
        treatments: ['Root Canal Treatment', 'Invisible Aligners', 'Cosmetic Dentistry', 'Veneers & Crowns', 'Dentures']
      }
    ],
    knowledgeBaseSnippet: `Indore Poly Dental Clinic is located at 1/4 near 56 Shops, New Palasia, Indore. Run by Dr. Sandesh Jain (Oral & Maxillofacial Surgeon) and Dr. Saumya Jain (Endodontist) with ~40 years combined experience. Operating hours: Mon-Sat 11:00 AM to 8:30 PM. Specialties: Dental Implants, Root Canals, Aligners, Facial Surgery.`
  };

  if (!clinic) {
    clinic = await Clinic.create(clinicData);
    console.log(`[SEED] Anchor Clinic Created: ${clinic.name}`);
  } else {
    await Clinic.updateOne({ _id: clinic._id }, { $set: clinicData });
    console.log(`[SEED] Anchor Clinic Verified: ${clinic.name}`);
  }

  // 2. Ensure Default Admin User
  let adminUser = await User.findOne({ email: 'admin@indoredental.com' });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      name: 'Dr. Sandesh Jain (Admin)',
      email: 'admin@indoredental.com',
      passwordHash,
      role: 'clinic_admin',
      clinicId: clinic._id
    });
    console.log(`[SEED] Admin User Created: ${adminUser.email} (Password: admin123)`);
  } else {
    console.log(`[SEED] Admin User Verified: ${adminUser.email}`);
  }

  // 3. Purge dummy sample data so only real user data is stored in MongoDB Atlas
  const dummyNames = ['Rahul Sharma', 'Priya Verma', 'Vikram Joshi', 'Meena Saxena'];
  const deletedDummyLeads = await Lead.deleteMany({ patientName: { $in: dummyNames } });
  const deletedDummyApts = await Appointment.deleteMany({ patientName: { $in: dummyNames } });
  if (deletedDummyLeads.deletedCount > 0 || deletedDummyApts.deletedCount > 0) {
    console.log(`[SEED] Purged dummy sample records: ${deletedDummyLeads.deletedCount} leads, ${deletedDummyApts.deletedCount} appointments.`);
  }

  console.log('[SEED] Ready for real clinic patient data!');
};

// Only execute directly when run as CLI script (npm run seed)
const isDirectCall = process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'));
if (isDirectCall) {
  seedDatabase()
    .then(() => {
      console.log('[SEED] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED] Error seeding database:', err);
      process.exit(1);
    });
}


