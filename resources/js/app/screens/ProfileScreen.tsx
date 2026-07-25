// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { Progress } from '@/app/components/ui/progress';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { Trophy, Target, TrendingUp, Award, LogOut, Edit2, Loader2, MapPin, User, AtSign, Trash2, Calendar, Globe, Lock, Users, Clock, X } from 'lucide-react';
// import { Button } from '@/app/components/ui/button';
// import { Input } from '@/app/components/ui/input';
// import { Label } from '@/app/components/ui/label';
// import { motion, AnimatePresence } from 'motion/react';
// import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
// import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
// import { useNavigate } from 'react-router-dom';
// import { AvatarSelector } from '@/app/components/AvatarSelector';
// import { useState, useEffect } from 'react';
// import { getAuth, postFormDataAuth, deleteAuth, putAuth, patchAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface Group {
//   id: number;
//   name: string;
// }

// interface Badge {
//   id: string;
//   name: string;
//   icon: string;
//   description: string;
// }

// interface ProfileData {
//   id: number;
//   name: string;
//   username: string;
//   email: string;
//   avatar?: string;
//   avatar_url?: string | null;
//   country: string | null;
//   city: string | null;
//   questions: any[];
//   answers: any[];
//   points: { points: number }[];
//   groups: Group[];
// }

// interface ApiResponse {
//   status: boolean;
//   user: ProfileData;
//   badges: Badge[];
//   summary: {
//     total_questions: number;
//     total_answers: number;
//     total_points: number;
//     groups_joined: number;
//   };
// }

// export function ProfileScreen() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Edit modal state
//   const [editOpen, setEditOpen] = useState(false);
//   const [editName, setEditName] = useState('');
//   const [editUsername, setEditUsername] = useState('');
//   const [editCountry, setEditCountry] = useState('');
//   const [editCity, setEditCity] = useState('');
//   const [selectedAvatar, setSelectedAvatar] = useState<string>('');
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

//   // Question Edit state
//   const [questionEditOpen, setQuestionEditOpen] = useState(false);
//   const [editingQuestion, setEditingQuestion] = useState<any>(null);
//   const [editQuestionText, setEditQuestionText] = useState('');
//   const [editQuestionVisibility, setEditQuestionVisibility] = useState('public');
//   const [editQuestionEndDate, setEditQuestionEndDate] = useState('');
//   const [editQuestionVotingEndDate, setEditQuestionVotingEndDate] = useState('');
//   const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);
//   const [editQuestionFieldId, setEditQuestionFieldId] = useState<number | null>(null);
//   const [editQuestionDescription, setEditQuestionDescription] = useState('');
//   
//   // Privacy & Data Modal state
//   const [privacyOpen, setPrivacyOpen] = useState(false);
//
//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await getAuth('/api/profile');
//       setProfile(res);
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.message || 'Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const user = profile?.user;
//   const summary = profile?.summary;

//   const openEditModal = () => {
//     if (!user) return;
//     setEditName(user.name || '');
//     setEditUsername(user.username || '');
//     setEditCountry(user.country || '');
//     setEditCity(user.city || '');
//     setSelectedAvatar(user.avatar_url || user.avatar || '');
//     setAvatarFile(null);
//     setAvatarPreview(null);
//     setEditOpen(true);
//   };

//   const handleAvatarSelect = (avatar: string | File) => {
//     if (typeof avatar === 'string') {
//       setSelectedAvatar(avatar);
//       setAvatarFile(null);
//       setAvatarPreview(null);
//     } else {
//       setAvatarFile(avatar);
//       const reader = new FileReader();
//       reader.onloadend = () => setAvatarPreview(reader.result as string);
//       reader.readAsDataURL(avatar);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!user) return;
//     try {
//       setIsSaving(true);
//       const formData = new FormData();
//       formData.append('username', editUsername.trim() || user.username);
//       formData.append('name', editName.trim());
//       formData.append('country', editCountry.trim());
//       formData.append('city', editCity.trim());

//       if (avatarFile) {
//         formData.append('avatar', avatarFile);
//       } else if (selectedAvatar && selectedAvatar !== (user.avatar_url || user.avatar)) {
//         formData.append('avatar', selectedAvatar);
//       }

//       await postFormDataAuth('/api/profile/update', formData);
//       await dispatch(checkAuthStatus());
//       await fetchProfile();
//       setEditOpen(false);
//       toast.success('Profile updated successfully!');
//     } catch (err: any) {
//       toast.error(err?.message || 'Failed to update profile');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteQuestion = (id: number) => {
//     toast.custom(
//       (t) => (
//         <div className="glass-card p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-red-200 bg-white">
//           <div className="text-center space-y-4">
//             <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
//               <Trash2 size={28} className="text-red-500" />
//             </div>
//             <h3 className="text-lg font-bold text-foreground">Delete Question?</h3>
//             <p className="text-sm text-muted-foreground">
//               This action cannot be undone. The question and all associated answers will be permanently deleted.
//             </p>

//             <div className="flex gap-3 pt-2">
//               <Button
//                 variant="outline"
//                 className="flex-1 border-border hover:bg-muted"
//                 onClick={() => toast.dismiss(t)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 className="flex-1 bg-red-600 hover:bg-red-700"
//                 onClick={async () => {
//                   toast.dismiss(t);
//                   try {
//                     await deleteAuth(`/api/questions/${id}`);
//                     toast.success('Question deleted successfully');
//                     fetchProfile();
//                   } catch (err: any) {
//                     toast.error('Failed to delete question');
//                   }
//                 }}
//               >
//                 Delete
//               </Button>
//             </div>
//           </div>
//         </div>
//       ),
//       {
//         duration: Infinity,
//         position: 'top-center',
//         unstyled: true,
//       }
//     );
//   };

