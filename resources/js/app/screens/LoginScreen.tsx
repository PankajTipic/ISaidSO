import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser, registerUser, checkAuthStatus, guestLogin } from '@/app/modules/auth/authSlice';
import { Input } from '@/app/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { host } from '@/util/constants';

// ─── Google Font: Caveat (handwritten marker style) ───────────────────────────
// Inject once at module level — safe for SSR too
if (typeof document !== 'undefined') {
  const linkId = 'caveat-font';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }
}

// ─── Words ────────────────────────────────────────────────────────────────────
const WORDS = [
  'अहम् ब्रह्मास्मि', 'Divine', 'Soul', 'Özüm İlahi',
  'من تو شدم', '我即真理', 'ஆத்மா', 'తత్త్వమసి',
  'Eternal', 'Spirit', 'Cosmos', 'Truth',
  'I Said So', 'Predict', 'Yes!', 'No?',
  'Maybe', 'Believe', 'Wisdom', 'Vision',
];

// Dark, saturated colors — like marker pen on white paper
const COLORS = [
  '#1e1b4b', // deep indigo
  '#7c2d12', // deep burnt orange
  '#14532d', // deep green
  '#1e3a5f', // deep navy blue
  '#4a1942', // deep purple
  '#7f1d1d', // deep red
  '#0c4a6e', // deep sky blue
  '#365314', // deep olive
  '#312e81', // deep violet
  '#1c1917', // near black
  '#831843', // deep pink
  '#134e4a', // deep teal
];

interface FWord { id: number; text: string; x: number; y: number; angle: number; delay: number; duration: number; opacity: number; fontSize: number; color: string; bold: boolean; }

// Stable positions — not random so no regeneration on re-render
function buildWords(): FWord[] {
  return Array.from({ length: 26 }, (_, i) => ({
    id: i,
    text: WORDS[i % WORDS.length],
    x: 2 + ((i * 37 + 11) % 88),
    y: 2 + ((i * 53 + 7) % 90),
    angle: [-35, -18, 0, 18, 35][i % 5],
    delay: (i * 0.65) % 8,
    duration: 5 + (i % 6),
    opacity: 0.28 + (i % 4) * 0.08,   // 0.28–0.52 — dark colors need higher opacity
    fontSize: 15 + (i % 5) * 4,        // 15–31px — bigger for handwritten feel
    color: COLORS[i % COLORS.length],
    bold: i % 2 === 0,
  }));
}
const ALL_WORDS = buildWords();

