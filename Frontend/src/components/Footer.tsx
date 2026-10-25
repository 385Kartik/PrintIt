import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Heart, 
  Coffee, 
  Sparkles
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-24 pb-10 px-4 sm:px-6 lg:px-8 border-t border-gray-100 rounded-t-[3rem] mt-[-3rem] relative z-30 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
          {/* --- BRAND COLUMN --- */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-6 group cursor-default">
              <div className="bg-gray-50 p-2.5 rounded-2xl group-hover:bg-black transition-colors duration-300">
                 <Code2 className="w-6 h-6 text-black group-hover:text-[#80ED99] transition-colors" />
              </div>
              <span className="text-2xl font-black tracking-tighter">PrintIt.</span>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm font-medium">
              We are just a bunch of students trying to make college life a little less stressful. 
              <br />
              <span className="text-black font-bold">No queues. No drama.</span>
            </p>
            
            {/* CONTACT BUTTON */}
            <a href="mailto:contact.us.print.it@gmail.com" className="inline-flex items-center gap-3 bg-[#FAFAFA] px-5 py-3 rounded-2xl border border-gray-100 hover:border-[#80ED99] hover:bg-[#80ED99]/10 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group">
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-lg">👋</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">Don't be shy</span>
                   <span className="text-sm font-black text-black">Say Hi to us!</span>
                </div>
            </a>
          </div>

          {/* --- EXPLORE LINKS --- */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-bold text-black mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
              Explore <Sparkles className="w-3 h-3 text-[#80ED99]" />
            </h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><Link to="/" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Home</Link></li>
              <li><Link to="/about" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Our Story</Link></li>
              <li><Link to="/pricing" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Pricing</Link></li>
              <li><Link to="/savings" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Savings Calculator</Link></li>
            </ul>
          </div>

          {/* --- LEGAL / BORING STUFF LINKS --- */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-black mb-6 uppercase text-xs tracking-[0.2em]">Boring Stuff</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><Link to="/contact" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Help Center</Link></li>
              {/* Linked Privacy Policy Here */}
              <li><Link to="/privacy" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Privacy Policy</Link></li>
              {/* Linked Terms Here */}
              <li><Link to="/terms" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Terms & Conditions</Link></li>
              <li><a href="/refund-policy" className="hover:text-black hover:pl-2 transition-all duration-300 inline-block">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-bold tracking-wide">
             © 2025 PrintIt Technologies.
          </p>
          
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
            <span>Coded with</span>
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>&</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>in Mumbai</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;