import { Request, Response, NextFunction } from 'express';

// For typing the extended Request
export interface AuthRequest extends Request {
  user?: any;
}

export const adminGuard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
       res.status(401).json({ error: 'Unauthorized: Missing token' });
       return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Dynamic import to prevent client-side bleeding if mistakenly imported
    const { getFirebaseAdmin } = await import('../firebase/admin.js');
    const decoded = await getFirebaseAdmin().auth.verifyIdToken(token);

    // Enforce custom claim
    if (!decoded.admin) {
      res.status(403).json({ error: 'Forbidden: Admin clearance required.' });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
     return;
  }
};
