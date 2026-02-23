
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';

// Import your API helpers (adjust alias/path based on your vite.config.ts)
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

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export function CreatePredictionScreen() {
  const navigate = useNavigate();

  // Form state
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [answerType, setAnswerType] = useState<AnswerType>('yes-no');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');

  // Reference data
  const [fields, setFields] = useState<Field[]>([]);
  const [answerTypes, setAnswerTypes] = useState<AnswerTypeBackend[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Field modal state
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  // ── Load reference data (protected endpoints) ─────────────
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingRefs(true);

        const [fieldsRes, typesRes] = await Promise.all([
          getAuth('/api/fields'),
          getAuth('/api/answer-types'),
        ]);

        const fieldData = fieldsRes?.data ?? fieldsRes ?? [];
        const typeData = typesRes?.data ?? typesRes ?? [];

        setFields(fieldData);
        setAnswerTypes(typeData);

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

  const handlePublish = async () => {
    // Validation
    if (!text.trim()) return toast.error('Please write your prediction');
    if (selectedFieldId === null) return toast.error('Please select a category');
    if (!votingEndDate) return toast.error('Please set voting end date');
    if (!correctAnswer.trim()) return toast.error('Please provide the correct answer');

    if (answerType === 'mcq') {
      const validOptions = mcqOptions.filter(o => o.trim());
      if (validOptions.length < 2) return toast.error('At least 2 valid options required');
      if (!validOptions.includes(correctAnswer.trim())) {
        return toast.error('Correct answer must match one of the options exactly');
      }
    }

    const endDate = new Date(votingEndDate);
    if (endDate <= new Date()) return toast.error('Voting end date must be in the future');

    const selectedType = answerTypes.find(t => t.ans_type === ANSWER_TYPE_MAP[answerType]);
    if (!selectedType) return toast.error('Selected answer type not found');

    const payload: Record<string, any> = {
      field_id: selectedFieldId,
      questions: text.trim(),
      ans_type_id: selectedType.id,
      correct_answer: correctAnswer.trim(),
      visibility,
      start_date: formatToMySQLDateTime(new Date().toISOString().slice(0, 16)),
      end_date: formatToMySQLDateTime(votingEndDate),
    };

    if (answerType === 'mcq') {
      payload.options = mcqOptions.filter(o => o.trim());
    }

    console.log('Sending payload:', payload);

    try {
      await postAuth('/api/questions', payload);
      toast.success('Prediction created successfully!');
      setTimeout(() => navigate('/home'), 900);
    } catch (err: any) {
      console.error('Publish failed:', err);
      let message = err.message || 'Failed to create prediction';

      if (err.status === 401) {
        message = 'Session expired. Please log in again.';
        // You can also call logout() here if you want
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      toast.error(message);
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
            <h1 className="text-3xl font-bold mb-2">Create Prediction</h1>
            <p className="text-muted-foreground">
              Make a bold claim. Set the timeline. Let the world vote.
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Category</Label>
              <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 glass-card border flex items-center">
                    <Plus size={14} className="mr-1" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        placeholder="e.g. Technology, Sports..."
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="glass-card"
                      />
                    </div>
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
            <Select
              value={selectedFieldId?.toString() ?? ''}
              onValueChange={v => setSelectedFieldId(Number(v))}
            >
              <SelectTrigger className="glass-card">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.fields}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prediction Text */}
          <div className="space-y-2">
            <Label>Prediction</Label>
            <Textarea
              placeholder="What do you predict will happen?"
              value={text}
              onChange={e => setText(e.target.value)}
              className="glass-card min-h-28 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {text.length}/500
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={v => setVisibility(v as 'public' | 'private')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer">Public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">Private</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Voting End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Voting Ends</Label>
              <Input
                type="datetime-local"
                value={votingEndDate}
                onChange={e => setVotingEndDate(e.target.value)}
                className="glass-card"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            {/* Uncomment if you decide to use result publish date */}
            {/* <div className="space-y-2">
              <Label>Result Publish (optional)</Label>
              <Input type="datetime-local" className="glass-card" />
            </div> */}
          </div>

          {/* Answer Type */}
          <div className="space-y-2">
            <Label>Answer Type</Label>
            <Select
              value={answerType}
              onValueChange={v => {
                setAnswerType(v as AnswerType);
                setMcqOptions(['', '']);
                setCorrectAnswer('');
              }}
            >
              <SelectTrigger className="glass-card">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes-no">Yes / No</SelectItem>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="numeric">Numeric Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label>Correct Answer (for scoring)</Label>

            {answerType === 'yes-no' && (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger className="glass-card">
                  <SelectValue placeholder="Choose correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            )}

            {answerType === 'mcq' && (
              <Input
                placeholder="Type correct option exactly"
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="glass-card"
              />
            )}

            {answerType === 'numeric' && (
              <Input
                type="number"
                step="any"
                placeholder="e.g. 42 or 3.14"
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="glass-card"
              />
            )}
          </div>

          {/* MCQ Options */}
          {answerType === 'mcq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options (2–6)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={mcqOptions.length >= 6}
                >
                  <Plus size={16} className="mr-1.5" /> Add Option
                </Button>
              </div>

              {mcqOptions.map((opt, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Input
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="glass-card flex-1"
                  />
                  {mcqOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(i)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full h-12 text-lg font-semibold mt-8"
            onClick={handlePublish}
            disabled={loadingRefs}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            }}
          >
            Publish Prediction
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}