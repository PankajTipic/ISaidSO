import { useState, useEffect } from 'react';
import { Bell, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { getAuth, postAuth, deleteAuth } from '@/util/api';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface Notification {
    id: string;
    type: string;
    read_at: string | null;
    created_at: string;
    data: {
        type?: string;
        requester_name?: string;
        requester_id?: number;
        group_name?: string;
        group_id?: number;
        created_at?: string;
    };
}

export default function NotificationsTab() {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [contactMessages, setContactMessages] = useState<{ data: ContactMessage[] } | null>(null);
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'contact' | 'join_request'>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    const [selectedMessageDetails, setSelectedMessageDetails] = useState<any>(null);
    const [messageDetailsLoading, setMessageDetailsLoading] = useState(false);

    const [deleteMessageModal, setDeleteMessageModal] = useState(false);
const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Loaders ────────────────────────────────────────────────────────────────
    const loadNotifications = async () => {
        try {
            const res = await getAuth('/api/notifications');
            setAllNotifications(res.notifications || []);
            const unread = res.notifications?.filter((n: Notification) => !n.read_at).length || 0;
            setUnreadCount(unread);
        } catch (err) {
            console.error(err);
        }
    };

    const loadContactMessages = async () => {
        try {
            const res = await getAuth('/api/admin/contact-messages');
            setContactMessages(res);
        } catch {
            /* silent */
        }
    };

    useEffect(() => {
        loadNotifications();
        loadContactMessages();
    }, []);

    // ── Derived ────────────────────────────────────────────────────────────────
    const filteredNotifications = () => {
        let items: any[] = [];

        if (notificationFilter === 'all' || notificationFilter === 'contact') {
            items = [...items, ...(contactMessages?.data || [])];
        }

        if (notificationFilter === 'all' || notificationFilter === 'join_request') {
            items = [...items, ...allNotifications];
        }

        return items;
    };

    // ── Handlers ───────────────────────────────────────────────────────────────
    const viewNotificationDetails = async (notif: Notification) => {
        setMessageDetailsLoading(true);
        try {
            if (!notif.read_at) {
                await postAuth(`/api/notifications/${notif.id}/read`);
            }
            setSelectedMessageDetails(notif);
            loadNotifications();
        } catch {
            toast.error('Failed to load notification details');
        } finally {
            setMessageDetailsLoading(false);
        }
    };

    const viewMessageDetails = async (msgId: number) => {
        setMessageDetailsLoading(true);
        try {
            const res = await getAuth(`/api/admin/contact-messages/${msgId}`);
            setSelectedMessageDetails(res);
            loadContactMessages();
        } catch {
            toast.error('Failed to load message');
        } finally {
            setMessageDetailsLoading(false);
        }
    };

    const toggleMessageRead = async (msgId: number) => {
        try {
            await postAuth(`/api/admin/contact-messages/${msgId}/read`);
            toast.success('Updated.');
            if (selectedMessageDetails?.id === msgId) {
                setSelectedMessageDetails((p: any) => p ? { ...p, is_read: !p.is_read } : null);
            }
            loadContactMessages();
        } catch {
            toast.error('Action failed');
        }
    };

    // const deleteMessage = async (msgId: number) => {
    //     if (!window.confirm('Delete message permanently?')) return;
    //     try {
    //         await deleteAuth(`/api/admin/contact-messages/${msgId}`);
    //         toast.success('Deleted.');
    //         setSelectedMessageDetails(null);
    //         loadContactMessages();
    //     } catch {
    //         toast.error('Delete failed');
    //     }
    // };

    const deleteMessage = (msgId: number) => {
    setSelectedMessageId(msgId);
    setDeleteMessageModal(true);
};

const confirmDeleteMessage = async () => {
    if (!selectedMessageId) return;

    try {
        setDeleteLoading(true);

        await deleteAuth(
            `/api/admin/contact-messages/${selectedMessageId}`
        );

        toast.success('Message deleted successfully');

        setSelectedMessageDetails(null);
        setDeleteMessageModal(false);
        setSelectedMessageId(null);

        loadContactMessages();
    } catch (err: any) {
        toast.error(
            err?.response?.data?.message || 'Delete failed'
        );
    } finally {
        setDeleteLoading(false);
    }
};

    const handleJoinRequestAction = async (
        groupId: number,
        requesterId: number,
        action: 'accept' | 'reject'
    ) => {
        try {
            await postAuth(`/api/groups/${groupId}/requests/${requesterId}`, { action });
            toast.success(`Request ${action}ed successfully!`);
            setSelectedMessageDetails(null);
            loadNotifications();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-slate-900">Notifications & Messages</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {allNotifications.length + (contactMessages?.data?.length || 0)} total • {unreadCount} unread
                    </p>
                </div>

                <div className="flex gap-2">
                    {(['all', 'contact', 'join_request'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setNotificationFilter(type)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                                notificationFilter === type
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {type === 'all' && 'All'}
                            {type === 'contact' && 'Contact Messages'}
                            {type === 'join_request' && 'Join Requests'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">

                {/* ── Left Pane – List ── */}
                <div className="md:col-span-1 border-r border-slate-100 p-4 overflow-y-auto max-h-[600px]">
                    {filteredNotifications().length > 0 ? (
                        <div className="space-y-2">
                            {filteredNotifications().map((item: any) => {
                                const isJoinRequest =
                                    item.type === 'App\\Notifications\\JoinRequestNotification' ||
                                    item.data?.type === 'join_request';
                                const isContact = !isJoinRequest;
                                const isSelected = selectedMessageDetails?.id === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() =>
                                            isJoinRequest
                                                ? viewNotificationDetails(item)
                                                : viewMessageDetails(item.id)
                                        }
                                        className={`p-3 flex items-center gap-3 cursor-pointer rounded-xl transition-all border ${
                                            isSelected
                                                ? 'bg-violet-50 border-violet-200'
                                                : 'border-transparent hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    isJoinRequest
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : isSelected
                                                        ? 'bg-violet-200 text-violet-700'
                                                        : 'bg-pink-100 text-pink-600'
                                                }`}
                                            >
                                                {isJoinRequest ? '👥' : item.name?.[0] || 'C'}
                                            </div>
                                            {((isJoinRequest && !item.read_at) ||
                                                (isContact && !item.is_read)) && (
                                                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 border border-white" />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 truncate">
                                                {isJoinRequest
                                                    ? `${item.data?.requester_name} wants to join`
                                                    : item.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                {isJoinRequest
                                                    ? item.data?.group_name
                                                    : item.message}
                                            </p>
                                        </div>

                                        {/* Date */}
                                        <span className="text-[9px] text-slate-400 whitespace-nowrap self-start mt-0.5">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <Bell size={28} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications found</p>
                        </div>
                    )}
                </div>

                {/* ── Right Pane – Detail ── */}
                <div className="md:col-span-2 p-6 bg-slate-50/50 flex flex-col">
                    {messageDetailsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                    ) : selectedMessageDetails ? (
                        <div className="space-y-5 flex-1 flex flex-col justify-between">
                            {/* Detail body */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-200/60 pb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">
                                            {selectedMessageDetails.data?.type === 'join_request'
                                                ? `${selectedMessageDetails.data.requester_name} - Join Request`
                                                : selectedMessageDetails.name}
                                        </h3>
                                        <p className="text-sm text-violet-600 font-medium mt-0.5">
                                            {selectedMessageDetails.data?.type === 'join_request'
                                                ? selectedMessageDetails.data.group_name
                                                : selectedMessageDetails.email}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Sent:{' '}
                                            {new Date(
                                                selectedMessageDetails.created_at ||
                                                    selectedMessageDetails.data?.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <span
                                        className={`self-start px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                            selectedMessageDetails.read_at || selectedMessageDetails.is_read
                                                ? 'bg-slate-200 text-slate-700'
                                                : 'bg-pink-100 text-pink-700'
                                        }`}
                                    >
                                        {selectedMessageDetails.read_at || selectedMessageDetails.is_read
                                            ? 'Read'
                                            : 'New'}
                                    </span>
                                </div>

                                {/* Message body */}
                                <div className="p-5 rounded-2xl bg-white border border-slate-150 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm min-h-[150px]">
                                    {selectedMessageDetails.data?.type === 'join_request'
                                        ? `${selectedMessageDetails.data.requester_name} has requested to join the group "${selectedMessageDetails.data.group_name}".`
                                        : selectedMessageDetails.message}
                                </div>
                            </div>

                            {/* Join Request Actions */}
                            {selectedMessageDetails.data?.type === 'join_request' && (
                                <div className="flex gap-3 pt-6 border-t border-slate-200">
                                    <Button
                                        onClick={() =>
                                            handleJoinRequestAction(
                                                selectedMessageDetails.data.group_id,
                                                selectedMessageDetails.data.requester_id,
                                                'accept'
                                            )
                                        }
                                        className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                                    >
                                        ✅ Accept Request
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() =>
                                            handleJoinRequestAction(
                                                selectedMessageDetails.data.group_id,
                                                selectedMessageDetails.data.requester_id,
                                                'reject'
                                            )
                                        }
                                        className="flex-1"
                                    >
                                        ❌ Reject Request
                                    </Button>
                                </div>
                            )}

                            {/* Contact Message Actions */}
                            {selectedMessageDetails.data?.type !== 'join_request' && (
                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/60">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => toggleMessageRead(selectedMessageDetails.id)}
                                        className="h-9 px-4 text-xs font-medium"
                                    >
                                        Mark as {selectedMessageDetails.is_read ? 'Unread' : 'Read'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMessage(selectedMessageDetails.id)}
                                        className="h-9 px-4 text-xs font-medium"
                                    >
                                        Delete Permanently
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
                            <MessageSquare size={36} className="mb-2 opacity-25" />
                            <p className="text-sm">Select a notification or message to view details</p>
                        </div>
                    )}
                </div>
            </div>













        </div>







<Dialog
    open={deleteMessageModal}
    onOpenChange={setDeleteMessageModal}
>
    <DialogContent  className="
        fixed
        left-[50%]
        top-[50%]
        z-50
        w-full
        max-w-md
        translate-x-[-50%]
        translate-y-[-50%]
        bg-white
        border
        border-slate-200
        shadow-2xl
        rounded-2xl
        p-6
    ">
        <div className="flex flex-col items-center text-center py-2">

            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
                Delete Message
            </h3>

            <p className="mt-2 text-sm text-slate-500">
                This action cannot be undone.
                The contact message will be permanently deleted.
            </p>

            <div className="flex gap-3 w-full mt-6">
                <Button
                    variant="outline"
                    className="flex-1"
                    disabled={deleteLoading}
                    onClick={() => {
                        setDeleteMessageModal(false);
                        setSelectedMessageId(null);
                    }}
                >
                    Cancel
                </Button>

                <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={deleteLoading}
                    onClick={confirmDeleteMessage}
                >
                    {deleteLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        'Delete'
                    )}
                </Button>
            </div>

        </div>
    </DialogContent>
</Dialog>

</>


    );
}