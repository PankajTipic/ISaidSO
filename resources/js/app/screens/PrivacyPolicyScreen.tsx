// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { getAuth } from '@/util/api';
// import { Shield, Loader2, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';

// export function PrivacyPolicyScreen() {
//     const navigate = useNavigate();
//     const [policy, setPolicy] = useState<string>('');
//     const [loading, setLoading] = useState<boolean>(true);

//     useEffect(() => {
//         const fetchPolicy = async () => {
//             try {
//                 const res = await getAuth('/api/settings/privacy_policy');
//                 setPolicy(res.value || '<h1>Privacy Policy</h1><p>No privacy policy has been defined yet.</p>');
//             } catch (err) {
//                 console.error('Failed to load privacy policy:', err);
//                 setPolicy('<h1>Error</h1><p>Failed to load the privacy policy. Please try again later.</p>');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPolicy();
//     }, []);

//     return (
//         <div className="min-h-screen bg-background">
//             <TopNav />
//             <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#a855f7] mb-6 transition-colors"
//                 >
//                     <ArrowLeft size={16} />
//                     Back
//                 </button>

//                 <motion.div
//                     initial={{ opacity: 0, y: 15 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="glass-card border border-border/50 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative"
//                 >
//                     {/* Header Details */}
//                     <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
//                         <div className="p-3 rounded-2xl bg-[#a855f7]/10 text-[#a855f7]">
//                             <Shield size={32} />
//                         </div>
//                         <div>
//                             <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Privacy Policy</h1>
//                             <p className="text-sm text-muted-foreground mt-1">Last Updated: Dynamic Version</p>
//                         </div>
//                     </div>

//                     {/* Content Section */}
//                     {loading ? (
//                         <div className="flex flex-col items-center justify-center py-20 gap-4">
//                             <Loader2 className="h-10 w-10 animate-spin text-[#a855f7]" />
//                             <p className="text-muted-foreground text-sm">Loading Privacy Policy...</p>
//                         </div>
//                     ) : (
//                         <div 
//                             className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 space-y-4"
//                             dangerouslySetInnerHTML={{ __html: policy }}
//                         />
//                     )}
//                 </motion.div>
//             </div>
//             <MobileNav />
//         </div>
//     );
// }




import { motion } from 'framer-motion';
import {
  Shield,
  ArrowLeft,
  Mail,
  Globe,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Information We Collect',
      content: (
        <>
          <p>
            Depending on your use of the Platform, we may collect the
            following information:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Contact number (where applicable)</li>
            <li>Username</li>
            <li>Profile information</li>
            <li>Predictions, comments, votes and other content you choose to submit</li>
            <li>Device, browser and technical information necessary for operating and securing the Platform</li>
          </ul>
        </>
      ),
    },
    {
      title: 'How We Use Your Information',
      content: (
        <>
          <p>We may use your information to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Create and manage your account</li>
            <li>Authenticate users</li>
            <li>Operate, maintain and improve the Platform</li>
            <li>Display user-generated content and participation within the Platform</li>
            <li>Communicate with you regarding your account or the Platform</li>
            <li>Maintain security, prevent misuse and investigate suspected violations</li>
            <li>Comply with applicable legal or regulatory requirements</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Sharing of Information',
      content: (
        <>
          <p>We do not sell your personal information.</p>
          <p className="mt-3">
            Your information may be disclosed where necessary:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>To service providers supporting the operation of the Platform</li>
            <li>To our business partners or customers where required for providing the Platform</li>
            <li>To comply with applicable law, legal process or regulatory requirements</li>
            <li>To protect the rights, security or integrity of the Platform, its users or third parties</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Data Security',
      content: (
        <p>
          We implement reasonable technical and organizational measures
          designed to protect personal information from unauthorized access,
          disclosure, alteration or loss. No method of electronic storage or
          transmission can be guaranteed to be completely secure.
        </p>
      ),
    },
    {
      title: 'Data Retention',
      content: (
        <p>
          Personal information may be retained for as long as reasonably
          necessary for business, operational, contractual or legal purposes.
          Information may also be retained where required to establish,
          exercise or defend legal claims or to comply with applicable law.
        </p>
      ),
    },
    {
      title: 'Managing Your Information',
      content: (
        <>
          <p>
            Where functionality is available, you may review and update
            information associated with your account through the Platform.
          </p>
          <p className="mt-3">
            If you wish to request account deletion or have questions
            regarding your personal information, you may contact us using the
            details provided below. Requests will be considered in accordance
            with applicable law and our legitimate business and legal
            obligations.
          </p>
        </>
      ),
    },
    {
      title: 'Cookies and Similar Technologies',
      content: (
        <p>
          The Platform may use cookies or similar technologies necessary for
          security, authentication, performance and operation. Additional
          technologies may be used where permitted or required by applicable
          law.
        </p>
      ),
    },
    {
      title: 'Changes to this Privacy Policy',
      content: (
        <p>
          We may update this Privacy Policy from time to time. Continued use
          of the Platform after any changes become effective constitutes
          acceptance of the updated Privacy Policy.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-500 transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
                <Shield className="h-10 w-10 text-violet-500" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Privacy Policy
                </h1>

                <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
                  This Privacy Policy explains how I Said So ("the Platform",
                  "we", "our", or "us") collects, uses, stores, and protects
                  personal information when you use the Platform.
                </p>

                <div className="mt-4 inline-flex items-center rounded-full bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-500">
                  Effective Date • 01/08/2026
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Policy Sections */}
        <div className="mt-8 space-y-5">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 font-bold">
                    {index + 1}
                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold">
                    {section.title}
                  </h2>
                </div>

                <div className="text-muted-foreground leading-8">
                  {section.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 shadow-xl"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-violet-500" />
              <h2 className="text-2xl font-bold">
                Contact Information
              </h2>
            </div>

            <p className="text-muted-foreground mb-6">
              For privacy-related enquiries, please contact us.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-background/70 p-5 border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-violet-500" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-muted-foreground">
                      privacy@company.com
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-background/70 p-5 border">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-violet-500" />
                  <div>
                    <div className="font-semibold">Website</div>
                    <div className="text-muted-foreground">
                      isaidso.tipicqa.in
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}