// Floating words layer — reusable inside or outside card
function FloatingTextLayer() {
  return (
    <>
      {ALL_WORDS.map(w => (
        <motion.span
          key={w.id}
          style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: `${w.y}%`,
            rotate: w.angle,
            whiteSpace: 'nowrap',
            fontSize: w.fontSize,
            color: w.color,
            fontWeight: w.bold ? 700 : 400,
            fontFamily: "'Caveat', 'Comic Sans MS', cursive",
            letterSpacing: '0.01em',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, w.opacity, w.opacity, 0],
            y: [8, -8, -8, 8],
          }}
          transition={{
            duration: w.duration,
            delay: w.delay,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: 'easeInOut',
          }}
        >
          {w.text}
        </motion.span>
      ))}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [shake, setShake] = useState<{ [k: string]: boolean }>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isError, message, isAuthenticated, user, isGuest } = useAppSelector(s => s.auth);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const access = p.get('access_token'), refresh = p.get('refresh_token');
    if (p.get('error')) toast.error(p.get('message') || 'Google login failed');
    if (access && refresh) {
      localStorage.removeItem('isGuest');
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      dispatch(checkAuthStatus()).unwrap()
        .then(() => toast.success('Logged in successfully'))
        .catch(() => toast.error('Failed to verify session'));
    }
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!user.is_profile_completed && !isGuest) { navigate('/profile-setup', { replace: true }); return; }
    navigate((user.role || '').toLowerCase().trim() === 'admin' ? '/admin' : '/home', { replace: true });
  }, [isAuthenticated, user, isGuest, navigate]);

  useEffect(() => {
    if (!isLoading && !isError && message && isRegister && message.includes('verify'))
      setShowVerificationModal(true);
  }, [isLoading, isError, message, isRegister]);

  useEffect(() => {
    if (isError && message) {
      if (message.includes('email') || message.includes('registered')) triggerError('email', message);
      else if (message.includes('password')) triggerError('password', message);
    }
  }, [isError, message]);

  const triggerError = (f: string, msg: string) => {
    setErrors(p => ({ ...p, [f]: msg }));
    setShake(p => ({ ...p, [f]: true }));
    setTimeout(() => setShake(p => ({ ...p, [f]: false })), 500);
  };

  const validateForm = () => {
    let ok = true;
    if (isRegister && !name.trim()) { triggerError('name', 'Name is required'); ok = false; }
    if (!email.trim()) { triggerError('email', 'Email is required'); ok = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { triggerError('email', 'Invalid email format'); ok = false; }
    if (!password) { triggerError('password', 'Password is required'); ok = false; }
    else if (password.length < 8) { triggerError('password', 'Min 8 characters'); ok = false; }
    if (isRegister && !country.trim()) { triggerError('country', 'Country is required'); ok = false; }
    if (isRegister && !city.trim()) { triggerError('city', 'City is required'); ok = false; }
    if (isRegister && password !== passwordConfirmation) { triggerError('passwordConfirmation', 'Passwords do not match'); ok = false; }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    if (!validateForm()) return;
    try {
      if (isRegister) {
        await dispatch(registerUser({ name, email, password, password_confirmation: passwordConfirmation, country, city })).unwrap();
      } else {
        localStorage.removeItem('isGuest');
        await dispatch(loginUser({ email, password })).unwrap();
        toast.success('Logged in successfully');
      }
    } catch (err) { console.error(err); }
  };

  const shakeAnim = (s: boolean) => ({ x: s ? [0, -8, 8, -8, 8, 0] : 0, transition: { duration: 0.4 } });

  return (
    <div
      className="min-h-screen bg-white font-sans"
      style={{ position: 'relative', overflow: 'hidden' }}
    >

      {/* ── Global floating text — behind everything ──────────────────────── */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
      >
        <FloatingTextLayer />
      </div>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <div
        className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-8 gap-6 lg:gap-16 max-w-[980px] mx-auto"
        style={{ zIndex: 1 }}
      >

        {/* LEFT — Branding */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left w-full lg:max-w-[420px] lg:flex-shrink-0"
        >
          <p
            className="text-xs font-black tracking-[0.22em] uppercase mb-2"
            style={{ color: '#a855f7' }}
          >
            Welcome to
          </p>
          <h1
            className="text-5xl lg:text-6xl font-black italic font-serif tracking-tight leading-none mb-3"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            I Said So
          </h1>
          <p className="text-base lg:text-xl font-semibold text-gray-700 leading-snug max-w-[300px] mx-auto lg:mx-0">
            What I Said… They shall be.
          </p>

          {/* Pill tags — desktop only */}
          <div className="hidden lg:flex flex-wrap gap-2 mt-5">
            {['Divine', 'Soul', 'Yes!', 'No?', 'Predict', 'Eternal'].map(w => (
              <span key={w} className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ border: '1.5px solid #e9d5ff', color: '#7c3aed', background: '#faf5ff' }}>
                {w}
              </span>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/*
            Card:
            - position: relative + overflow: hidden  → clips the inner FloatingTextLayer
            - semi-transparent white + backdrop-blur → floating words visible through card background
            - inner zIndex structure: words at 0, form content at 1
          */}
          <div
            className="rounded-3xl p-6"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow:
                '0 0 0 1.5px rgba(168,85,247,0.20), 0 24px 64px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.07)',
            }}
          >
            {/* Floating words INSIDE the card (clipped by overflow:hidden) */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
            >
              <FloatingTextLayer />
            </div>

            {/* Form content — above the words */}
            <div style={{ position: 'relative', zIndex: 1 }}>

              <div className="mb-5">
                <h2 className="text-lg font-black text-gray-900">
                  {isRegister ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRegister ? 'Join and start predicting today.' : 'Good to see you again!'}
                </p>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>

                {/* Register-only fields */}
                <AnimatePresence>
                  {isRegister && (
                    <motion.div key="reg"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden"
                    >
                      <motion.div animate={shakeAnim(shake.name)}>
                        <Input type="text" value={name} placeholder="Full Name"
                          onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                          className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 focus:border-purple-400 transition-colors ${errors.name ? 'border-red-400' : ''}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </motion.div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <motion.div animate={shakeAnim(shake.country)}>
                            <Input type="text" value={country} placeholder="Country"
                              onChange={e => { setCountry(e.target.value); if (errors.country) setErrors(p => ({ ...p, country: '' })); }}
                              className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 focus:border-purple-400 ${errors.country ? 'border-red-400' : ''}`}
                            />
                          </motion.div>
                          {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                        </div>
                        <div>
                          <motion.div animate={shakeAnim(shake.city)}>
                            <Input type="text" value={city} placeholder="City"
                              onChange={e => { setCity(e.target.value); if (errors.city) setErrors(p => ({ ...p, city: '' })); }}
                              className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 focus:border-purple-400 ${errors.city ? 'border-red-400' : ''}`}
                            />
                          </motion.div>
                          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div animate={shakeAnim(shake.email)}>
                  <Input type="email" value={email}
                    placeholder={isRegister ? 'Email address' : 'Email or phone number'}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                    className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 focus:border-purple-400 transition-colors ${errors.email ? 'border-red-400' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </motion.div>

                {/* Password */}
                <motion.div animate={shakeAnim(shake.password)}>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'} value={password} placeholder="Password"
                      onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                      className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 pr-14 focus:border-purple-400 transition-colors ${errors.password ? 'border-red-400' : ''}`}
                    />
                    {password && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-600 hover:text-purple-800">
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </motion.div>

                {/* Confirm password */}
                <AnimatePresence>
                  {isRegister && (
                    <motion.div key="cpw"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                    >
                      <motion.div animate={shakeAnim(shake.passwordConfirmation)}>
                        <Input type="password" value={passwordConfirmation} placeholder="Confirm Password"
                          onChange={e => { setPasswordConfirmation(e.target.value); if (errors.passwordConfirmation) setErrors(p => ({ ...p, passwordConfirmation: '' })); }}
                          className={`h-11 text-sm rounded-xl border-gray-200 bg-white/90 focus:border-purple-400 ${errors.passwordConfirmation ? 'border-red-400' : ''}`}
                        />
                        {errors.passwordConfirmation && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirmation}</p>}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* General error */}
                {isError && !errors.email && !errors.password && !errors.name && !errors.passwordConfirmation && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-xs text-red-600 bg-red-50/90 p-3 rounded-xl border border-red-100">
                    <AlertCircle size={13} /><span>{message}</span>
                  </motion.div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                  className="w-full h-11 text-white text-sm font-black rounded-xl transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', boxShadow: '0 4px 16px rgba(124,58,237,0.38)' }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRegister ? 'Create Account' : 'Log In'}
                </button>

                {/* Forgot password */}
                {!isRegister && (
                  <div className="text-center">
                    <button type="button" onClick={() => navigate('/forgot-password')}
                      className="text-xs font-semibold hover:opacity-80"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Guest */}
                <button type="button"
                  onClick={() => { dispatch(guestLogin()); navigate('/home'); toast.success('Logged in as Guest'); }}
                  className="flex items-center justify-center gap-2 w-full h-10 border border-gray-200 rounded-xl bg-white/80 hover:bg-white text-sm font-semibold text-gray-700 transition-all"
                >
                  <User size={14} className="text-gray-500" /> Guest Login
                </button>

                {/* Google */}
                <a href={`${host}/api/auth/google`}
                  className="flex items-center justify-center gap-2 w-full h-10 border border-gray-200 rounded-xl bg-white/80 hover:bg-white text-sm font-semibold text-gray-700 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </a>

                {/* Toggle */}
                <div className="pt-3 border-t border-purple-100/60 flex items-center justify-center gap-1.5">
                  <span className="text-xs text-gray-500">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                  <button type="button"
                    onClick={() => { setIsRegister(!isRegister); setErrors({}); }}
                    className="text-xs font-black hover:opacity-80 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {isRegister ? 'Log In' : 'Sign Up'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 50 }} onClick={() => setShowVerificationModal(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12))' }}>
                <svg className="w-7 h-7" fill="none" stroke="url(#vg)" viewBox="0 0 24 24">
                  <defs><linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#ec4899"/></linearGradient></defs>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-500 mb-2">
                Verification link sent to <span className="font-semibold text-gray-800">{email}</span>
              </p>
              <p className="text-xs text-gray-400 mb-6">Click the link to activate your account. Expires in 24 hours.</p>
              <button
                onClick={() => { setShowVerificationModal(false); setIsRegister(false); setName(''); setEmail(''); setPassword(''); setPasswordConfirmation(''); }}
                className="w-full text-white font-bold rounded-xl h-11 hover:opacity-90 transition-opacity text-sm"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}