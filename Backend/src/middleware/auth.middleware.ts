import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../database/users';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check if it's an admin token
    if (decoded.isAdmin) {
      req.user = { 
        _id: 'admin', 
        id: 'admin', 
        isAdmin: true,
        tokens: 0 
      };
      next();
      return;
    }

    const user = await findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Remove password from user object and add _id for compatibility
    const { hashed_password, ...userWithoutPassword } = user;
    req.user = { ...userWithoutPassword, _id: user.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: 'Access denied. Admin only.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
