import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { registerUser } from '@/app/modules/auth/authSlice';

export default function TermsAcceptanceScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const state = location.state as {
        isRegister?: boolean;
        pendingAction?: string;
        formData?: any;
    } | null;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [registrationDone, setRegistrationDone] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const { isLoading } = useAppSelector(s => s.auth);

    // If no state is passed, redirect back to login
    if (!state || !state.isRegister) {
        navigate('/login', { replace: true });
        return null;
    }

    const shakeAnim = (s: boolean) => ({
        x: s ? [0, -8, 8, -8, 8, 0] : 0,
        transition: { duration: 0.4 }
    });

    const handleConfirm = async () => {
        if (!termsAccepted) {
            setError('You must agree to the Terms & Conditions and Privacy Policy to continue.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setError('');

        if (state.pendingAction === 'email' && state.formData) {
            try {
                await dispatch(registerUser({
                    ...state.formData,
                    password_confirmation: state.formData.passwordConfirmation,
                    terms_accepted: true,
                })).unwrap();
                // ✅ Registration succeeded — show email verification screen
                setRegisteredEmail(state.formData.email || '');
                setRegistrationDone(true);
            } catch (err: any) {
                console.error(err);
                const msg = err?.message || err?.data?.message || 'Registration failed. Please go back and check your details.';
                setError(msg);
            }
        } else if (state.pendingAction === 'whatsapp') {
            navigate('/whatsapp-login');
        } else if (state.pendingAction) {
            window.location.href = state.pendingAction;
        }
    };

    // ─── Email Verification Success Screen ────────────────────────────────────
    if (registrationDone) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-purple-100"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12))' }}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="url(#emailGrad)" viewBox="0 0 24 24">
                            <defs>
                                <linearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
                        style={{ background: 'linear-gradient(135deg, #7c3aed22, #ec489922)', color: '#7c3aed' }}
                    >
                        <CheckCircle2 size={12} /> Account Created Successfully
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-black text-gray-900 mb-3"
                    >
                        Check Your Email
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="text-sm text-gray-500 mb-2"
                    >
                        We've sent a verification link to
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-base font-bold text-gray-800 mb-2"
                    >
                        {registeredEmail}
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="text-xs text-gray-400 mb-8"
                    >
                        Click the link in the email to activate your account. The link expires in 24 hours.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => navigate('/login', { replace: true })}
                        className="w-full py-3.5 rounded-xl text-white font-black text-sm hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
                    >
                        Got it, Go to Login
                    </motion.button>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs text-gray-400 mt-4"
                    >
                        Didn't receive it? Check your spam folder.
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    // ─── Terms & Conditions Screen ─────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4 shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Terms & Conditions</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Please read and agree to continue with registration.</p>
                    </div>
                </div>

                {/* Scrollable T&C body */}
                <div className="flex-1 overflow-y-auto pr-4 text-sm text-gray-700 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
                    <p className="font-semibold text-gray-500">Effective Date: [DD/MM/YYYY]</p>
                    <p>Welcome to I Said So ("the Platform"). By creating an account or using the Platform, you agree to these Terms & Conditions.</p>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">1. Eligibility</h2>
                    <p>You must be at least 18 years old or the legal age required in your jurisdiction to use the Platform.</p>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">2. User Account</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You are responsible for all activities performed through your account.</li>
                        <li>You must provide accurate and up-to-date information during registration.</li>
                    </ul>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">3. Acceptable Use</h2>
                    <p className="mb-2">You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Submit false, unlawful, defamatory, abusive, hateful, or misleading content.</li>
                        <li>Impersonate another person or organization.</li>
                        <li>Attempt to gain unauthorized access to the Platform or its systems.</li>
                        <li>Interfere with the normal operation or security of the Platform.</li>
                        <li>Use the Platform for illegal or fraudulent activities.</li>
                    </ul>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">4. User Content</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You retain ownership of the content you submit.</li>
                        <li>By submitting content, you grant the Platform a non-exclusive, worldwide license to store, display, process, and distribute that content for operating the Platform.</li>
                        <li>You are solely responsible for the content you publish.</li>
                    </ul>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">5. Predictions and Validation</h2>
                    <p>Predictions, votes, comments, and validation outcomes represent user opinions and community participation. The Platform does not guarantee the accuracy, truthfulness, or completeness of any prediction or validation.</p>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">6. Intellectual Property</h2>
                    <p>All software, branding, logos, designs, and platform content (excluding user-generated content) remain the intellectual property of the Platform or its licensors.</p>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">7. Privacy</h2>
                    <p>Your personal information is processed in accordance with our Privacy Policy.</p>

                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">8. Suspension and Termination</h2>
                    <p>We may suspend or terminate accounts that violate these Terms, misuse the Platform, or compromise the security or integrity of the service.</p>
                </div>

                {/* Footer: Checkbox + Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-100 shrink-0">
                    <motion.div
                        animate={shakeAnim(shake)}
                        className={`flex items-start gap-3 mb-4 p-4 rounded-2xl border transition-colors ${error ? 'bg-red-50/50 border-red-200' : 'bg-purple-50/50 border-purple-100'}`}
                    >
                        <div className="flex h-5 items-center mt-0.5 shrink-0">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    if (error) setError('');
                                }}
                                className={`w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer ${error ? 'border-red-400' : ''}`}
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm font-medium text-gray-700 leading-snug cursor-pointer">
                            I have read and agree to the{' '}
                            <button type="button" onClick={() => window.open('/terms-and-conditions', '_blank')} className="text-purple-600 font-bold hover:underline">
                                Terms & Conditions
                            </button>{' '}
                            and{' '}
                            <button type="button" onClick={() => window.open('/privacy-policy', '_blank')} className="text-purple-600 font-bold hover:underline">
                                Privacy Policy
                            </button>.
                        </label>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                                    <AlertCircle size={13} />
                                    <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3.5 rounded-xl text-gray-700 font-bold text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-[2] py-3.5 rounded-xl text-white font-black text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
                        >
                            {isLoading ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Creating Account...</>
                            ) : (
                                'Confirm & Create Account'
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
