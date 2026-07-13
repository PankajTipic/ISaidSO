// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { host } from '@/util/constants';
// import { postAuth } from '@/util/api';

// export default function WhatsappLoginScreen() {
//   const navigate = useNavigate();

//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const sendOtp = async () => {
//     if (!phone) {
//       toast.error('Please enter mobile number');
//       return;
//     }

//     try {
//       setLoading(true);

//       await postAuth(`/api/send-whatsapp-otp`, {
//         phone,
//       });

//       setOtpSent(true);
//       toast.success('OTP sent successfully');
//     } catch (error: any) {
//       toast.error(
//         error?.response?.message || 'Failed to send OTP'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

// const verifyOtp = async () => {
//   try {
//     setLoading(true);

//     const response = await postAuth(
//       '/api/verify-whatsapp-otp',
//       {
//         phone,
//         otp,
//       }
//     );

//     localStorage.setItem(
//       'access_token',
//       response.access_token
//     );

//     localStorage.setItem(
//       'refresh_token',
//       response.refresh_token
//     );

//     localStorage.setItem(
//       'user',
//       JSON.stringify(response.user)
//     );

//     // toast.success('Login successful');

//     // if (response.is_new_user) {
//     //   navigate('/profile-setup');
//     // } else {
//     //   navigate('/home');
//     // }

//     toast.success('Login successful');

// window.location.href = response.is_new_user
//   ? '/profile-setup'
//   : '/home';

//   } catch (error: any) {

//     toast.error(
//       error?.response?.data?.message ||
//       error?.message ||
//       'Login Failed'
//     );

//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-green-100">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
//             <svg
//               className="w-10 h-10"
//               fill="#25D366"
//               viewBox="0 0 32 32"
//             >
//               <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.4 2.1 7.8L0 32l8.4-2.5c2.3 1.2 4.8 1.9 7.6 1.9 8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.3c-2.4 0-4.7-.7-6.7-1.9l-.5-.3-5 1.5 1.6-4.8-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.8-13 13-13s13 5.8 13 13-5.8 13-13 13z" />
//             </svg>
//           </div>

//           <h1 className="text-3xl font-bold text-gray-800">
//             WhatsApp Login
//           </h1>

//           <p className="text-gray-500 mt-2">
//             Login using your WhatsApp number
//           </p>
//         </div>

//         {!otpSent ? (
//           <>
//             <div className="mb-4">
//               <label className="text-sm font-semibold text-gray-700">
//                 Mobile Number
//               </label>

//               <input
//                 type="text"
//                 placeholder="919876543210"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="w-full h-12 mt-2 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-green-500"
//               />
//             </div>

//             <button
//               onClick={sendOtp}
//               disabled={loading}
//               className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition"
//             >
//               {loading ? 'Sending...' : 'Send OTP'}
//             </button>
//           </>
//         ) : (
//           <>
//             <div className="mb-4">
//               <label className="text-sm font-semibold text-gray-700">
//                 Enter OTP
//               </label>

//               <input
//                 type="text"
//                 maxLength={6}
//                 placeholder="123456"
//                 value={otp}
//                 onChange={(e) =>
//                   setOtp(e.target.value.replace(/\D/g, ''))
//                 }
//                 className="w-full h-12 mt-2 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-green-500 text-center text-xl tracking-widest"
//               />
//             </div>

//             <button
//               onClick={verifyOtp}
//               disabled={loading}
//               className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition"
//             >
//               {loading ? 'Verifying...' : 'Verify OTP'}
//             </button>

//             <button
//               onClick={() => {
//                 setOtpSent(false);
//                 setOtp('');
//               }}
//               className="w-full mt-3 text-gray-600 text-sm"
//             >
//               Change Number
//             </button>
//           </>
//         )}

//         <button
//           onClick={() => navigate('/auth')}
//           className="w-full mt-6 text-sm text-gray-500 hover:text-gray-700"
//         >
//           Back to Login
//         </button>
//       </div>
//     </div>
//   );
// }












import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { postAuth } from '@/util/api';
import { useAppDispatch } from '@/app/store/hooks';
import { setCredentials } from '@/app/modules/auth/authSlice';

