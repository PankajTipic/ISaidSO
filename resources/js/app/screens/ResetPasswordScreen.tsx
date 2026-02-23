import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/store/hooks';
import { checkAuthStatus } from '@/app/modules/auth/authSlice';
import { postAuth } from '@/util/api';

export function ResetPasswordScreen() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const response = await postAuth('/api/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            // If backend auto-logs in and returns token (as per issueTokens struct)
            // { user, access_token, ... }
            // We should save it and update state.

            const { access_token, user } = response.data;
            if (access_token) {
                localStorage.setItem('access_token', access_token);
                // Also update user in local storage if issueTokens returns it
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                await dispatch(checkAuthStatus()); // Sync redux state

                toast.success("Password reset successfully!");

                if (user?.is_profile_completed) {
                    navigate('/home');
                } else {
                    navigate('/profile-setup');
                }
            } else {
                // If backend just says success
                toast.success("Password reset successfully! Please login.");
                navigate('/auth');
            }

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password.");
            toast.error("Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center p-8 glass-card rounded-xl">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
                    <p className="text-muted-foreground mb-6">This password reset link is invalid or incomplete.</p>
                    <Button onClick={() => navigate('/auth')}>Back to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        Create New Password
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>

                <div className="glass-card p-8 rounded-xl border border-border/50 shadow-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10 bg-muted/50"
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="passwordConfirmation">Confirm New Password</Label>
                            <Input
                                id="passwordConfirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="bg-muted/50"
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Reset Password
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
