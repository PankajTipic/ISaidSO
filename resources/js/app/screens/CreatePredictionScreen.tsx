
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Input } from '@/app/components/ui/input';
// import { Textarea } from '@/app/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/app/components/ui/select';
// import { Label } from '@/app/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Plus, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';

// // ────────────────────────────────────────────────
// // Types
// // ────────────────────────────────────────────────
// type AnswerType = 'yes-no' | 'mcq' | 'numeric' | 'datetime';

// type Field = { id: number; fields: string };
// type AnswerTypeBackend = { id: number; ans_type: string };

// const ANSWER_TYPE_MAP: Record<AnswerType, string> = {
//   'yes-no':   'Yes/No',
//   'mcq':      'Multiple Choice',
//   'numeric':  'Numeric',
//   'datetime': 'DateTime', // ← change only if your database has different value
// };

// // ────────────────────────────────────────────────
// // Component
// // ────────────────────────────────────────────────
// export function CreatePredictionScreen() {
//   const navigate = useNavigate();

//   // Form state
//   const [text, setText]                 = useState('');
//   const [visibility, setVisibility]     = useState<'public' | 'private'>('public');
//   const [answerType, setAnswerType]     = useState<AnswerType>('yes-no');
//   const [mcqOptions, setMcqOptions]     = useState<string[]>(['', '']);
//   const [correctAnswer, setCorrectAnswer] = useState('');
//   const [votingEndDate, setVotingEndDate] = useState('');
//   const [resultPublishDate, setResultPublishDate] = useState('');

//   // Backend reference data
//   const [fields, setFields]             = useState<Field[]>([]);
//   const [answerTypes, setAnswerTypes]   = useState<AnswerTypeBackend[]>([]);
//   const [loadingRefs, setLoadingRefs]   = useState(true);
//   const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

//   // ── Load categories & answer types ─────────────
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoadingRefs(true);

//         const [fieldsRes, typesRes] = await Promise.all([
//           fetch('/api/fields', { headers: { Accept: 'application/json' } }).then(r => r.json()),
//           fetch('/api/answer-types', { headers: { Accept: 'application/json' } }).then(r => r.json()),
//         ]);

//         setFields(fieldsRes.data ?? fieldsRes ?? []);
//         setAnswerTypes(typesRes.data ?? typesRes ?? []);

//         if ((fieldsRes.data ?? fieldsRes)?.length > 0) {
//           setSelectedFieldId((fieldsRes.data ?? fieldsRes)[0].id);
//         }
//       } catch (err) {
//         console.error('Reference data load failed:', err);
//         toast.error('Failed to load categories & answer types');
//       } finally {
//         setLoadingRefs(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // ── Format date → MySQL safe format (VERY IMPORTANT) ───────
//   const formatMySQLDate = (dateInput: string | Date): string | null => {
//     try {
//       const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
//       if (isNaN(date.getTime())) return null;

//       const pad = (n: number) => String(n).padStart(2, '0');

//       return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
//     } catch {
//       return null;
//     }
//   };

//   // ── Handlers ───────────────────────────────────
//   const handleAddOption = () => {
//     if (mcqOptions.length < 6) {
//       setMcqOptions([...mcqOptions, '']);
//     }
//   };

//   const handleRemoveOption = (index: number) => {
//     if (mcqOptions.length > 2) {
//       setMcqOptions(mcqOptions.filter((_, i) => i !== index));
//     }
//   };

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...mcqOptions];
//     newOptions[index] = value;
//     setMcqOptions(newOptions);
//   };

//   const handlePublish = async () => {
//     // Validation
//     if (!text.trim())               return toast.error('Please enter a prediction');
//     if (selectedFieldId === null)   return toast.error('Please select a category');
//     if (!votingEndDate)             return toast.error('Please set voting end date');
//     if (!correctAnswer.trim())      return toast.error('Please provide the correct answer');

//     if (answerType === 'mcq') {
//       const trimmedOptions = mcqOptions.filter(o => o.trim());
//       if (trimmedOptions.length < 2) {
//         return toast.error('At least 2 valid options are required');
//       }
//       if (!trimmedOptions.includes(correctAnswer.trim())) {
//         return toast.error('Correct answer must exactly match one of the options');
//       }
//     }

