import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Upload, RefreshCw } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { checkAuthStatus } from '@/app/modules/auth/authSlice';
import axios from 'axios';
import { AvatarSelector } from '@/app/components/AvatarSelector';
import { avatarOptions } from '@/app/constants/avatarOptions';



export function ProfileSetupScreen() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const [username, setUsername] = useState('');
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [country, setCountry] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await axios.get('http://127.0.0.1:8000/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const userData = response.data;
                // Only set if not already set (to avoid overwriting user input if they navigate back/forth)
                if (!name && userData.name) setName(userData.name);
                // Email is driven by state init but let's double check

                // If user has an avatar already, set it
                if (userData.avatar) {
                    // Check if it's one of the options or custom
                    if (avatarOptions.includes(userData.avatar)) {
                        setSelectedAvatar(userData.avatar);
                    } else {
                        // It's a custom URL or S3 URL
                        // Store the PATH locally for logic, but preview needs URL
                        // However, selectedAvatar is used for preview if avatarPreview is null.
                        // If we set selectedAvatar to the PATH, it won't load.
                        // We should set it to the URL.
                        setSelectedAvatar(userData.avatar_url || userData.avatar);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            }
        };

        fetchUserData();
    }, []);

    const handleAvatarSelect = (avatar: string | File) => {
        if (typeof avatar === 'string') {
            setSelectedAvatar(avatar);
            setAvatarFile(null);
            setAvatarPreview(null);
        } else {
            setAvatarFile(avatar);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(avatar);
        }
    };

    const handleContinue = async () => {
        // Auto-generate username if empty
        let finalUsername = username;
        if (!finalUsername) {
            const base = name ? name.toLowerCase().replace(/\s+/g, '') : 'user';
            const random = Math.floor(Math.random() * 10000);
            finalUsername = `${base}${random}`.substring(0, 20); // Limit to 20 chars
            setUsername(finalUsername);
        }

        if (!selectedAvatar && !avatarFile) {
            setError('Please select an avatar or upload an image.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', finalUsername);
            formData.append('name', name);
            formData.append('country', country);

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else if (selectedAvatar) {
                formData.append('avatar', selectedAvatar);
            }

            const token = localStorage.getItem('access_token');
            await axios.post('http://127.0.0.1:8000/api/profile/update', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh user state to update is_profile_completed
            await dispatch(checkAuthStatus());

            navigate('/home');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#16161d] to-[#0a0a0f] p-4">
            <motion.div
                className="glass-card rounded-3xl p-8 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
                    <p className="text-muted-foreground">Set up your account details</p>
                </div>

                {/* Avatar Selection */}
                <AvatarSelector
                    currentAvatar={selectedAvatar}
                    preview={avatarPreview}
                    onSelect={handleAvatarSelect}
                />

                {/* Form Fields */}
                <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={email}
                            disabled
                            className="h-12 glass-card opacity-60 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input
                            type="text"
                            placeholder="Enter your country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="h-12 glass-card"
                        />
                    </div>
                </div>

                {
                    error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )
                }

                <Button
                    className="w-full h-12"
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    style={{
                        background: !isSubmitting
                            ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                            : undefined,
                    }}
                >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
            </motion.div >
        </div >
    );
}
