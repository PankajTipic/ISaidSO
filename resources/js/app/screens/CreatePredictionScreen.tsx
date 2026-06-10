
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import {
  Plus, X, Globe, Lock, Check, ArrowLeft, Users,
  Zap, BarChart2, ChevronRight, Calendar, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import { useAppSelector } from '@/app/store/hooks';
import { getAuth, postAuth } from '@/util/api';

// ── Types ──────────────────────────────────────────────────
type AnswerType = 'yes-no' | 'mcq' | 'numeric' | 'datetime';

interface Field { id: number; fields: string; }
interface AnswerTypeBackend { id: number; ans_type: string; }
interface MyGroup { id: number; name: string; }

// ── Card left-border palette (mirrors GroupsScreen) ────────
const cardPalettes = [
  { border: '#a855f7', bg: 'rgba(168,85,247,0.06)',  badge: 'rgba(168,85,247,0.12)', badgeText: '#a855f7', iconBg: 'rgba(168,85,247,0.1)' },
  { border: '#ec4899', bg: 'rgba(236,72,153,0.06)',  badge: 'rgba(236,72,153,0.12)', badgeText: '#ec4899', iconBg: 'rgba(236,72,153,0.1)' },
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)',   badge: 'rgba(6,182,212,0.12)',  badgeText: '#0891b2', iconBg: 'rgba(6,182,212,0.1)'  },
  { border: '#10b981', bg: 'rgba(16,185,129,0.06)',  badge: 'rgba(16,185,129,0.12)', badgeText: '#059669', iconBg: 'rgba(16,185,129,0.1)' },
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  badge: 'rgba(245,158,11,0.12)', badgeText: '#d97706', iconBg: 'rgba(245,158,11,0.1)' },
  { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)',  badge: 'rgba(59,130,246,0.12)', badgeText: '#2563eb', iconBg: 'rgba(59,130,246,0.1)' },
];
const getPalette = (i: number) => cardPalettes[i % cardPalettes.length];

// ── Shared section card ────────────────────────────────────
function SectionCard({ children, paletteIndex = 0 }: { children: React.ReactNode; paletteIndex?: number }) {
  const pal = getPalette(paletteIndex);
  return (
    <div
      className="rounded-2xl p-5 border border-border/50 shadow-sm overflow-hidden bg-white"
      style={{ borderLeftWidth: 3, borderLeftColor: pal.border }}
    >
      {children}
    </div>
  );
}