// Same FloatingTextLayer used in your 2FA screen
// const words = ['WhatsApp', 'Verify', 'Secure', 'Login', 'OTP', 'Connect', 'Message', 'Phone', 'Code', 'Auth'];


const words = [
  'अहम् ब्रह्मास्मि', 'Divine', 'Soul', 'Özüm İlahi',
  'من تو شدم', '我即真理', 'ஆத்மா', 'తత్త్వమసి',
  'Eternal', 'Spirit', 'Cosmos', 'Truth',
  'I Said So', 'Predict', 'Yes!', 'No?',
  'Maybe', 'Believe', 'Wisdom', 'Vision',
];


function FloatingTextLayer() {
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 13 + 5) % 95}%`,
            top: `${(i * 17 + 10) % 90}%`,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            opacity: 0.045,
            color: '#7c3aed',
            whiteSpace: 'nowrap',
            animation: `floatDrift ${8 + i}s linear infinite`,
            animationDelay: `${-i * 1.2}s`,
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes floatDrift {
          0%   { transform: translateY(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
      `}</style>
    </>
  );
}

export default function WhatsappLoginScreen() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone) { toast.error('Please enter mobile number'); return; }
    try {
      setLoading(true);
      await postAuth('/api/send-whatsapp-otp', { phone });
      setOtpSent(true);
      toast.success('OTP sent successfully');
    } catch (error: any) {
      toast.error(error?.response?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const response = await postAuth('/api/verify-whatsapp-otp', { phone, otp });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Login successful');
      window.location.href = response.is_new_user ? '/profile-setup' : '/home';
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background floating text */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <FloatingTextLayer />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[400px]"
        >
          <div
            className="rounded-3xl p-8"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.90)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow:
                '0 0 0 1.5px rgba(168,85,247,0.25), 0 24px 64px rgba(124,58,237,0.14), 0 4px 16px rgba(0,0,0,0.07)',
            }}
          >
            {/* Floating words inside card */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              <FloatingTextLayer />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* WhatsApp icon — gradient instead of green */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12))' }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#waGrad)"
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-gray-900">WhatsApp Login</h2>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {otpSent
                    ? <>We sent a 6-digit code to<br /><span className="font-bold text-gray-800">{phone}</span></>
                    : 'Login using your WhatsApp number'}
                </p>
              </div>

              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Mobile Number</label>
                      <input
                        type="text"
                        placeholder="919876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }}
                        className="w-full h-14 px-4 rounded-xl border-2 outline-none transition-all text-sm text-gray-800"
                        style={{
                          borderColor: '#e5e7eb',
                          background: 'rgba(255,255,255,0.9)',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={sendOtp}
                      className="w-full h-12 text-white text-sm font-black rounded-xl transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                      }}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          Send OTP via WhatsApp
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Enter OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onKeyDown={(e) => { if (e.key === 'Enter') verifyOtp(); }}
                        className="w-full h-14 text-center text-2xl font-black tracking-[0.4em] rounded-xl border-2 outline-none transition-all"
                        style={{
                          borderColor: otp.length === 6 ? '#7c3aed' : '#e5e7eb',
                          background: 'rgba(255,255,255,0.9)',
                          color: '#1f2937',
                        }}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      disabled={loading || otp.length !== 6}
                      onClick={verifyOtp}
                      className="w-full h-12 text-white text-sm font-black rounded-xl transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                      }}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : 'Verify & Login'}
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); }}
                        className="text-xs text-gray-500 hover:text-gray-700 font-semibold transition-colors"
                      >
                        ← Change Number
                      </button>
                      <button
                        type="button"
                        onClick={sendOtp}
                        className="text-xs font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Resend Code
                      </button>
                    </div>
                  </>
                )}
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-5 leading-relaxed">
                {otpSent
                  ? <>This code expires in <span className="font-bold text-gray-600">10 minutes</span>.<br />Check your WhatsApp messages.</>
                  : <>A 6-digit code will be sent to your number.<br /><span className="font-bold text-gray-600">Message rates may apply.</span></>}
              </p>

              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full mt-6 text-xs text-gray-500 hover:text-gray-700 font-semibold transition-colors text-center"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}