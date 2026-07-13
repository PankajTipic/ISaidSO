import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, BarChart2, Megaphone, CheckCircle2 } from 'lucide-react';
import type { CookiePreferences } from './CookieConsentBanner';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (prefs: CookiePreferences) => void;
    onAcceptAll: () => void;
}

export default function CookiePreferencesModal({ open, onClose, onSave, onAcceptAll }: Props) {
    const [analytics, setAnalytics]   = useState(false);
    const [marketing, setMarketing]   = useState(false);

    const handleSave = () => {
        onSave({ essential: true, analytics, marketing });
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 60, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 60, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #100a20 0%, #1a0d30 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-base font-black text-white">Cookie Preferences</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Manage your privacy settings</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Cookie Types */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Essential */}
                            <CookieItem
                                icon={<Shield className="w-4 h-4 text-emerald-400" />}
                                iconBg="bg-emerald-500/15 border-emerald-500/20"
                                title="Essential Cookies"
                                description="Required for the website to function. Cannot be disabled."
                                enabled={true}
                                locked={true}
                                onChange={() => {}}
                            />
                            {/* Analytics */}
                            <CookieItem
                                icon={<BarChart2 className="w-4 h-4 text-blue-400" />}
                                iconBg="bg-blue-500/15 border-blue-500/20"
                                title="Analytics Cookies"
                                description="Help us understand how visitors use our platform to improve the experience."
                                enabled={analytics}
                                locked={false}
                                onChange={setAnalytics}
                            />
                            {/* Marketing */}
                            <CookieItem
                                icon={<Megaphone className="w-4 h-4 text-pink-400" />}
                                iconBg="bg-pink-500/15 border-pink-500/20"
                                title="Marketing Cookies"
                                description="Used to deliver relevant ads and track campaign effectiveness."
                                enabled={marketing}
                                locked={false}
                                onChange={setMarketing}
                            />
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex flex-col gap-2">
                            <button
                                onClick={onAcceptAll}
                                className="w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition-opacity"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                            >
                                Accept All Cookies
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full py-3 rounded-xl text-sm font-bold text-gray-200 border border-white/15 hover:bg-white/10 transition-colors"
                            >
                                Save My Preferences
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function CookieItem({
    icon, iconBg, title, description, enabled, locked, onChange,
}: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    enabled: boolean;
    locked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/3">
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${iconBg}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">{title}</p>
                    {locked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Always On
                        </span>
                    ) : (
                        <button
                            onClick={() => onChange(!enabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-white/15'}`}
                        >
                            <motion.span
                                layout
                                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                                animate={{ left: enabled ? '1.375rem' : '0.25rem' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
