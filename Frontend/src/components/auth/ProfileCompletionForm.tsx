import { useState } from 'react';
import { Building2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileCompletionFormProps {
  onComplete: (phone: string, college: string) => Promise<void>;
  userEmail: string;
}

/**
 * Profile Completion Form
 * Shown after signup to collect phone number and college
 * College is locked to "Universal College of Engineering" for now
 */
export const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({
  onComplete,
  userEmail,
}) => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const college = 'Universal College of Engineering'; // Fixed value

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Indian phone number validation: 10 digits starting with 6-9
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete(phone, college);
      toast.success('Profile completed successfully!');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-400 text-sm">
              Just one more step! We need a few more details.
            </p>
            <p className="text-blue-400 text-sm mt-2">
              Signed in as: <span className="font-semibold">{userEmail}</span>
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> We currently support Indian phone numbers only. 
              Please add your phone number below for verification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={10}
              />
              <p className="text-xs text-gray-400 mt-1">
                Indian mobile number (10 digits)
              </p>
            </div>

            {/* College Field (Disabled) */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-300 mb-2">
                <Building2 className="inline w-4 h-4 mr-2" />
                College
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="college"
                  value={college}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                />
                <div className="absolute right-3 top-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                More colleges will be available soon
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || phone.length !== 10}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                isSubmitting || phone.length !== 10
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              Your information is secure and will only be used for print request notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionForm;
