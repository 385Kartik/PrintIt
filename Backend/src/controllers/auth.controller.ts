import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';
import validator from 'validator';
import * as userService from '../database/users';
import * as otpService from '../services/otp.service';
import * as emailService from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helper to generate token with no expiry
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET);
};

/**
 * Step 1: Request Signup OTP (passwordless)
 * User provides: name, email, optional phone
 */
export const requestSignupOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400).json({ message: 'Invalid phone number format' });
      return;
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const otp = otpService.generateAuthOTP();
    const stored = await otpService.storeOTP(email, otp);

    if (!stored) {
      res.status(500).json({ message: 'Failed to generate OTP. Please try again.' });
      return;
    }

    console.log(`\n🔑 ==========================================`);
    console.log(`🔑 [PRINT-IT OTP] Verification code for ${email}: ${otp}`);
    console.log(`🔑 ==========================================\n`);

    const emailSent = await emailService.sendOTPEmail(email, otp, name);

    if (!emailSent) {
      console.warn(`⚠️ Email delivery failed for ${email}. Fallback OTP (123456) is accepted.`);
      res.status(200).json({
        message: 'OTP sent! If you do not receive the email, you can use fallback code: 123456',
        email: email,
        phone: phone,
      });
      return;
    }

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email,
      phone: phone,
    });
  } catch (error: any) {
    console.error('Request signup OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Step 2: Verify OTP and Complete Registration (passwordless)
 * User provides: name, email, otp, optional phone
 */
export const verifySignupOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, otp, college } = req.body;

    if (!name || !email || !otp) {
      res.status(400).json({ message: 'Name, email, and OTP are required' });
      return;
    }

    const isValidOTP = await otpService.verifyOTP(email, otp);
    if (!isValidOTP) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const user = await userService.createUser({
      name,
      email,
      phone,
      college: college || 'Universal College of Engineering',
    });

    if (!user) {
      res.status(500).json({ message: 'Failed to create user' });
      return;
    }

    otpService.deleteOTP(email);

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tokens: user.tokens,
      },
    });
  } catch (error: any) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Step 1: Request Login OTP (passwordless)
 */
export const requestLoginOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: 'User not found. Please sign up first.' });
      return;
    }

    const otp = otpService.generateAuthOTP();
    const stored = await otpService.storeOTP(email, otp);

    if (!stored) {
      res.status(500).json({ message: 'Failed to generate OTP. Please try again.' });
      return;
    }

    console.log(`\n🔑 ==========================================`);
    console.log(`🔑 [PRINT-IT OTP] Login code for ${email}: ${otp}`);
    console.log(`🔑 ==========================================\n`);

    const emailSent = await emailService.sendOTPEmail(email, otp, user.name);
    if (!emailSent) {
      console.warn(`⚠️ Email delivery failed for ${email}. Fallback OTP (123456) is accepted.`);
      res.status(200).json({
        message: 'OTP sent! If you do not receive the email, you can use fallback code: 123456',
        email,
      });
      return;
    }

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to login.',
      email,
    });
  } catch (error: any) {
    console.error('Request login OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Step 2: Verify Login OTP (passwordless)
 */
export const verifyLoginOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    const isValidOTP = await otpService.verifyOTP(email, otp);
    if (!isValidOTP) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: 'User not found. Please sign up first.' });
      return;
    }

    otpService.deleteOTP(email);

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tokens: user.tokens,
      },
    });
  } catch (error: any) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user profile (authenticated)
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        tokens: user.tokens,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile (phone, college)
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, college } = req.body;

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400).json({ message: 'Invalid phone number format' });
      return;
    }

    const updatedUser = await userService.updateUserProfile(req.user.id, { phone, college });

    if (!updatedUser) {
      res.status(500).json({ message: 'Failed to update profile' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        college: updatedUser.college,
        tokens: updatedUser.tokens,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
