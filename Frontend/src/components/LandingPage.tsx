import React from 'react';
import { 
  Zap, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Printer, 
  Moon, 
  Coins, 
  ChevronRight 
} from 'lucide-react';
import Header from './Header';
import { Link } from 'react-router-dom';
import Footer from './Footer'; // Assuming you have this from the 2nd app structure

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenProfile?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenProfile }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      {/* Header */}
      <Header 
        onPrimaryAction={onGetStarted} 
        onUserAction={onOpenProfile} 
      />

      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden pt-32 lg:pt-40 pb-20">
        
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-sm font-bold mb-8 border shadow-sm transition-all duration-300 bg-green-50 border-green-200 text-green-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
              </span>
              <span className="tracking-wide">Portal Live (24/7 Open)</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Print Your Documents
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-[#00b894]">
                Without the Queue.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload from home, customize settings, and pick up your prints in minutes. 
              Featuring <b>75 GSM Premium Paper</b> & Gold-Standard Ink.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl font-bold text-lg border-2 shadow-lg inline-flex items-center gap-2 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[#80ED99] text-black border-[#6DD687] hover:bg-[#6DD687]"
              >
                Start Printing
                <ArrowRight className="w-5 h-5 stroke-[3px]" />
              </button>

              <Link 
                to="/savings" 
                className="group flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 hover:border-black/30 hover:bg-gray-50 transition-all font-semibold text-gray-700"
              >
                <Coins className="w-5 h-5 text-gray-400 group-hover:text-[#80ED99] transition-colors" />
                <span>Calculate Savings</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Hero Illustration (The Green Box) */}
          <div className="mt-20 relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-b from-[#80ED99]/20 to-transparent blur-3xl -z-10 rounded-full"></div>
            
            <div className="bg-gradient-to-br from-[#80ED99] to-[#5ac18e] rounded-3xl p-1 shadow-2xl transition-all duration-500">
              <div className="bg-white/90 backdrop-blur-xl rounded-[1.3rem] p-8 md:p-10 shadow-inner">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Printer, label: 'Easy Upload', desc: 'PDF, DOCX, IMG' },
                    { icon: Zap, label: 'Queueless', desc: 'Skip the line' },
                    { icon: Shield, label: 'Secure Pay', desc: 'UPI & Cards' },
                    { icon: Moon, label: 'Late Night', desc: 'Open till 9 PM' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:border-[#80ED99] hover:bg-white hover:shadow-lg transition-all duration-300 group">
                      <div className="bg-white border border-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <item.icon className="w-7 h-7 text-[#80ED99]" />
                      </div>
                      <p className="text-base font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-tight">Why Smart Students Choose PrintIt?</h2>
            <p className="text-lg text-gray-600">Better quality than market. Cheaper price. Zero hassle.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1: Speed */}
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-[#80ED99] hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload and process documents in seconds. Our system calculates cost instantly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  Zero waiting time
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  Real-time cost calc
                </li>
              </ul>
            </div>

            {/* Feature 2: Savings (Highlighted) */}
            <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-2xl border-4 border-[#80ED99] relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#80ED99] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Most Popular
              </div>
              <div className="bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-gray-700">
                <Coins className="w-8 h-8 text-[#80ED99]" />
              </div>
              <h3 className="text-2xl font-bold text-[#80ED99] mb-3">Unbeatable Price</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Market charges ₹5/page. We charge <b>₹2.5/page</b> (double-sided) with premium paper.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  75 GSM Gold-Infused Ink
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  <b>Tokens</b> on every order
                </li>
              </ul>
              <Link to="/pricing" className="mt-8 inline-flex items-center text-sm font-bold border-b border-[#80ED99] pb-0.5 hover:text-[#80ED99] transition-colors">
                  View Rate Card &rarr;
              </Link>
            </div>

            {/* Feature 3: Night Owl */}
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-[#80ED99] hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <Moon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Late Night Owl</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Submission tomorrow? We are open till <b>09:00 PM</b>. Upload late, pick up early.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  Open 7 Days a week
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#80ED99] flex-shrink-0" />
                  Morning delivery available
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get your documents printed in 4 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Upload', desc: 'PDF, Images, or Docs' },
              { step: '2', title: 'Customize', desc: 'B/W, Color, Sides' },
              { step: '3', title: 'Pay Securely', desc: 'UPI & Earn Tokens' },
              { step: '4', title: 'Pick Up', desc: 'Visit Shop or Collect at your College' },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-[#80ED99] flex items-center justify-center text-3xl font-bold text-black mx-auto mb-6 group-hover:bg-[#80ED99] transition-colors duration-300 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-[#80ED99]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-6 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10 font-medium">
            Join thousands of students who save time & money with PrintIt.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 rounded-2xl font-bold text-lg shadow-xl inline-flex items-center gap-3 transform transition-all hover:scale-105 bg-black text-white hover:bg-gray-800"
          >
            Start Printing Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