//   const openQuestionEdit = (q: any) => {
//     setEditingQuestion(q);
//     setEditQuestionText(q.questions || '');
//     setEditQuestionVisibility(q.visibility || 'public');
//     setEditQuestionEndDate(q.end_date ? q.end_date.split('T')[0] : '');
//     setQuestionEditOpen(true);
//   };

//   const handleUpdateQuestion = async () => {
//     if (!editingQuestion) return;
//     try {
//       setIsUpdatingQuestion(true);
//       await putAuth(`/api/questions/${editingQuestion.id}`, {
//         questions: editQuestionText,
//         visibility: editQuestionVisibility,
//         end_date: editQuestionEndDate || null,
//       });
//       toast.success('Question updated successfully!');
//       fetchProfile();
//       setQuestionEditOpen(false);
//     } catch (err: any) {
//       toast.error(err?.message || 'Failed to update question');
//     } finally {
//       setIsUpdatingQuestion(false);
//     }
//   };

//   const handleToggleVisibility = (q: any) => {
//     const isPublic = q.visibility === 'public';
//     const targetVisibility = isPublic ? 'private' : 'public';

//     toast.custom(
//       (t) => (
//         <div className="glass-card p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-primary/20 bg-white">
//           <div className="text-center space-y-4">
//             <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${isPublic ? 'bg-amber-50' : 'bg-blue-50'}`}>
//               {isPublic ? <Lock size={28} className="text-amber-500" /> : <Globe size={28} className="text-blue-500" />}
//             </div>
//             <h3 className="text-lg font-bold text-foreground">Switch to {targetVisibility}?</h3>
//             <p className="text-sm text-muted-foreground">
//               {isPublic 
//                 ? "This prediction will be hidden from the public feed and only visible to you and shared groups."
//                 : "This prediction will become visible to everyone on the public feed."}
//             </p>

//             <div className="flex gap-3 pt-2">
//               <Button
//                 variant="outline"
//                 className="flex-1 border-border hover:bg-muted"
//                 onClick={() => toast.dismiss(t)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 className={`flex-1 text-white ${isPublic ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}`}
//                 onClick={async () => {
//                   toast.dismiss(t);
//                   try {
//                     await patchAuth(`/api/predictions/${q.id}/toggle-visibility`);
//                     toast.success(`Prediction is now ${targetVisibility}`);
//                     fetchProfile();
//                   } catch (err: any) {
//                     toast.error('Failed to update visibility');
//                   }
//                 }}
//               >
//                 Switch
//               </Button>
//             </div>
//           </div>
//         </div>
//       ),
//       {
//         duration: Infinity,
//         position: 'top-center',
//         unstyled: true,
//       }
//     );
//   };

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     navigate('/auth');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//       </div>
//     );
//   }

//   if (error || !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-red-400">{error || 'Profile not found'}</p>
//       </div>
//     );
//   }

//   // Calculate accuracy and wins
//   let winningVotes = 0;
//   let totalResolvedAnswers = 0;
//   user.answers?.forEach((ans: any) => {
//     if (ans.question && ans.question.correct_answer && ans.question.correct_answer !== 'N/A') {
//       totalResolvedAnswers++;
//       if (ans.answer === ans.question.correct_answer) winningVotes++;
//     }
//   });
//   const accuracy = totalResolvedAnswers > 0
//     ? (winningVotes / totalResolvedAnswers) * 100
//     : 0;

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       <div className="max-w-5xl mx-auto px-4 py-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-6"
//         >
//           {/* Profile Card */}
//           <div className="rounded-3xl p-8 relative overflow-hidden border border-border/40 shadow-2xl bg-white dark:bg-black">
//             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-pink-500/5 to-transparent rounded-full blur-[120px] -mr-40 -mt-40" />
//             <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-500/5 via-primary/5 to-transparent rounded-full blur-[100px] -ml-20 -mb-20" />

//             <div className="relative z-10">
//               <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
//                 <div className="relative group">
//                   <Avatar className="w-28 h-28 ring-4 ring-primary/10 shadow-2xl">
//                     <AvatarImage
//                       src={user.avatar_url || user.avatar || undefined}
//                       alt={user.username}
//                     />
//                     <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-pink-500 text-white">
//                       {user.name?.[0] || user.username?.[0]}
//                     </AvatarFallback>
//                   </Avatar>
//                   <button
//                     onClick={openEditModal}
//                     className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border border-border hover:bg-muted transition-all scale-90 hover:scale-100"
//                   >
//                     <Edit2 size={16} className="text-primary" />
//                   </button>
//                 </div>

//                 <div className="flex-1 text-center md:text-left min-w-0">
//                   <h2 className="text-3xl font-black text-foreground mb-1 mt-2">{user.name || user.username}</h2>
//                   <p className="text-primary font-bold mb-4">@{user.username}</p>

//                   <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-2xl w-fit mx-auto md:mx-0">
//                     {(user.country || user.city) && (
//                       <span className="flex items-center gap-1.5 px-2">
//                         <MapPin size={14} className="text-primary" />
//                         {[user.city, user.country].filter(Boolean).join(', ')}
//                       </span>
//                     )}
//                     <span className="flex items-center gap-1.5 px-2">
//                       <AtSign size={14} className="text-primary" />
//                       {user.email}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
//                   <div className="flex items-center justify-center gap-2 mb-2">
//                     <Target size={16} className="text-primary" />
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
//                   </div>
//                   <p className="text-2xl font-black text-primary">
//                     {accuracy.toFixed(1)}%
//                   </p>
//                 </div>