//     // Check that end date is in future
//     const endDateObj = new Date(votingEndDate);
//     if (endDateObj <= new Date()) {
//       return toast.error('Voting end date must be in the future');
//     }

//     // Prepare payload with **correct** date format
//     const payload: any = {

//       field_id:       selectedFieldId,
//       questions:      text.trim(),
//       ans_type_id:    answerTypes.find(t => t.ans_type === ANSWER_TYPE_MAP[answerType])?.id,
//       correct_answer: correctAnswer.trim(),
//       visibility,
//       start_date:     formatMySQLDate(new Date()),           // current time
//       end_date:       formatMySQLDate(votingEndDate),
//     };

//     if (!payload.ans_type_id) {
//       return toast.error('Selected answer type not found in database');
//     }

//     if (answerType === 'mcq') {
//       payload.options = mcqOptions.filter(o => o.trim());
//     }

//     console.log('Sending payload:', payload);

//     try {
//       const res = await fetch('/api/questions', {
//         method: 'POST',
//         headers: {
//           'Content-Type':  'application/json',
//           'Accept':        'application/json',
//           // 'Authorization': 'Bearer your-jwt-token',   // ← add when you have auth
//         },
//         body: JSON.stringify(payload),
//       });

//       let data;
//       try {
//         data = await res.json();
//       } catch {
//         const text = await res.text();
//         console.error('Non-JSON response:', text.substring(0, 400));
//         throw new Error('Server returned invalid response (probably HTML error page)');
//       }

//       if (!res.ok) {
//         const errorMsg =
//           data?.message ||
//           data?.error ||

//           `Server error (${res.status})`;

//         throw new Error(errorMsg);
//       }

//       toast.success('Prediction created successfully!');
//       setTimeout(() => navigate('/home'), 800);
//     } catch (err: any) {
//       console.error('Publish error:', err);
//       toast.error(err.message || 'Failed to create prediction');
//     }
//   };

//   if (loadingRefs) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading form...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       <div className="max-w-3xl mx-auto px-4 py-8">
//         <motion.div
//           className="space-y-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold mb-2">Create Prediction</h1>
//             <p className="text-muted-foreground">
//               Make a bold claim. Set the timeline. Let the world vote.
//             </p>
//           </div>

//           {/* Category / Field */}
//           <div className="space-y-2">
//             <Label>Category</Label>
//             <Select
//               value={selectedFieldId?.toString() ?? undefined}
//               onValueChange={(v) => setSelectedFieldId(Number(v))}
//             >
//               <SelectTrigger className="glass-card">
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent className="glass-card">
//                 {fields.map((f) => (
//                   <SelectItem key={f.id} value={f.id.toString()}>
//                     {f.fields}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Prediction Text */}
//           <div className="space-y-2">
//             <Label>Prediction</Label>
//             <Textarea
//               placeholder="What do you predict will happen?"
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               className="glass-card min-h-24"
//               maxLength={500}
//             />
//             <p className="text-xs text-muted-foreground text-right">{text.length}/500</p>
//           </div>

//           {/* Visibility */}
//           <div className="space-y-2">
//             <Label>Visibility</Label>
//             <RadioGroup
//               value={visibility}
//               onValueChange={(v) => setVisibility(v as 'public' | 'private')}
//             >
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="public" id="public" />
//                   <Label htmlFor="public" className="cursor-pointer">Public</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="private" id="private" />
//                   <Label htmlFor="private" className="cursor-pointer">Private</Label>
//                 </div>
//               </div>
//             </RadioGroup>
//           </div>

//           {/* Dates */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Voting End Date</Label>
//               <Input
//                 type="datetime-local"
//                 value={votingEndDate}
//                 onChange={(e) => setVotingEndDate(e.target.value)}
//                 className="glass-card"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>Result Publish Date (optional)</Label>
//               <Input
//                 type="datetime-local"
//                 value={resultPublishDate}
//                 onChange={(e) => setResultPublishDate(e.target.value)}
//                 className="glass-card"
//               />
//             </div>
//           </div>

