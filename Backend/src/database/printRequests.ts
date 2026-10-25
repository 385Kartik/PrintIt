import PrintRequestModel, { IPrintRequest, IFileInfo, IPrintOptions } from '../models/PrintRequest.model';
import DailyOtpCounter from '../models/DailyOtpCounter.model';

// Re-export interfaces for backward compatibility
export { IFileInfo as FileInfo, IPrintOptions as PrintOptions };

// Normalize print status for consistent display
export const normalizePrintStatus = (status?: string): 'pending' | 'printed' | 'delivered' => {
  if (status === 'completed' || status === 'delivered' || status === 'collected') return 'delivered';
  if (status === 'processing' || status === 'printed') return 'printed';
  return 'pending';
};

// Legacy interface for backward compatibility with existing code
export interface PrintRequest {
  id: string;
  user_id: string;
  files: IFileInfo[];
  special_pages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  total_amount: number;
  tokens_used: number;
  amount_paid: number;
  payment_id?: string;
  order_id?: string;
  collection_pin?: string; // For college_pickup: day-based OTP (e.g. "252"). For home_delivery: random 4-digit PIN.
  delivery_type: 'college_pickup' | 'home_delivery';
  payment_status: 'pending' | 'completed' | 'failed';
  print_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'delivered' | 'collected';
  deadline?: string;
  created_at: string;
  updated_at: string;
}

// Helper to convert MongoDB document to legacy PrintRequest interface
const toPrintRequestInterface = (doc: IPrintRequest | null): PrintRequest | null => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    user_id: doc.user_id.toString(),
    files: doc.files,
    special_pages: (doc as any).special_pages,
    total_amount: doc.total_amount,
    tokens_used: doc.tokens_used,
    amount_paid: doc.amount_paid,
    payment_id: doc.payment_id,
    order_id: doc.order_id,
    collection_pin: doc.collection_pin,
    delivery_type: doc.delivery_type || 'home_delivery',
    payment_status: doc.payment_status,
    print_status: doc.print_status,
    deadline: doc.deadline ? doc.deadline.toISOString() : undefined,
    created_at: doc.createdAt.toISOString(),
    updated_at: doc.updatedAt.toISOString(),
  };
};

/**
 * Create a print request
 */
