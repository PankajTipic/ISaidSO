// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { Progress } from '@/app/components/ui/progress';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { currentUser } from '@/app/data/mockData';
// import { Trophy, Target, TrendingUp, Award, Settings, LogOut } from 'lucide-react';
// import { Button } from '@/app/components/ui/button';
// import { motion } from 'motion/react';
// import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
// import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
// import { useNavigate } from 'react-router';
// import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
// import { AvatarSelector } from '@/app/components/AvatarSelector';
// import { useState } from 'react';
// import axios from 'axios';
// import { Edit } from 'lucide-react';



// export function ProfileScreen() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const user = useAppSelector((state) => state.auth.user);

//   // Fallback to mock if needed, or better show loading/real data. 
//   // For now using user from state.
//   // Note: currentUser.accuracy etc might not be in user object yet?
//   // The user object in Redux is `User`. `accuracy` is not there based on `authSlice` definition.
//   // We will mix them for now to avoid breaking stats.

//   const accuracyColor = '#10b981'; // Default for now

//   const [editOpen, setEditOpen] = useState(false);
//   const [selectedAvatar, setSelectedAvatar] = useState<string>('');
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     navigate('/auth');
//   };

//   const handleAvatarSelect = (avatar: string | File) => {
//     if (typeof avatar === 'string') {
//       setSelectedAvatar(avatar);
//       setAvatarFile(null);
//       setAvatarPreview(null);
//     } else {
//       setAvatarFile(avatar);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result as string);
//       };
//       reader.readAsDataURL(avatar);
//     }
//   };

//   const handleSaveAvatar = async () => {
//     try {
//       setIsSaving(true);
//       const formData = new FormData();
//       // We only send avatar here
//       if (avatarFile) {
//         formData.append('avatar', avatarFile);
//       } else if (selectedAvatar) {
//         // If it's a string (default avatar), we send it
//         // Backend expects 'avatar' to be string or file
//         formData.append('avatar', selectedAvatar);
//       }

//       // We also need username as it's required by validation usually? 
//       // Let's check AuthController validation: 
//       // 'username' => 'required|string|unique:users,username,id|max:20'
//       // 'name', 'country', 'avatar' are nullable/optional.
//       // But if we send partial update, validation might fail if 'username' is missing?
//       // AuthController: $request->validate(['username' => 'required...'])
//       // So we MUST send username.
//       formData.append('username', user?.username || '');

//       const token = localStorage.getItem('access_token');
//       await axios.post('http://127.0.0.1:8000/api/profile/update', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       await dispatch(checkAuthStatus());
//       setEditOpen(false);
//     } catch (error) {
//       console.error('Failed to update avatar:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };


//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-4 py-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-6"
//         >
//           {/* Profile Card */}
//           <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
//             {/* Background Glow */}
//             <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] rounded-full blur-[128px] opacity-20" />

//             <div className="relative z-10">
//               <div className="flex items-start gap-4 mb-6">
//                 <Dialog open={editOpen} onOpenChange={setEditOpen}>
//                   <DialogTrigger asChild>
//                     <div className="relative group cursor-pointer">
//                       <Avatar className="w-24 h-24 ring-4 ring-[#a855f7]/50 transition-transform group-hover:scale-105">
//                         <AvatarImage src={user?.avatar_url || user?.avatar} alt={user?.username} />
//                         <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
//                       </Avatar>
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Edit className="text-white w-6 h-6" />
//                       </div>
//                     </div>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-md glass-card border-none text-foreground">
//                     <DialogHeader>
//                       <DialogTitle>Edit Avatar</DialogTitle>
//                     </DialogHeader>
//                     <div className="py-4">
//                       <AvatarSelector
//                         currentAvatar={selectedAvatar || user?.avatar || ''}
//                         preview={avatarPreview}
//                         onSelect={handleAvatarSelect}
//                       />
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
//                       <Button
//                         onClick={handleSaveAvatar}
//                         disabled={isSaving}
//                         style={{
//                           background: !isSaving
//                             ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
//                             : undefined,
//                         }}
//                       >
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 <div className="flex-1">
//                   <h2 className="text-2xl font-bold mb-2">{user?.name || user?.username}</h2>
//                   <LevelBadge level={currentUser.level} size="lg" />

//                   <div className="flex items-center gap-4 mt-4 text-sm">
//                     <div>
//                       <span className="text-muted-foreground">{user?.country || 'Location not set'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="glass-card p-4 rounded-xl">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Target size={16} className="text-[#a855f7]" />
//                     <p className="text-xs text-muted-foreground">Accuracy</p>
//                   </div>
//                   <p className="text-2xl font-bold" style={{ color: accuracyColor }}>
//                     {currentUser.accuracy.toFixed(1)}%
//                   </p>
//                 </div>

