import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Clinic } from '../models/Clinic.js';
import { User } from '../models/User.js';
import { getBillingProvider } from '../integrations/billing/razorpay.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Helper to slugify clinic name
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * POST /api/onboarding/register
 * Public Self-Signup Onboarding Wizard:
 * Accepts Clinic Info, Admin User, Services, Doctors/Staff, and Operating Hours.
 * Creates both Clinic and User in one atomic operation.
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      clinicName,
      address,
      city,
      phone,
      email,
      operatingHours,
      adminName,
      adminEmail,
      adminPassword,
      services,
      doctors,
      staff
    } = req.body;

    if (!clinicName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Clinic name, admin email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists'
      });
    }

    let slug = slugify(clinicName);
    const existingSlug = await Clinic.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Build doctors array or defaults
    const docList = Array.isArray(doctors) && doctors.length > 0 ? doctors : [
      {
        name: adminName || 'Chief Doctor',
        title: 'Lead Dental Surgeon',
        specialty: 'General & Cosmetic Dentistry',
        experience: '10+ Years Experience'
      }
    ];

    // Build staff routing array
    const staffList = Array.isArray(staff) && staff.length > 0 ? staff : docList.map(d => ({
      name: d.name,
      role: d.title,
      treatments: services || ['Consultation', 'Dental Checkup']
    }));

    // Auto-generate initial Knowledge Base snippet
    const kbSnippet = `${clinicName} is located at ${address || 'Main Road'}, ${city || 'Indore'}. Contact: ${phone || ''}, ${email || adminEmail}. Operating hours: ${operatingHours || 'Mon-Sat 10:00 AM - 8:00 PM'}. Specialties include: ${(services || []).join(', ')}.`;

    // 1. Create Clinic
    const clinic = await Clinic.create({
      name: clinicName,
      slug,
      tagline: 'Modern Digital Dental Care',
      address: address || 'Clinic Address',
      city: city || 'Indore',
      phone: phone || '+91 9999999999',
      email: email || adminEmail,
      operatingHours: operatingHours || 'Mon-Sat 10:00 AM - 8:00 PM',
      plan: 'Free',
      subscriptionStatus: 'active',
      doctors: docList,
      staff: staffList,
      services: services || ['Dental Checkup', 'Teeth Cleaning', 'Root Canal'],
      knowledgeBaseSnippet: kbSnippet
    });

    // 2. Create Admin User
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const user = await User.create({
      name: adminName || 'Clinic Admin',
      email: adminEmail,
      passwordHash,
      role: 'clinic_admin',
      clinicId: clinic._id
    });

    // 3. Issue Token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        clinicId: clinic._id
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_indore_dental_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Clinic onboarding completed successfully!',
      token,
      clinic: {
        id: clinic._id,
        name: clinic.name,
        slug: clinic.slug,
        plan: clinic.plan
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('[ONBOARDING ERROR]', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to complete onboarding' });
  }
});

/**
 * POST /api/onboarding/checkout
 * Initiate plan upgrade checkout via Razorpay billing provider stub/live
 */
router.post('/checkout', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(403).json({ success: false, error: 'Clinic context missing' });
    }

    const priceMap: Record<string, number> = {
      Starter: 149900,   // ?1,499 in paise
      Growth: 299900,    // ?2,999 in paise
      Enterprise: 599900 // ?5,999 in paise
    };

    const amount = priceMap[plan] || 149900;
    const billing = getBillingProvider();

    const order = await billing.createOrder({
      clinicId,
      amount,
      currency: 'INR',
      plan: plan || 'Starter',
      receipt: "rcpt_1788705838731"
    });

    return res.json({
      success: true,
      order,
      billingEnabled: process.env.BILLING_ENABLED === 'true'
    });
  } catch (error: any) {
    console.error('[BILLING CHECKOUT ERROR]', error);
    return res.status(500).json({ success: false, error: error.message || 'Billing order creation failed' });
  }
});

/**
 * POST /api/onboarding/verify-payment
 * Verify payment signature and upgrade clinic plan
 */
router.post('/verify-payment', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, paymentId, signature, plan } = req.body;
    const clinicId = req.user?.clinicId;

    const billing = getBillingProvider();
    const verified = await billing.verifyPayment(orderId, paymentId, signature);

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Update clinic subscription plan
    await Clinic.findByIdAndUpdate(clinicId, {
      plan: plan || 'Growth',
      subscriptionStatus: 'active'
    });

    return res.json({
      success: true,
      message: `Successfully upgraded to ${plan || 'Growth'} plan!`,
      plan: plan || 'Growth'
    });
  } catch (error: any) {
    console.error('[BILLING VERIFY ERROR]', error);
    return res.status(500).json({ success: false, error: error.message || 'Payment processing failed' });
  }
});

export default router;