export const createPrintRequest = async (data: {
  user_id: string;
  files: IFileInfo[];
  special_pages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  total_amount: number;
  tokens_used: number;
  amount_paid: number;
  order_id?: string;
  payment_id?: string;
  collection_pin?: string;
  delivery_type?: 'college_pickup' | 'home_delivery';
  payment_status: string;
  deadline?: string;
}): Promise<PrintRequest | null> => {
  try {
    // Sanitize files to ensure DB schema requirements are met
    const sanitizeFile = (file: any) => {
      const filename = file.filename || file.originalName || file.name || file.s3Key || file.s3_key || 'document';
      const originalName = file.originalName || file.filename || file.name || 'document';
      const s3Key = file.s3Key || file.s3_key || filename;
      const s3Url = file.s3Url || file.s3_url || file.url || `memory://${filename}`;
      const size = typeof file.size === 'number' ? file.size : 0;
      const mimeType = file.mimeType || file.mimetype || 'application/octet-stream';
      const pages = typeof file.pages === 'number' ? file.pages : 1;
      const printOptions = file.printOptions || undefined;
      const cost = typeof file.cost === 'number' ? file.cost : undefined;

      const sanitized = {
        filename,
        originalName,
        s3Key,
        s3Url,
        size,
        mimeType,
        pages,
        printOptions,
        cost,
      } as IFileInfo;

      // Warn if the original file missed critical fields so we can debug
      if (!file || (!file.filename && !file.originalName) || !file.s3Key || !file.s3Url) {
        console.warn('Sanitizing file missing critical fields:', { original: file, sanitized });
      }

      return sanitized;
    };

    const sanitizedFiles = (data.files || []).map(sanitizeFile);

    const printRequest = await PrintRequestModel.create({
      user_id: data.user_id,
      files: sanitizedFiles,
      special_pages: data.special_pages,
      total_amount: data.total_amount,
      tokens_used: data.tokens_used,
      amount_paid: data.amount_paid,
      order_id: data.order_id,
      payment_id: data.payment_id,
      collection_pin: data.collection_pin,
      delivery_type: data.delivery_type || 'home_delivery',
      payment_status: data.payment_status,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    return toPrintRequestInterface(printRequest);
  } catch (error) {
    console.error('Create print request error:', error);
    return null;
  }
};

/**
 * Find print request by ID
 */
export const findPrintRequestById = async (id: string): Promise<PrintRequest | null> => {
  try {
    const printRequest = await PrintRequestModel.findById(id);
    return toPrintRequestInterface(printRequest);
  } catch (error) {
    return null;
  }
};

/**
 * Get user's print requests
 */
export const getUserPrintRequests = async (userId: string): Promise<PrintRequest[]> => {
  try {
    const printRequests = await PrintRequestModel.find({ user_id: userId }).sort({ createdAt: -1 });
    return printRequests.map((pr: IPrintRequest) => toPrintRequestInterface(pr)!).filter(Boolean);
  } catch (error) {
    return [];
  }
};

/**
 * Update print request payment
 */
export const updatePrintRequestPayment = async (
  id: string,
  paymentData: {
    payment_id: string;
    payment_status: string;
  }
): Promise<PrintRequest | null> => {
  try {
    const printRequest = await PrintRequestModel.findByIdAndUpdate(id, paymentData, { new: true });
    return toPrintRequestInterface(printRequest);
  } catch (error) {
    return null;
  }
};

/**
 * Update a print request with arbitrary fields (used to finalize draft)
 */
export const updatePrintRequest = async (
  id: string,
  data: Partial<{
    files: IFileInfo[];
    total_amount: number;
    tokens_used: number;
    amount_paid: number;
    order_id?: string;
    security_pin?: string;
    payment_status?: string;
    print_status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  }>
): Promise<PrintRequest | null> => {
  try {
    // If files are included in update, sanitize them
    const updateData = { ...data } as any;
    if (updateData.files && Array.isArray(updateData.files)) {
      const sanitizeFile = (file: any) => {
        const filename = file.filename || file.originalName || file.name || file.s3Key || file.s3_key || 'document';
        const originalName = file.originalName || file.filename || file.name || 'document';
        const s3Key = file.s3Key || file.s3_key || filename;
        const s3Url = file.s3Url || file.s3_url || file.url || `memory://${filename}`;
        const size = typeof file.size === 'number' ? file.size : 0;
        const mimeType = file.mimeType || file.mimetype || 'application/octet-stream';
        const pages = typeof file.pages === 'number' ? file.pages : 1;
        const printOptions = file.printOptions || undefined;
        const cost = typeof file.cost === 'number' ? file.cost : undefined;
        return { filename, originalName, s3Key, s3Url, size, mimeType, pages, printOptions, cost } as IFileInfo;
      };
      updateData.files = updateData.files.map(sanitizeFile);
    }

    const printRequest = await PrintRequestModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!printRequest) {
      console.error('Update print request error: Not found');
      return null;
    }

    return toPrintRequestInterface(printRequest);
  } catch (error) {
    console.error('Update print request exception:', error);
    return null;
  }
};

/**
 * Update print request status
 */
export const updatePrintRequestStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'delivered'
): Promise<PrintRequest | null> => {
  try {
    const printRequest = await PrintRequestModel.findByIdAndUpdate(
      id,
      { print_status: status },
      { new: true }
    );
    return toPrintRequestInterface(printRequest);
  } catch (error) {
    return null;
  }
};

/**
 * Get all print requests (admin)
 */
