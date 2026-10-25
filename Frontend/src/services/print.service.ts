// Normalize API base: accept values with or without trailing /api
const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = rawApi.endsWith('/api') ? rawApi : `${rawApi.replace(/\/$/, '')}/api`;

export interface PrintOptions {
  printSide: 'single' | 'double';
  colorMode: 'bw' | 'color';
  paperSize: 'A4' | 'A3' | 'Letter';
  copies: number;
}

export interface FileData {
  filename: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  size: number;
  mimeType: string;
  pages: number;
  printOptions?: PrintOptions;
  cost?: number;
}

export interface PrintRequest {
  _id: string;
  userId: string;
  files: FileData[];
  specialPages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  totalAmount: number;
  tokensUsed: number;
  amountPaid: number;
  paymentId?: string;
  orderId?: string;
  collectionPin?: string;
  deliveryType: 'college_pickup' | 'home_delivery';
  paymentStatus: 'pending' | 'completed' | 'failed';
  printStatus: 'pending' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'delivered' | 'collected';
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export const printService = {
  async uploadFiles(files: File[], token: string): Promise<{ files: FileData[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/print/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'File upload failed';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async calculateCostFromFiles(
    files: File[],
    printOptions: PrintOptions[],
    useTokens: boolean,
    token: string,
    specialPages?: { certificatePage: number; indexPage: number; coverPage: number },
    deliveryType?: 'college_pickup' | 'home_delivery'
  ): Promise<{
    totalAmount: number;
    tokensUsed: number;
    amountToPay: number;
    tokensAvailable: number;
    breakdown: Array<{ filename: string; pages: number; cost: number; printOptions: PrintOptions }>;
    files: FileData[];
    requestId?: string;
    specialPages?: { certificatePage: number; indexPage: number; coverPage: number };
    specialPagesCost?: number;
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('printOptions', JSON.stringify(printOptions));
    formData.append('useTokens', String(useTokens));
    if (specialPages) {
      formData.append('specialPages', JSON.stringify(specialPages));
    }
    if (deliveryType) {
      formData.append('deliveryType', deliveryType);
    }

    const response = await fetch(`${API_URL}/print/calculate-cost-from-files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'Failed to calculate cost';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async calculateCost(
    files: FileData[],
    useTokens: boolean,
    token: string,
    specialPages?: { certificatePage: number; indexPage: number; coverPage: number }
  ): Promise<{
    totalAmount: number;
    tokensUsed: number;
    amountToPay: number;
    tokensAvailable: number;
    breakdown: Array<{ filename: string; pages: number; cost: number }>;
    requestId?: string;
    specialPages?: { certificatePage: number; indexPage: number; coverPage: number };
    specialPagesCost?: number;
  }> {
    const response = await fetch(`${API_URL}/print/calculate-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ files, useTokens, specialPages }),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'Failed to calculate cost';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async createOrder(
    requestId: string,
    token: string,
    deliveryType?: 'college_pickup' | 'home_delivery'
  ): Promise<{
    orderId: string;
    amountToPay: number;
    tokensUsed: number;
    requestId: string;
    printRequestId?: string;
    deliveryType?: string;
    pickupOtp?: number;
    deadline: string;
    keyId?: string;
  }> {
    const response = await fetch(`${API_URL}/print/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId, deliveryType }),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'Failed to create order';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async verifyPayment(
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      requestId: string;
      deliveryType?: string;
    },
    token: string
  ): Promise<{ message: string; printRequest: PrintRequest; tokensEarned: number }> {
    const response = await fetch(`${API_URL}/print/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'Payment verification failed';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async cancelPendingRequest(requestId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/print/cancel-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId }),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = 'Failed to cancel pending request';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    return JSON.parse(text);
  },

  async getMyRequests(
    token: string,
    page = 1,
    limit = 10,
    undeliveredOnly = false
  ): Promise<{
    printRequests: PrintRequest[];
    currentPage: number;
    totalPages: number;
    total: number;
  }> {
    const undeliveredParam = undeliveredOnly ? '&undeliveredOnly=true' : '';
    const response = await fetch(
      `${API_URL}/print/my-requests?page=${page}&limit=${limit}${undeliveredParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const text = await response.text();
    if (!response.ok) {
      let message = 'Failed to fetch print requests';
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }
    const payload = JSON.parse(text);

    const normalizeFile = (file: any): FileData => ({
      filename: file.filename || file.originalName || file.name || 'document',
      originalName: file.originalName || file.filename || file.name || 'document',
      s3Key: file.s3Key || file.s3_key || '',
      s3Url: file.s3Url || file.s3_url || file.url || '',
      size: file.size || 0,
      mimeType: file.mimeType || file.mimetype || 'application/pdf',
      pages: file.pages || file.pageCount || 0,
      printOptions: file.printOptions,
      cost: file.cost,
    });

    const normalizePrintStatus = (status?: string) => {
      if (status === 'completed' || status === 'delivered') return 'delivered';
      if (status === 'processing' || status === 'printed') return 'printed';
      if (status === 'cancelled') return 'cancelled';
      return 'pending';
    };

    const normalizeRequest = (request: any): PrintRequest => ({
      _id: request._id || request.id,
      userId: request.userId || request.user_id,
      files: Array.isArray(request.files) ? request.files.map(normalizeFile) : [],
      specialPages: request.specialPages || request.special_pages,
      totalAmount: request.totalAmount ?? request.total_amount ?? request.amount ?? 0,
      tokensUsed: request.tokensUsed ?? request.tokens_used ?? 0,
      amountPaid: request.amountPaid ?? request.amount_paid ?? 0,
      paymentId: request.paymentId || request.payment_id,
      orderId: request.orderId || request.order_id,
      collectionPin: request.collectionPin || request.collection_pin,
      deliveryType: request.deliveryType || request.delivery_type || 'home_delivery',
      paymentStatus: request.paymentStatus || request.payment_status || 'pending',
      printStatus: normalizePrintStatus(request.printStatus || request.print_status || request.status),
      deadline: request.deadline,
      createdAt: request.createdAt || request.created_at || new Date().toISOString(),
      updatedAt: request.updatedAt || request.updated_at || request.createdAt || new Date().toISOString(),
    });

    const normalizedRequests = Array.isArray(payload.printRequests)
      ? payload.printRequests.map(normalizeRequest)
      : [];

    return {
      ...payload,
      printRequests: normalizedRequests,
    };
  },

  async getFilePreview(s3Key: string, token: string): Promise<{ previewUrl: string; expiresIn: number }> {
    const response = await fetch(
      `${API_URL}/print/preview/${encodeURIComponent(s3Key)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get file preview');
    }

    return response.json();
  },
};
