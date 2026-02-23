import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { Mail, Phone } from 'lucide-react';

export function AuthScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'choose' | 'phone' | 'otp'>('choose');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleGoogleLogin = () => {
    // Mock Google login
    navigate('/username-setup');
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Mock OTP verification
      setTimeout(() => navigate('/username-setup'), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 relative overflow-hidden text-gray-900">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a855f7] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06b6d4] rounded-full blur-[128px]" />
      </div>

      <motion.div
        className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-8 w-full max-w-md relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent mb-2">
            Welcome
          </h1>
          <p className="text-gray-500">Join the prediction revolution</p>
        </div>

        {step === 'choose' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm font-medium flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
            >
              <Mail size={20} className="text-gray-600" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-transparent hover:bg-purple-50 text-gray-900 border border-purple-200 flex items-center justify-center gap-3 shadow-none"
              onClick={() => setStep('phone')}
              style={{ borderColor: '#a855f7', color: '#6b21a8' }}
            >
              <Phone size={20} />
              Continue with Phone
            </Button>
          </motion.div>
        )}

        {step === 'phone' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors placeholder:text-gray-400"
              />
            </div>

            <Button
              className="w-full h-12 text-white shadow-lg shadow-purple-500/30"
              onClick={handlePhoneSubmit}
              disabled={phoneNumber.length < 10}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              }}
            >
              Send OTP
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setStep('choose')}
            >
              Back
            </Button>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium text-gray-900">{phoneNumber}</p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpComplete}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-gray-50 border-gray-200 text-gray-900" />
                  <InputOTPSlot index={1} className="bg-gray-50 border-gray-200 text-gray-900" />
                  <InputOTPSlot index={2} className="bg-gray-50 border-gray-200 text-gray-900" />
                  <InputOTPSlot index={3} className="bg-gray-50 border-gray-200 text-gray-900" />
                  <InputOTPSlot index={4} className="bg-gray-50 border-gray-200 text-gray-900" />
                  <InputOTPSlot index={5} className="bg-gray-50 border-gray-200 text-gray-900" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button variant="ghost" className="w-full text-[#a855f7] hover:bg-purple-50 hover:text-[#9333ea]">
              Resend Code
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setStep('phone')}
            >
              Change Number
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