export const getAllPrintRequests = async (): Promise<PrintRequest[]> => {
  try {
    const printRequests = await PrintRequestModel.find().sort({ createdAt: -1 });
    return printRequests.map((pr: IPrintRequest) => toPrintRequestInterface(pr)!).filter(Boolean);
  } catch (error) {
    return [];
  }
};

/**
 * Delete print request
 */
export const deletePrintRequest = async (id: string): Promise<boolean> => {
  try {
    const result = await PrintRequestModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    console.error('Delete print request error:', error);
    return false;
  }
};

/**
 * Get print requests by status
 */
export const getPrintRequestsByStatus = async (
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<PrintRequest[]> => {
  try {
    const printRequests = await PrintRequestModel.find({ print_status: status }).sort({ createdAt: -1 });
    return printRequests.map((pr: IPrintRequest) => toPrintRequestInterface(pr)!).filter(Boolean);
  } catch (error) {
    return [];
  }
};

const formatRequestWithUser = (request: any) => {
  // Safely get user data from populated user_id
  const userData = request.user_id;
  const user = (userData && typeof userData === 'object') ? {
    name: userData.name || 'Unknown',
    email: userData.email || 'N/A',
    phone: userData.phone || 'N/A',
  } : {
    name: 'Unknown',
    email: 'N/A',
    phone: 'N/A',
  };

  return {
    _id: request._id ? request._id.toString() : request._id,
    user,
    files: request.files || [],
    special_pages: request.special_pages || undefined,
    totalPages: request.files?.reduce((sum: number, file: any) => sum + (file.pages || 0), 0) || 0,
    total_amount: request.total_amount,
    amount_paid: request.amount_paid,
    tokens_used: request.tokens_used,
    payment_status: request.payment_status,
    print_status: request.print_status,
    delivery_type: request.delivery_type || 'home_delivery',
    deadline: request.deadline,
    status: request.print_status === 'completed' ? 'delivered' : request.print_status || 'pending',
    createdAt: request.createdAt,
    order_id: request.order_id,
    payment_id: request.payment_id,
    collection_pin: request.collection_pin || request.security_pin || request.collection_otp,
  };
};

/**
 * Generate a daily auto-incrementing OTP for college pickup orders.
 * Resets to 1 at the start of each new day.
 */
export const generatePickupOtp = async (): Promise<string> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dayOfMonth = new Date().getDate(); // e.g., 25
  const result = await DailyOtpCounter.findOneAndUpdate(
    { date: today },
    { $inc: { counter: 1 } },
    { upsert: true, new: true }
  );
  // e.g., day 25 + counter 2 → "252"
  return `${dayOfMonth}${result.counter}`;
};

/**
 * Generate a unique 4-digit collection PIN
 */
export const generateUniqueCollectionPin = async (): Promise<string> => {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const exists = await PrintRequestModel.findOne({ collection_pin: pin }).select('_id');
    if (!exists) {
      return pin;
    }
  }
  throw new Error('Failed to generate unique collection PIN');
};

/**
 * Find a print request by collection PIN (admin)
 */
export const findPrintRequestByCollectionPin = async (pin: string): Promise<any | null> => {
  try {
    const request = await PrintRequestModel.findOne({
      $or: [
        { collection_pin: pin },
        { security_pin: pin },
        { collection_otp: pin }
      ]
    })
      .populate('user_id', 'name email phone');

    if (!request) return null;

    return formatRequestWithUser(request);
  } catch (error) {
    console.error('Find print request by PIN error:', error);
    return null;
  }
};

/**
 * Get all print requests with user data populated (for admin)
 */
export const getAllPrintRequestsWithUsers = async (): Promise<any[]> => {
  try {
    const printRequests = await PrintRequestModel.find()
      .populate('user_id', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return printRequests.map(formatRequestWithUser);
  } catch (error) {
    console.error('Get all print requests with users error:', error);
    return [];
  }
};