//           {/* Answer Type */}
//           <div className="space-y-2">
//             <Label>Answer Type</Label>
//             <Select
//               value={answerType}
//               onValueChange={(v) => {
//                 setAnswerType(v as AnswerType);
//                 setMcqOptions(['', '']);
//                 setCorrectAnswer('');
//               }}
//             >
//               <SelectTrigger className="glass-card">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="yes-no">Yes / No</SelectItem>
//                 <SelectItem value="mcq">Multiple Choice</SelectItem>
//                 <SelectItem value="numeric">Numeric Value</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Correct Answer */}
//           <div className="space-y-2">
//             <Label>Correct Answer (for scoring)</Label>

//             {answerType === 'yes-no' && (
//               <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select correct answer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Yes">Yes</SelectItem>
//                   <SelectItem value="No">No</SelectItem>
//                 </SelectContent>
//               </Select>
//             )}

//             {answerType === 'mcq' && (
//               <Input
//                 placeholder="Type the correct option exactly"
//                 value={correctAnswer}
//                 onChange={(e) => setCorrectAnswer(e.target.value)}
//                 className="glass-card"
//               />
//             )}

//             {answerType === 'numeric' && (
//               <Input
//                 type="number"
//                 step="any"
//                 placeholder="e.g. 42 or 3.14"
//                 value={correctAnswer}
//                 onChange={(e) => setCorrectAnswer(e.target.value)}
//                 className="glass-card"
//               />
//             )}
//           </div>

//           {/* MCQ Options */}
//           {answerType === 'mcq' && (
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <Label>Options (2–6)</Label>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={handleAddOption}
//                   disabled={mcqOptions.length >= 6}
//                 >
//                   <Plus size={16} className="mr-1" /> Add
//                 </Button>
//               </div>

//               {mcqOptions.map((opt, i) => (
//                 <div key={i} className="flex gap-2 items-center">
//                   <Input
//                     value={opt}
//                     onChange={(e) => handleOptionChange(i, e.target.value)}
//                     placeholder={`Option ${i + 1}`}
//                     className="glass-card"
//                   />
//                   {mcqOptions.length > 2 && (
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleRemoveOption(i)}
//                     >
//                       <X size={16} />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Submit Button */}
//           <Button
//             className="w-full h-12 text-lg font-semibold"
//             onClick={handlePublish}
//             style={{
//               background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//             }}
//           >
//             Publish Prediction
//           </Button>
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }








// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Input } from '@/app/components/ui/input';
// import { Textarea } from '@/app/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/app/components/ui/select';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
// import { Label } from '@/app/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Plus, X, Globe, Flag, MapPin, Check, CalendarIcon, Lock, ArrowLeft, Users } from 'lucide-react';
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import { useAppSelector } from '@/app/store/hooks';

// // Import your API helpers
// import { getAuth, postAuth } from '@/util/api';

// // ────────────────────────────────────────────────
// // Types
// // ────────────────────────────────────────────────
// type AnswerType = 'yes-no' | 'mcq' | 'numeric' | 'datetime';

// interface Field {
//   id: number;
//   fields: string;
// }

// interface AnswerTypeBackend {
//   id: number;
//   ans_type: string;
// }

// const ANSWER_TYPE_MAP: Record<AnswerType, string> = {
//   'yes-no': 'Yes/No',
//   mcq: 'Multiple Choice',
//   numeric: 'Numeric',
//   datetime: 'DateTime',
// };

// interface MyGroup {
//   id: number;
//   name: string;
// }

// // ────────────────────────────────────────────────
// // Component
// // ────────────────────────────────────────────────
// export function CreatePredictionScreen() {
//   const navigate = useNavigate();
//   const { user: currentUser } = useAppSelector((state) => state.auth);
//   const isAdmin = currentUser?.role === 'admin';