//                 <div className="glass-card p-4 rounded-xl">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Trophy size={16} className="text-[#fbbf24]" />
//                     <p className="text-xs text-muted-foreground">Rank Score</p>
//                   </div>
//                   <p className="text-2xl font-bold text-[#fbbf24]">{currentUser.rankScore}</p>
//                 </div>

//                 <div className="glass-card p-4 rounded-xl">
//                   <div className="flex items-center gap-2 mb-2">
//                     <TrendingUp size={16} className="text-[#10b981]" />
//                     <p className="text-xs text-muted-foreground">Created</p>
//                   </div>
//                   <p className="text-2xl font-bold">{currentUser.predictionsCreated}</p>
//                 </div>

//                 <div className="glass-card p-4 rounded-xl">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Award size={16} className="text-[#ec4899]" />
//                     <p className="text-xs text-muted-foreground">Resolved</p>
//                   </div>
//                   <p className="text-2xl font-bold">{currentUser.predictionsResolved}</p>
//                 </div>
//               </div>

//               {/* Logout Button */}
//               <Button
//                 onClick={handleLogout}
//                 variant="outline"
//                 className="mt-4 w-full md:w-auto glass-card hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
//               >
//                 <LogOut size={16} className="mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </div>

//           {/* Badges */}
//           <div className="glass-card rounded-2xl p-6">
//             <h3 className="font-bold mb-4 flex items-center gap-2">
//               <Award size={20} className="text-[#fbbf24]" />
//               Badges Earned
//             </h3>

//             {currentUser.badges.length > 0 ? (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {currentUser.badges.map((badge) => (
//                   <div key={badge.id} className="glass-card p-4 rounded-xl text-center">
//                     <div className="text-4xl mb-2">{badge.icon}</div>
//                     <p className="font-medium text-sm mb-1">{badge.name}</p>
//                     <p className="text-xs text-muted-foreground">{badge.description}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">No badges earned yet</p>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Keep making accurate predictions to earn badges!
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Prediction History */}
//           <div className="glass-card rounded-2xl p-6">
//             <h3 className="font-bold mb-4">Prediction History</h3>

//             <Tabs defaultValue="all">
//               <TabsList className="glass-card w-full justify-start mb-4">
//                 <TabsTrigger value="all">All</TabsTrigger>
//                 <TabsTrigger value="active">Active</TabsTrigger>
//                 <TabsTrigger value="resolved">Resolved</TabsTrigger>
//               </TabsList>

//               <TabsContent value="all" className="space-y-3">
//                 <div className="text-center py-8">
//                   <p className="text-muted-foreground">Your prediction history will appear here</p>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>

//           {/* Level Progress */}
//           <div className="glass-card rounded-2xl p-6">
//             <h3 className="font-bold mb-4">Level Progress</h3>

//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Predictions Resolved</span>
//                   <span className="text-sm font-medium">{currentUser.predictionsResolved} / 50</span>
//                 </div>
//                 <Progress value={(currentUser.predictionsResolved / 50) * 100} className="h-2" />
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Accuracy</span>
//                   <span className="text-sm font-medium">{currentUser.accuracy.toFixed(1)}%</span>
//                 </div>
//                 <Progress value={currentUser.accuracy} className="h-2" />
//               </div>

//               <div className="glass-card p-4 rounded-xl mt-4">
//                 <p className="text-sm text-center text-muted-foreground">
//                   Reach <span className="font-bold text-[#fbbf24]">50 predictions</span> with{' '}
//                   <span className="font-bold text-[#fbbf24]">70%+ accuracy</span> to become Elite!
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }













import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Trophy, Target, TrendingUp, Award, LogOut, Edit2, Loader2, MapPin, User, AtSign, Trash2, Calendar, Globe, Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { AvatarSelector } from '@/app/components/AvatarSelector';
import { useState, useEffect } from 'react';
import { getAuth, postFormDataAuth, deleteAuth, putAuth } from '@/util/api';
import { toast } from 'sonner';

interface Group {
  id: number;
  name: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ProfileData {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string | null;
  country: string | null;
  city: string | null;
  questions: any[];
  answers: any[];
  points: { points: number }[];
  groups: Group[];
}

interface ApiResponse {
  status: boolean;
  user: ProfileData;
  badges: Badge[];
  summary: {
    total_questions: number;
    total_answers: number;
    total_points: number;
    groups_joined: number;
  };
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.auth.user);

