import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Button } from '@/app/components/ui/button';
import { Bell, Check, X, Trash2, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAuth, postAuth, deleteAuth } from '@/util/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

interface Notification {
    id: string;
    data: {
        type: string;
        requester_id: number;
        requester_name: string;
        group_id: number;
        group_name: string;
        message: string;
    };
    read_at: string | null;
    created_at: string;
}

export function NotificationsScreen() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await getAuth('/api/notifications');
            setNotifications(res.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAction = async (notification: Notification, action: 'accept' | 'reject') => {
        try {
            await postAuth(`/api/groups/${notification.data.group_id}/requests/${notification.data.requester_id}`, {
                action
            });
            toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
            // Mark as read and delete from view
            await postAuth(`/api/notifications/${notification.id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await postAuth(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await deleteAuth(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const markAllRead = async () => {
        try {
            await postAuth('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-6">
            <TopNav />

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                            <ArrowLeft size={24} />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Bell size={32} className="text-primary" />
                                Notifications
                            </h1>
                        </div>
                    </div>

                    {notifications.some(n => !n.read_at) && (
                        <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-full glass-card">
                            Mark all read
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((n, index) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`glass-card p-4 rounded-2xl border ${n.read_at ? 'border-border/40 opacity-70' : 'border-primary/20 shadow-lg shadow-primary/5'} transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${n.data.type === 'join_request' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'}`}>
                                            {n.data.type === 'join_request' ? <UserPlus size={20} /> : <Bell size={20} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-relaxed">
                                                {n.data.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(n.created_at).toLocaleString()}
                                            </p>

                                            {n.data.type === 'join_request' && !n.read_at && (
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleAction(n, 'accept')}
                                                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-8"
                                                    >
                                                        <Check size={14} className="mr-1" /> Accept
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleAction(n, 'reject')}
                                                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-full px-4 h-8"
                                                    >
                                                        <X size={14} className="mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {!n.read_at && (
                                                <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} className="h-8 w-8 rounded-full">
                                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => deleteNotification(n.id)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border">
                        <Bell size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            When you get group join requests or activity updates, they'll appear here.
                        </p>
                    </div>
                )}
            </div>

            <MobileNav />
        </div>
    );
}
