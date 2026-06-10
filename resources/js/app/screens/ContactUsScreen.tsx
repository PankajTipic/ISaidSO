import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/app/store/hooks';
import { postPublic, postAuth } from '@/util/api';
import { Mail, User as UserIcon, MessageSquare, Send, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import { toast } from 'sonner';

export function ContactUsScreen() {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.auth.user);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Pre-fill user data if logged in
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setEmail(currentUser.email || '');
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error('All fields are required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = { name: name.trim(), email: email.trim(), message: message.trim() };
            if (currentUser) {
                await postAuth('/api/contact', payload);
            } else {
                await postPublic('/api/contact', payload);
            }
            toast.success('Your message has been sent successfully!');
            setSuccess(true);
            setMessage('');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopNav />
            <div className="max-w-xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#a855f7] mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                >
                    {/* Header Details */}
                    <div className="flex items-center gap-4 border-b border-border/50 pb-5 mb-6">
                        <div className="p-3 rounded-2xl bg-[#ec4899]/10 text-[#ec4899]">
                            <Mail size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground">Contact Us</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">We'd love to hear from you.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="flex flex-col items-center text-center py-10 gap-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Message Sent!</h2>
                                <p className="text-muted-foreground text-sm max-w-sm">
                                    Thank you for reaching out. An administrator has been notified and will review your message shortly.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-4 px-6 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <UserIcon size={14} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={submitting || !!currentUser}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:border-[#a855f7] disabled:opacity-75 transition-colors text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Mail size={14} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={submitting || !!currentUser}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:border-[#a855f7] disabled:opacity-75 transition-colors text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <MessageSquare size={14} /> Your Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={submitting}
                                        rows={5}
                                        placeholder="Type your message here..."
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:border-[#a855f7] transition-colors text-sm resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
                                    className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending message...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
            <MobileNav />
        </div>
    );
}
