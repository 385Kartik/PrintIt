import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/admin/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
};

// Admin Service
export interface PrintOptions {
  printSide: 'single' | 'double';
  colorMode: 'bw' | 'color';
  paperSize: 'A4' | 'A3' | 'Letter';
  copies: number;
}

export interface FileInfo {
  filename: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  size: number;
  mimeType: string;
  pages: number;
  pageCount?: number; // For backward compatibility
  printOptions?: PrintOptions;
  _id?: string;
}

export interface PrintRequest {
  _id: string;
  id?: string;
  user_id?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  files: FileInfo[];
  special_pages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  total_amount?: number;
  amount?: number; // For backward compatibility
  tokens_used?: number;
  amount_paid?: number;
  order_id?: string;
  collection_pin?: string;
  delivery_type: 'college_pickup' | 'home_delivery';
  payment_status?: 'pending' | 'completed' | 'failed';
  print_status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'delivered' | 'collected';
  deadline: string;
  status: 'pending' | 'delivered' | 'processing' | 'completed' | 'cancelled' | 'printed' | 'collected';
  createdAt: string;
  created_at?: string;
  // Legacy fields for backward compatibility
  totalPages?: number;
  colorPages?: number;
  printType?: 'black-white' | 'color';
  copies?: number;
  paperSize?: 'A4' | 'A3';
}

const normalizeStatus = (status?: string) => {
  if (status === 'completed' || status === 'delivered' || status === 'collected') return 'delivered';
  if (status === 'processing' || status === 'printed') return 'printed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
};

export const adminService = {
  getAllPrintRequests: async (): Promise<PrintRequest[]> => {
    const response = await api.get('/admin/print-requests');
    const data = (response.data || []).map((request: any) => ({
      ...request,
      print_status: normalizeStatus(request.print_status || request.status),
      status: normalizeStatus(request.print_status || request.status),
      user: request.user || {
        name: 'Unknown',
        email: 'N/A',
        phone: 'N/A',
      },
      collection_pin: request.collection_pin,
      delivery_type: request.delivery_type || 'home_delivery',
    }));

    return data;
  },

  getCollegePickupRequests: async (): Promise<PrintRequest[]> => {
    const response = await api.get('/admin/print-requests/college-pickup');
    const data = (response.data || []).map((request: any) => ({
      ...request,
      print_status: normalizeStatus(request.print_status || request.status),
      status: normalizeStatus(request.print_status || request.status),
      user: request.user || {
        name: 'Unknown',
        email: 'N/A',
        phone: 'N/A',
      },
      collection_pin: request.collection_pin,
      delivery_type: 'college_pickup' as const,
    }));
    return data;
  },

  updatePrintStatus: async (
    requestId: string,
    printStatus: 'pending' | 'printed' | 'processing' | 'completed' | 'cancelled' | 'delivered' | 'collected'
  ) => {
    const response = await api.patch(`/admin/print-requests/${requestId}/status`, { printStatus });
    return response.data;
  },

  downloadFile: async (s3Key: string, filename: string) => {
    const response = await api.get(`/admin/download/${encodeURIComponent(s3Key)}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  markAsDelivered: async (requestId: string) => {
    const response = await api.patch(`/admin/print-requests/${requestId}/deliver`);
    return response.data;
  },

  getFilePreview: async (s3Key: string): Promise<{ previewUrl: string; expiresIn: number }> => {
    const response = await api.get(`/admin/preview/${encodeURIComponent(s3Key)}`);
    return response.data;
  },
  searchByPin: async (pin: string): Promise<PrintRequest> => {
    const response = await api.get(`/admin/print-requests/pin/${pin}`);
    const request = response.data;
    return {
      ...request,
      print_status: normalizeStatus(request.print_status || request.status),
      status: normalizeStatus(request.print_status || request.status),
      user: request.user || {
        name: 'Unknown',
        email: 'N/A',
        phone: 'N/A',
      },
      collection_pin: request.collection_pin,
      delivery_type: request.delivery_type || 'home_delivery',
    };
  },
};

export default api;
