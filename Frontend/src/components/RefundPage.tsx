import React from 'react';
import Header from './Header';
import {
  Wallet,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Gift
} from 'lucide-react';
import Footer from './Footer';

interface RefundPageProps {
  onGoBack: () => void;
  onOpenProfile?: () => void;
}

const RefundPage: React.FC<RefundPageProps> = ({ onGoBack, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      
      <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

      {/* --- 1. HERO SECTION --- */}
      <div className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#80ED99]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80ED99]/10 text-[#00a844] text-[10px] font-bold mb-8 uppercase tracking-[0.2em] border border-[#80ED99]/20">
            <Wallet className="w-3 h-3" />
            <span>Refund Policy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black leading-[0.9]">
            FAIR & TRANSPARENT <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-emerald-600">
              REFUNDS.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Real money gets real refunds. Promotional credits stay in the system. 
            We maintain strict separation between the two.
          </p>
          <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Policy Version: 2.1 (Loyalty Protocol)
          </p>
        </div>
      </div>

      {/* --- 2. HIGHLIGHTS --- */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Cash Refunds */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black mb-2">UPI/Cash Refund</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                    <strong>100% Reversal</strong> to original payment source if a real-money transaction fails due to server error.
                </p>
            </div>

            {/* Token Logic */}
            <div className="bg-[#050505] text-white p-6 rounded-[2rem] border border-gray-800 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(128,237,153,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-[#80ED99]">
                    <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black mb-2">Token Refund</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                    Failed orders paid via Tokens are refunded to your <strong>PrintIt Wallet</strong>. Tokens cannot be converted to cash.
                </p>
            </div>

            {/* User Errors */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-500">
                    <XCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black mb-2">User Errors</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                    <strong>No Refund</strong> for wrong file uploads, incorrect settings, or uncollected prints.
                </p>
            </div>

            {/* Quality */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black mb-2">Quality Disputes</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                    Refunds processed only after physical verification of defects at the Partner Hub.
                </p>
            </div>
        </div>
      </div>

      {/* --- 3. DETAILED POLICY --- */}
      <div className="pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-sm relative">
            
            <div className="prose prose-lg prose-gray max-w-none">
                
                {/* 1. Eligibility */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">01</span>
                        Refund Eligibility Criteria
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        We process refunds automatically under the following conditions:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-500 mt-4 marker:text-[#80ED99] text-sm">
                        <li><strong>Gateway Failures:</strong> Money deducted from bank but order status remains "Failed" for more than 1 hour.</li>
                        <li><strong>Partner Unavailability:</strong> If the selected Shop is verified as offline/closed after order placement.</li>
                    </ul>
                </div>

                {/* 2. PROMOTIONAL CREDITS POLICY */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">02</span>
                        Promotional Credits (Tokens)
                    </h2>
                    <div className="bg-gray-50 border-l-4 border-[#80ED99] p-6 rounded-r-xl">
                        <p className="text-gray-700 font-medium text-sm leading-relaxed">
                            <strong>PrintIt Tokens</strong> (including Login Bonus & Spend Rewards) are promotional instruments owned by PrintIt.
                        </p>
                        <ul className="list-disc pl-4 space-y-2 text-gray-600 mt-4 marker:text-black text-sm">
                            <li>Tokens are applied as a <strong>100% discount</strong> on print services. They are not legal tender.</li>
                            <li><strong>Non-Refundable to Bank:</strong> If you cancel or lose an order paid via Tokens, the refund is credited back to your PrintIt Wallet as Tokens. Under no circumstances can Tokens be encashed.</li>
                            <li><strong>Expiry:</strong> PrintIt reserves the right to expire promotional tokens if the account remains inactive for more than 12 months.</li>
                        </ul>
                    </div>
                </div>

                {/* 3. Non-Refundable */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">03</span>
                        Non-Refundable Items
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        Since printing is a custom service, we do not offer refunds for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-500 mt-4 marker:text-red-400 text-sm">
                        <li><strong>Change of Mind:</strong> Once a file is queued for printing, it cannot be cancelled.</li>
                        <li><strong>User Error:</strong> Uploading the wrong document or selecting incorrect print specifications (e.g., Color instead of B&W).</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="mt-12 pt-10 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-black mb-2">Dispute Resolution</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        For transaction disputes, email us with your <span className="font-mono bg-gray-100 px-1 rounded text-black">Order ID</span>.
                    </p>
                    <a href="mailto:contact.us.print.it@gmail.com" className="inline-flex items-center gap-2 text-black font-bold border-b-2 border-[#80ED99] hover:bg-[#80ED99] hover:border-transparent transition-colors">
                        <HelpCircle className="w-4 h-4" /> contact.us.print.it@gmail.com
                    </a>
                </div>

            </div>
        </div>
      </div>

      <Footer />

    </div>
  );
};

export default RefundPage;