import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { getAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/store/hooks';
import { logoutUser } from '@/app/modules/auth/authSlice';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PrivacyDataModal({ open, onClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleDownloadData = async () => {
    try {
      toast.info('Preparing your data for download...', { id: 'gdpr-export' });
      const res = await getAuth('/api/gdpr/export');
      
      // Create and trigger download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "isaidso_my_data.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast.success('Your data has been downloaded successfully!', { id: 'gdpr-export' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export data.', { id: 'gdpr-export' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!password) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    try {
      setIsDeleting(true);
      await postAuth('/api/gdpr/delete-account', { password });
      
      toast.success('Your account has been scheduled for deletion.');
      onClose();
      
      // Logout and redirect
      await dispatch(logoutUser());
      navigate('/auth');
    } catch (err: any) {
      if (err?.data?.errors?.password) {
        setDeleteError(err.data.errors.password[0]);
      } else {
        setDeleteError(err?.message || 'Incorrect password or failed to delete account.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="bg-[#f8f8f6] rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl border-none my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <Shield size={28} className="text-[#a855f7]" /> Privacy & Data
              </h2>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Data Export Section */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Download size={16} className="text-blue-500" />
                    Download Your Data
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Get a copy of your personal data, predictions, votes, and account history in JSON format.
                  </p>
                </div>
                <Button 
                  onClick={handleDownloadData}
                  className="shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl text-xs h-10 px-4"
                >
                  Download Data
                </Button>
              </div>

              {/* Account Deletion Section */}
              <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-sm">
                {!showDeleteConfirm ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-rose-700 mb-1 flex items-center gap-2">
                        <Trash2 size={16} />
                        Delete Account
                      </h3>
                      <p className="text-xs text-rose-600/80 leading-relaxed">
                        Permanently delete your account and all associated data. This action cannot be undone after the 30-day grace period.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="shrink-0 bg-rose-100 text-rose-600 hover:bg-rose-200 font-bold rounded-xl text-xs h-10 px-4"
                    >
                      Delete Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-rose-700 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} /> Confirm Deletion
                      </h3>
                      <p className="text-xs text-rose-600/80 leading-relaxed mb-4">
                        Please enter your password to confirm. Your account will be scheduled for permanent deletion.
                      </p>
                      
                      <Label className="text-xs font-bold text-rose-700 mb-1.5 block">Password</Label>
                      <Input 
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white border-rose-200 focus-visible:ring-rose-500"
                      />
                      
                      {deleteError && (
                        <p className="text-xs text-red-500 mt-2 font-medium">{deleteError}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => { setShowDeleteConfirm(false); setPassword(''); setDeleteError(''); }}
                        className="flex-1 bg-white border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Delete'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