//   // Form state
//   const [activeTab, setActiveTab] = useState('prediction');
//   const [text, setText] = useState('');
//   const [description, setDescription] = useState('');
//   const [locationScope, setLocationScope] = useState<'global' | 'country' | 'city'>('global');
//   const [visibility, setVisibility] = useState<'public' | 'private'>('public');
//   const [answerType, setAnswerType] = useState<AnswerType>('yes-no');
//   const [mcqOptions, setMcqOptions] = useState<string[]>(['', '']);
//   const [correctAnswer, setCorrectAnswer] = useState('');
//   const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
//   const [votingEndDate, setVotingEndDate] = useState('');
//   const [predictionOverDate, setPredictionOverDate] = useState('');
//   const [isReviewing, setIsReviewing] = useState(false);

//   // Poll specific state
//   const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
//   const [submitting, setSubmitting] = useState(false);

//   // Reference data
//   const [fields, setFields] = useState<Field[]>([]);
//   const [answerTypes, setAnswerTypes] = useState<AnswerTypeBackend[]>([]);
//   const [loadingRefs, setLoadingRefs] = useState(true);
//   const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

//   // Field modal state
//   const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
//   const [newFieldName, setNewFieldName] = useState('');
//   const [isAddingField, setIsAddingField] = useState(false);

//   // Group sharing state
//   const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
//   const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

//   // ── Load reference data (protected endpoints) ─────────────
//   useEffect(() => {
//     const loadReferenceData = async () => {
//       try {
//         setLoadingRefs(true);

//         const [fieldsRes, typesRes, groupsRes] = await Promise.all([
//           getAuth('/api/fields'),
//           getAuth('/api/answer-types'),
//           getAuth('/api/groups?my_groups=1'),
//         ]);

//         const fieldData = fieldsRes?.data ?? fieldsRes ?? [];
//         const typeData = typesRes?.data ?? typesRes ?? [];
//         const groupData = groupsRes?.data ?? groupsRes ?? [];

//         setFields(fieldData);
//         setAnswerTypes(typeData);
//         setMyGroups(groupData);

//         if (fieldData.length > 0) {
//           setSelectedFieldId(fieldData[0].id);
//         }
//       } catch (err: any) {
//         console.error('Failed to load reference data:', err);
//         if (err.status === 401) {
//           toast.error('Session expired. Please log in again.');
//           navigate('/login');
//         } else {
//           toast.error('Failed to load categories & answer types');
//         }
//       } finally {
//         setLoadingRefs(false);
//       }
//     };

//     loadReferenceData();
//   }, [navigate]);

//   // ── Format local datetime to MySQL format ───────
//   const formatToMySQLDateTime = (dateStr: string): string | null => {
//     if (!dateStr) return null;
//     try {
//       const date = new Date(dateStr);
//       if (isNaN(date.getTime())) return null;
//       const pad = (n: number) => String(n).padStart(2, '0');
//       return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
//     } catch {
//       return null;
//     }
//   };

//   // ── Handlers ───────────────────────────────────
//   const handleAddOption = () => {
//     if (mcqOptions.length < 6) {
//       setMcqOptions([...mcqOptions, '']);
//     }
//   };

//   const handleRemoveOption = (index: number) => {
//     if (mcqOptions.length > 2) {
//       setMcqOptions(mcqOptions.filter((_, i) => i !== index));
//     }
//   };

//   const handleOptionChange = (index: number, value: string) => {
//     const updated = [...mcqOptions];
//     updated[index] = value;
//     setMcqOptions(updated);
//   };

//   const handleAddPollOption = () => {
//     if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
//   };

//   const handleRemovePollOption = (index: number) => {
//     if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
//   };

//   const handlePollOptionChange = (index: number, value: string) => {
//     const updated = [...pollOptions];
//     updated[index] = value;
//     setPollOptions(updated);
//   };

//   const toggleGroupSelection = (id: number) => {
//     setSelectedGroupIds(prev =>
//       prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
//     );
//   };

//   const handleAddField = async () => {
//     if (!newFieldName.trim()) return toast.error('Please enter a category name');
//     try {
//       setIsAddingField(true);
//       const res = await postAuth('/api/fields', { fields: newFieldName.trim() });
//       toast.success('Category added successfully!');

