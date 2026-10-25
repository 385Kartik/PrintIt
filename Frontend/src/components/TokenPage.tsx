import React from 'react';
import { Coins, ArrowRight, Gift, TrendingUp, IndianRupee, Calculator, CheckCircle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface TokenPageProps {
  onGoBack: () => void;
  onOpenProfile?: () => void;
}

const TokenPage: React.FC<TokenPageProps> = ({ onGoBack, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Reusing existing Nav - You might need to adjust props based on your router */}
      <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

      {/* Hero Section */}
      <div className="pt-24 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80ED99]/20 text-black font-semibold mb-6">
            <Gift className="w-5 h-5 text-black" />
            <span>PrintIt Rewards Program</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
            Print More, <br />
            <span className="text-[#6DD687]">Save More.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Earn tokens with every print order and use them to pay for future documents. 
            It's our way of saying thank you.
          </p>
        </div>
      </div>

      {/* The Core Logic Section (The "Math" you requested) */}
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Value Card */}
          <div className="bg-black rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#80ED99] rounded-full filter blur-[100px] opacity-20"></div>

            <h2 className="text-3xl font-bold text-white text-center mb-12 relative z-10">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
              
              {/* Step 1: Spending */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center transform hover:scale-105 transition-all">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="w-8 h-8 text-[#80ED99]" />
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">You Spend</h3>
                <p className="text-4xl font-bold text-white">₹20</p>
                <p className="text-gray-500 text-xs mt-2">on any print order</p>
              </div>

              {/* Arrow / Connection */}
              <div className="flex flex-col items-center justify-center text-[#80ED99]">
                <ArrowRight className="w-12 h-12 hidden md:block animate-pulse" />
                <div className="md:hidden py-4">
                  <ArrowRight className="w-8 h-8 rotate-90" />
                </div>
                <span className="font-bold bg-[#80ED99] text-black px-3 py-1 rounded-full text-sm mt-2">
                  GET FREE
                </span>
              </div>

              {/* Step 2: Earning */}
              <div className="bg-linear-to-br from-[#80ED99] to-[#6DD687] rounded-2xl p-6 text-center transform hover:scale-105 transition-all shadow-lg shadow-green-900/20">
                <div className="bg-black/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-black/70 text-sm uppercase tracking-wider font-bold mb-2">You Earn</h3>
                <p className="text-4xl font-bold text-black">1 Token</p>
                <p className="text-black/60 text-xs mt-2 font-semibold">Added to your wallet</p>
              </div>
            </div>

            {/* Token Value Footer inside Card */}
            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#80ED99] p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Current Token Value</p>
                  <p className="text-xl font-bold text-white">1 Token = ₹1.00</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[#80ED99] font-bold text-sm">5% Value Back</p>
                <p className="text-gray-400 text-xs">Effective return on spend</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Features Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#80ED99] transition-colors">
              <Coins className="w-10 h-10 text-[#80ED99] mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">Automatic Earning</h3>
              <p className="text-gray-600">
                No need to scan codes. Tokens are automatically credited to your account instantly after every payment of ₹20 or more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#80ED99] transition-colors">
              <Calculator className="w-10 h-10 text-[#80ED99] mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">Transparent Value</h3>
              <p className="text-gray-600">
                We keep it simple. 1 Token always equals ₹1. Use them to pay fully or partially for your next document print.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#80ED99] transition-colors">
              <Gift className="w-10 h-10 text-[#80ED99] mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">No Expiration</h3>
              <p className="text-gray-600">
                Your hard-earned tokens never expire. Keep accumulating them for a big project or use them daily.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Example Calculation Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Real World Example</h2>
          
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">Project Report Printing</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#80ED99]" /> Total Cost: ₹200
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#80ED99]" /> 50 Pages (B&W)
                  </li>
                </ul>
              </div>
              
              <div className="hidden md:block h-16 w-px bg-gray-300"></div>
              
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-lg mb-2 text-[#6DD687]">Your Rewards</h4>
                <div className="text-3xl font-bold text-black mb-1">10 Tokens</div>
                <p className="text-sm text-gray-500">
                  (₹200 / 20 = 10 Tokens)
                </p>
              </div>

              <div className="hidden md:block h-16 w-px bg-gray-300"></div>

              <div className="flex-1 text-center md:text-right">
                <h4 className="font-bold text-lg mb-2">Value Earned</h4>
                <div className="text-3xl font-bold text-black">₹10</div>
                <p className="text-sm text-gray-500">To use next time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#80ED99]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-6">Start Building Your Wallet</h2>
          <p className="text-lg text-gray-700 mb-8">
            Upload your first document today and watch your token balance grow.
          </p>
          <button
            onClick={onGoBack}
            className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Start Printing
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      < Footer />
    </div>
  );
};

export default TokenPage;