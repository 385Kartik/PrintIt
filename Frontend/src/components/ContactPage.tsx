import React, { useState } from 'react';
import Header from './Header';
import { contactService } from '../services/contact.service';
import toast from 'react-hot-toast';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send
} from 'lucide-react';
import Footer from './Footer';

interface ContactPageProps {
  onGetStarted: () => void;
  onOpenProfile?: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onGetStarted, onOpenProfile }) => {
  // --- LOGIC FROM 1ST APP ---
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !subject || !message) {
      toast.error('Please complete all fields before sending');
      return;
    }

    setSubmitting(true);
    try {
      await contactService.sendContactMessage({ email, subject, message });
      toast.success('Message sent! We will reply shortly.');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI FROM 2ND APP ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      
      <Header onPrimaryAction={onGetStarted} onUserAction={onOpenProfile} />

      {/* --- 1. HERO SECTION --- */}
      <div className="pt-40 pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 relative overflow-hidden rounded-b-[3rem]">
        
        {/* Soft Background Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80ED99]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-[10px] font-bold mb-8 uppercase tracking-[0.2em]">
            <MessageSquare className="w-3 h-3 text-[#80ED99]" />
            <span>24/7 Support</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-black">
            GOT QUESTIONS? <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-emerald-600">
              WE'RE LISTENING.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-xl font-medium leading-relaxed">
            Whether it's a bulk order, a partnership proposal, or just a suggestion to make PrintIt better—we are all ears.
          </p>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT: Contact Info Cards */}
          <div className="space-y-8">
             
             {/* Intro Text */}
             <div>
                <h3 className="text-2xl font-black mb-4">Contact Information</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Our team usually replies within one business day. For urgent queries, feel free to call us directly.
                </p>
             </div>

             {/* Card 1: Email */}
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <Mail className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-black text-lg">Email Us</h4>
                   <p className="text-gray-500 text-sm mb-2">For general queries & support</p>
                   <a href="mailto:contact.us.print.it@gmail.com" className="text-black font-bold border-b-2 border-[#80ED99] hover:bg-[#80ED99] transition-colors">
                     contact.us.print.it@gmail.com
                   </a>
                </div>
             </div>

             {/* Card 2: Phone */}
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                   <Phone className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-black text-lg">Call Us</h4>
                   <p className="text-gray-500 text-sm mb-2">Mon - Sat, 9 AM to 7 PM</p>
                   <div className="flex flex-col gap-1">
                     <a href="tel:+919619410050" className="text-black font-bold hover:text-[#00a844] transition-colors">Kartik Parmar: (+91) 96194 10050</a>
                     <a href="tel:+919653369369" className="text-black font-bold hover:text-[#00a844] transition-colors">Mahek Shah: (+91) 96533 69369</a>
                     <a href="tel:+918779544355" className="text-black font-bold hover:text-[#00a844] transition-colors">Kashyap Bhatt: (+91) 87795 44355</a>
                   </div>
                </div>
             </div>

          </div>

          {/* RIGHT: The Form (Wired to Logic) */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-200 shadow-xl relative overflow-hidden">
            
            {/* Form Header */}
            <div className="mb-8">
               <h3 className="text-2xl font-black mb-2">Send a Message</h3>
               <p className="text-gray-500 text-sm">We'll get back to you faster than a laser printer.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
               
               {/* Email Input */}
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Your Email</label>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80ED99] focus:bg-white transition-all font-medium"
                   placeholder="john@example.com"
                   required
                 />
               </div>

               {/* Subject Input */}
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Subject</label>
                 <input
                   type="text"
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80ED99] focus:bg-white transition-all font-medium"
                   placeholder="Regarding..."
                   required
                 />
               </div>

               {/* Message Input */}
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Message</label>
                 <textarea
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80ED99] focus:bg-white transition-all font-medium resize-none"
                   placeholder="Tell us more about your inquiry..."
                   rows={5}
                   required
                 />
               </div>

               {/* Buttons */}
               <div className="pt-4 space-y-3">
                 <button
                   type="submit"
                   disabled={submitting}
                   className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-[#80ED99] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-[#80ED99]/20"
                 >
                   {submitting ? (
                     <span className="animate-pulse">Sending...</span>
                   ) : (
                     <>
                       Send Message <Send className="w-5 h-5" />
                     </>
                   )}
                 </button>
                 
                 <button
                   type="button"
                   onClick={onGetStarted}
                   className="w-full bg-white text-gray-500 py-4 rounded-xl font-bold text-sm border border-gray-200 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                 >
                   Back to Dashboard
                 </button>
               </div>

            </form>
          </div>

        </div>
      </div>

      <Footer />

    </div>
  );
};

export default ContactPage;