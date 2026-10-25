import React from 'react';
import Header from './Header';
import {
  ShieldCheck,
  Lock,
  Activity,
  Eye,
  Mail
} from 'lucide-react';
import Footer from './Footer';

interface PrivacyPageProps {
  onGoBack: () => void;
  onOpenProfile?: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onGoBack, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      
      <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

      {/* --- HERO SECTION --- */}
      <div className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#80ED99]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80ED99]/10 text-[#00a844] text-[10px] font-bold mb-8 uppercase tracking-[0.2em] border border-[#80ED99]/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black leading-[0.9]">
            YOUR PRIVACY IS <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-emerald-600">
              OUR PROTOCOL.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            We operate with a security-first architecture. Your data powers your experience, securely.
          </p>
          <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last Updated: January 2026
          </p>
        </div>
      </div>

      {/* --- KEY PROMISES --- */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6 text-[#80ED99]">
                    <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Encryption Protocol</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    All service requests are transmitted using <strong>Industry Standard Encryption (TLS/SSL)</strong> protocols.
                </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-700">
                    <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Service Integrity</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    System inputs are processed strictly to <strong>facilitate fulfillment</strong> and maintain platform quality.
                </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-700">
                    <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">Zero External Sharing</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    We maintain strict data isolation. We <strong>do not monetize</strong> user contact details with third parties.
                </p>
            </div>
        </div>
      </div>

      {/* --- LEGAL CONTENT --- */}
      <div className="pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-sm relative">
            <div className="prose prose-lg prose-gray max-w-none">
                
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">01</span>
                        Service Processing
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        To facilitate digital fulfillment, our systems <strong>process necessary inputs</strong> and technical metadata provided by the user.
                    </p>
                </div>

                {/* 2. REWARD AUTOMATION (Justifying Data Collection for Tokens) */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">02</span>
                        Platform Optimization & Rewards
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        We utilize service data to maintain and enhance the platform. This includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-500 mt-4 marker:text-[#80ED99] text-sm">
                        <li>Facilitating the execution of user-initiated commands.</li>
                        <li><strong>Loyalty Calculation:</strong> Tracking transaction volume to automatically credit promotional Tokens (1 Token per ₹16 spend) to user accounts.</li>
                        <li><strong>Algorithmic Refinement:</strong> Analyzing aggregate data to improve system heuristics and error detection.</li>
                    </ul>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">03</span>
                        Security Protocols
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        We deploy robust technical measures to safeguard service integrity. Access to processing nodes is restricted to authorized operations essential for service delivery.
                    </p>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <span className="bg-[#FAFAFA] text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200">04</span>
                        Contact
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        For inquiries regarding platform policies, please contact our support team.
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#80ED99]" />
                        <a href="mailto:contact.us.print.it@gmail.com" className="font-bold text-black border-b-2 border-[#80ED99] hover:bg-[#80ED99] hover:border-transparent transition-colors">contact.us.print.it@gmail.com</a>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <Footer />

    </div>
  );
};

export default PrivacyPage;