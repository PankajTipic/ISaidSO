import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from '@/util/api';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';

export function PrivacyPolicyScreen() {
    const navigate = useNavigate();
    const [policy, setPolicy] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await getAuth('/api/settings/privacy_policy');
                setPolicy(res.value || '<h1>Privacy Policy</h1><p>No privacy policy has been defined yet.</p>');
            } catch (err) {
                console.error('Failed to load privacy policy:', err);
                setPolicy('<h1>Error</h1><p>Failed to load the privacy policy. Please try again later.</p>');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <TopNav />
            <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
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
                    className="glass-card border border-border/50 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative"
                >
                    {/* Header Details */}
                    <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
                        <div className="p-3 rounded-2xl bg-[#a855f7]/10 text-[#a855f7]">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Privacy Policy</h1>
                            <p className="text-sm text-muted-foreground mt-1">Last Updated: Dynamic Version</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-[#a855f7]" />
                            <p className="text-muted-foreground text-sm">Loading Privacy Policy...</p>
                        </div>
                    ) : (
                        <div 
                            className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 space-y-4"
                            dangerouslySetInnerHTML={{ __html: policy }}
                        />
                    )}
                </motion.div>
            </div>
            <MobileNav />
        </div>
    );
}
