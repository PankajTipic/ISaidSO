import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function TermsScreen() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100"
            >
                <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Terms & Conditions</h1>
                </div>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                    <p className="font-semibold text-gray-500">Effective Date: [DD/MM/YYYY]</p>

                    <p>
                        Welcome to I Said So ("the Platform"). By creating an account or using the Platform, you agree to these Terms & Conditions.
                    </p>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">1. Eligibility</h2>
                        <p>You must be at least 18 years old or the legal age required in your jurisdiction to use the Platform.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">2. User Account</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You are responsible for all activities performed through your account.</li>
                            <li>You must provide accurate and up-to-date information during registration.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">3. Acceptable Use</h2>
                        <p className="mb-2">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Submit false, unlawful, defamatory, abusive, hateful, or misleading content.</li>
                            <li>Impersonate another person or organization.</li>
                            <li>Attempt to gain unauthorized access to the Platform or its systems.</li>
                            <li>Interfere with the normal operation or security of the Platform.</li>
                            <li>Use the Platform for illegal or fraudulent activities.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">4. User Content</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You retain ownership of the content you submit.</li>
                            <li>By submitting content, you grant the Platform a non-exclusive, worldwide license to store, display, process, and distribute that content for operating the Platform.</li>
                            <li>You are solely responsible for the content you publish.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">5. Predictions and Validation</h2>
                        <p>Predictions, votes, comments, and validation outcomes represent user opinions and community participation. The Platform does not guarantee the accuracy, truthfulness, or completeness of any prediction or validation.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">6. Intellectual Property</h2>
                        <p>All software, branding, logos, designs, and platform content (excluding user-generated content) remain the intellectual property of the Platform or its licensors.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">7. Privacy</h2>
                        <p>Your personal information is processed in accordance with our Privacy Policy.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">8. Suspension and Termination</h2>
                        <p>We may suspend or terminate accounts that violate these Terms, misuse the Platform, or compromise the security or integrity of the service.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">9. Limitation of Liability</h2>
                        <p>The Platform is provided on an "as available" basis. To the extent permitted by applicable law, the Platform is not liable for indirect, incidental, consequential, or special damages arising from the use of the service.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">10. Changes to these Terms</h2>
                        <p>We may update these Terms from time to time. Continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">11. Governing Law</h2>
                        <p>These Terms shall be governed by the laws specified by the Platform owner or the contracting organization, subject to applicable legal requirements.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">12. Contact</h2>
                        <p>For questions regarding these Terms, please contact:</p>
                        <p className="font-medium text-purple-600 mt-1">Email: [privacy@company.com]</p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-opacity shadow-sm"
                    >
                        I Understand & Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
