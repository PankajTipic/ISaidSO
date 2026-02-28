import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser, registerUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react';

import { toast } from 'sonner';
import { host } from '@/util/constants';

export default function LoginScreen() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Local error state for shake effect
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [shake, setShake] = useState<{ [key: string]: boolean }>({});
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { isLoading, isError, message, isAuthenticated, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const error = params.get('error');
        const msg = params.get('message');
        const access = params.get('access_token');
        const refresh = params.get('refresh_token');

        if (error) {
            toast.error(msg || "Google login failed");
            // optionally set local error state
        }

        if (access && refresh) {
            // store tokens (localStorage / redux / context)
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // then check auth / navigate
            dispatch(checkAuthStatus());
            toast.success("Logged in successfully");
        }
    }, [location.search]);

    // useEffect(() => {
    //     if (isAuthenticated && user) {
    //         // Check if profile is completed
    //         if (user.is_profile_completed) {
    //             navigate('/home');
    //         } else {
    //             navigate('/profile-setup');
    //         }
    //     }
    // }, [isAuthenticated, user, navigate]);

 useEffect(() => {
  if (!isAuthenticated || !user) return;

  console.log("Auth changed → user:", user);              // ← keep temporarily for debugging
  console.log("Role:", user.role, " | is_profile_completed:", user.is_profile_completed);

  // Priority 1: Profile must be completed
  if (!user.is_profile_completed) {
    navigate('/profile-setup', { replace: true });
    return;
  }

  // Priority 2: Role-based redirection
  const roleLower = (user.role || '').toLowerCase().trim();
  const isAdmin = roleLower === 'admin';

  if (isAdmin) {
    console.log("→ Redirecting ADMIN to /admin");
    navigate('/admin', { replace: true });
  } else {
    console.log("→ Redirecting normal user to /home");
    navigate('/home', { replace: true });
  }
}, [isAuthenticated, user, navigate]);


    // Show verification modal on successful registration
    useEffect(() => {
        if (!isLoading && !isError && message && isRegister && message.includes('verify')) {
            setShowVerificationModal(true);
        }
    }, [isLoading, isError, message, isRegister]);

    // Parse backend errors if any
    useEffect(() => {
        if (isError && message) {
            try {
                // If the message is a JSON stringified validation error object? 
                // Usually Redux rejection payload is just a string message. 
                // We might need to adjust authSlice to pass the full error object if we want granular backend errors here.
                // For now, let's just handle specific string matches or general error.

                // Note: To get field specific errors from backend in Redux, 
                // we'd need to update the THUNK to reject with the `errors` object.
                // Assuming simple string for now, we map it manually or show general.

                if (message.includes('email') || message.includes('registered')) {
                    triggerError('email', message);
                } else if (message.includes('password')) {
                    triggerError('password', message);
                } else {
                    // General error
                }
            } catch (e) { }
        }
    }, [isError, message]);

    const triggerError = (field: string, msg: string) => {
        setErrors(prev => ({ ...prev, [field]: msg }));
        setShake(prev => ({ ...prev, [field]: true }));
        setTimeout(() => setShake(prev => ({ ...prev, [field]: false })), 500);
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors: { [key: string]: string } = {};

        if (isRegister && !name.trim()) {
            newErrors.name = 'Name is required';
            triggerError('name', 'Name is required');
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            triggerError('email', 'Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
            triggerError('email', 'Invalid email format');
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            triggerError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            triggerError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (isRegister && !country.trim()) {
            newErrors.country = 'Country is required';
            triggerError('country', 'Country is required');
            isValid = false;
        }

        if (isRegister && !city.trim()) {
            newErrors.city = 'City is required';
            triggerError('city', 'City is required');
            isValid = false;
        }

        if (isRegister && password !== passwordConfirmation) {
            newErrors.passwordConfirmation = 'Passwords do not match';
            triggerError('passwordConfirmation', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // Clear prev errors

        if (!validateForm()) return;

        if (isRegister) {
            dispatch(registerUser({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                country,
                city
            }));
        } else {
            dispatch(loginUser({ email, password }));
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${host}/api/auth/google`;
    };

    const shakeAnimation = (isShaking: boolean) => ({
        x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
        transition: { duration: 0.4 }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        {isRegister ? 'Create an account' : 'Sign in to your account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isRegister ? 'Enter your details below to create your account' : 'Welcome back! Please enter your details.'}
                    </p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md p-8 rounded-xl border border-zinc-800 shadow-xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {isRegister && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className={errors.name ? 'text-destructive' : 'text-gray-200'}>Full Name</Label>
                                    <motion.div animate={shakeAnimation(shake.name)}>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                            }}
                                            placeholder="John Doe"
                                            className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-primary ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                        />
                                    </motion.div>
                                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className={errors.country ? 'text-destructive' : 'text-gray-200'}>Country</Label>
                                        <motion.div animate={shakeAnimation(shake.country)}>
                                            <Input
                                                id="country"
                                                type="text"
                                                value={country}
                                                onChange={(e) => {
                                                    setCountry(e.target.value);
                                                    if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
                                                }}
                                                placeholder="USA"
                                                className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-primary ${errors.country ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            />
                                        </motion.div>
                                        {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city" className={errors.city ? 'text-destructive' : 'text-gray-200'}>City</Label>
                                        <motion.div animate={shakeAnimation(shake.city)}>
                                            <Input
                                                id="city"
                                                type="text"
                                                value={city}
                                                onChange={(e) => {
                                                    setCity(e.target.value);
                                                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                                                }}
                                                placeholder="New York"
                                                className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-primary ${errors.city ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            />
                                        </motion.div>
                                        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className={errors.email ? 'text-destructive' : 'text-gray-200'}>Email address</Label>
                            <motion.div animate={shakeAnimation(shake.email)}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                    }}
                                    placeholder="Enter your email"
                                    className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-primary ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                />
                            </motion.div>
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className={errors.password ? 'text-destructive' : 'text-gray-200'}>Password</Label>
                                {!isRegister && (
                                    <div className="text-sm">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgot-password')}
                                            className="font-medium text-primary hover:text-primary/90"
                                        >
                                            Forgot your password?
                                        </button>
                                    </div>
                                )}
                            </div>
                            <motion.div animate={shakeAnimation(shake.password)}>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                        }}
                                        placeholder="••••••••"
                                        className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 pr-10 focus:border-primary ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </motion.div>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                        </div>

                        {isRegister && (
                            <div className="space-y-2">
                                <Label htmlFor="passwordConfirmation" className={errors.passwordConfirmation ? 'text-destructive' : 'text-gray-200'}>Confirm Password</Label>
                                <motion.div animate={shakeAnimation(shake.passwordConfirmation)}>
                                    <Input
                                        id="passwordConfirmation"
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => {
                                            setPasswordConfirmation(e.target.value);
                                            if (errors.passwordConfirmation) setErrors(prev => ({ ...prev, passwordConfirmation: '' }));
                                        }}
                                        placeholder="••••••••"
                                        className={`bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-primary ${errors.passwordConfirmation ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </motion.div>
                                {errors.passwordConfirmation && <p className="text-xs text-destructive mt-1">{errors.passwordConfirmation}</p>}
                            </div>
                        )}

                        {isError && !errors.email && !errors.password && !errors.name && !errors.passwordConfirmation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                            >
                                <AlertCircle size={16} />
                                <span>{message}</span>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isRegister ? 'Create Account' : 'Sign in'}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <a
                            href={`${host}/api/auth/google`}
                            className="w-full bg-white hover:bg-gray-200 text-black font-bold flex items-center justify-center border-none h-10 rounded-md transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </a>

                        {/* <button
  onClick={handleGoogleLogin}
  className="w-full bg-red-500 text-white py-2 rounded-lg"
>
  Continue with Google
</button> */}

                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        </span>
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setErrors({});
                            }}
                            className="font-medium text-primary hover:text-primary/90 underline-offset-4 hover:underline"
                        >
                            {isRegister ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                </div>
            </motion.div >

            {/* Email Verification Modal */}
            <AnimatePresence>
                {
                    showVerificationModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                            onClick={() => setShowVerificationModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-6">
                                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                        <svg
                                            className="w-8 h-8 text-primary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Check Your Email</h3>
                                    <p className="text-muted-foreground">
                                        We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Please check your inbox and click the verification link to activate your account.
                                        The link will expire in 24 hours.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setShowVerificationModal(false);
                                            setIsRegister(false);
                                            setName('');
                                            setEmail('');
                                            setPassword('');
                                            setPasswordConfirmation('');
                                        }}
                                        className="w-full bg-primary hover:bg-primary/90"
                                    >
                                        Got it!
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
