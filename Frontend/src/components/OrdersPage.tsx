import React from 'react';
import Header from './Header';
import MyPrints from './MyPrints';

interface OrdersPageProps {
  onGetStarted: () => void;
  onOpenProfile?: () => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onGetStarted, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      <Header onPrimaryAction={onGetStarted} onUserAction={onOpenProfile} isShopOpen />

      <div className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-gray-500">Track, filter, and refresh your print requests.</p>
            </div>
          </div>

          <MyPrints shouldLoad />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
