import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { 
  CheckCircle2, 
  Coins, 
  Printer, 
  Zap, 
  ArrowRight, 
  Droplets,
  FileText,
  Moon,
  Sparkles
} from 'lucide-react';

interface PricingPageProps {
  onGetStarted: () => void;
  onOpenProfile?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted, onOpenProfile }) => {
  // --- PRICING CONSTANTS ---
  const PI_BW_SINGLE = 3.5;
  const PI_BW_DOUBLE_SHEET = 5; // cost for 2 pages (front/back)
  
  const PI_COLOR_SINGLE = 10;
  const PI_COLOR_DOUBLE_SHEET = 20; // cost for 2 pages (front/back)

  const TOKEN_THRESHOLD = 20;
  const TOKEN_VALUE = 1;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      <Header onPrimaryAction={onGetStarted} onUserAction={onOpenProfile} />

      {/* 1. HERO SECTION (Premium Dark Theme from Calculator) */}
      <div className="pt-24 lg:pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-white text-black overflow-hidden relative">
        {/* Abstract Gold/Green Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#80ED99]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80ED99]/30 text-yellow-500 text-sm font-bold mb-6 border border-yellow-500/30 backdrop-blur-sm animate-fade-in-up">
            <Droplets className="w-4 h-4" />
            <span>Premium Gold-Infused Ink Technology</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Premium Quality. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-[#6DD687]">
              Student-Friendly Pricing.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            We don't sell faded photocopies. We provide <b>75-100 GSM</b> laser prints, 
            gold-standard ink, and 24/7 service at prices that beat the market.
          </p>

          {/* <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#80ED99] bg-[#80ED99]/10 px-4 py-2 rounded-full">
                <Star className="w-4 h-4 fill-current" /> Rated 4.9/5 by Students
              </div>
          </div> */}
        </div>
      </div>

      {/* 2. PRICING CARDS SECTION (Overlapping Container) */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 -mt-16 relative z-20 rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start pt-8">
            
            {/* CARD 1: B/W (THE HERO PRODUCT - Dark Premium Style) */}
            <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-900/20 border-4 border-[#80ED99] relative overflow-hidden group transform md:-translate-y-6 hover:scale-[1.02] transition-all duration-300 z-10">
               {/* Background subtle texture */}
               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               
               <div className="absolute top-0 right-0 bg-gradient-to-r from-[#80ED99] to-[#6DD687] text-black text-xs font-extrabold px-5 py-2 rounded-bl-2xl z-10 tracking-wider shadow-sm">
                 STUDENT'S CHOICE
               </div>

              <div className="relative z-10">
                <div className="bg-white/10 w-18 h-18 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 shadow-inner p-4">
                  <FileText className="w-10 h-10 text-[#80ED99]" />
                </div>
                
                <h3 className="text-3xl font-extrabold mb-3 text-white tracking-tight">Black & White</h3>
                <p className="text-gray-300 mb-8 font-medium text-lg leading-relaxed">Laser-sharp text for notes, assignments & reports.</p>
                
                {/* Pricing Block */}
                <div className="space-y-1 mb-10 bg-black/30 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">Single Side</span>
                    <span className="font-bold text-3xl tracking-tight text-white">₹{PI_BW_SINGLE}</span>
                  </div>
                  <div className="w-full h-px bg-gray-800 my-4"></div>
                  <div className="flex justify-between items-end">
                    <div>
                        <span className="text-gray-400 font-medium uppercase tracking-wider text-xs block">Double Sided (Per Sheet)</span>
                        <span className="text-[#80ED99] text-xs font-bold bg-[#80ED99]/10 px-2 py-0.5 rounded-full mt-1 inline-block">Best Value</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-4xl text-[#80ED99] tracking-tight">₹{PI_BW_DOUBLE_SHEET}</span>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">(Effective ₹2.5 / page)</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-gray-200 font-medium">
                  <li className="flex gap-3 items-center"><div className="bg-[#80ED99]/20 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#80ED99]"/></div> <span>75 GSM Snow White Paper</span></li>
                  <li className="flex gap-3 items-center"><div className="bg-[#80ED99]/20 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#80ED99]"/></div> <span>Smudge-proof Laser Ink</span></li>
                </ul>
              </div>
            </div>

            {/* CARD 2: COLOR (Clean Premium) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border-2 border-transparent hover:border-orange-300 transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
              <div>
                <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 p-4 group-hover:bg-orange-100 transition-colors">
                  <Droplets className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-gray-900 tracking-tight">Color Print</h3>
                <p className="text-gray-500 mb-8 font-medium text-lg leading-relaxed">Vibrant graphics for presentations & photos.</p>
                
                <div className="space-y-5 mb-10 p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-bold text-sm uppercase tracking-wider">Single Side</span>
                    <span className="font-bold text-3xl text-gray-900">₹{PI_COLOR_SINGLE}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 font-bold text-sm uppercase tracking-wider">Double Sided<br/><span className="text-[10px] text-gray-400 font-normal">(Per Sheet)</span></span>
                    <div className="text-right">
                      <span className="block font-bold text-3xl text-gray-900">₹{PI_COLOR_DOUBLE_SHEET}</span>
                      <span className="text-xs text-gray-500 font-bold">(₹10 / page)</span>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-gray-600 font-medium">
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400"/> 100 GSM Premium Paper</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400"/> Gold-Infused Vivid Ink</li>
              </ul>
            </div>

            {/* CARD 3: TOKENS (Clean Premium) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border-2 border-transparent hover:border-[#80ED99] transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#80ED99]"></div>
              <div>
                <div className="bg-[#80ED99]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 p-4 group-hover:bg-[#80ED99]/20 transition-colors">
                  <Coins className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-gray-900 tracking-tight">Token Rewards</h3>
                <p className="text-gray-500 mb-8 font-medium text-lg leading-relaxed">Automatic cashback on every single order.</p>
                
                <div className="bg-gray-900 rounded-2xl p-6 mb-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[pattern-dots] bg-[length:10px_10px]"></div>
                  <p className="text-sm text-gray-400 mb-3 font-bold uppercase tracking-wider relative z-10">PrintIt Loyalty System</p>
                  <div className="flex items-center justify-center gap-4 text-white relative z-10 my-4">
                    <div className="text-center">
                        <span className="block font-extrabold text-2xl">₹{TOKEN_THRESHOLD}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Spend</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-[#80ED99]" />
                    <div className="text-center">
                        <span className="block font-extrabold text-2xl text-[#80ED99]">1 Token</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#80ED99]/70">Earned</span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 inline-block bg-[#80ED99] text-black text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg shadow-[#80ED99]/20">
                    1 Token Value = ₹{TOKEN_VALUE}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl">
                <Sparkles className="w-5 h-5 text-[#80ED99] flex-shrink-0 mt-0.5" />
                <p>Tokens are credited instantly. Use them to get a direct discount on your very next print job.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. FEATURES FOOTER (Dark & Bold) */}
      <div className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#80ED99]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left relative z-10">
            <div>
                <div className="bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 border border-gray-700 shadow-lg">
                    <Moon className="w-7 h-7 text-[#80ED99]" />
                </div>
                <h4 className="font-bold text-xl mb-3">Open till 9 PM</h4>
                <p className="text-gray-400 leading-relaxed font-medium">Late night submissions? We are awake and printing.</p>
            </div>
            <div>
                <div className="bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 border border-gray-700 shadow-lg">
                    <Zap className="w-7 h-7 text-[#80ED99]" />
                </div>
                <h4 className="font-bold text-xl mb-3">Queueless</h4>
                <p className="text-gray-400 leading-relaxed font-medium">Upload from home. Zero waiting time at the shop.</p>
            </div>
            <div>
                 <div className="bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 border border-gray-700 shadow-lg">
                    <Printer className="w-7 h-7 text-[#80ED99]" />
                </div>
                <h4 className="font-bold text-xl mb-3">Precision Count</h4>
                <p className="text-gray-400 leading-relaxed font-medium">Software calculates exact pages. Pay only for what you print.</p>
            </div>
            <div className="flex flex-col items-center justify-center md:items-end">
                <p className="text-[#80ED99] font-bold mb-4 uppercase tracking-widest text-sm">Ready to experience it?</p>
                <button
                    onClick={onGetStarted}
                    className="bg-[#80ED99] text-black px-8 py-4 rounded-2xl font-extrabold hover:bg-[#6DD687] transition-all flex items-center gap-3 shadow-[0_10px_20px_-10px_rgba(128,237,153,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(128,237,153,0.6)] hover:-translate-y-1"
                >
                    Start Printing <ArrowRight className="w-5 h-5 stroke-[3px]"/>
                </button>
            </div>
        </div>
      </div>

            < Footer />

    </div>
  );
};

export default PricingPage;
