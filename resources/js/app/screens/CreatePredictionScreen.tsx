
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








import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Plus, X, Globe, Flag, MapPin, Check, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';

// Import your API helpers
import { getAuth, postAuth } from '@/util/api';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type AnswerType = 'yes-no' | 'mcq' | 'numeric' | 'datetime';

interface Field {
  id: number;
  fields: string;
}

interface AnswerTypeBackend {
  id: number;
  ans_type: string;
}

const ANSWER_TYPE_MAP: Record<AnswerType, string> = {
  'yes-no': 'Yes/No',
  mcq: 'Multiple Choice',
  numeric: 'Numeric',
  datetime: 'DateTime',
};

interface MyGroup {
  id: number;
  name: string;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export function CreatePredictionScreen() {
  const navigate = useNavigate();

  // Form state
  const [activeTab, setActiveTab] = useState('prediction');
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [locationScope, setLocationScope] = useState<'global' | 'country' | 'city'>('global');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [answerType, setAnswerType] = useState<AnswerType>('yes-no');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');

  // Poll specific state
  const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
  const [submitting, setSubmitting] = useState(false);

  // Reference data
  const [fields, setFields] = useState<Field[]>([]);
  const [answerTypes, setAnswerTypes] = useState<AnswerTypeBackend[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Field modal state
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  // Group sharing state
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  // ── Load reference data (protected endpoints) ─────────────
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingRefs(true);

        const [fieldsRes, typesRes, groupsRes] = await Promise.all([
          getAuth('/api/fields'),
          getAuth('/api/answer-types'),
          getAuth('/api/groups?my_groups=1'),
        ]);

        const fieldData = fieldsRes?.data ?? fieldsRes ?? [];
        const typeData = typesRes?.data ?? typesRes ?? [];
        const groupData = groupsRes?.data ?? groupsRes ?? [];

        setFields(fieldData);
        setAnswerTypes(typeData);
        setMyGroups(groupData);

        if (fieldData.length > 0) {
          setSelectedFieldId(fieldData[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load reference data:', err);
        if (err.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Failed to load categories & answer types');
        }
      } finally {
        setLoadingRefs(false);
      }
    };

    loadReferenceData();
  }, [navigate]);

  // ── Format local datetime to MySQL format ───────
  const formatToMySQLDateTime = (dateStr: string): string | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    } catch {
      return null;
    }
  };

  // ── Handlers ───────────────────────────────────
  const handleAddOption = () => {
    if (mcqOptions.length < 6) {
      setMcqOptions([...mcqOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (mcqOptions.length > 2) {
      setMcqOptions(mcqOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...mcqOptions];
    updated[index] = value;
    setMcqOptions(updated);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const toggleGroupSelection = (id: number) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return toast.error('Please enter a category name');
    try {
      setIsAddingField(true);
      const res = await postAuth('/api/fields', { fields: newFieldName.trim() });
      toast.success('Category added successfully!');

      const newField = { id: res.id, fields: res.fields };
      setFields((prev) => [...prev, newField]);
      setSelectedFieldId(res.id);

      setIsFieldModalOpen(false);
      setNewFieldName('');
    } catch (err: any) {
      console.error('Failed to add category:', err);
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setIsAddingField(false);
    }
  };

  const handlePublishPoll = async () => {
    if (!text.trim()) return toast.error('Please enter a poll question');
    if (selectedFieldId === null) return toast.error('Please select a category');
    if (!votingEndDate) return toast.error('Please set voting end date');

    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length < 2) return toast.error('At least 2 poll options required');

    const payload = {
      field_id: selectedFieldId,
      questions: text.trim(),
      options: validOptions,
      correct_answer: pollCorrectAnswer || 'N/A',
      visibility,
      end_date: formatToMySQLDateTime(votingEndDate),
      group_ids: selectedGroupIds,
    };

    try {
      setSubmitting(true);
      await postAuth('/api/polls', payload);
      toast.success('Poll created successfully!');
      setTimeout(() => navigate('/polls'), 900);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (activeTab === 'poll') {
      return handlePublishPoll();
    }

    // Prediction Validation
    if (!text.trim()) return toast.error('Please write your prediction');
    if (selectedFieldId === null) return toast.error('Please select a category');
    if (!votingEndDate) return toast.error('Please set voting end date');
    if (!correctAnswer.trim()) return toast.error('Please provide the correct answer');

    const endDate = new Date(votingEndDate);
    if (endDate <= new Date()) return toast.error('Voting end date must be in the future');

    const selectedType = answerTypes.find(t => t.ans_type === 'Yes/No');
    if (!selectedType) return toast.error('Standard answer type "Yes/No" not found');

    const payload: Record<string, any> = {
      field_id: selectedFieldId,
      questions: text.trim(),
      description: description.trim() || null,
      location_scope: locationScope,
      ans_type_id: selectedType.id,
      correct_answer: correctAnswer.trim(),
      visibility,
      start_date: formatToMySQLDateTime(new Date().toISOString().slice(0, 16)),
      end_date: formatToMySQLDateTime(votingEndDate),
      options: ['Yes', 'No'],
      group_ids: selectedGroupIds,
    };

    try {
      setSubmitting(true);
      await postAuth('/api/predictions', payload);
      toast.success('Prediction created successfully!');
      setTimeout(() => navigate('/home'), 900);
    } catch (err: any) {
      console.error('Publish failed:', err);
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





  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          className="space-y-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Content</h1>
            <p className="text-muted-foreground">
              Share your thoughts or ask the community what they think.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 glass-card border p-1 rounded-2xl h-14">
              <TabsTrigger value="prediction" className="rounded-xl h-full text-base">Predictions</TabsTrigger>
              <TabsTrigger value="poll" className="rounded-xl h-full text-base">Polls</TabsTrigger>
            </TabsList>

            <TabsContent value="prediction" className="space-y-7 focus:outline-none">
              {/* Prediction Specific Content */}
              <div className="glass-card rounded-3xl border border-white/5 p-6 md:p-8 space-y-7 shadow-2xl">
                {/* Category Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold ml-1">Category</Label>
                    <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 glass-card border border-white/10 hover:bg-white/5">
                          <Plus size={14} className="mr-1.5" /> Add Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border border-white/10">
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Input
                            placeholder="e.g. Technology, Sports..."
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            className="glass-card border-white/10"
                          />
                          <Button
                            className="w-full"
                            onClick={handleAddField}
                            disabled={isAddingField}
                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                          >
                            {isAddingField ? 'Adding...' : 'Add Category'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select value={selectedFieldId?.toString() ?? ''} onValueChange={v => setSelectedFieldId(Number(v))}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                      {fields.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold ml-1">Your Prediction</Label>
                  <Textarea
                    placeholder="What do you predict will happen?"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="glass-card border-white/10 min-h-32 p-4 text-lg"
                    maxLength={500}
                  />
                  <div className="flex justify-end pr-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{text.length}/500</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold ml-1">Description <span className="text-white/30">(optional)</span></Label>
                  <Textarea
                    placeholder="Add context or evidence for your prediction..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="glass-card border-white/10 min-h-24 p-4"
                  />
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold ml-1">Location Scope</Label>
                    <Select
                      value={locationScope}
                      onValueChange={v => setLocationScope(v as any)}
                    >
                      <SelectTrigger className="glass-card border-white/10 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="global"><div className="flex items-center gap-2"><Globe size={14} className="text-blue-400" /> Global</div></SelectItem>
                        <SelectItem value="country"><div className="flex items-center gap-2"><Flag size={14} className="text-red-400" /> Country</div></SelectItem>
                        <SelectItem value="city"><div className="flex items-center gap-2"><MapPin size={14} className="text-green-400" /> City</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <RadioGroup
                      value={visibility}
                      onValueChange={v => setVisibility(v as any)}
                      className="flex h-12 gap-6 items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="p-public" />
                        <Label htmlFor="p-public" className="cursor-pointer">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="p-private" />
                        <Label htmlFor="p-private" className="cursor-pointer">Private</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Group Selection for Private Predictions */}
                {visibility === 'private' && myGroups.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2"
                  >
                    <Label className="text-sm font-semibold ml-1">Share with Groups (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {myGroups.map(group => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => toggleGroupSelection(group.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all truncate max-w-[200px] ${selectedGroupIds.includes(group.id)
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                        >
                          <span className="truncate">{group.name}</span>
                          {selectedGroupIds.includes(group.id) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">Members of these groups will be able to see this private prediction.</p>
                  </motion.div>
                )}

                {/* Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold ml-1">Due Date (Voting Ends)</Label>
                    <Input
                      type="datetime-local"
                      value={votingEndDate}
                      onChange={e => setVotingEndDate(e.target.value)}
                       className="glass-card border-white/10 h-12 text-white 
             [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert 
             [&::-webkit-calendar-picker-indicator]:brightness-0 
             [&::-webkit-calendar-picker-indicator]:hue-rotate(180deg)"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    
                  </div>
                </div>



                {/* Correct Answer */}
                <div className="space-y-2 pt-2 border-t border-white/5 mt-4">
                  <Label className="text-sm font-semibold ml-1">Correct Answer (Expected Outcome)</Label>
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue placeholder="Choose expected result" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="Yes">Yes (Achieved)</SelectItem>
                      <SelectItem value="No">No (Not Achieved)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <Button
                  className="w-full h-14 text-lg font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99]"
                  onClick={handlePublish}
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Prediction'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="poll" className="space-y-7 focus:outline-none">
              <div className="glass-card rounded-3xl border border-white/5 p-6 md:p-8 space-y-7 shadow-2xl">
                {/* Same Category Picker for Polls */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold ml-1">Category</Label>
                  <Select value={selectedFieldId?.toString() ?? ''} onValueChange={v => setSelectedFieldId(Number(v))}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card font-inter">
                      {fields.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Poll Question */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold ml-1">Poll Question</Label>
                  <Textarea
                    placeholder="What would you like to ask?"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="glass-card border-white/10 min-h-32 p-4 text-lg"
                    maxLength={500}
                  />
                  <div className="flex justify-end pr-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{text.length}/500</span>
                  </div>
                </div>

                {/* Poll Options */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Options (2–6)</Label>
                    <Button variant="outline" size="sm" onClick={handleAddPollOption} disabled={pollOptions.length >= 6}>
                      <Plus size={14} className="mr-1.5" /> Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={e => handlePollOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="glass-card border-white/10 h-11"
                        />
                        {pollOptions.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemovePollOption(i)} className="text-red-400">
                            <X size={18} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer for Poll */}
                <div className="space-y-2 pt-2 border-t border-white/5 mt-4">
                  <Label className="text-sm font-semibold ml-1">Correct Answer (Optional Rewards)</Label>
                  <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
                    <SelectTrigger className="glass-card border-white/10 h-12">
                      <SelectValue placeholder="Identify the correct result" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {pollOptions.filter(opt => opt.trim()).map((opt, i) => (
                        <SelectItem key={i} value={opt.trim()}>{opt.trim()}</SelectItem>
                      ))}
                      <SelectItem value="N/A">None / General Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground ml-1">Correct voters will earn 10 points when the poll is resolved.</p>
                </div>

                {/* Timing & Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold ml-1">Due Date (Voting Ends)</Label>
                    <Input
                      type="datetime-local"
                      value={votingEndDate}
                      onChange={e => setVotingEndDate(e.target.value)}
                      className="glass-card border-white/10 h-12 text-white 
             [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert 
             [&::-webkit-calendar-picker-indicator]:brightness-0 
             [&::-webkit-calendar-picker-indicator]:hue-rotate(180deg)"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold ml-1">Visibility</Label>
                    <RadioGroup
                      value={visibility}
                      onValueChange={v => setVisibility(v as any)}
                      className="flex h-12 gap-6 items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="poll-public" />
                        <Label htmlFor="poll-public" className="cursor-pointer">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="poll-private" />
                        <Label htmlFor="poll-private" className="cursor-pointer">Private</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Group Selection for Private Polls */}
                {visibility === 'private' && myGroups.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2"
                  >
                    <Label className="text-sm font-semibold ml-1">Share with Groups (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {myGroups.map(group => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => toggleGroupSelection(group.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all truncate max-w-[200px] ${selectedGroupIds.includes(group.id)
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                        >
                          <span className="truncate">{group.name}</span>
                          {selectedGroupIds.includes(group.id) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">Members of these groups will be able to see this private poll.</p>
                  </motion.div>
                )}

                <Button
                  className="w-full h-14 text-lg font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99] mt-4"
                  onClick={handlePublish}
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Poll'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}