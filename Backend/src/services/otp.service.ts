import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

type OtpEntry = {
  otp: string;
  expiry: Date;
};

// In-memory OTP store keyed by email
export const otpStore = new Map<string, OtpEntry>();

/**
 * Generate a 4-digit OTP for order collection
 */
export const generateOTP = (): string => {
  return crypto.randomInt(1000, 9999).toString();
};

/**
 * Generate a 6-digit OTP for authentication
 */
export const generateAuthOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP in-memory for the given email
 */
export const storeOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    otpStore.set(email.toLowerCase(), { otp, expiry: expiresAt });
    return true;
  } catch (error) {
    console.error('Store OTP error:', error);
    return false;
  }
};

/**
 * Verify OTP from the in-memory store (does not delete)
 */
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Master fallback OTP support (123456) so users/developers are never blocked
    const masterOtp = process.env.MASTER_OTP || '123456';
    if (otp === masterOtp) {
      console.log(`✅ Master OTP accepted for ${email}`);
      return true;
    }

    const entry = otpStore.get(email.toLowerCase());

    if (!entry) {
      console.log('OTP not found or already verified');
      return false;
    }

    // Check if expired
    if (entry.expiry < new Date()) {
      console.log('OTP expired');
      // Remove expired OTP
      otpStore.delete(email.toLowerCase());
      return false;
    }

    // Check if OTP matches
    if (entry.otp !== otp) {
      console.log('OTP does not match');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return false;
  }
};

/**
 * Delete OTP after successful operation
 */
export const deleteOTP = (email: string): void => {
  otpStore.delete(email.toLowerCase());
};

export default {
  generateOTP,
  storeOTP,
  verifyOTP,
  deleteOTP,
};
