import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { authService, type User } from '../../services/auth.service';
import toast from 'react-hot-toast';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

type AuthMode = 'login' | 'signup';
type AuthStep = 'request' | 'verify';

const AuthPage = ({ onAuthSuccess, initialMode }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode ?? 'login');
  const [step, setStep] = useState<AuthStep>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    username: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const resetFlow = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep('request');
    setError('');
    setFormData({ name: '', email: '', phone: '', otp: '', username: '', password: '' });
  };

  useEffect(() => {
    if (!initialMode) return;
    resetFlow(initialMode);
  }, [initialMode]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await authService.requestSignupOTP(formData.name, formData.email, formData.phone || undefined);
        toast.success('OTP sent to your email!');
        setStep('verify');
        return;
      }

      await authService.requestLoginOTP(formData.email);
      toast.success('OTP sent to your email!');
      setStep('verify');
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = mode === 'signup'
        ? await authService.verifySignupOTP(
            formData.name,
            formData.email,
            formData.phone || undefined,
            formData.otp,
            'Universal College of Engineering'
          )
        : await authService.verifyLoginOTP(formData.email, formData.otp);

      authService.saveToken(response.token);
      authService.saveUser(response.user);
      toast.success(mode === 'signup' ? 'Registration successful!' : 'Login successful!');
      onAuthSuccess(response.user);
    } catch (err: any) {
      const message = err.message || 'OTP verification failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-black">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {step === 'request'
              ? (mode === 'login' ? 'Enter your email to receive OTP' : 'Enter your details to register')
              : 'Enter the OTP sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'request' ? handleRequestOTP : handleVerifyOTP} className="space-y-4">
            {step === 'request' && mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 text-black focus:border-[#80ED99] focus:ring-[#80ED99]"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 text-black focus:border-[#80ED99] focus:ring-[#80ED99]"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 text-black focus:border-[#80ED99] focus:ring-[#80ED99]"
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college" className="text-black">College</Label>
                  <select
                    id="college"
                    name="college"
                    value="Universal College of Engineering"
                    disabled
                    className="w-full bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl px-3 py-2 font-medium text-gray-500 cursor-not-allowed text-sm sm:text-base"
                  >
                    <option value="Universal College of Engineering">Universal College of Engineering</option>
                  </select>
                </div>
              </>
            )}

            {step === 'request' && mode === 'login' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-gray-200 text-black focus:border-[#80ED99] focus:ring-[#80ED99]"
                  placeholder="you@example.com"
                />
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-black">OTP</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-gray-200 text-black focus:border-[#80ED99] focus:ring-[#80ED99]"
                  placeholder="Enter OTP"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#80ED99] hover:bg-[#6DD687] text-black font-semibold border-2 border-[#6DD687] shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (step === 'request' ? 'Sending OTP...' : 'Verifying...') : step === 'request' ? 'Send OTP' : 'Verify OTP'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => resetFlow(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