//                 <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
//                   <div className="flex items-center justify-center gap-2 mb-2">
//                     <Trophy size={16} className="text-amber-500" />
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Points</p>
//                   </div>
//                   <p className="text-2xl font-black text-amber-500">
//                     {summary?.total_points || 0}
//                   </p>
//                 </div>

//                 <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
//                   <div className="flex items-center justify-center gap-2 mb-2">
//                     <TrendingUp size={16} className="text-emerald-500" />
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Predictions</p>
//                   </div>
//                   <p className="text-2xl font-black text-emerald-500">{summary?.total_questions || 0}</p>
//                 </div>

//                 <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
//                   <div className="flex items-center justify-center gap-2 mb-2">
//                     <Award size={16} className="text-rose-500" />
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Winning Votes</p>
//                   </div>
//                   <p className="text-2xl font-black text-rose-500">{winningVotes}</p>
//                 </div>
//               </div>

//               <div className="flex gap-3 justify-center md:justify-start mt-6 pt-6 border-t border-border/30">
//                 <Button
//                   onClick={handleLogout}
//                   variant="outline"
//                   className="rounded-xl border-border hover:bg-red-50 hover:text-red-500 transition-colors"
//                 >
//                   <LogOut size={16} className="mr-2" />
//                   Sign Out
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-2 space-y-6">
//               <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
//                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
//                   <Calendar size={20} className="text-primary" />
//                   Activity History
//                 </h3>
//                 <Tabs defaultValue="predictions" className="w-full">
//                   <TabsList className="bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl mb-8 flex w-full md:w-fit">
//                     <TabsTrigger value="predictions" className="flex-1 md:px-8 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">My Predictions</TabsTrigger>
//                     <TabsTrigger value="votes" className="flex-1 md:px-8 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">My Votes</TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="predictions" className="space-y-4">
//                     {user.questions?.length > 0 ? (
//                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
//                         {user.questions.map((q: any) => (
//                           <div key={q.id} className="p-4 md:p-5 rounded-2xl border border-border bg-muted/10 hover:bg-muted/20 transition-all group relative flex flex-col md:flex-row md:items-start gap-4">
//                             <div className="flex-1 min-w-0">
//                               <h4 className="font-bold text-base md:text-lg mb-3 leading-snug text-gray-900 dark:text-white">{q.questions}</h4>
//                               <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-gray-500">
//                                 <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
//                                   {q.visibility === 'private' ? <Lock size={13} className="text-amber-500" /> : <Globe size={13} className="text-primary" />}
//                                   {q.visibility}
//                                 </span>
//                                 <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
//                                   <Users size={13} className="text-emerald-500" />
//                                   {q.answers?.length || 0} Votes
//                                 </span>
//                                 {q.end_date && (
//                                   <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
//                                     <Clock size={13} className="text-rose-400" />
//                                     {new Date(q.end_date).toLocaleDateString()}
//                                   </span>
//                                 )}
//                                 <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold uppercase tracking-widest ${q.status === 'closed' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
//                                   {q.status || 'active'}
//                                 </span>
//                               </div>
//                             </div>
//                              <div className="flex flex-row md:flex-row gap-2 mt-3 md:mt-0">
//                               <Button
//                                 onClick={(e) => { e.stopPropagation(); openQuestionEdit(q); }}
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-9 w-9 md:h-9 md:w-9 rounded-xl bg-white shadow-sm border-border hover:bg-primary/10 transition-colors"
//                               >
//                                 <Edit2 size={16} className="text-primary" />
//                               </Button>
//                               <Button
//                                 onClick={(e) => { e.stopPropagation(); handleToggleVisibility(q); }}
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-9 w-9 md:h-9 md:w-9 rounded-xl bg-white shadow-sm border-border hover:bg-amber-50 transition-colors"
//                                 title={`Switch to ${q.visibility === 'public' ? 'private' : 'public'}`}
//                               >
//                                 {q.visibility === 'public' ? (
//                                   <Lock size={16} className="text-amber-500" />
//                                 ) : (
//                                   <Globe size={16} className="text-blue-500" />
//                                 )}
//                               </Button>
//                               <Button
//                                 onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-9 w-9 md:h-9 md:w-9 rounded-xl bg-white shadow-sm border-border hover:bg-red-50 transition-colors"
//                               >
//                                 <Trash2 size={16} className="text-rose-500" />
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
//                         <p className="text-muted-foreground font-medium">No predictions created yet</p>
//                       </div>
//                     )}
//                   </TabsContent>

