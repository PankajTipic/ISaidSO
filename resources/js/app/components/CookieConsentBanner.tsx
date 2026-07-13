import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Shield } from 'lucide-react';
import CookiePreferencesModal from './CookiePreferencesModal';

export type CookiePreferences = {
    essential: true;       // Always on
    analytics: boolean;
    marketing: boolean;
};

const STORAGE_KEY = 'isaidso_cookie_consent';

export default function CookieConsentBanner() {
    const [visible, setVisible]   = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            // Small delay so banner doesn't flash on load
            const t = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    const saveConsent = (prefs: CookiePreferences) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
        setVisible(false);
        setShowPrefs(false);
    };

    const acceptAll = () => saveConsent({ essential: true, analytics: true, marketing: true });
    const rejectNonEssential = () => saveConsent({ essential: true, analytics: false, marketing: false });

    return (
        <>
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                        className="fixed bottom-4 left-4 right-4 z-[9999] max-w-2xl mx-auto"
                    >
                        <div
                            className="rounded-2xl border border-white/20 p-5 shadow-2xl backdrop-blur-xl"
                            style={{ background: 'linear-gradient(135deg, rgba(15,10,30,0.95) 0%, rgba(30,15,50,0.95) 100%)' }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed33, #ec489933)' }}>
                                    <Cookie className="w-5 h-5 text-purple-400" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-black text-white">We value your privacy</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">GDPR</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        We use cookies to enhance your experience and analyze site usage. Essential cookies are always active.{' '}
                                        <button
                                            onClick={() => setShowPrefs(true)}
                                            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors"
                                        >
                                            Learn more
                                        </button>
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <button
                                            onClick={acceptAll}
                                            className="px-4 py-1.5 rounded-lg text-xs font-black text-white transition-opacity hover:opacity-90"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                                        >
                                            Accept All
                                        </button>
                                        <button
                                            onClick={rejectNonEssential}
                                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-300 border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            Reject Non-Essential
                                        </button>
                                        <button
                                            onClick={() => setShowPrefs(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-colors"
                                        >
                                            <Settings size={11} /> Manage Preferences
                                        </button>
                                    </div>
                                </div>

                                {/* Close (reject essential only) */}
                                <button
                                    onClick={rejectNonEssential}
                                    className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preferences Modal */}
            <CookiePreferencesModal
                open={showPrefs}
                onClose={() => setShowPrefs(false)}
                onSave={saveConsent}
                onAcceptAll={acceptAll}
            />
        </>
    );
}
