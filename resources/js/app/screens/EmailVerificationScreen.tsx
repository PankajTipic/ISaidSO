import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/app/store/hooks';
import { checkAuthStatus } from '@/app/modules/auth/authSlice';

export function EmailVerificationScreen() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token || verificationAttempted.current) return;
            verificationAttempted.current = true;

            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/auth/verify-email/${token}`);

                // Store tokens
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);

                // Update Redux state
                await dispatch(checkAuthStatus());

                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                setErrorMessage(
                    error.response?.data?.error || 'Email verification failed. Please try again.'
                );
            }
        };

        verifyEmail();
    }, [token, dispatch]); // Removed navigate from deps as it's not needed inside effect and stable

    const handleContinue = () => {
        navigate('/profile-setup');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#16161d] to-[#0a0a0f] p-4">
            <motion.div
                className="glass-card rounded-3xl p-8 w-full max-w-md text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-[#a855f7] animate-spin mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
                        <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <CheckCircle className="w-20 h-20 text-green-500" />
                            </motion.div>

                            {/* Particle effects */}
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e'][i % 4],
                                    }}
                                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 200,
                                        y: (Math.random() - 0.5) * 200,
                                        opacity: 0,
                                        scale: 0,
                                    }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeOut",
                                        delay: 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                />
                            ))}
                        </div>

                        <motion.h2
                            className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Email Verified! 🎉
                        </motion.h2>

                        <motion.p
                            className="text-white/80 mb-8 text-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Thank you for verifying your email. You can now set up your profile.
                        </motion.p>

                        <motion.button
                            onClick={handleContinue}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 2, duration: 0.8 }}
                            whileHover={{
                                boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                            }}
                        >
                            Continue to Profile Setup
                        </motion.button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle size={64} className="mx-auto mb-6 text-[#ef4444]" />
                        <h2 className="text-2xl font-bold mb-2 text-red-500">Verification Failed</h2>
                        <p className="text-muted-foreground mb-6">{errorMessage}</p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