//                   <TabsContent value="votes" className="space-y-4">
//                     {user.answers?.length > 0 ? (
//                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
//                         {user.answers.map((a: any) => (
//                           <div key={a.id} className="p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-md transition-all">
//                             <h4 className="font-bold text-sm text-foreground mb-4 leading-relaxed">{a.question?.questions || 'Unknown Prediction'}</h4>
//                             <div className="flex flex-wrap items-center gap-4">
//                               <div className="flex flex-col gap-1">
//                                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Prediction</span>
//                                 <span className={`text-sm font-black px-3 py-1 rounded-lg border ${a.question?.correct_answer && a.question.correct_answer !== 'N/A' ? (a.answer === a.question.correct_answer ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200') : 'bg-primary/10 text-primary border-primary/20'}`}>{a.answer}</span>
//                               </div>
//                               {a.question?.correct_answer && a.question.correct_answer !== 'N/A' && (
//                                 <div className="flex flex-col gap-1">
//                                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Winning Vote</span>
//                                   <span className="text-sm font-black px-3 py-1 rounded-lg border bg-amber-50 text-amber-600 border-amber-200">
//                                     {a.question.correct_answer}
//                                   </span>
//                                 </div>
//                               )}
//                               {a.question?.correct_answer && a.question.correct_answer !== 'N/A' && (
//                                 <div className="ml-auto">
//                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${a.answer === a.question.correct_answer ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
//                                       {a.answer === a.question.correct_answer ? 'WIN' : 'LOSS'}
//                                    </span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
//                         <p className="text-muted-foreground font-medium">No votes recorded yet</p>
//                       </div>
//                     )}
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
//                 <h3 className="font-bold mb-6 flex items-center gap-2">
//                   <Award size={20} className="text-amber-500" />
//                   Badges
//                 </h3>
//                 {profile?.badges && profile.badges.length > 0 ? (
//                   <div className="grid grid-cols-2 gap-3">
//                     {profile.badges.map((badge) => (
//                       <div key={badge.id} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/20 border border-border/50 text-center hover:scale-105 transition-transform cursor-pointer shadow-sm">
//                         <div className="text-3xl mb-2">{badge.icon}</div>
//                         <p className="font-bold text-[10px] leading-tight text-foreground">{badge.name}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-xs text-muted-foreground">Master predictions to earn exclusive badges!</p>
//                   </div>
//                 )}
//               </div>

//               <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
//                 <h3 className="font-bold mb-4 flex items-center gap-2">
//                   <Users size={20} className="text-primary" />
//                   Groups
//                 </h3>
//                 <div className="space-y-3">
//                   {user.groups?.length > 0 ? (
//                     user.groups.slice(0, 5).map(group => (
//                       <div key={group.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
//                         <span className="text-sm font-semibold truncate flex-1">{group.name}</span>
//                         <TrendingUp size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-xs text-muted-foreground text-center py-4">No groups yet</p>
//                   )}
//                   <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-10 mt-3" onClick={() => navigate('/groups')}>
//                     Discover Groups
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <AnimatePresence>
//         {editOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
//             onClick={() => setEditOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 30 }}
//               className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border my-auto relative"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between mb-8">
//                 <h2 className="text-2xl font-black text-foreground">Update Profile</h2>
//                 <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEditOpen(false)}>
//                   <X size={20} />
//                 </Button>
//               </div>

//               <div className="mb-8 flex flex-col items-center">
//                 <AvatarSelector
//                   currentAvatar={avatarPreview || selectedAvatar}
//                   preview={avatarPreview}
//                   onSelect={handleAvatarSelect}
//                 />
//               </div>

//               <div className="space-y-5">
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
//                   <Input
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     className="h-12 rounded-xl bg-muted/30 border-border"
//                   />
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Username</Label>
//                   <Input
//                     value={editUsername}
//                     onChange={(e) => setEditUsername(e.target.value)}
//                     className="h-12 rounded-xl bg-muted/30 border-border"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Country</Label>
//                     <Input
//                       value={editCountry}
//                       onChange={(e) => setEditCountry(e.target.value)}
//                       className="h-12 rounded-xl bg-muted/30 border-border"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">City</Label>
//                     <Input
//                       value={editCity}
//                       onChange={(e) => setEditCity(e.target.value)}
//                       className="h-12 rounded-xl bg-muted/30 border-border"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-8 flex gap-3">
//                 <Button
//                   onClick={handleSaveProfile}
//                   disabled={isSaving}
//                   className="w-full h-14 rounded-2xl font-black text-lg bg-gradient-to-r from-primary to-pink-500 shadow-xl shadow-primary/20"
//                 >
//                   {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Question Edit Modal */}
//       <AnimatePresence>
//         {questionEditOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
//             onClick={() => setQuestionEditOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 30 }}
//               className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border my-auto relative"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between mb-8">
//                 <h2 className="text-2xl font-black text-foreground">Edit Prediction</h2>
//                 <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQuestionEditOpen(false)}>
//                   <X size={20} />
//                 </Button>
//               </div>

//               <div className="space-y-5">
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">The Question</Label>
//                   <Input
//                     value={editQuestionText}
//                     onChange={(e) => setEditQuestionText(e.target.value)}
//                     className="h-12 rounded-xl bg-muted/30 border-border"
//                     placeholder="Enter your prediction question..."
//                   />
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Visibility</Label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <Button
//                       type="button"
//                       variant={editQuestionVisibility === 'public' ? 'default' : 'outline'}
//                       onClick={() => setEditQuestionVisibility('public')}
//                       className="rounded-xl h-12 gap-2"
//                     >
//                       <Globe size={16} /> Public
//                     </Button>
//                     <Button
//                       type="button"
//                       variant={editQuestionVisibility === 'private' ? 'default' : 'outline'}
//                       onClick={() => setEditQuestionVisibility('private')}
//                       className="rounded-xl h-12 gap-2"
//                     >
//                       <Lock size={16} /> Private
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Prediction End Date</Label>
//                   <Input
//                     type="date"
//                     value={editQuestionEndDate}
//                     onChange={(e) => setEditQuestionEndDate(e.target.value)}
//                     className="h-12 rounded-xl bg-muted/30 border-border"
//                   />
//                   <p className="text-[10px] text-muted-foreground mt-1 ml-1">The date when the prediction outcome will be determined.</p>
//                 </div>
//               </div>

