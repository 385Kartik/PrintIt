import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Image, File, Clock, CheckCircle, XCircle, RefreshCw, Truck, School } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrdersStore } from '../store/useOrdersStore';
import { authService } from '../services/auth.service';

interface MyPrintsProps { shouldLoad?: boolean }

const MyPrints: React.FC<MyPrintsProps> = ({ shouldLoad = false }) => {
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [initializing, setInitializing] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-gray-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
      case 'printed':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const shouldFetchOrders = shouldLoad || orders.length === 0;

  useEffect(() => {
    if (!shouldFetchOrders) return;

    let active = true;
    const hydrateOrders = async () => {
      try {
        setInitializing(true);
        const token = authService.getToken();
        if (!token) return;
        await fetchOrders(token, { force: shouldLoad });
      } catch (error) {
        console.error('Error fetching prints:', error);
        if (error instanceof Error && !error.message.includes('auth')) {
          toast.error('Failed to fetch print requests');
        }
      } finally {
        if (active) setInitializing(false);
      }
    };

    void hydrateOrders();
    return () => { active = false; };
  }, [shouldFetchOrders, fetchOrders, shouldLoad]);

  const filteredPrints = useMemo(() => {
    if (filter === 'pending') {
      return orders.filter(
        (order) => order.printStatus !== 'delivered' && order.printStatus !== 'completed'
      );
    }
    return orders;
  }, [orders, filter]);

  const isLoading = loading || initializing;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
         <div className="w-10 h-10 border-4 border-[#80ED99] border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    // Outer Container: Plain full width on mobile, Card style on Desktop
    <div className="w-full sm:bg-white sm:border-2 sm:border-gray-200 sm:rounded-xl sm:p-8 sm:shadow-sm sm:mb-8">
      
      {/* --- Sticky Header (Controls) --- */}
      <div className="sticky top-0 z-20 bg-gray-50 sm:bg-white pt-4 pb-4 px-4 sm:px-0 sm:pt-0 border-b sm:border-none border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm sm:shadow-none mb-4 sm:mb-6">
        
        {/* Title & Refresh */}
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-black">My Requests</h2>
          <button
            onClick={async () => {
              try {
                const token = authService.getToken();
                if (token) await fetchOrders(token, { force: true });
                toast.success("Orders refreshed");
              } catch (err) {
                toast.error('Failed to refresh');
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 whitespace-nowrap active:scale-95 transition-transform"
            title="Refresh Orders"
          >
            <RefreshCw className="h-4 w-4 sm:inline" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto p-1 bg-gray-200/50 rounded-xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              filter === 'pending'
                ? 'bg-white text-black shadow-sm scale-[1.02]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Undelivered
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              filter === 'all'
                ? 'bg-white text-black shadow-sm scale-[1.02]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      {/* --- Orders List --- */}
      {filteredPrints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">No orders found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            {filter === 'pending' ? 'You have no pending prints.' : 'You haven\'t placed any orders yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-4 sm:px-0 pb-20 sm:pb-0">
          {filteredPrints.map((print) => (
            <div
              key={print._id}
              className="bg-white sm:bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm sm:shadow-none sm:border-2"
            >
              {/* Card Header: Status & Price */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 sm:border-gray-200/60">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`p-2 rounded-full ${
                    print.printStatus === 'completed' || print.printStatus === 'delivered' || print.printStatus === 'collected' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {getStatusIcon(print.printStatus)}
                  </div>
                  <div className="flex-1">
                    <p className="text-black font-bold capitalize text-base">
                      {print.printStatus === 'printed'
                        ? (print.deliveryType === 'college_pickup' ? 'Ready — Pickup at College' : 'Ready for Pickup')
                        : print.printStatus === 'collected'
                        ? 'Collected ✓'
                        : print.printStatus}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {new Date(print.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(print.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Price (Mobile: Top Right, Desktop: Right) */}
                  <div className="text-right sm:hidden">
                    <p className="text-black font-bold text-lg">₹{print.totalAmount}</p>
                  </div>
                </div>

                {/* Price (Desktop) */}
                <div className="hidden sm:block text-right">
                  <p className="text-black font-bold text-lg">₹{print.totalAmount}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {print.tokensUsed > 0 ? `${print.tokensUsed} tokens saved` : 'Paid via UPI'}
                  </p>
                </div>
              </div>

              {/* Card Body: Files & PIN */}
              <div className="space-y-3">

                {/* Delivery Type Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  print.deliveryType === 'college_pickup'
                    ? 'bg-orange-50 border border-orange-200 text-orange-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {print.deliveryType === 'college_pickup' ? (
                    <><School className="w-3.5 h-3.5" /> Print from College — Same-Day Campus Pickup</>
                  ) : (
                    <><Truck className="w-3.5 h-3.5" /> Next-Day Delivery</>
                  )}
                </div>

                {/* PIN Badge — college: pickup number, home: collection PIN */}
                {print.deliveryType === 'college_pickup' && print.collectionPin && (
                  <div className="flex items-center justify-between bg-orange-500 text-white px-4 py-3 rounded-lg shadow-md">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Your Pickup Number</span>
                    <span className="text-3xl font-mono font-black tracking-widest">#{print.collectionPin}</span>
                  </div>
                )}

                {/* Collection PIN Badge (home delivery) */}
                {print.deliveryType !== 'college_pickup' && print.collectionPin && (
                   <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-lg shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#80ED99]">Collection PIN</span>
                      <span className="text-xl font-mono font-bold tracking-[0.2em]">{print.collectionPin}</span>
                   </div>
                )}

                {/* Files List */}
                <div className="bg-gray-50 sm:bg-white rounded-lg border border-gray-100 overflow-hidden">
                  {print.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 text-sm font-medium truncate">
                          {file.originalName}
                        </p>
                        <p className="text-gray-500 text-xs">
                           {(file.size / 1024 / 1024).toFixed(2)} MB • {file.pages || '?'} Pages
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Card Footer: Deadline/Tokens Mobile */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2">
                 {print.deliveryType === 'college_pickup' ? (
                    <span className="font-medium text-orange-600">⚡ Same-Day Priority</span>
                 ) : print.deadline ? (
                    <span>Deadline: {new Date(print.deadline).toLocaleDateString()}</span>
                 ) : (
                    <span>Standard Delivery</span>
                 )}
                 
                 {/* Mobile Only Token Text */}
                 <span className="sm:hidden font-medium text-gray-900">
                    {print.tokensUsed > 0 && `Saved ₹${print.tokensUsed}`}
                 </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrints;