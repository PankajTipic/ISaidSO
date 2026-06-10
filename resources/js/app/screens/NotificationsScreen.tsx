import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Button } from '@/app/components/ui/button';
import {
    Bell, Check, X, Trash2, ArrowLeft, Loader2,
    UserPlus, TrendingUp, CheckCheck, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAuth, postAuth, deleteAuth } from '@/util/api';

interface Notification {
    id: string;
    data: {
        type: string;
        message: string;
        requester_id?: number;
        requester_name?: string;
        group_id?: number;
        group_name?: string;
        question_id?: number;
        question_text?: string;
        creator_id?: number;
        creator_name?: string;
    };
    read_at: string | null;
    created_at: string;
    // local-only flag to track whether the join request was already handled
    _handled?: boolean;
}

const notifPalettes = [
    { border: '#a855f7', bg: 'rgba(168,85,247,0.06)', icon: 'bg-purple-100 text-purple-600' },
    { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)',  icon: 'bg-cyan-100 text-cyan-600' },
    { border: '#10b981', bg: 'rgba(16,185,129,0.06)', icon: 'bg-emerald-100 text-emerald-600' },
    { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', icon: 'bg-amber-100 text-amber-600' },
    { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)', icon: 'bg-blue-100 text-blue-600' },
    { border: '#ec4899', bg: 'rgba(236,72,153,0.06)', icon: 'bg-pink-100 text-pink-600' },
];

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationsScreen() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [handlingId, setHandlingId] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await getAuth('/api/notifications');
            setNotifications(res.notifications || []);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    // Accept or Reject a group join request.
    // Does NOT hide buttons based on read_at; uses a local _handled flag instead.
    const handleAction = async (notif: Notification, action: 'accept' | 'reject') => {
        if (handlingId === notif.id) return;
        setHandlingId(notif.id);
        try {
            await postAuth(
                `/api/groups/${notif.data.group_id}/requests/${notif.data.requester_id}`,
                { action }
            );
            toast.success(action === 'accept' ? '✅ Request accepted!' : '❌ Request rejected');
            await postAuth(`/api/notifications/${notif.id}/read`);
            // Mark locally as handled (buttons disappear) and read
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? { ...n, read_at: new Date().toISOString(), _handled: true }
                        : n
                )
            );
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setHandlingId(null);
        }
    };

    // Mark as read — but do NOT remove Accept/Reject buttons for join_request notifications
    const markAsRead = async (notif: Notification) => {
        try {
            await postAuth(`/api/notifications/${notif.id}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await deleteAuth(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification removed');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const markAllRead = async () => {
        try {
            await postAuth('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('All caught up!');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-24 md:pb-8">
            <TopNav />

            <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">

                {/* ── Header ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-600 shrink-0 mt-1 md:mt-0"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                    <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <div className="flex items-center justify-center bg-violet-600 text-white rounded-full w-8 h-8 md:w-auto md:h-auto md:px-2 md:py-0.5 shadow-sm">
                                            <div className="flex flex-col items-center leading-none">
                                                <span className="text-[10px] font-black">{unreadCount}</span>
                                                <span className="text-[7px] font-bold uppercase md:hidden">new</span>
                                            </div>
                                            <span className="hidden md:inline text-[10px] font-black ml-1">new</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Stay up to date with your activity</p>
                                
                                {/* Mobile-only: Mark all read button below text */}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="md:hidden mt-3 flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition w-fit"
                                    >
                                        <CheckCheck size={13} />
                                        <span>Mark all read</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Desktop-only: Mark all read button on the right */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition"
                            >
                                <CheckCheck size={14} />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                        </div>
                        <p className="text-sm text-slate-500">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Bell size={28} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">All caught up!</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto px-4">
                            Group join requests, predictions and updates will appear here.
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            className="mt-5 px-5 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition"
                        >
                            Go to Home
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <AnimatePresence>
                            {notifications.map((notif, index) => {
                                const pal = notifPalettes[index % notifPalettes.length];
                                const isJoinRequest = notif.data.type === 'join_request';
                                const isPrediction  = notif.data.type === 'new_prediction';
                                // Show Accept/Reject ONLY if it's a join_request AND NOT yet handled (_handled flag)
                                const showActions   = isJoinRequest && !notif._handled;
                                const isHandling    = handlingId === notif.id;

                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -24, scale: 0.96 }}
                                        transition={{ delay: index * 0.04, duration: 0.25 }}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                        style={{
                                            borderLeft: `3px solid ${pal.border}`,
                                            opacity: notif.read_at && !showActions ? 0.75 : 1,
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${pal.icon}`}>
                                                    {isJoinRequest  ? <UserPlus size={18} /> :
                                                     isPrediction   ? <TrendingUp size={18} /> :
                                                     <Sparkles size={18} />}
                                                </div>

                                                {/* Body */}
                                                <div
                                                    className={`flex-1 min-w-0 ${isPrediction ? 'cursor-pointer' : ''}`}
                                                    onClick={() => {
                                                        if (isPrediction && notif.data.question_id) {
                                                            navigate(`/prediction/${notif.data.question_id}`);
                                                        }
                                                    }}
                                                >
                                                    {/* Type badge */}
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span
                                                            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                            style={{ background: `${pal.border}18`, color: pal.border }}
                                                        >
                                                            {isJoinRequest ? 'Join Request' :
                                                             isPrediction  ? 'New Prediction' : 'Update'}
                                                        </span>
                                                        {!notif.read_at && (
                                                            <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                                                        )}
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                                        {notif.data.message}
                                                    </p>
                                                    {notif.data.group_name && (
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Community: <span className="font-semibold text-slate-700">{notif.data.group_name}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(notif.created_at)}</p>

                                                    {/* ── Accept / Reject Buttons ──
                                                        Visible for join_request as long as NOT _handled.
                                                        read_at does NOT hide these buttons. */}
                                                    {showActions && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <button
                                                                disabled={isHandling}
                                                                onClick={(e) => { e.stopPropagation(); handleAction(notif, 'accept'); }}
                                                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition disabled:opacity-60"
                                                            >
                                                                {isHandling ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                                                                Accept
                                                            </button>
                                                            <button
                                                                disabled={isHandling}
                                                                onClick={(e) => { e.stopPropagation(); handleAction(notif, 'reject'); }}
                                                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 text-xs font-bold transition disabled:opacity-60"
                                                            >
                                                                <X size={13} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions column */}
                                                <div className="flex flex-col items-center gap-1 shrink-0">
                                                    {/* Mark-as-read dot — ONLY marks read, never hides accept/reject */}
                                                    {!notif.read_at && (
                                                        <button
                                                            title="Mark as read"
                                                            onClick={(e) => { e.stopPropagation(); markAsRead(notif); }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition group"
                                                        >
                                                            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 group-hover:scale-125 transition-transform" />
                                                        </button>
                                                    )}
                                                    <button
                                                        title="Delete"
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <MobileNav />
        </div>
    );
}