//               <div className="mt-8 flex gap-3">
//                 <Button
//                   onClick={handleUpdateQuestion}
//                   disabled={isUpdatingQuestion}
//                   className="w-full h-14 rounded-2xl font-black text-lg bg-gradient-to-r from-primary to-pink-500 shadow-xl shadow-primary/20"
//                 >
//                   {isUpdatingQuestion ? <Loader2 size={18} className="animate-spin" /> : 'Update Prediction'}
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <MobileNav />
//     </div>
//   );
// }













import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import {
  Trophy, Target, TrendingUp, Award, LogOut, Edit2, Loader2, MapPin,
  User, AtSign, Trash2, Calendar, Globe, Lock, Users, Clock, X,
  Pencil, Zap, BarChart2, Shield
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { AvatarSelector } from '@/app/components/AvatarSelector';
import { PrivacyDataModal } from '@/app/components/PrivacyDataModal';
import { Dialog, DialogContent, DialogTrigger } from '@/app/components/ui/dialog';
import { useState, useEffect } from 'react';
import { getAuth, postFormDataAuth, deleteAuth, putAuth, patchAuth } from '@/util/api';
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

const cardPalettes = [
  { border: '#a855f7', bg: 'rgba(168,85,247,0.06)', badge: 'rgba(168,85,247,0.12)', badgeText: '#a855f7', iconBg: 'rgba(168,85,247,0.1)' },
  { border: '#ec4899', bg: 'rgba(236,72,153,0.06)', badge: 'rgba(236,72,153,0.12)', badgeText: '#ec4899', iconBg: 'rgba(236,72,153,0.1)' },
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)', badge: 'rgba(6,182,212,0.12)', badgeText: '#0891b2', iconBg: 'rgba(6,182,212,0.1)' },
  { border: '#10b981', bg: 'rgba(16,185,129,0.06)', badge: 'rgba(16,185,129,0.12)', badgeText: '#059669', iconBg: 'rgba(16,185,129,0.1)' },
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', badge: 'rgba(245,158,11,0.12)', badgeText: '#d97706', iconBg: 'rgba(245,158,11,0.1)' },
  { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)', badge: 'rgba(59,130,246,0.12)', badgeText: '#2563eb', iconBg: 'rgba(59,130,246,0.1)' },
];

function getPalette(index: number) {
  return cardPalettes[index % cardPalettes.length];
}