//       const newField = { id: res.id, fields: res.fields };
//       setFields((prev) => [...prev, newField]);
//       setSelectedFieldId(res.id);

//       setIsFieldModalOpen(false);
//       setNewFieldName('');
//     } catch (err: any) {
//       console.error('Failed to add category:', err);
//       toast.error(err.response?.data?.message || 'Failed to add category');
//     } finally {
//       setIsAddingField(false);
//     }
//   };


//   const handlePublishPoll = async () => {
//     if (!text.trim()) return toast.error('Please enter a poll question');
//     if (selectedFieldId === null) return toast.error('Please select a category');
//     if (!votingEndDate) return toast.error('Please set voting end date');

//     const validOptions = pollOptions.filter(o => o.trim());
//     if (validOptions.length < 2) return toast.error('At least 2 poll options required');

//     const payload = {
//       field_id: selectedFieldId,
//       questions: text.trim(),
//       options: validOptions,
//       correct_answer: pollCorrectAnswer || 'N/A',
//       visibility,
//       end_date: formatToMySQLDateTime(votingEndDate),
//       group_ids: selectedGroupIds,
//     };

//     try {
//       setSubmitting(true);
//       await postAuth('/api/polls', payload);
//       toast.success('Poll created successfully!');
//       setTimeout(() => navigate('/polls'), 900);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to create poll');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handlePublish = async () => {
//     if (activeTab === 'poll') {
//       return handlePublishPoll();
//     }

//     // --- Step 1: Validation & Review Transition ---
//     if (!isReviewing) {
//       if (!text.trim()) return toast.error('Please write your prediction');
//       if (selectedFieldId === null) return toast.error('Please select a category');
//       if (!predictionOverDate) return toast.error('Please set the Prediction Over date');

//       const predDate = new Date(predictionOverDate);
//       if (predDate <= new Date()) return toast.error('Prediction Over date must be in the future');

//       if (votingEndDate) {
//         const vDate = new Date(votingEndDate);
//         if (vDate <= new Date()) return toast.error('Voting end date must be in the future');
//         if (vDate >= predDate) return toast.error('Voting must end before the prediction is over');
//       }

//       return setIsReviewing(true); // Switch to review screen
//     }

//     // --- Step 2: Confirmation & Publishing ---
//     const selectedType = answerTypes.find(t => t.ans_type === 'Yes/No');
//     if (!selectedType) return toast.error('Standard answer type "Yes/No" not found');

//     const payload: Record<string, any> = {
//       field_id: selectedFieldId,
//       questions: text.trim(),
//       description: description.trim() || null,
//       location_scope: 'global', // Hidden from UI, defaults to global
//       ans_type_id: selectedType.id,
//       visibility,
//       start_date: formatToMySQLDateTime(new Date().toISOString().slice(0, 16)),
//       end_date: formatToMySQLDateTime(predictionOverDate),
//       voting_end_date: votingEndDate ? formatToMySQLDateTime(votingEndDate) : null,
//       options: ['Yes', 'No', 'Vague'],
//       group_ids: selectedGroupIds,
//     };

//     try {
//       setSubmitting(true);
//       await postAuth('/api/predictions', payload);
//       toast.success('Your prediction has been standardized!');
//       setTimeout(() => navigate('/home'), 900);
//     } catch (err: any) {
//       console.error('Publish failed:', err);
//       toast.error(err.message || 'Failed to create prediction');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loadingRefs) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-muted-foreground">
//         Loading form data...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <motion.div
//           className="glass-card rounded-3xl border border-border/30 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           {/* Decorative floating icons */}
//           <div className="absolute -top-8 -right-8 opacity-10 pointer-events-none">
//             <Users size={120} className="text-[#a855f7]" />
//           </div>
//           <div className="mb-6">
//             <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
//               {isReviewing ? 'Review Your Prediction' : 'Create New Prediction'}
//             </h1>
//             <p className="text-slate-500 text-sm max-w-2xl">
//               {isReviewing
//                 ? 'Double‑check your details before publishing.'
//                 : 'Craft a bold prediction and let the community weigh in.'}
//             </p>
//           </div>

