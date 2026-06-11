import { useState, useEffect } from 'react';
// import { Loader2, LogOut, X, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { getAuth, postAuth, postFormDataAuth } from '@/util/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
// import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '@/app/modules/auth/authSlice';
import { useAppDispatch } from '@/app/store/hooks';

import {
  Loader2,
  LogOut,
  X,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    is_blocked: boolean;
    avatar_url?: string;
    created_at?: string;
    country?: string;
    city?: string;
}

export default function ProfileTab() {
    // ── Profile state ──────────────────────────────────────────────────────────
    const [adminProfile, setAdminProfile] = useState<User | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Edit profile
    const [editingProfile, setEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editAvatar, setEditAvatar] = useState<File | null>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Change password
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [showEmailPassword, setShowEmailPassword] = useState(false);

    // Change email
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailSaving, setEmailSaving] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // ── Load profile ───────────────────────────────────────────────────────────
    const loadAdminProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await getAuth('/api/user');
            setAdminProfile(res);
        } catch {
            /* silent */
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        loadAdminProfile();
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            toast.success('Logged out successfully');
            navigate('/auth', { replace: true });
        } catch {
            toast.error('Logout failed – redirecting');
            navigate('/auth', { replace: true });
        }
    };

    const openEditProfile = () => {
        if (!adminProfile) return;
        setEditName(adminProfile.name ?? '');
        setEditUsername(adminProfile.username ?? '');
        setEditCountry(adminProfile.country ?? '');
        setEditCity(adminProfile.city ?? '');
        setEditAvatarPreview(adminProfile.avatar_url ?? null);
        setEditAvatar(null);
        setEditingProfile(true);
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditAvatar(file);
        const reader = new FileReader();
        reader.onload = () => setEditAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            formData.append('username', editUsername);
            if (editCountry) formData.append('country', editCountry);
            if (editCity) formData.append('city', editCity);
            if (editAvatar) formData.append('avatar', editAvatar);

            const data = await postFormDataAuth('/api/profile/update', formData);
            toast.success('Profile updated successfully');
            setAdminProfile(prev => (prev ? { ...prev, ...data.user } : data.user));
            setEditingProfile(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setPasswordSaving(true);
        try {
            await postAuth('/api/user/change-password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            toast.success('Password changed successfully');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Failed to change password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail.trim() || !emailPassword.trim()) {
            toast.error('All fields are required');
            return;
        }
        setEmailSaving(true);
        try {
            await postAuth('/api/user/change-email', {
                email: newEmail.trim(),
                password: emailPassword,
            });
            toast.success('Email updated. Please verify your new email address.');
            setShowEmailForm(false);
            setNewEmail('');
            setEmailPassword('');
            loadAdminProfile();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Failed to change email');
        } finally {
            setEmailSaving(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto space-y-4">

            {/* ── Profile Hero Card ───────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Banner */}
                <div className="relative h-36 bg-[#0f172a] overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 80% 20%, #db2777 0%, transparent 50%)',
                        }}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">
                            Online
                        </span>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    {profileLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                    ) : adminProfile ? (
                        <>
                            {/* Avatar row */}
                            <div className="flex items-end justify-between -mt-14 mb-5">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-[3px] border-white shadow-lg ring-2 ring-violet-100">
                                        <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.name} />
                                        <AvatarFallback className="bg-violet-600 text-white text-2xl font-bold">
                                            {(adminProfile.name?.[0] ?? 'A').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                                </div>

                                <button
                                    onClick={openEditProfile}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    {/* pencil icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>

                            {/* Name / role */}
                            <div className="mb-5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-xl font-bold text-slate-900">{adminProfile.name}</h2>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            adminProfile.role === 'super_admin'
                                                ? 'bg-amber-100 text-amber-700'
                                                : adminProfile.role === 'system_admin'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-violet-100 text-violet-700'
                                        }`}
                                    >
                                        {adminProfile.role?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-0.5">@{adminProfile.username}</p>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {(
                                    [
                                        {
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                            ),
                                            label: 'Email address',
                                            value: adminProfile.email,
                                            color: 'text-violet-600',
                                            bg: 'bg-violet-50',
                                        },
                                        {
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            ),
                                            label: 'User ID',
                                            value: `#${adminProfile.id}`,
                                            color: 'text-slate-600',
                                            bg: 'bg-slate-50',
                                        },
                                        {
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                            ),
                                            label: 'Account status',
                                            value: adminProfile.is_blocked ? 'Blocked' : 'Active',
                                            color: adminProfile.is_blocked ? 'text-red-600' : 'text-emerald-600',
                                            bg: adminProfile.is_blocked ? 'bg-red-50' : 'bg-emerald-50',
                                        },
                                        {
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                            ),
                                            label: 'Member since',
                                            value: adminProfile.created_at
                                                ? new Date(adminProfile.created_at).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : '—',
                                            color: 'text-slate-600',
                                            bg: 'bg-slate-50',
                                        },
                                    ] as { icon: React.ReactNode; label: string; value: string; color: string; bg: string }[]
                                ).map(item => (
                                    <div
                                        key={item.label}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 ${item.bg}`}
                                    >
                                        <div className={`mt-0.5 flex-shrink-0 ${item.color}`}>{item.icon}</div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                                                {item.label}
                                            </p>
                                            <p className={`text-sm font-semibold truncate ${item.color}`}>
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <p className="text-sm">Failed to load profile</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Security Settings ───────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Security settings
                    </p>
                </div>

                {/* ── Change Password ── */}
                <div className="border-b border-slate-100">
                    <button
                        onClick={() => {
                            setShowPasswordForm(v => !v);
                            setShowEmailForm(false);
                        }}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors group"
                    >
                        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">Change password</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Update your account password regularly for security
                            </p>
                        </div>
                        <div
                            className={`flex-shrink-0 h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center transition-all ${
                                showPasswordForm
                                    ? 'bg-violet-600 border-violet-600 rotate-180'
                                    : 'bg-white group-hover:border-slate-300'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={showPasswordForm ? 'white' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </button>

                    {showPasswordForm && (
                        <div className="px-5 pb-5 space-y-4 bg-slate-50/50 border-t border-slate-100">
                            <div className="pt-4 grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Current password
                                    </label>
                                    {/* <Input
                                        type="password"
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                    /> */}

                                    <div className="relative">
    <Input
        type={showCurrentPassword ? 'text' : 'password'}
        placeholder="Enter your current password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        className="pr-10"
    />

    <button
        type="button"
        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
        {showCurrentPassword ? (
            <EyeOff size={16} />
        ) : (
            <Eye size={16} />
        )}
    </button>
</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            New password
                                        </label>
                                        {/* <Input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                        /> */}

                                        <div className="relative">
    <Input
        type={showNewPassword ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="pr-10"
    />

    <button
        type="button"
        onClick={() => setShowNewPassword(!showNewPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
        {showNewPassword ? (
            <EyeOff size={16} />
        ) : (
            <Eye size={16} />
        )}
    </button>
</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Confirm password
                                        </label>
                                        {/* <Input
                                            type="password"
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                        /> */}

                                        <div className="relative">
    <Input
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Repeat new password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        className="pr-10"
    />

    <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
        {showConfirmPassword ? (
            <EyeOff size={16} />
        ) : (
            <Eye size={16} />
        )}
    </button>
</div>
                                    </div>
                                </div>

                                {/* Password strength */}
                                {newPassword && (
                                    <div className="space-y-1.5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                                        newPassword.length >= i * 2
                                                            ? newPassword.length >= 8
                                                                ? 'bg-emerald-500'
                                                                : 'bg-amber-400'
                                                            : 'bg-slate-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p
                                            className={`text-[11px] font-medium ${
                                                newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                                            }`}
                                        >
                                            {newPassword.length < 4
                                                ? 'Too short'
                                                : newPassword.length < 8
                                                ? 'Almost there — keep going'
                                                : 'Strong password'}
                                        </p>
                                    </div>
                                )}

                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        <X size={12} /> Passwords do not match
                                    </div>
                                )}
                                {newPassword && confirmPassword && newPassword === confirmPassword && (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                        <CheckCircle size={12} /> Passwords match
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                                <button
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    size="sm"
                                    onClick={handleChangePassword}
                                    disabled={
                                        passwordSaving ||
                                        !currentPassword ||
                                        !newPassword ||
                                        !confirmPassword ||
                                        newPassword !== confirmPassword
                                    }
                                    className="h-9 px-5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
                                >
                                    {passwordSaving ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                            Updating…
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Update password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Change Email ── */}
                <div>
                    <button
                        onClick={() => {
                            setShowEmailForm(v => !v);
                            setShowPasswordForm(false);
                        }}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors group"
                    >
                        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">Change email address</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                Current:{' '}
                                <span className="text-slate-500 font-medium">{adminProfile?.email ?? '—'}</span>
                            </p>
                        </div>
                        <div
                            className={`flex-shrink-0 h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center transition-all ${
                                showEmailForm
                                    ? 'bg-violet-600 border-violet-600 rotate-180'
                                    : 'bg-white group-hover:border-slate-300'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={showEmailForm ? 'white' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </button>

                    {showEmailForm && (
                        <div className="px-5 pb-5 space-y-4 bg-slate-50/50 border-t border-slate-100">
                            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 border border-sky-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 flex-shrink-0 mt-0.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="text-xs text-sky-700 leading-relaxed">
                                    A verification link will be sent to your new email. Your email won't change until
                                    you verify it.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        New email address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Confirm with password
                                    </label>
                                    {/* <Input
                                        type="password"
                                        placeholder="Your current password"
                                        value={emailPassword}
                                        onChange={e => setEmailPassword(e.target.value)}
                                        className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
                                    /> */}

                                    <div className="relative">
    <Input
        type={showEmailPassword ? 'text' : 'password'}
        placeholder="Your current password"
        value={emailPassword}
        onChange={e => setEmailPassword(e.target.value)}
        className="pr-10"
    />

    <button
        type="button"
        onClick={() => setShowEmailPassword(!showEmailPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
        {showEmailPassword ? (
            <EyeOff size={16} />
        ) : (
            <Eye size={16} />
        )}
    </button>
</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                                <button
                                    onClick={() => {
                                        setShowEmailForm(false);
                                        setNewEmail('');
                                        setEmailPassword('');
                                    }}
                                    className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    size="sm"
                                    onClick={handleChangeEmail}
                                    disabled={emailSaving || !newEmail.trim() || !emailPassword.trim()}
                                    className="h-9 px-5 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white border-0 shadow-sm"
                                >
                                    {emailSaving ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                            Updating…
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Update email
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Danger Zone ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-red-100 flex items-center gap-2 bg-red-50/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">Danger zone</p>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Sign out of all devices</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Revoke all active sessions across every device
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
                    >
                        <LogOut size={13} />
                        Sign out
                    </button>
                </div>
            </div>

            {/* ── Edit Profile Modal ───────────────────────────────────────────── */}
            <Dialog open={editingProfile} onOpenChange={open => { if (!open) setEditingProfile(false); }}>
                <DialogContent className="bg-white border-slate-200 shadow-xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">Edit profile</DialogTitle>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Update your display name, username and photo
                        </p>
                    </DialogHeader>

                    <div className="space-y-5 mt-2">
                        {/* Avatar upload */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-2 ring-violet-100">
                                    <AvatarImage src={editAvatarPreview ?? undefined} />
                                    <AvatarFallback className="bg-violet-600 text-white text-xl font-bold">
                                        {(editName?.[0] ?? 'A').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-violet-600 text-white cursor-pointer hover:bg-violet-700 transition-colors shadow flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarFileChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Profile photo</p>
                                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
                                {editAvatarPreview && editAvatar && (
                                    <button
                                        onClick={() => {
                                            setEditAvatar(null);
                                            setEditAvatarPreview(adminProfile?.avatar_url ?? null);
                                        }}
                                        className="text-[11px] text-red-500 hover:text-red-700 font-medium mt-1 transition-colors"
                                    >
                                        Remove new photo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Full name
                                    </label>
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Your full name"
                                        className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                            @
                                        </span>
                                        <Input
                                            value={editUsername}
                                            onChange={e => setEditUsername(e.target.value)}
                                            placeholder="username"
                                            maxLength={20}
                                            className="h-10 text-sm pl-7 border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Country
                                    </label>
                                    <Input
                                        value={editCountry}
                                        onChange={e => setEditCountry(e.target.value)}
                                        placeholder="e.g. India"
                                        className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        City
                                    </label>
                                    <Input
                                        value={editCity}
                                        onChange={e => setEditCity(e.target.value)}
                                        placeholder="e.g. Mumbai"
                                        className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setEditingProfile(false)}
                                className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={profileSaving || !editName.trim() || !editUsername.trim()}
                                className="h-9 px-6 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm"
                            >
                                {profileSaving ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Save changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}