function SectionCard({ children, paletteIndex = 0 }: { children: React.ReactNode; paletteIndex?: number }) {
  const pal = getPalette(paletteIndex);
  return (
    <div className="rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden bg-white" style={{ borderLeftWidth: 3, borderLeftColor: pal.border }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, label, paletteIndex = 0 }: { icon: any; label: string; paletteIndex?: number }) {
  const pal = getPalette(paletteIndex);
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: pal.iconBg }}>
        <Icon size={12} style={{ color: pal.border }} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pal.border }}>{label}</span>
    </div>
  );
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
  const [fields, setFields] = useState<any[]>([]);
  const [editQuestionFieldId, setEditQuestionFieldId] = useState<number | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionDescription, setEditQuestionDescription] = useState('');
  const [editQuestionVisibility, setEditQuestionVisibility] = useState<'public' | 'private'>('public');
  const [editQuestionEndDate, setEditQuestionEndDate] = useState('');
  const [editQuestionVotingEndDate, setEditQuestionVotingEndDate] = useState('');
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);
  
  // Share & Share to Group state
  const [shareGroupOpen, setShareGroupOpen] = useState(false);
  const [selectedPredictionId, setSelectedPredictionId] = useState<number | null>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [isSharingToGroup, setIsSharingToGroup] = useState(false);

  useEffect(() => {
    if (shareGroupOpen) {
      const fetchGroups = async () => {
        try {
          const res = await getAuth('/api/groups?my_groups=1');
          setMyGroups(res?.data ?? res ?? []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchGroups();
    }
  }, [shareGroupOpen]);

  const handleShareToGroup = async () => {
    if (selectedGroupIds.length === 0 || !selectedPredictionId) {
      toast.error('Select at least one group');
      return;
    }
    setIsSharingToGroup(true);
    try {
      const res = await postAuth(`/api/predictions/${selectedPredictionId}/share-to-groups`, { group_ids: selectedGroupIds });
      toast.success(res.message || 'Shared successfully');
      setShareGroupOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to share to groups');
    } finally {
      setIsSharingToGroup(false);
    }
  };

  // Privacy & Data Modal state
  const [privacyOpen, setPrivacyOpen] = useState(false);

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
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await getAuth('/api/fields');
      setFields(res?.data ?? res ?? []);
    } catch (err) {
      console.error('Failed to fetch fields', err);
    }
  };

  const user = profile?.user;
  const summary = profile?.summary;

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

  const handleDeleteQuestion = (id: number) => {
    toast.custom(
      (t) => (
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-red-200">
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Delete Question?</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The question and all associated answers will be permanently deleted.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border hover:bg-muted"
                onClick={() => toast.dismiss(t)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  toast.dismiss(t);
                  try {
                    await deleteAuth(`/api/questions/${id}`);
                    toast.success('Question deleted successfully');
                    fetchProfile();
                  } catch (err: any) {
                    toast.error('Failed to delete question');
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
        unstyled: true,
      }
    );
  };

  const openQuestionEdit = (q: any) => {
    setEditingQuestion(q);
    setEditQuestionFieldId(q.field_id);
    setEditQuestionText(q.questions || '');
    setEditQuestionDescription(q.description || '');
    setEditQuestionVisibility(q.visibility || 'public');
    setEditQuestionEndDate(q.end_date ? new Date(q.end_date).toISOString().slice(0, 16) : '');
    setEditQuestionVotingEndDate(q.voting_end_date ? new Date(q.voting_end_date).toISOString().slice(0, 16) : '');
    setQuestionEditOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      setIsUpdatingQuestion(true);
      await putAuth(`/api/questions/${editingQuestion.id}`, {
        field_id: editQuestionFieldId,
        questions: editQuestionText,
        description: editQuestionDescription,
        visibility: editQuestionVisibility,
        end_date: editQuestionEndDate || null,
        voting_end_date: editQuestionVotingEndDate || null,
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

  const handleToggleVisibility = (q: any) => {
    const isPublic = q.visibility === 'public';
    const targetVisibility = isPublic ? 'private' : 'public';

    toast.custom(
      (t) => (
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-primary/20">
          <div className="text-center space-y-4">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${isPublic ? 'bg-amber-50' : 'bg-blue-50'}`}>
              {isPublic ? <Lock size={28} className="text-amber-500" /> : <Globe size={28} className="text-blue-500" />}
            </div>
            <h3 className="text-lg font-bold text-foreground">Switch to {targetVisibility}?</h3>
            <p className="text-sm text-muted-foreground">
              {isPublic
                ? "This prediction will be hidden from the public feed and only visible to you and shared groups."
                : "This prediction will become visible to everyone on the public feed."}
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border hover:bg-muted"
                onClick={() => toast.dismiss(t)}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 text-white ${isPublic ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={async () => {
                  toast.dismiss(t);
                  try {
                    await patchAuth(`/api/predictions/${q.id}/toggle-visibility`);
                    toast.success(`Prediction is now ${targetVisibility}`);
                    fetchProfile();
                  } catch (err: any) {
                    toast.error('Failed to update visibility');
                  }
                }}
              >
                Switch
              </Button>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        unstyled: true,
      }
    );
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
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

  // Calculate accuracy and wins
  let winningVotes = 0;
  let totalResolvedAnswers = 0;
  user.answers?.forEach((ans: any) => {
    if (ans.question && ans.question.correct_answer && ans.question.correct_answer !== 'N/A') {
      totalResolvedAnswers++;
      if (ans.answer === ans.question.correct_answer) winningVotes++;
    }
  });
  const accuracy = totalResolvedAnswers > 0
    ? (winningVotes / totalResolvedAnswers) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="max-w-5xl mx-auto px-2 md:px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card - Updated with glass style */}
          <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-border/50 shadow-sm">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-pink-500/5 to-transparent rounded-full blur-[120px] -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-500/5 via-primary/5 to-transparent rounded-full blur-[100px] -ml-20 -mb-20" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                <div className="relative group">
                  <Avatar className="w-28 h-28 ring-4 ring-primary/10 shadow-2xl">
                    <AvatarImage
                      src={user.avatar_url || user.avatar || undefined}
                      alt={user.username}
                    />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-pink-500 text-white">
                      {user.name?.[0] || user.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={openEditModal}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border border-border hover:bg-muted transition-all scale-90 hover:scale-100"
                  >
                    <Edit2 size={16} className="text-primary" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left min-w-0">
                  <h2 className="text-3xl font-black text-foreground mb-1 mt-2">{user.name || user.username}</h2>
                  <p className="text-primary font-bold mb-4">@{user.username}</p>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-2xl w-fit mx-auto md:mx-0">
                    {(user.country || user.city) && (
                      <span className="flex items-center gap-1.5 px-2">
                        <MapPin size={14} className="text-primary" />
                        {[user.city, user.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-2">
                      <AtSign size={14} className="text-primary" />
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Card style like groups */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { icon: Target, label: "Accuracy", value: `${accuracy.toFixed(1)}%`, color: "text-primary" },
                  { icon: Trophy, label: "Points", value: summary?.total_points || 0, color: "text-amber-500" },
                  { icon: TrendingUp, label: "Predictions", value: summary?.total_questions || 0, color: "text-emerald-500" },
                  { icon: Award, label: "Winning Votes", value: winningVotes, color: "text-rose-500" },
                ].map((stat, index) => {
                  const pal = getPalette(index);
                  return (
                    <motion.div
                      key={index}
                      className="glass-card p-4 md:p-5 rounded-2xl border border-border/50 hover:border-primary/20 transition-all shadow-sm text-center"
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: pal.border,
                        background: pal.bg,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <stat.icon size={18} className={stat.color} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>
                        {stat.value}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center md:justify-start mt-6 pt-6 border-t border-border/30">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="rounded-xl border-border hover:bg-red-50 hover:text-red-500 transition-colors h-9 md:h-10 px-6 font-semibold"
                  style={{ borderColor: '#a855f7', color: '#a855f7' }}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
                <Button
                  onClick={() => setPrivacyOpen(true)}
                  variant="outline"
                  className="rounded-xl border-border hover:bg-gray-50 transition-colors h-9 md:h-10 px-6 font-semibold"
                  style={{ borderColor: '#6b7280', color: '#4b5563' }}
                >
                  <Shield size={16} className="mr-2" />
                  Privacy & Data
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              {/* Activity History */}
              <div className="glass-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Activity History
                </h3>
                <Tabs defaultValue="predictions" className="w-full">
                  <TabsList className="bg-transparent p-0 h-auto gap-2 mb-6">
                    <TabsTrigger
                      value="predictions"
                      className="
                        px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                        bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
                        text-gray-600 dark:text-gray-400
                        hover:border-[#a855f7]/40
                        data-[state=active]:bg-[#a855f7]
                        data-[state=active]:text-white
                        data-[state=active]:border-[#a855f7]
                        data-[state=active]:shadow-md
                      "
                    >
                      My Predictions
                    </TabsTrigger>
                    <TabsTrigger
                      value="votes"
                      className="
                        px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                        bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
                        text-gray-600 dark:text-gray-400
                        hover:border-[#a855f7]/40
                        data-[state=active]:bg-[#a855f7]
                        data-[state=active]:text-white
                        data-[state=active]:border-[#a855f7]
                        data-[state=active]:shadow-md
                      "
                    >
                      My Votes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="predictions" className="space-y-3 md:space-y-4 mt-0">
                    {user.questions?.length > 0 ? (
                      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-hide">
                        {user.questions.map((q: any, index: number) => {
                          const pal = getPalette(index);
                          return (
                            <motion.div
                              key={q.id}
                              className="glass-card p-4 md:p-5 rounded-2xl border border-border/50 hover:border-primary/20 transition-all group"
                              style={{
                                borderLeftWidth: 3,
                                borderLeftColor: pal.border,
                                background: pal.bg,
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <div className="flex flex-col md:flex-row md:items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-base md:text-lg mb-3 leading-snug text-foreground">{q.questions}</h4>
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: pal.badge }}>
                                      {q.visibility === 'private' ? <Lock size={13} style={{ color: pal.badgeText }} /> : <Globe size={13} style={{ color: pal.badgeText }} />}
                                      <span style={{ color: pal.badgeText }} className="font-semibold">{q.visibility}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: pal.badge }}>
                                      <Users size={13} style={{ color: pal.badgeText }} />
                                      <span style={{ color: pal.badgeText }} className="font-semibold">{q.answers?.length || 0} votes</span>
                                    </div>
                                    {q.end_date && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
                                        <Clock size={13} />
                                        {new Date(q.end_date).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <Button
                                    onClick={(e) => { e.stopPropagation(); openQuestionEdit(q); }}
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 rounded-xl"
                                    style={{ borderColor: '#a855f7', color: '#a855f7' }}
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button
                                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(q); }}
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 rounded-xl"
                                  >
                                    {q.visibility === 'public' ? <Lock size={16} className="text-amber-500" /> : <Globe size={16} className="text-blue-500" />}
                                  </Button>
                                    <Button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                      size="sm"
                                      variant="outline"
                                      className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-500"
                                    >
                                      <Trash2 size={16} className="text-rose-500" />
                                    </Button>

                                    {/* Share Button */}
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const url = `${window.location.origin}${q.module_type === 'poll' ? '/poll' : '/prediction'}/${q.id}`;
                                        const text = `🤔 Predict now on iSaidSo!\n\nQuestion: ${q.questions}\n\nCast your vote and see what others think 👇`;
                                        if (navigator.share) {
                                          navigator.share({ title: 'iSaidSo Prediction', text, url }).catch(console.error);
                                        } else {
                                          navigator.clipboard.writeText(`${text} ${url}`);
                                          toast.success('Link copied to clipboard!');
                                        }
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="h-9 px-3 rounded-xl border-gray-200 hover:border-[#a855f7] hover:text-[#a855f7] hover:bg-[#a855f7]/5 transition-all text-xs font-bold"
                                    >
                                      Share
                                    </Button>

                                    {/* Add to Group Button (if Private) */}
                                    {q.visibility === 'private' && (
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedPredictionId(q.id);
                                          setSelectedGroupIds([]);
                                          setShareGroupOpen(true);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-9 px-3 rounded-xl border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all text-xs font-bold"
                                      >
                                        Add to Group
                                      </Button>
                                    )}
                                  </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No predictions created yet</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="votes" className="space-y-3 md:space-y-4 mt-0">
                    {user.answers?.length > 0 ? (
                      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-hide">
                        {user.answers.map((a: any, index: number) => (
                          <motion.div
                            key={a.id}
                            className="glass-card p-5 rounded-2xl border border-border/50 hover:border-primary/20 transition-all"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <h4 className="font-semibold text-base mb-4 leading-relaxed text-foreground">{a.question?.questions || 'Unknown Prediction'}</h4>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Prediction</span>
                                <span className={`text-sm font-bold px-4 py-1.5 rounded-xl border ${a.question?.correct_answer && a.question.correct_answer !== 'N/A' ? (a.answer === a.question.correct_answer ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200') : 'bg-primary/10 text-primary border-primary/20'}`}>
                                  {a.answer}
                                </span>
                              </div>
                              {a.question?.correct_answer && a.question.correct_answer !== 'N/A' && (
                                <>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Winning Vote</span>
                                    <span className="text-sm font-bold px-4 py-1.5 rounded-xl border bg-amber-100 text-amber-700 border-amber-200">
                                      {a.question.correct_answer}
                                    </span>
                                  </div>
                                  <div className="ml-auto self-end">
                                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${a.answer === a.question.correct_answer ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                      {a.answer === a.question.correct_answer ? 'WIN' : 'LOSS'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No votes recorded yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Badges */}
              <div className="glass-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
                <h3 className="font-bold mb-5 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  Badges
                </h3>
                {profile?.badges && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.badges.map((badge, index) => {
                      const pal = getPalette(index);
                      return (
                        <div
                          key={badge.id}
                          className="glass-card p-4 rounded-2xl border border-border/50 text-center hover:scale-105 transition-all cursor-pointer"
                          style={{ background: pal.bg, borderColor: pal.border }}
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className="font-bold text-sm text-foreground">{badge.name}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">Master predictions to earn exclusive badges!</p>
                  </div>
                )}
              </div>

              {/* Groups */}
              <div className="glass-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
                <h3 className="font-bold mb-5 flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Community
                </h3>
                <div className="space-y-2">
                  {user.groups?.length > 0 ? (
                    user.groups.slice(0, 5).map((group, index) => {
                      const pal = getPalette(index);
                      return (
                        <div
                          key={group.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/70 transition-all cursor-pointer group"
                          style={{ background: pal.bg }}
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          <span className="text-sm font-semibold truncate flex-1 text-foreground">{group.name}</span>
                          <TrendingUp size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 bg-muted/10 rounded-2xl border border-dashed border-border">
                      <p className="text-xs text-muted-foreground">No Community yet</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 h-10 rounded-xl font-semibold text-sm"
                  style={{ borderColor: '#a855f7', color: '#a855f7' }}
                  onClick={() => navigate('/groups')}
                >
                  Discover More Community
                </Button>
              </div>
            </div>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-border my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-foreground">Update Profile</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEditOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <div className="mb-8 flex flex-col items-center">
                <AvatarSelector
                  currentAvatar={avatarPreview || selectedAvatar}
                  preview={avatarPreview}
                  onSelect={handleAvatarSelect}
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-11 md:h-12 rounded-xl bg-white border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Username</Label>
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-11 md:h-12 rounded-xl bg-white border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Country</Label>
                    <Input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="h-11 md:h-12 rounded-xl bg-white border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">City</Label>
                    <Input
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="h-11 md:h-12 rounded-xl bg-white border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full h-12 md:h-14 rounded-2xl font-bold text-base md:text-lg shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Edit Modal */}
      <AnimatePresence>
        {questionEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setQuestionEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#f8f8f6] rounded-[2rem] p-4 md:p-8 w-full max-w-2xl shadow-2xl border-none my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                  <Zap size={28} className="text-[#a855f7]" /> Edit Prediction
                </h2>
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm" onClick={() => setQuestionEditOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <SectionCard paletteIndex={0}>
                  <SectionHeading icon={BarChart2} label="Category" paletteIndex={0} />
                  <Select value={editQuestionFieldId?.toString() ?? ''} onValueChange={v => setEditQuestionFieldId(Number(v))}>
                    <SelectTrigger className="bg-white border-gray-200 h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {fields.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SectionCard>

                {/* Question & Description */}
                <SectionCard paletteIndex={1}>
                  <SectionHeading icon={Zap} label="Your prediction" paletteIndex={1} />
                  <Textarea
                    placeholder="Write your prediction..."
                    value={editQuestionText}
                    onChange={e => setEditQuestionText(e.target.value)}
                    className="bg-white border-gray-200 min-h-24 p-4 text-sm"
                  />
                  <div className="mt-4 space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Context or evidence..."
                      value={editQuestionDescription}
                      onChange={e => setEditQuestionDescription(e.target.value)}
                      className="bg-white border-gray-200 min-h-20 p-3 text-sm"
                    />
                  </div>
                </SectionCard>

                {/* Timing */}
                <SectionCard paletteIndex={2}>
                  <SectionHeading icon={Calendar} label="Timing" paletteIndex={2} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Prediction Ends
                      </Label>
                      <Input
                        type="datetime-local"
                        value={editQuestionEndDate}
                        onChange={e => setEditQuestionEndDate(e.target.value)}
                        className="bg-white border-gray-200 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Voting Ends
                      </Label>
                      <Input
                        type="datetime-local"
                        value={editQuestionVotingEndDate}
                        onChange={e => setEditQuestionVotingEndDate(e.target.value)}
                        className="bg-white border-gray-200 h-10"
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Visibility */}
                <SectionCard paletteIndex={4}>
                  <SectionHeading icon={editQuestionVisibility === 'public' ? Globe : Lock} label="Visibility" paletteIndex={4} />
                  <RadioGroup value={editQuestionVisibility} onValueChange={v => setEditQuestionVisibility(v as any)} className="flex gap-6 items-center">
                    {['public', 'private'].map(v => (
                      <div key={v} className="flex items-center space-x-2">
                        <RadioGroupItem value={v} id={`profile-edit-vis-${v}`} className="border-[#a855f7] text-[#a855f7]" />
                        <Label htmlFor={`profile-edit-vis-${v}`} className="cursor-pointer text-xs font-bold uppercase tracking-wide capitalize">{v}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </SectionCard>

                <div className="pt-6">
                  <Button
                    onClick={handleUpdateQuestion}
                    disabled={isUpdatingQuestion}
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl text-white border-0"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                  >
                    {isUpdatingQuestion ? <Loader2 size={18} className="animate-spin" /> : 'Update Prediction'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrivacyDataModal 
        open={privacyOpen} 
        onClose={() => setPrivacyOpen(false)} 
      />

      <Dialog open={shareGroupOpen} onOpenChange={setShareGroupOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl p-5 border-none shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Select Groups to Share</h3>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
            {myGroups.length === 0 ? (
              <p className="text-xs text-gray-500 font-semibold">You are not in any groups.</p>
            ) : (
              myGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => {
                  setSelectedGroupIds(prev => prev.includes(group.id) ? prev.filter(gid => gid !== group.id) : [...prev, group.id]);
                }}>
                  <input 
                    type="checkbox" 
                    checked={selectedGroupIds.includes(group.id)} 
                    onChange={() => {}} 
                    className="rounded text-purple-500 focus:ring-purple-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{group.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => setShareGroupOpen(false)} className="flex-1 rounded-xl h-10 text-xs font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleShareToGroup} disabled={isSharingToGroup || selectedGroupIds.length === 0} className="flex-1 rounded-xl h-10 text-xs font-bold uppercase tracking-widest bg-purple-600 hover:bg-purple-700 text-white">
              {isSharingToGroup ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}