//           {!isReviewing && (
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
//             <TabsContent value="prediction" className="space-y-7 focus:outline-none">
//               <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-7 shadow-2xl">
//                 {/* Category Picker */}
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <Label className="text-sm font-medium text-slate-700">Category</Label>
//                     {isAdmin && (
//                       <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
//                         <DialogTrigger asChild>
//                           <Button variant="outline" size="sm" className="text-xs font-bold uppercase tracking-widest">
//                             + Add
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="glass-card border-border">
//                           <DialogHeader>
//                             <DialogTitle className="text-lg font-bold">New Category</DialogTitle>
//                           </DialogHeader>
//                           <div className="space-y-3 py-3">
//                             <Input
//                               placeholder="e.g. Technology, Sports"
//                               value={newFieldName}
//                               onChange={e => setNewFieldName(e.target.value)}
//                               className="glass-card border-border h-10"
//                             />
//                             <Button
//                               onClick={handleAddField}
//                               disabled={isAddingField}
//                               className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white"
//                             >
//                               {isAddingField ? 'Adding…' : 'Create'}
//                             </Button>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     )}
//                   </div>
//                   <Select value={selectedFieldId?.toString() ?? ''} onValueChange={v => setSelectedFieldId(Number(v))}>
//                     <SelectTrigger className="glass-card border-border h-11">
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent className="glass-card border-border">
//                       {fields.map(f => (
//                         <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Question */}
//                 <div className="space-y-2">
//                   <Label className="text-sm font-semibold ml-1">Your Prediction</Label>
//                   <Textarea
//                     placeholder="Your bold prediction..."
//                     value={text}
//                     onChange={e => setText(e.target.value)}
//                     className="glass-card border-border min-h-32 p-4 text-base text-slate-800"
//                     maxLength={500}
//                   />
//                   <div className="flex justify-end mt-1">
//                     <span className="text-xs text-slate-500">{text.length}/500</span>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium text-slate-700">Description <span className="text-slate-400 italic">(optional)</span></Label>
//                   <Textarea
//                     placeholder="Provide context or evidence..."
//                     value={description}
//                     onChange={e => setDescription(e.target.value)}
//                     className="glass-card border-border min-h-24 p-3 text-sm text-slate-700"
//                   />
//                 </div>

//                 {/* Timing & Visibility */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-slate-700">Prediction Ends<span className="ml-2 text-xs text-slate-500">(required)</span></Label>
//                     <Input
//                       type="datetime-local"
//                       value={predictionOverDate}
//                       onChange={e => setPredictionOverDate(e.target.value)}
//                       className="glass-card border-border h-10 text-slate-800"
//                       min={new Date().toISOString().slice(0, 16)}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-slate-700">Voting Ends <span className="ml-2 text-xs text-slate-500">(optional)</span></Label>
//                     <Input
//                       type="datetime-local"
//                       value={votingEndDate}
//                       onChange={e => setVotingEndDate(e.target.value)}
//                       className="glass-card border-border h-10 text-slate-800"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2 pt-2">
//                   <Label className="text-sm font-medium text-slate-700">Visibility</Label>
//                   <RadioGroup
//                     value={visibility}
//                     onValueChange={v => setVisibility(v as any)}
//                     className="flex h-10 gap-4 items-center"
//                   >
//                     <div className="flex items-center space-x-1">
//                       <RadioGroupItem value="public" id="vis-public" />
//                       <Label htmlFor="vis-public" className="cursor-pointer text-sm">Public</Label>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <RadioGroupItem value="private" id="vis-private" />
//                       <Label htmlFor="vis-private" className="cursor-pointer text-sm">Private</Label>
//                     </div>
//                   </RadioGroup>
//                 </div>

