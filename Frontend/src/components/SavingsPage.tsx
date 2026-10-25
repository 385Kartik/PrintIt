import React, { useState } from 'react';
import { 
  Navigation, 
  Zap, 
  AlertTriangle, 
  ArrowRight, 
  Droplets, 
  FileText, 
  Moon, 
  Coins,
  Minus,
  Plus
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface SmartCalculatorProps {
  onGoBack: () => void;
  onOpenProfile?: () => void;
}

const SmartCalculator: React.FC<SmartCalculatorProps> = ({ onGoBack, onOpenProfile, }) => {
  // State
  const [pages, setPages] = useState<number>(50);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [sideType, setSideType] = useState<'single' | 'double'>('single');
  const [travelCost, setTravelCost] = useState<number>(40); // Auto fare avg
  const [timeSpent] = useState<number>(45); // Minutes

  // --- PRICING CONSTANTS ---
  
  // Market Rates (No discounts usually)
  const MARKET_BW_RATE = 5; 
  const MARKET_COLOR_RATE = 10;

  // PrintIt Rates (Gold Standard)
  const PI_BW_SINGLE = 3.5;
  const PI_BW_DOUBLE_SHEET = 5; // 2 pages front-back cost ₹5
  
  const PI_COLOR_SINGLE = 10;
  const PI_COLOR_DOUBLE_SHEET = 20; // 2 pages front-back cost ₹20

  // Token Logic
  const TOKEN_THRESHOLD = 20;
  const TOKEN_VALUE = 1; // Worth in Rs

  // --- CALCULATION LOGIC ---

  const calculateCost = () => {
    // 1. Market Cost (Straight multiplication, they rarely do bulk discounts on small orders)
    // Even if double sided, they usually charge per side (e.g. 5+5=10)
    const marketRate = printType === 'bw' ? MARKET_BW_RATE : MARKET_COLOR_RATE;
    const totalMarketPrintCost = pages * marketRate;
    const totalMarketRealCost = totalMarketPrintCost + travelCost;

    // 2. PrintIt Cost
    let totalPiPrintCost = 0;

    if (sideType === 'single') {
      const rate = printType === 'bw' ? PI_BW_SINGLE : PI_COLOR_SINGLE;
      totalPiPrintCost = pages * rate;
    } else {
      // Double Sided Logic:
      // Sheets (Front+Back) = Discounted Price
      // Remainder (Single Page) = Single Price
      const sheets = Math.floor(pages / 2);
      const remainder = pages % 2;
      
      const sheetPrice = printType === 'bw' ? PI_BW_DOUBLE_SHEET : PI_COLOR_DOUBLE_SHEET;
      const singlePrice = printType === 'bw' ? PI_BW_SINGLE : PI_COLOR_SINGLE;
      
      totalPiPrintCost = (sheets * sheetPrice) + (remainder * singlePrice);
    }

    // 3. Token Rewards
    const tokensEarned = Math.floor(totalPiPrintCost / TOKEN_THRESHOLD);
    const futureSavings = tokensEarned * TOKEN_VALUE;

    return {
      totalMarketPrintCost,
      totalMarketRealCost,
      totalPiPrintCost,
      tokensEarned,
      futureSavings,
      effectivePiCost: totalPiPrintCost - futureSavings // Taking rewards into account
    };
  };

  const stats = calculateCost();
  const totalSavings = stats.totalMarketRealCost - stats.effectivePiCost;

  // Handlers
  const handlePageChange = (val: number) => {
    if (val < 1) setPages(1);
    else if (val > 2000) setPages(2000);
    else setPages(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

      {/* 1. HERO: The Quality & Time Pitch */}
      <div className="pt-24 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-black text-white overflow-hidden relative">
        {/* Abstract Gold Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold mb-6 border border-yellow-500/50">
                <Droplets className="w-4 h-4" />
                <span>Premium Gold-Infused Ink Technology</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
                Quality that justifies <br />
                <span className="text-[#80ED99]">Every Rupee.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Due to rising raw material costs (Gold Tax & Ink), our prices have evolved. 
                But so has our quality. We now use <b>High-Grade Ink</b> and <b>Premium Paper</b> that market xerox shops can't match.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-gray-700">
                    <Moon className="w-8 h-8 text-[#80ED99]" />
                    <div>
                        <p className="font-bold text-white">Open till 9 PM</p>
                        <p className="text-xs text-gray-400">Order late, get morning delivery</p>
                    </div>
                 </div>
                 <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-gray-700">
                    <Zap className="w-8 h-8 text-[#80ED99]" />
                    <div>
                        <p className="font-bold text-white">Queueless</p>
                        <p className="text-xs text-gray-400">No waiting in lines</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Paper Quality Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white text-black p-6 rounded-2xl transform rotate-2 hover:rotate-0 transition-all duration-300">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                     <FileText className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">B/W Documents</h3>
                  <p className="text-3xl font-bold text-black mb-2">75-80 <span className="text-sm text-gray-500">GSM</span></p>
                  <p className="text-sm text-gray-600">Snow white paper. Crisp text. Perfect for assignments.</p>
               </div>
               <div className="bg-gradient-to-br from-yellow-100 to-white text-black p-6 rounded-2xl transform -rotate-2 hover:rotate-0 transition-all duration-300 border-2 border-yellow-400/20">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                     <Droplets className="w-6 h-6 text-yellow-700" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">Color Prints</h3>
                  <p className="text-3xl font-bold text-black mb-2">100 <span className="text-sm text-gray-500">GSM</span></p>
                  <p className="text-sm text-gray-600">Thick premium paper. Vibrant colors with gold-standard ink.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE CALCULATOR */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          
          <div className="bg-gray-100 border-b border-gray-200 p-4 md:p-6 text-center">
             <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Navigation className="w-6 h-6 text-blue-600" />
                The "Real Cost" Calculator
             </h2>
             <p className="text-gray-500 text-sm mt-1">Compare us with Market Rates + Hidden Travel Costs</p>
          </div>

          <div className="grid md:grid-cols-12">
             
             {/* Left: Inputs */}
             <div className="md:col-span-5 p-6 md:p-8 border-r border-gray-100 space-y-8">
                
                {/* Pages Input (Replaced Slider with Buttons) */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">1. Number of Pages</label>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePageChange(pages - 1)}
                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                            <input 
                                type="number"
                                value={pages}
                                onChange={(e) => handlePageChange(Number(e.target.value))}
                                className="w-full h-10 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-black outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => handlePageChange(pages + 1)}
                            className="w-10 h-10 rounded-lg bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Print Type */}
                <div>
                   <label className="text-sm font-bold text-gray-700 mb-2 block">2. Print Mode</label>
                   <div className="grid grid-cols-2 gap-2">
                                 <button
                                    onClick={() => setPrintType('bw')}
                                    className={`p-3 rounded-xl border-2 font-bold transition-all ${printType === 'bw' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                 >
                                    Black & White
                                 </button>
                                 <button
                                    onClick={() => { setPrintType('color'); setSideType('single'); }}
                                    className={`p-3 rounded-xl border-2 font-bold transition-all ${printType === 'color' ? 'border-[#80ED99] bg-[#80ED99] text-black' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                 >
                                    Color
                                 </button>
                   </div>
                </div>

                {/* Sides */}
                <div>
                   <label className="text-sm font-bold text-gray-700 mb-2 block">3. Sides</label>
                   <div className="grid grid-cols-2 gap-2">
                                 <button
                                    onClick={() => setSideType('single')}
                                    className={`p-3 rounded-xl border-2 font-bold transition-all ${sideType === 'single' ? 'border-black bg-gray-100 text-black' : 'border-gray-200 text-gray-500'}`}
                                 >
                                    Single Sided
                                 </button>
                                 <button
                                    onClick={() => { if (printType === 'color') return; setSideType('double'); }}
                                    disabled={printType === 'color'}
                                    className={`p-3 rounded-xl border-2 font-bold transition-all ${sideType === 'double' ? 'border-black bg-gray-100 text-black' : 'border-gray-200 text-gray-500'} ${printType === 'color' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                 >
                                    Double Sided
                                    <span className="block text-[10px] text-green-600 font-normal">Big Savings!</span>
                                 </button>
                   </div>
                </div>

                {/* Hidden Costs (Updated to Manual Input) */}
                <div className="pt-4 border-t border-gray-100">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <label className="text-xs font-bold text-orange-700 uppercase tracking-wide">Hidden Costs (Auto/Bus)</label>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setTravelCost(Math.max(0, travelCost - 10))}
                            className="w-8 h-8 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 flex items-center justify-center"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₹</span>
                            <input 
                                type="number" 
                                value={travelCost}
                                onChange={(e) => setTravelCost(Math.max(0, Number(e.target.value)))}
                                className="w-full pl-6 pr-2 py-1.5 bg-orange-50 border border-orange-200 rounded font-bold text-orange-800 outline-none text-center"
                            />
                        </div>
                        <button 
                            onClick={() => setTravelCost(travelCost + 10)}
                            className="w-8 h-8 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 flex items-center justify-center"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                   </div>
                </div>

             </div>

             {/* Right: Results */}
             <div className="md:col-span-7 bg-gray-50 p-6 md:p-8">
                
                {/* Comparison Block */}
                <div className="space-y-4 mb-8">
                   {/* Market Row */}
                   <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-red-100 shadow-sm opacity-70">
                      <div>
                         <p className="text-xs font-bold text-red-500 uppercase">Market / Other Shops</p>
                         <p className="text-sm text-gray-500">Print + Travel Cost</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-bold text-gray-400 line-through">₹{stats.totalMarketRealCost}</p>
                         <p className="text-[10px] text-red-400">Time Wasted: {timeSpent} mins</p>
                      </div>
                   </div>

                   {/* PrintIt Row */}
                   <div className="flex justify-between items-center p-5 bg-white rounded-xl border-2 border-[#80ED99] shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 bg-[#80ED99] text-[10px] font-bold px-2 py-0.5 text-black">BEST CHOICE</div>
                      <div className="relative z-10">
                         <p className="text-xs font-bold text-green-600 uppercase mb-1">PrintIt Portal</p>
                                     {sideType === 'double' && printType === 'bw' && (
                           <span className="inline-block bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold mb-1">
                             Double Sided Discount Applied
                           </span>
                         )}
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-[#80ED99] fill-current" />
                            <span>Queueless & Delivered</span>
                         </div>
                      </div>
                      <div className="text-right relative z-10">
                         <p className="text-4xl font-bold text-black">₹{stats.totalPiPrintCost}</p>
                         <p className="text-xs text-gray-500">Total Bill</p>
                      </div>
                   </div>
                </div>

                {/* The Reward Section */}
                <div className="bg-black rounded-2xl p-6 text-white mb-6">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#80ED99] p-2 rounded-lg text-black">
                         <Coins className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="font-bold">Wallet Rewards</p>
                         <p className="text-xs text-gray-400">Spend ₹{TOKEN_THRESHOLD} = Get 1 Token Free</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                      <div>
                         <p className="text-2xl font-bold text-[#80ED99]">{stats.tokensEarned} Tokens</p>
                         <p className="text-xs text-gray-400">Added to wallet</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-bold">₹{stats.futureSavings}</p>
                         <p className="text-xs text-gray-400">Off on next order</p>
                      </div>
                   </div>
                </div>

                {/* Final Savings Verdict */}
                <div className="text-center">
                   <p className="text-gray-500 text-sm mb-2">Total Value (Savings + Time + Rewards)</p>
                   <h3 className="text-3xl font-bold text-black">
                      You Save <span className="text-[#6DD687]">₹{totalSavings.toFixed(0)}</span>
                   </h3>
                   <div className="mt-6">
                     <button
                        onClick={onGoBack}
                        className="w-full bg-[#80ED99] text-black py-4 rounded-xl hover:bg-[#6DD687] transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                     >
                        Upload & Save Now
                        <ArrowRight className="w-5 h-5" />
                     </button>
                   </div>
                </div>

             </div>
          </div>
        </div>

        {/* Night Owl Banner */}
        <div className="max-w-3xl mx-auto mt-12 bg-indigo-900 text-white rounded-2xl p-6 flex items-center justify-between shadow-xl">
           <div className="flex items-center gap-4">
              <div className="bg-indigo-800 p-3 rounded-full">
                 <Moon className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                 <h4 className="font-bold text-lg">Subah 8 baje submission hai?</h4>
                 <p className="text-indigo-200 text-sm">Raat ke 9 baje tak upload karo, subah direct delivery lo.</p>
              </div>
           </div>
           <div className="hidden sm:block">
              <span className="font-bold text-2xl text-yellow-400">Opens 9 to 9</span>
              <p className="text-xs text-indigo-300 text-right">Online</p>
           </div>
        </div>

      </div>

    < Footer />

    </div>
  );
};


export default SmartCalculator;

