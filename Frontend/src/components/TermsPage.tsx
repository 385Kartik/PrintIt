import React from 'react';
import Header from './Header';
import {
  Scale,
  Ban,
  Gift,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import Footer from './Footer';

interface TermsPageProps {
  onGoBack: () => void;
  onOpenProfile?: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onGoBack, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      
      <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

      {/* --- 1. HERO SECTION --- */}
      <div className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#80ED99]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80ED99]/10 text-[#00a844] text-[10px] font-bold mb-8 uppercase tracking-[0.2em] border border-[#80ED99]/20">
            <Scale className="w-3 h-3" />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black leading-[0.9]">
            TERMS OF <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-emerald-600">
              SERVICE.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            These terms constitute a legally binding agreement between you ("User") and PrintIt. 
            Read carefully before proceeding.
          </p>
          <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last Revised: January 2026
          </p>
        </div>
      </div>

      {/* --- 2. KEY HIGHLIGHTS --- */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                    <Ban className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Usage Policy</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Printing illegal, offensive, or counterfeit material is strictly prohibited. Accounts found in violation will be permanently suspended.
                </p>
            </div>

            <div className="bg-[#050505] text-white p-8 rounded-[2rem] border border-gray-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#80ED99] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">NO CASH VALUE</div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-[#80ED99]">
                    <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Token Protocol</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    PrintIt Tokens are <strong>promotional loyalty credits</strong>. They are NOT currency and cannot be withdrawn to a bank account.
                </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-600">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Indemnity</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    PrintIt is a software facilitator. We are not liable for hardware failures, shop closures, or missed deadlines.
                </p>
            </div>
        </div>
      </div>

      {/* --- 3. DETAILED LEGAL TEXT --- */}
      <div className="pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-sm relative">
            <div className="prose prose-lg prose-gray max-w-none">
                
                {/* 1. Acceptance */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">01</span>
                        Acceptance & Eligibility
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        By accessing the platform, you confirm you are at least 18 years old or accessing under supervision. PrintIt acts solely as an aggregator connecting users with independent printing hubs ("Partners").
                    </p>
                </div>

                {/* 2. THE LOYALTY CLAUSE (DETAILED) */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">02</span>
                        Loyalty Program ("PrintIt Tokens")
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        The platform operates a promotional rewards system known as "Tokens" or "PrintIt Money".
                    </p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-4">
                        <h4 className="font-bold text-black text-sm uppercase mb-2">Earning Mechanics:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm mb-4">
                            <li><strong>Sign-Up Bonus:</strong> New users are credited <strong>5 Tokens</strong> upon verified registration.</li>
                            <li><strong>Spend Rewards:</strong> Users earn <strong>1 Token</strong> automatically for every cumulative <strong>₹16 spent</strong> on successful orders.</li>
                        </ul>
                        <h4 className="font-bold text-red-600 text-sm uppercase mb-2">Legal Nature of Tokens:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm">
                            <li>Tokens have <strong>zero monetary value</strong> outside the PrintIt ecosystem.</li>
                            <li>Tokens constitute a limited, non-transferable license to use the platform's services.</li>
                            <li><strong>No Withdrawals:</strong> Tokens cannot be redeemed for cash, transferred to bank accounts, or exchanged between users.</li>
                        </ul>
                    </div>
                </div>

                {/* 3. Data Rights (Stealth AI) */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">03</span>
                        Content License & Data Usage
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        You retain full ownership of your files. However, to provide and improve the service, you grant PrintIt a license to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-500 mt-4 marker:text-[#80ED99] text-sm">
                        <li>Process, encrypt, and transmit files to Partner Shops.</li>
                        <li><strong>Conduct automated analysis</strong> of file metadata, layout structures, and error patterns to enhance system heuristics and print optimization algorithms.</li>
                        <li>Utilize transaction history for the automated calculation of Loyalty Rewards.</li>
                    </ul>
                </div>

                {/* 4. Limitation of Liability */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">04</span>
                        Disclaimer & Limitation of Liability
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        The service is provided "AS IS". PrintIt shall not be liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-500 mt-4 marker:text-gray-300 text-sm">
                        <li>Delays caused by third-party shop closures or hardware malfunctions.</li>
                        <li>Loss of data due to user negligence (e.g., uploading wrong file).</li>
                        <li>Any indirect, incidental, or consequential damages arising from service use.</li>
                    </ul>
                    
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-gray-400 mt-1 shrink-0" />
                        <div className="text-sm text-gray-500">
                            <strong>Governing Law:</strong> These terms are governed by the laws of India. Exclusive jurisdiction resides with the courts of Mumbai, Maharashtra.
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <Footer />

    </div>
  );
};

export default TermsPage;