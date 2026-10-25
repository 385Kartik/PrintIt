import { Response } from 'express';
import { findUserById } from '../database/users';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTokenBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ tokens: user.tokens });
  } catch (error: any) {
    console.error('Get token balance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
