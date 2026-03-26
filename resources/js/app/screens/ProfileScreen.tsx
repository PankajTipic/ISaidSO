import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Trophy, Target, TrendingUp, Award, LogOut, Edit2, Loader2, MapPin, User, AtSign, Trash2, Calendar, Globe, Lock, Users, Clock, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { AvatarSelector } from '@/app/components/AvatarSelector';
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
        <div className="glass-card p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-red-200 bg-white">
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

  const handleToggleVisibility = (q: any) => {
    const isPublic = q.visibility === 'public';
    const targetVisibility = isPublic ? 'private' : 'public';

    toast.custom(
      (t) => (
        <div className="glass-card p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-primary/20 bg-white">
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

      <div className="max-w-5xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-border/50 shadow-xl bg-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />

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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target size={16} className="text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
                  </div>
                  <p className="text-2xl font-black text-primary">
                    {accuracy.toFixed(1)}%
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy size={16} className="text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Points</p>
                  </div>
                  <p className="text-2xl font-black text-amber-500">
                    {summary?.total_points || 0}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Questions</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-500">{summary?.total_questions || 0}</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-border/50 bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award size={16} className="text-rose-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Answers</p>
                  </div>
                  <p className="text-2xl font-black text-rose-500">{summary?.total_answers || 0}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center md:justify-start mt-6 pt-6 border-t border-border/30">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="rounded-xl border-border hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Activity History
                </h3>
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="bg-muted/50 p-1 rounded-xl mb-6 flex w-full">
                    <TabsTrigger value="questions" className="flex-1 rounded-lg">My Questions</TabsTrigger>
                    <TabsTrigger value="answers" className="flex-1 rounded-lg">My Answers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="questions" className="space-y-4">
                    {user.questions?.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                        {user.questions.map((q: any) => (
                          <div key={q.id} className="p-5 rounded-2xl border border-border bg-muted/10 hover:bg-muted/20 transition-all group relative">
                            <div className="pr-32">
                              <h4 className="font-bold text-base mb-3 leading-snug">{q.questions}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-border/50 shadow-sm">
                                  {q.visibility === 'private' ? <Lock size={12} className="text-amber-500" /> : <Globe size={12} className="text-primary" />}
                                  {q.visibility}
                                </span>
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-border/50 shadow-sm">
                                  <Users size={12} className="text-emerald-500" />
                                  {q.answers?.length || 0} Votes
                                </span>
                                {q.end_date && (
                                  <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-border/50 shadow-sm">
                                    <Clock size={12} className="text-rose-400" />
                                    {new Date(q.end_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="absolute right-4 top-4 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => openQuestionEdit(q)}
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full bg-white shadow-md border-border"
                              >
                                <Edit2 size={14} className="text-primary" />
                              </Button>
                              <Button
                                onClick={() => handleToggleVisibility(q)}
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full bg-white shadow-md border-border hover:bg-amber-50"
                                title={`Switch to ${q.visibility === 'public' ? 'private' : 'public'}`}
                              >
                                {q.visibility === 'public' ? (
                                  <Lock size={14} className="text-amber-500" />
                                ) : (
                                  <Globe size={14} className="text-blue-500" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleDeleteQuestion(q.id)}
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full bg-white shadow-md border-border hover:bg-red-50"
                              >
                                <Trash2 size={14} className="text-rose-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No questions created yet</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="answers" className="space-y-4">
                    {user.answers?.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                        {user.answers.map((a: any) => (
                          <div key={a.id} className="p-5 rounded-2xl border border-border bg-muted/10 hover:bg-muted/20 transition-all">
                            <h4 className="font-bold text-sm text-foreground mb-4 leading-relaxed">{a.question?.questions || 'Unknown Question'}</h4>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Vote</span>
                                <span className="text-sm font-black text-primary px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">{a.answer}</span>
                              </div>
                              {a.question?.correct_answer && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Result</span>
                                  <span className={`text-sm font-black px-3 py-1 rounded-lg border ${a.answer === a.question.correct_answer ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                    {a.question.correct_answer}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No answers recorded yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  Badges
                </h3>
                {profile?.badges && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/20 border border-border/50 text-center hover:scale-105 transition-transform cursor-pointer shadow-sm">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className="font-bold text-[10px] leading-tight text-foreground">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">Master predictions to earn exclusive badges!</p>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-6 border border-border/50 bg-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Groups
                </h3>
                <div className="space-y-3">
                  {user.groups?.length > 0 ? (
                    user.groups.slice(0, 5).map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                        <span className="text-sm font-semibold truncate flex-1">{group.name}</span>
                        <TrendingUp size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No groups yet</p>
                  )}
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-10 mt-3" onClick={() => navigate('/groups')}>
                    Discover Groups
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border my-auto relative"
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
                    className="h-12 rounded-xl bg-muted/30 border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Username</Label>
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Country</Label>
                    <Input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">City</Label>
                    <Input
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full h-14 rounded-2xl font-black text-lg bg-gradient-to-r from-primary to-pink-500 shadow-xl shadow-primary/20"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}