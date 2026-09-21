import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Clinic } from '../models/Clinic.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();
const getJwtSecret = () => process.env.JWT_SECRET || 'indore_dental_clinic_2026';

// Register Admin
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, clinicName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = await Clinic.create({
        name: clinicName || 'Indore Poly Dental Clinic',
        address: '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
        phone: '+91 98270 12345',
        email: 'info@indoredental.com',
        operatingHours: 'Mon-Sat, 11:00-20:30',
        doctors: [
          { name: 'Dr. Sandesh Jain', title: 'Senior Surgeon', specialty: 'Oral & Maxillofacial Surgery', experience: '~25 years' },
          { name: 'Dr. Saumya Jain', title: 'Endodontic Specialist', specialty: 'Root Canal & Cosmetic Dentistry', experience: '~15 years' }
        ],
        services: [
          'Dental Implants',
          'Root Canal',
          'Cosmetic Dentistry',
          'Invisible Aligners',
          'Veneers & Crowns',
          'Dentures',
          'Jaw & Facial Surgery',
          'TMJ Treatment'
        ]
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'clinic_admin',
      clinicId: clinic._id
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, clinicId: clinic._id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, clinicId: clinic._id },
        clinic: {
          id: clinic._id,
          name: clinic.name,
          tagline: clinic.tagline,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          email: clinic.email,
          operatingHours: clinic.operatingHours,
          doctors: clinic.doctors,
          services: clinic.services
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Login Admin
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    let clinic = await Clinic.findById(user.clinicId);
    if (!clinic) {
      clinic = await Clinic.findOne();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, clinicId: user.clinicId },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId },
        clinic: clinic
          ? {
              id: clinic._id,
              name: clinic.name,
              tagline: clinic.tagline,
              address: clinic.address,
              city: clinic.city,
              phone: clinic.phone,
              email: clinic.email,
              operatingHours: clinic.operatingHours,
              doctors: clinic.doctors,
              services: clinic.services
            }
          : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user profile (/me)
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const clinic = await Clinic.findById(user.clinicId);

    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId },
        clinic: clinic
          ? {
              id: clinic._id,
              name: clinic.name,
              tagline: clinic.tagline,
              address: clinic.address,
              city: clinic.city,
              phone: clinic.phone,
              email: clinic.email,
              operatingHours: clinic.operatingHours,
              doctors: clinic.doctors,
              services: clinic.services
            }
          : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
