import UserModel, { IUser } from '../models/User.model';

// Legacy interface for backward compatibility with existing code
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  hashed_password?: string | null;
  temporary_otp?: string | null;
  otp_expiry?: string | null;
  college?: string;
  tokens: number;
  uploaded_file_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  college?: string;
}

// Helper to convert MongoDB document to legacy User interface
const toUserInterface = (doc: IUser | null): User | null => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    hashed_password: doc.hashed_password || null,
    temporary_otp: doc.temporary_otp || null,
    otp_expiry: doc.otp_expiry ? doc.otp_expiry.toISOString() : null,
    college: doc.college,
    tokens: doc.tokens,
    uploaded_file_urls: doc.uploaded_file_urls,
    created_at: doc.createdAt.toISOString(),
    updated_at: doc.updatedAt.toISOString(),
  };
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<User | null> => {
  try {
    const user = await UserModel.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      hashed_password: null,
      college: userData.college,
      tokens: 0,
      uploaded_file_urls: [],
    });

    return toUserInterface(user);
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return toUserInterface(user);
  } catch (error) {
    return null;
  }
};

/**
 * Find user by ID
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  try {
    const user = await UserModel.findById(userId);
    return toUserInterface(user);
  } catch (error) {
    return null;
  }
};

/**
 * Update user tokens
 */
export const updateUserTokens = async (
  userId: string,
  tokens: number
): Promise<boolean> => {
  try {
    const result = await UserModel.findByIdAndUpdate(userId, { tokens });
    return result !== null;
  } catch (error) {
    console.error('Update tokens error:', error);
    return false;
  }
};

/**
 * Store OTP for user
 */
export const storeUserOTP = async (
  userId: string,
  otp: string,
  expiryMinutes: number = 10
): Promise<boolean> => {
  try {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

    const result = await UserModel.findByIdAndUpdate(userId, {
      temporary_otp: otp,
      otp_expiry: expiryDate,
    });

    return result !== null;
  } catch (error) {
    console.error('Store OTP error:', error);
    return false;
  }
};

/**
 * Verify OTP for user
 */
export const verifyUserOTP = async (
  userId: string,
  otp: string
): Promise<boolean> => {
  try {
    const user = await UserModel.findById(userId);

    if (!user || !user.temporary_otp || !user.otp_expiry) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > user.otp_expiry) {
      return false;
    }

    // Check if OTP matches
    if (user.temporary_otp !== otp) {
      return false;
    }

    // Clear OTP after successful verification
    await UserModel.findByIdAndUpdate(userId, {
      temporary_otp: null,
      otp_expiry: null,
    });

    return true;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return false;
  }
};

/**
 * Add file URL to user
 */
export const addFileUrlToUser = async (
  userId: string,
  fileUrl: string
): Promise<boolean> => {
  try {
    const result = await UserModel.findByIdAndUpdate(userId, {
      $push: { uploaded_file_urls: fileUrl },
    });

    return result !== null;
  } catch (error) {
    console.error('Add file URL error:', error);
    return false;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map((user: IUser) => toUserInterface(user)!).filter(Boolean);
  } catch (error) {
    return [];
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
};

/**
 * Update user profile (college, phone)
 */
export const updateUserProfile = async (
  userId: string,
  data: { college?: string; phone?: string }
): Promise<User | null> => {
  try {
    const updateData: any = {};
    if (data.college !== undefined) updateData.college = data.college;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    return toUserInterface(user);
  } catch (error) {
    console.error('Update user profile error:', error);
    return null;
  }
};