//                 {/* Group Selection */}
//                 {visibility === 'private' && myGroups.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     className="space-y-3 pt-2"
//                   >
//                     <Label className="text-sm font-semibold ml-1">Share with Groups</Label>
//                     <div className="flex flex-wrap gap-2">
//                       {myGroups.map(group => (
//                         <button
//                           key={group.id}
//                           type="button"
//                           onClick={() => toggleGroupSelection(group.id)}
//                           className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all truncate max-w-[200px] ${selectedGroupIds.includes(group.id)
//                             ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]'
//                             : 'bg-muted border-border text-muted-foreground hover:bg-muted/50'
//                             }`}
//                         >
//                           <span className="truncate">{group.name}</span>
//                           {selectedGroupIds.includes(group.id) && <Check size={14} />}
//                         </button>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}

//                 <Button
//                   className="w-full h-14 text-lg font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99]"
//                   onClick={handlePublish}
//                   disabled={submitting}
//                   style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
//                 >
//                   {submitting ? 'Processing...' : 'Review Prediction'}
//                 </Button>

//                 <div className="pt-4 text-center">
//                   <Button variant="link" size="sm" onClick={() => setActiveTab('poll')} className="text-xs">
//                     Switch to Poll Creation
//                   </Button>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="poll" className="space-y-7 focus:outline-none">
//               <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-7 shadow-2xl">
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label className="text-sm font-semibold ml-1">Category</Label>
//                   </div>
//                   <Select value={selectedFieldId?.toString() ?? ''} onValueChange={v => setSelectedFieldId(Number(v))}>
//                     <SelectTrigger className="glass-card border-border h-12">
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent className="glass-card font-inter">
//                       {fields.map(f => (
//                         <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm font-semibold ml-1">Poll Question</Label>
//                   <Textarea
//                     placeholder="What would you like to ask?"
//                     value={text}
//                     onChange={e => setText(e.target.value)}
//                     className="glass-card border-border min-h-32 p-4 text-lg"
//                     maxLength={500}
//                   />
//                   <div className="flex justify-end pr-1">
//                     <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{text.length}/500</span>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <Label className="text-sm font-semibold">Options (2–6)</Label>
//                     <Button variant="outline" size="sm" onClick={handleAddPollOption} disabled={pollOptions.length >= 6}>
//                       <Plus size={14} className="mr-1.5" /> Add
//                     </Button>
//                   </div>
//                   <div className="grid grid-cols-1 gap-3">
//                     {pollOptions.map((opt, i) => (
//                       <div key={i} className="flex gap-2">
//                         <Input
//                           value={opt}
//                           onChange={e => handlePollOptionChange(i, e.target.value)}
//                           placeholder={`Option ${i + 1}`}
//                           className="glass-card border-border h-11"
//                         />
//                         {pollOptions.length > 2 && (
//                           <Button variant="ghost" size="icon" onClick={() => handleRemovePollOption(i)} className="text-red-400">
//                             <X size={18} />
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-2 pt-2 border-t border-border/50 mt-4">
//                   <Label className="text-sm font-semibold ml-1">Correct Answer</Label>
//                   <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
//                     <SelectTrigger className="glass-card border-border h-12">
//                       <SelectValue placeholder="Identify the correct result" />
//                     </SelectTrigger>
//                     <SelectContent className="glass-card">
//                       {pollOptions.filter(opt => opt.trim()).map((opt, i) => (
//                         <SelectItem key={i} value={opt.trim()}>{opt.trim()}</SelectItem>
//                       ))}
//                       <SelectItem value="N/A">None / General Opinion</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold ml-1">Due Date (Voting Ends)</Label>
//                     <Input
//                       type="datetime-local"
//                       value={votingEndDate}
//                       onChange={e => setVotingEndDate(e.target.value)}
//                       className="glass-card border-border h-12 text-foreground"
//                       min={new Date().toISOString().slice(0, 16)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold ml-1">Visibility</Label>
//                     <RadioGroup
//                       value={visibility}
//                       onValueChange={v => setVisibility(v as any)}
//                       className="flex h-12 gap-6 items-center"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="public" id="poll-public" />
//                         <Label htmlFor="poll-public" className="cursor-pointer">Public</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="private" id="poll-private" />
//                         <Label htmlFor="poll-private" className="cursor-pointer">Private</Label>
//                       </div>
//                     </RadioGroup>
//                   </div>
//                 </div>