// ── Section heading with colored icon ─────────────────────
function SectionHeading({ icon: Icon, label, paletteIndex = 0 }: { icon: any; label: string; paletteIndex?: number }) {
  const pal = getPalette(paletteIndex);
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: pal.iconBg }}>
        <Icon size={13} style={{ color: pal.border }} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: pal.border }}>{label}</span>
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {[1, 2].map((n, i) => (
        <div key={n} className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300"
            style={
              step > n
                ? { background: 'rgba(168,85,247,0.12)', borderColor: '#a855f7', color: '#a855f7' }
                : step === n
                ? { background: '#a855f7', borderColor: '#a855f7', color: '#fff' }
                : { background: 'transparent', borderColor: 'rgba(168,85,247,0.3)', color: 'rgba(168,85,247,0.4)' }
            }
          >
            {step > n ? <Check size={12} /> : n}
          </div>
          <span className="text-xs font-semibold" style={{ color: step === n ? '#a855f7' : 'var(--muted-foreground)' }}>
            {n === 1 ? 'Details' : 'Review'}
          </span>
          {i === 0 && (
            <div className="w-10 h-px" style={{ background: step > 1 ? '#a855f7' : 'rgba(168,85,247,0.2)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export function CreatePredictionScreen() {
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState('prediction');
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '']);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
  const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  const [predictionOverDate, setPredictionOverDate] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fields, setFields] = useState<Field[]>([]);
  const [answerTypes, setAnswerTypes] = useState<AnswerTypeBackend[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);


  useEffect(() => {
    if (!votingEndDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      defaultDate.setHours(23, 59); // Optional: Set to end of day
      const formatted = defaultDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      setVotingEndDate(formatted);
    }
  }, [votingEndDate]); // Runs once on mount

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingRefs(true);
        const [fieldsRes, typesRes, groupsRes] = await Promise.all([
          getAuth('/api/fields'),
          getAuth('/api/answer-types'),
          getAuth('/api/groups?my_groups=1'),
        ]);
        const fieldData = fieldsRes?.data ?? fieldsRes ?? [];
        const typeData  = typesRes?.data  ?? typesRes  ?? [];
        const groupData = groupsRes?.data ?? groupsRes ?? [];
        setFields(fieldData);
        setAnswerTypes(typeData);
        setMyGroups(groupData);
        if (fieldData.length > 0) setSelectedFieldId(fieldData[0].id);
      } catch (err: any) {
        if (err.status === 401) { toast.error('Session expired.'); navigate('/login'); }
        else toast.error('Failed to load form data');
      } finally {
        setLoadingRefs(false);
      }
    };
    load();
  }, [navigate]);

  const formatToMySQL = (d: string) => {
    if (!d) return null;
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      const p = (n: number) => String(n).padStart(2, '0');
      return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:00`;
    } catch { return null; }
  };

  const handleAddOption    = () => { if (mcqOptions.length < 6) setMcqOptions([...mcqOptions, '']); };
  const handleRemoveOption = (i: number) => { if (mcqOptions.length > 2) setMcqOptions(mcqOptions.filter((_, j) => j !== i)); };
  const handleOptionChange = (i: number, v: string) => { const u = [...mcqOptions]; u[i] = v; setMcqOptions(u); };

  const handleAddPollOption    = () => { if (pollOptions.length < 6) setPollOptions([...pollOptions, '']); };
  const handleRemovePollOption = (i: number) => { if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, j) => j !== i)); };
  const handlePollOptionChange = (i: number, v: string) => { const u = [...pollOptions]; u[i] = v; setPollOptions(u); };

  const toggleGroup = (id: number) =>
    setSelectedGroupIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const handleAddField = async () => {
    if (!newFieldName.trim()) return toast.error('Enter a category name');
    try {
      setIsAddingField(true);
      const res = await postAuth('/api/fields', { fields: newFieldName.trim() });
      toast.success('Category added!');
      setFields(prev => [...prev, { id: res.id, fields: res.fields }]);
      setSelectedFieldId(res.id);
      setIsFieldModalOpen(false);
      setNewFieldName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setIsAddingField(false);
    }
  };

  const handlePublishPoll = async () => {
    if (!text.trim()) return toast.error('Enter a poll question');
    if (selectedFieldId === null) return toast.error('Select a category');
    if (!votingEndDate) return toast.error('Set voting end date');
    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length < 2) return toast.error('At least 2 options required');
    try {
      setSubmitting(true);
      await postAuth('/api/polls', {
        field_id: selectedFieldId,
        questions: text.trim(),
        options: validOptions,
        correct_answer: pollCorrectAnswer || 'N/A',
        visibility,
        end_date: formatToMySQL(votingEndDate),
        group_ids: selectedGroupIds,
      });
      toast.success('Poll created!');
      setTimeout(() => navigate('/polls'), 900);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (activeTab === 'poll') return handlePublishPoll();

    if (!isReviewing) {
      if (!text.trim()) return toast.error('Write your prediction');
      if (selectedFieldId === null) return toast.error('Select a category');
      if (!predictionOverDate) return toast.error('Set prediction end date');
      const predDate = new Date(predictionOverDate);
      if (predDate <= new Date()) return toast.error('End date must be in the future');
      if (votingEndDate) {
        const vDate = new Date(votingEndDate);
        if (vDate <= new Date()) return toast.error('Voting end date must be in the future');
      }
      return setIsReviewing(true);
    }

    const selectedType = answerTypes.find(t => t.ans_type === 'Yes/No');
    if (!selectedType) return toast.error('Answer type "Yes/No" not found');
    try {
      setSubmitting(true);
      await postAuth('/api/predictions', {
        field_id: selectedFieldId,
        questions: text.trim(),
        description: description.trim() || null,
        location_scope: 'global',
        ans_type_id: selectedType.id,
        visibility,
        start_date: formatToMySQL(new Date().toISOString().slice(0, 16)),
        end_date: formatToMySQL(predictionOverDate),
        voting_end_date: votingEndDate ? formatToMySQL(votingEndDate) : null,
        options: ['Yes', 'No', 'Vague'],
        group_ids: selectedGroupIds,
      });
      toast.success('Prediction published!');
      setTimeout(() => navigate('/home'), 900);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create prediction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRefs) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading form data...
      </div>
    );
  }

  // ── Shared: category + visibility + group pickers ─────────
  const CategoryPicker = ({ index = 0 }: { index?: number }) => {
    const pal = getPalette(index);
    return (
      <SectionCard paletteIndex={index}>
        <div className="flex items-center justify-between mb-4">
          <SectionHeading icon={BarChart2} label="Category" paletteIndex={index} />
          {isAdmin && (
            <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"
                  className="h-7 text-xs font-bold uppercase tracking-widest rounded-full"
                  style={{ borderColor: pal.border, color: pal.border }}>
                  + Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-border">
                <DialogHeader>
                  <DialogTitle className="font-bold">New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-3">
                  <Input placeholder="e.g. Technology, Sports" value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)} className="bg-white border-border h-10" />
                  <Button onClick={handleAddField} disabled={isAddingField} className="w-full text-white border-0"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    {isAddingField ? 'Adding…' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Select value={selectedFieldId?.toString() ?? ''} onValueChange={v => setSelectedFieldId(Number(v))}>
          <SelectTrigger className="bg-white border-border h-10">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-border">
            {fields.map(f => (
              <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SectionCard>
    );
  };

  const VisibilityPicker = ({ index = 4 }: { index?: number }) => {
    const pal = getPalette(index);
    return (
      <SectionCard paletteIndex={index}>
        <SectionHeading icon={visibility === 'public' ? Globe : Lock} label="Visibility" paletteIndex={index} />
        <RadioGroup value={visibility} onValueChange={v => {
          setVisibility(v as any);
          if (v === 'private') {
            toast('Only community members can validate your prediction', {
              icon: '🔒',
            });
          }
        }}
          className="flex gap-6 items-center mb-4">
          {['public', 'private'].map(v => (
            <div key={v} className="flex items-center space-x-2">
              <RadioGroupItem value={v} id={`vis-${v}-${index}`} className="border-[#a855f7] text-[#a855f7]" />
              <Label htmlFor={`vis-${v}-${index}`} className="cursor-pointer text-sm capitalize">{v}</Label>
            </div>
          ))}
        </RadioGroup>

        {visibility === 'private' && myGroups.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-3 border-t border-border/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Share with groups</p>
            <div className="flex flex-wrap gap-2">
              {myGroups.map(group => (
                <button key={group.id} type="button" onClick={() => toggleGroup(group.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all truncate max-w-[180px] ${
                    selectedGroupIds.includes(group.id)
                      ? 'border-[#a855f7] text-[#a855f7]'
                      : 'bg-muted border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                  style={selectedGroupIds.includes(group.id)
                    ? { background: 'rgba(168,85,247,0.1)', boxShadow: '0 0 10px rgba(168,85,247,0.15)' }
                    : {}}>
                  <span className="truncate">{group.name}</span>
                  {selectedGroupIds.includes(group.id) && <Check size={11} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </SectionCard>
    );
  };

  // ── Publish button (gradient matches GroupsScreen) ────────
  const PublishButton = ({ label }: { label: string }) => (
    <Button
      className="w-full h-13 text-base font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99] text-white border-0"
      onClick={handlePublish}
      disabled={submitting}
      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
      {submitting ? 'Publishing…' : label}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        {/* ── Page header ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(168,85,247,0.1)' }}>
              <Zap size={16} style={{ color: '#a855f7' }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {isReviewing ? 'Review prediction' : activeTab === 'poll' ? 'Create poll' : 'Create prediction'}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            {isReviewing
              ? 'Double-check your details before publishing.'
              : activeTab === 'poll'
              ? 'Ask the community and gather opinions.'
              : 'Craft a bold prediction and let the community weigh in.'}
          </p>
        </motion.div>

        {/* ── Tab switcher (matches GroupsScreen pill tabs) ── */}
        {/* {!isReviewing && (
          <div className="flex gap-2 mb-6">
            {['prediction', 'poll'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab
                    ? 'text-white border-[#a855f7] shadow-md'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#a855f7]/40'
                }`}
                style={activeTab === tab
                  ? { background: '#a855f7', boxShadow: '0 4px 14px rgba(168,85,247,0.25)' }
                  : {}}>
                {tab === 'prediction' ? 'Prediction' : 'Poll'}
              </button>
            ))}
          </div>
        )} */}

        {/* ── Step indicator (prediction only) ─────────────── */}
        {activeTab === 'prediction' && !isReviewing && <StepIndicator step={1} />}
        {activeTab === 'prediction' && isReviewing  && <StepIndicator step={2} />}

        <AnimatePresence mode="wait">

          {/* ════════════ PREDICTION FORM ════════════ */}
          {activeTab === 'prediction' && !isReviewing && (
            <motion.div key="pred-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} className="space-y-3">

              <CategoryPicker index={0} />

              {/* Question */}
              <SectionCard paletteIndex={1}>
                <SectionHeading icon={Zap} label="Your prediction" paletteIndex={1} />
                <Textarea
                  placeholder="Write your bold prediction..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="bg-white border-border min-h-28 p-4 text-sm text-foreground"
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{text.length}/500</span>
                </div>
                <div className="mt-4 space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Description <span className="normal-case font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Provide context or evidence..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white border-border min-h-20 p-3 text-sm"
                  />
                </div>
              </SectionCard>

              {/* Timing */}
              <SectionCard paletteIndex={2}>
                <SectionHeading icon={Calendar} label="Timeline" paletteIndex={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                     Destined Date <span className="text-[#ec4899]">*</span>
                    </Label>
                    <Input type="datetime-local" value={predictionOverDate}
                      onChange={e => setPredictionOverDate(e.target.value)}
                      className="bg-white border-border h-10"
                      min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Validation ends <span className="text-muted-foreground/50">(default: 7 days)</span>
                    </Label>
                    <Input type="datetime-local" value={votingEndDate}
                      onChange={e => setVotingEndDate(e.target.value)}
                      className="bg-white border-border h-10"
                      min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  {/* <Input 
        type="datetime-local" 
        value={votingEndDate}
        onChange={e => setVotingEndDate(e.target.value)}
        className="bg-white border-border h-10"
        min={new Date().toISOString().slice(0, 16)} 
      />
    </div> */}
                </div>
              </SectionCard>

              <VisibilityPicker index={4} />

              <div className="pt-1">
                <Button className="w-full h-13 text-base font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99] text-white border-0"
                  onClick={handlePublish} disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                  Review prediction <ChevronRight size={16} className="ml-1" />
                </Button>
                <div className="pt-4 text-center">
                  <button type="button" onClick={() => setActiveTab('poll')}
                    className="text-xs text-muted-foreground/60 hover:text-[#a855f7] transition-colors font-semibold underline underline-offset-4">
                    Switch to Poll Creation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ REVIEW SCREEN ════════════ */}
          {activeTab === 'prediction' && isReviewing && (
            <motion.div key="pred-review"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="space-y-3">

              {/* Review card — palette 0 (purple) */}
              <div
                className="bg-white rounded-2xl border border-border/50 p-5 md:p-7 shadow-sm overflow-hidden relative"
                style={{ borderLeftWidth: 3, borderLeftColor: '#a855f7' }}>

                {/* Top progress bar */}
                <div className="absolute top-0 left-0 w-full h-1"
                  style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />

                <div className="flex items-center justify-between mb-4 mt-1">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                    {fields.find(f => f.id === selectedFieldId)?.fields || 'General'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                    {visibility}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold leading-snug mb-3 text-foreground">{text}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-[#a855f7]/30 pl-4 mb-4">
                    {description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { label: 'Voting ends', value: votingEndDate ? format(new Date(votingEndDate), 'MMM dd, yyyy HH:mm') : 'When prediction ends', icon: Clock },
                    { label: 'Prediction over', value: format(new Date(predictionOverDate), 'MMM dd, yyyy HH:mm'), icon: Calendar, accent: true },
                  ].map(({ label, value, icon: Icon, accent }) => (
                    <div key={label}
                      className="p-3 rounded-xl border border-border/30"
                      style={{ background: accent ? 'rgba(168,85,247,0.08)' : 'rgba(0,0,0,0.02)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={11} style={{ color: accent ? '#a855f7' : undefined }} className={!accent ? 'text-muted-foreground' : ''} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: accent ? '#a855f7' : 'var(--foreground)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {selectedGroupIds.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Shared with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {myGroups.filter(g => selectedGroupIds.includes(g.id)).map(g => (
                        <span key={g.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                          <Users size={10} /> {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full h-13 text-base font-bold shadow-xl text-white border-0"
                onClick={handlePublish} disabled={submitting}
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                {submitting ? 'Publishing…' : 'Confirm & publish'}
              </Button>
              <Button variant="ghost"
                className="w-full h-11 text-muted-foreground font-semibold hover:text-foreground"
                onClick={() => setIsReviewing(false)}>
                <ArrowLeft size={15} className="mr-2" /> Back to edit
              </Button>
            </motion.div>
          )}

          {/* ════════════ POLL FORM ════════════ */}
          {activeTab === 'poll' && (
            <motion.div key="poll-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} className="space-y-3">

              <CategoryPicker index={1} />

              {/* Poll question */}
              <SectionCard paletteIndex={0}>
                <SectionHeading icon={Zap} label="Poll question" paletteIndex={0} />
                <Textarea placeholder="What would you like to ask?"
                  value={text} onChange={e => setText(e.target.value)}
                  className="bg-white border-border min-h-28 p-4 text-sm" maxLength={500} />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{text.length}/500</span>
                </div>
              </SectionCard>

              {/* Options */}
              <SectionCard paletteIndex={2}>
                <div className="flex items-center justify-between mb-4">
                  <SectionHeading icon={BarChart2} label="Options (2–6)" paletteIndex={2} />
                  <Button variant="outline" size="sm"
                    className="h-7 text-xs font-bold rounded-full"
                    style={{ borderColor: getPalette(2).border, color: getPalette(2).border }}
                    onClick={handleAddPollOption} disabled={pollOptions.length >= 6}>
                    <Plus size={12} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={opt} onChange={e => handlePollOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`} className="bg-white border-border h-10" />
                      {pollOptions.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePollOption(i)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10 shrink-0">
                          <X size={15} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Correct answer <span className="normal-case font-normal">(optional)</span>
                  </Label>
                  <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
                    <SelectTrigger className="bg-white border-border h-10">
                      <SelectValue placeholder="None / General opinion" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      {pollOptions.filter(o => o.trim()).map((o, i) => (
                        <SelectItem key={i} value={o.trim()}>{o.trim()}</SelectItem>
                      ))}
                      <SelectItem value="N/A">None / General Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SectionCard>

              {/* Timing */}
              <SectionCard paletteIndex={3}>
                <SectionHeading icon={Calendar} label="Timing" paletteIndex={3} />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Voting ends <span className="text-[#ec4899]">*</span>
                  </Label>
                  <Input type="datetime-local" value={votingEndDate}
                    onChange={e => setVotingEndDate(e.target.value)}
                    className="bg-white border-border h-10"
                    min={new Date().toISOString().slice(0, 16)} />
                </div>
              </SectionCard>

              <VisibilityPicker index={5} />

              <div className="pt-1">
                <Button className="w-full h-13 text-base font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99] text-white border-0"
                  onClick={handlePublish} disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                  {submitting ? 'Publishing…' : 'Publish poll'}
                </Button>
                <div className="pt-4 text-center">
                  <button type="button" onClick={() => setActiveTab('prediction')}
                    className="text-xs text-muted-foreground/60 hover:text-[#a855f7] transition-colors font-semibold underline underline-offset-4">
                    Create a prediction instead?
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <MobileNav />
    </div>
  );
}
