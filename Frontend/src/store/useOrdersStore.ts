import { create } from 'zustand';
import { printService, type PrintRequest } from '../services/print.service';

interface OrdersState {
  orders: PrintRequest[];
  loading: boolean;
  lastFetched: number | null;
  fetchOrders: (token: string, options?: { force?: boolean }) => Promise<void>;
  setOrders: (orders: PrintRequest[]) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  lastFetched: null,
  fetchOrders: async (token: string, options?: { force?: boolean }) => {
    const shouldForce = options?.force ?? false;
    if (!shouldForce && get().orders.length > 0) {
      return;
    }

    set({ loading: true });
    try {
      const response = await printService.getMyRequests(token, 1, 50, false);
      set({
        orders: response.printRequests,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch orders', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  setOrders: (orders) => set({ orders }),
  clearOrders: () => set({ orders: [], lastFetched: null }),
}));