//                 {/* Group Selection for Private Polls */}
//                 {visibility === 'private' && myGroups.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     className="space-y-3 pt-2"
//                   >
//                     <Label className="text-sm font-semibold ml-1">Share with Groups (Optional)</Label>
//                     <div className="flex flex-wrap gap-2">
//                       {myGroups.map(group => (
//                         <button
//                           key={group.id}
//                           type="button"
//                           onClick={() => toggleGroupSelection(group.id)}
//                           className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all truncate max-w-[200px] ${selectedGroupIds.includes(group.id)
//                             ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]'
//                             : 'bg-muted border-border text-muted-foreground hover:bg-muted/50'
//                             }`}
//                         >
//                           <span className="truncate">{group.name}</span>
//                           {selectedGroupIds.includes(group.id) && <Check size={14} />}
//                         </button>
//                       ))}
//                     </div>
//                     <p className="text-[10px] text-muted-foreground ml-1">Members of these groups will be able to see this private poll.</p>
//                   </motion.div>
//                 )}

//                 <Button
//                   className="w-full h-14 text-lg font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99] mt-4"
//                   onClick={handlePublish}
//                   disabled={submitting}
//                   style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
//                 >
//                   {submitting ? 'Publishing...' : 'Publish Poll'}
//                 </Button>

//                 {/* Subtle switch back to Predictions */}
//                 <div className="pt-6 text-center">
//                   <button 
//                     type="button"
//                     onClick={() => setActiveTab('prediction')}
//                     className="text-xs text-muted-foreground/60 hover:text-primary transition-colors font-semibold underline underline-offset-4"
//                   >
//                     Create a Prediction instead?
//                   </button>
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//           )}

//           {isReviewing && activeTab === 'prediction' && (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.98 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="glass-card rounded-3xl border border-border/50 p-6 md:p-10 space-y-8 shadow-2xl relative overflow-hidden"
//             >
//               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
              
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
//                     {fields.find(f => f.id === selectedFieldId)?.fields || 'General'}
//                   </span>
//                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
//                     {visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
//                     {visibility}
//                   </span>
//                 </div>

//                 <div>
//                   <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
//                     {text}
//                   </h2>
//                   {description && (
//                     <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic border-l-2 border-border pl-4">
//                       {description}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
//                   <div className="p-4 bg-muted/40 rounded-2xl border border-border/40">
//                     <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Voting Ends</p>
//                     <p className="text-sm font-semibold">
//                       {votingEndDate ? format(new Date(votingEndDate), 'MMM dd, yyyy HH:mm') : 'When prediction ends'}
//                     </p>
//                   </div>
//                   <div className="p-4 bg-muted/40 rounded-2xl border border-border/40">
//                     <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Prediction Over</p>
//                     <p className="text-sm font-semibold text-primary">
//                       {format(new Date(predictionOverDate), 'MMM dd, yyyy HH:mm')}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-3 pt-6">
//                 <Button
//                   className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
//                   onClick={handlePublish}
//                   disabled={submitting}
//                   style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
//                 >
//                   {submitting ? 'Standardizing...' : 'Confirm & Publish'}
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   className="w-full h-12 text-muted-foreground font-semibold hover:text-foreground"
//                   onClick={() => setIsReviewing(false)}
//                 >
//                   <ArrowLeft size={16} className="mr-2" /> Back to Edit
//                 </Button>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }














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
        if (vDate >= predDate) return toast.error('Voting must end before prediction ends');
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
        <RadioGroup value={visibility} onValueChange={v => setVisibility(v as any)}
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
                <SectionHeading icon={Calendar} label="Timing" paletteIndex={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Prediction ends <span className="text-[#ec4899]">*</span>
                    </Label>
                    <Input type="datetime-local" value={predictionOverDate}
                      onChange={e => setPredictionOverDate(e.target.value)}
                      className="bg-white border-border h-10"
                      min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Voting ends <span className="text-muted-foreground/50">(optional)</span>
                    </Label>
                    <Input type="datetime-local" value={votingEndDate}
                      onChange={e => setVotingEndDate(e.target.value)}
                      className="bg-white border-border h-10" />
                  </div>
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
