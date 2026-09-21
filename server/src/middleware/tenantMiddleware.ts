import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';

/**
 * Tenant scoping middleware: guarantees that any request accessing clinic-owned data
 * has a valid clinicId matching the authenticated token.
 */
export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.clinicId) {
    return res.status(403).json({
      success: false,
      error: 'Tenant context missing. Request not authorized for any clinic.'
    });
  }
  next();
};