  const [profile, setProfile] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Question Edit state
  const [questionEditOpen, setQuestionEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionVisibility, setEditQuestionVisibility] = useState('public');
  const [editQuestionEndDate, setEditQuestionEndDate] = useState('');
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getAuth('/api/profile');
      setProfile(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const user = profile?.user;
  const summary = profile?.summary;

  // Pre-fill edit form when opening
  const openEditModal = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditCountry(user.country || '');
    setEditCity(user.city || '');
    setSelectedAvatar(user.avatar_url || user.avatar || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditOpen(true);
  };

  const handleAvatarSelect = (avatar: string | File) => {
    if (typeof avatar === 'string') {
      setSelectedAvatar(avatar);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      setAvatarFile(avatar);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatar);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('username', editUsername.trim() || user.username);
      formData.append('name', editName.trim());
      formData.append('country', editCountry.trim());
      formData.append('city', editCity.trim());

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (selectedAvatar && selectedAvatar !== (user.avatar_url || user.avatar)) {
        formData.append('avatar', selectedAvatar);
      }

      await postFormDataAuth('/api/profile/update', formData);
      await dispatch(checkAuthStatus());
      await fetchProfile();
      setEditOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDeleteQuestion = async (id: number) => {
  //   if (!confirm('Are you sure you want to delete this question?')) return;
  //   try {
  //     await deleteAuth(`/api/questions/${id}`);
  //     toast.success('Question deleted successfully');
  //     fetchProfile();
  //   } catch (err: any) {
  //     toast.error(err?.message || 'Failed to delete question');
  //   }
  // };

  // ... rest of your imports and component code remains the same ...

const handleDeleteQuestion = (id: number) => {
  toast.custom(
    (t) => (
      <div className="glass-card p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-red-500/30 bg-gradient-to-br from-black/90 to-red-950/30">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 size={28} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Delete Question?</h3>
          <p className="text-sm text-gray-300">
            This action cannot be undone. The question and all associated answers will be permanently deleted.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 hover:bg-gray-800"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteAuth(`/api/questions/${id}`);
                  toast.success('Question deleted successfully', {
                    description: 'The question has been removed.',
                  });
                  fetchProfile(); // refresh the list
                } catch (err: any) {
                  toast.error('Failed to delete question', {
                    description: err?.message || 'Something went wrong.',
                  });
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center',
      unstyled: true, // allows full custom styling
    }
  );
};



  const openQuestionEdit = (q: any) => {
    setEditingQuestion(q);
    setEditQuestionText(q.questions || '');
    setEditQuestionVisibility(q.visibility || 'public');
    setEditQuestionEndDate(q.end_date ? q.end_date.split('T')[0] : '');
    setQuestionEditOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      setIsUpdatingQuestion(true);
      await putAuth(`/api/questions/${editingQuestion.id}`, {
        questions: editQuestionText,
        visibility: editQuestionVisibility,
        end_date: editQuestionEndDate || null,
      });
      toast.success('Question updated successfully!');
      fetchProfile();
      setQuestionEditOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update question');
    } finally {
      setIsUpdatingQuestion(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#a855f7] animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error || 'Profile not found'}</p>
      </div>
    );
  }

  // Calculate accuracy
  let correctAnswers = 0;
  let totalResolvedAnswers = 0;
  user.answers?.forEach((ans: any) => {
    if (ans.question && ans.question.correct_answer) {
      totalResolvedAnswers++;
      if (ans.answer === ans.question.correct_answer) correctAnswers++;
    }
  });
  const accuracy = totalResolvedAnswers > 0
    ? (correctAnswers / totalResolvedAnswers) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] rounded-full blur-[128px] opacity-20" />

            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="w-24 h-24 ring-4 ring-[#a855f7]/50">
                    <AvatarImage
                      src={user.avatar_url || user.avatar || undefined}
                      alt={user.username}
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#a855f7] to-[#ec4899]">
                      {user.name?.[0] || user.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold truncate">{user.name || user.username}</h2>
                    <button
                      onClick={openEditModal}
                      className="p-1.5 rounded-lg glass-card hover:bg-white/10 transition-colors text-[#a855f7] hover:text-[#ec4899] shrink-0"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">@{user.username}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                    {(user.country || user.city) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#a855f7]" />
                        {[user.city, user.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="text-xs">{user.email}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-[#a855f7]" />
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    {accuracy.toFixed(1)}%
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={16} className="text-[#fbbf24]" />
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <p className="text-2xl font-bold text-[#fbbf24]">
                    {summary?.total_points || 0}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-[#10b981]" />
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <p className="text-2xl font-bold">{summary?.total_questions || 0}</p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-[#ec4899]" />
                    <p className="text-xs text-muted-foreground">Answers</p>
                  </div>
                  <p className="text-2xl font-bold">{summary?.total_answers || 0}</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="mt-4 w-full md:w-auto glass-card hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-[#a855f7]" />
                Level Progress
              </h3>
              <span className="text-sm font-medium text-[#a855f7]">
                {accuracy.toFixed(1)}% Accuracy
              </span>
            </div>
            <Progress value={accuracy} className="h-2 bg-white/5" indicatorClassName="bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
            <p className="text-xs text-muted-foreground mt-3">
              Your overall prediction accuracy across all categories. Higher accuracy builds your reputation!
            </p>
          </div>

          {/* Badges */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Award size={20} className="text-[#fbbf24]" />
              Badges Earned
            </h3>
            {profile?.badges && profile.badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors group">
                    <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
                      {badge.icon}
                    </div>
                    <p className="font-bold text-sm mb-1">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No badges earned yet</p>
                <p className="text-sm text-muted-foreground mt-1">Keep answering correctly to earn badges!</p>
              </div>
            )}
          </div>

          {/* Activity History */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Activity History</h3>
            <Tabs defaultValue="questions">
              <TabsList className="glass-card w-full justify-start mb-4">
                <TabsTrigger value="questions">My Questions</TabsTrigger>
                <TabsTrigger value="answers">My Answers</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                {user.questions?.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {user.questions.map((q: any) => (
                      <div key={q.id} className="glass-card p-4 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7] rounded-full blur-[64px] opacity-10" />
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-2">{q.questions}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                              <span className="px-2 py-1 bg-white/5 rounded-md flex items-center gap-1">
                                {q.visibility === 'private' ? <Lock size={12} /> : <Globe size={12} />}
                                {q.visibility === 'private' ? 'Private' : 'Public'}
                              </span>
                              <span>{q.answers?.length || 0} Answers</span>
                              {q.end_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  Ends: {new Date(q.end_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => openQuestionEdit(q)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuestion(q.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't created any predictions yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="answers" className="space-y-4">
                {user.answers?.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {user.answers.map((a: any) => (
                      <div key={a.id} className="glass-card p-4 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className="relative z-10 space-y-3">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">{a.question?.questions || 'Unknown Question'}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                              <span className="text-xs text-muted-foreground">Your Answer:</span>
                              <span className="text-sm font-bold text-[#a855f7]">{a.answer}</span>
                            </div>
                            {a.question?.correct_answer && (
                              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                <span className="text-xs text-muted-foreground">Correct:</span>
                                <span className={`text-sm font-bold ${a.answer === a.question.correct_answer ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                  {a.question.correct_answer}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't answered any predictions yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setEditOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Avatar Selector */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Profile Photo</Label>
                <AvatarSelector
                  currentAvatar={avatarPreview || selectedAvatar}
                  preview={avatarPreview}
                  onSelect={handleAvatarSelect}
                />
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-sm font-medium flex items-center gap-1.5">
                    <User size={13} className="text-[#a855f7]" /> Full Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11 glass-card border-white/10 focus:border-[#a855f7]/50"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-username" className="text-sm font-medium flex items-center gap-1.5">
                    <AtSign size={13} className="text-[#a855f7]" /> Username
                  </Label>
                  <Input
                    id="edit-username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="your_username"
                    className="h-11 glass-card border-white/10 focus:border-[#a855f7]/50"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">{editUsername.length}/20 characters</p>
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-country" className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#a855f7]" /> Country
                    </Label>
                    <Input
                      id="edit-country"
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="India"
                      className="h-11 glass-card border-white/10 focus:border-[#a855f7]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-city" className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#ec4899]" /> City
                    </Label>
                    <Input
                      id="edit-city"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="Mumbai"
                      className="h-11 glass-card border-white/10 focus:border-[#a855f7]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 glass-card border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {questionEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setQuestionEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                  Edit Question
                </h2>
                <button
                  onClick={() => setQuestionEditOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qText">Question Text</Label>
                  <Input
                    id="qText"
                    value={editQuestionText}
                    onChange={(e) => setEditQuestionText(e.target.value)}
                    className="glass-card"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qVisibility">Visibility</Label>
                    <select
                      id="qVisibility"
                      value={editQuestionVisibility}
                      onChange={(e) => setEditQuestionVisibility(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qEndDate">End Date</Label>
                    <Input
                      id="qEndDate"
                      type="date"
                      value={editQuestionEndDate}
                      onChange={(e) => setEditQuestionEndDate(e.target.value)}
                      className="glass-card"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    onClick={() => setQuestionEditOpen(false)}
                    variant="outline"
                    className="flex-1 glass-card"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateQuestion}
                    className="flex-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:from-[#9333ea] hover:to-[#db2777] border-none"
                    disabled={isUpdatingQuestion || !editQuestionText.trim()}
                  >
                    {isUpdatingQuestion ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}