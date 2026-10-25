import React, { useState, useEffect } from 'react';
import { 
  X, Phone, Building2, Save, User, Mail, LogOut, Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    phone?: string;
    college?: string;
    tokens: number;
  };
  onUpdate: (phone: string, college: string) => Promise<void>;
  onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  onLogout,
}) => {
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const college = 'Universal College of Engineering';

  useEffect(() => {
    if (isOpen) {
      setPhone(user.phone || '');
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, user.phone]);

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(phone, college);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Z-INDEX 100 ensures it is above the header (which is usually z-40 or z-50)
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white h-[92dvh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up border border-gray-100">
        
        {/* --- Header Section --- */}
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 border-b border-gray-100 bg-white z-20 shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              My Profile
            </h2>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">
              Manage your account details
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black transition-all"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* --- Split Layout --- */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* --- LEFT SIDEBAR (Info & Stats) --- */}
          <div className="w-full md:w-[40%] lg:w-[35%] bg-gray-50/80 border-b md:border-b-0 md:border-r border-gray-100 p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
             
             {/* Identity Card */}
             <div className="flex flex-row items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#80ED99] to-emerald-400 flex items-center justify-center text-xl font-black text-black shadow-inner shrink-0">
                   {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                   <h3 className="text-lg font-bold text-black truncate">{user.name || 'User'}</h3>
                   <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                     <Mail className="w-3 h-3" /> <span className="truncate">{user.email}</span>
                   </div>
                </div>
             </div>

             {/* Stats */}
             <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
               <div className="bg-[#80ED99]/10 p-4 rounded-2xl border border-[#80ED99]/20 flex flex-col justify-center items-center text-center">
                  <span className="text-[#00a844] font-bold text-xs uppercase tracking-wider mb-1">Account Type</span>
                  <span className="font-bold text-black">Student</span>
               </div>

               <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</p>
                    <p className="text-2xl font-black text-gray-900">{user.tokens}</p>
                 </div>
                 <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-amber-500" />
                 </div>
               </div>
             </div>

             {/* Desktop Logout */}
             <div className="hidden md:flex mt-auto pt-6">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
             </div>
          </div>

          {/* --- RIGHT CONTENT (Form) --- */}
          <div className="flex-1 bg-white p-6 sm:p-10 overflow-y-auto">
             <div className="max-w-xl mx-auto md:mx-0 h-full flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 flex-1">
                  <div>
                    <h4 className="text-lg font-bold text-black mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                       <User className="w-5 h-5 text-[#80ED99]" /> Edit Details
                    </h4>
                    
                    <div className="grid gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                         <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#80ED99] transition-colors" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="98765 43210"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80ED99] focus:bg-white transition-all font-medium text-lg"
                              required
                              maxLength={10}
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Institute</label>
                         <div className="relative opacity-70">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={college}
                              disabled
                              className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl font-medium text-gray-500 cursor-not-allowed"
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col-reverse gap-4 md:hidden">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-red-500 bg-red-50 active:bg-red-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>

                  <div className="pt-4 md:pt-8 mt-auto">
                    <button
                      type="submit"
                      disabled={isSaving || phone.length !== 10}
                      className="w-full md:w-auto bg-[#80ED99] text-black px-10 py-4 rounded-xl font-bold text-base hover:bg-[#6DD687] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-xl shadow-[#80ED99]/20 active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Changes <Save className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;