import React, { useState } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Save,
  Send,
  MoreVertical,
  Layers,
  FileText,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Type,
  HelpCircle,
  CheckSquare,
  Sliders,
  Wind,
  Volume2,
  Smile,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  Play,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Table as TableIcon,
  Copy,
  UploadCloud,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { audioEngine } from '../../admin/activities/utils/therapeuticAudioEngine';
import { cn } from '@/lib/utils';

export type QuenzaElementType =
  | 'text'
  | 'open_question'
  | 'multiple_choice'
  | 'scale_rating'
  | 'breathing_pacer'
  | 'checklist'
  | 'voice_guide';

export interface QuenzaElement {
  id: string;
  type: QuenzaElementType;
  title: string;
  description?: string;
  content?: string;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  items?: string[];
  breathType?: 'diaphragmatic' | 'box' | '478';
  voiceScript?: string;
}

export interface QuenzaActivityData {
  id?: string | number;
  title: string;
  format?: 'Exercise' | 'Assessment' | 'Lesson' | 'Meditation' | 'Breathwork' | 'Journal' | 'Form' | string;
  category?: string;
  difficulty?: string;
  duration?: string;
  description?: string;
  instructions?: string;
  imageUrl?: string;
  enablePageBreaks?: boolean;
  elements: QuenzaElement[];
  assignedTo?: string[];
  clientAssignments?: any[];
  frequency?: string;
  timeOfDay?: string;
  [key: string]: any;
}

interface QuenzaActivityStudioProps {
  initialData?: QuenzaActivityData | null;
  onBack: () => void;
  onSave: (activity: QuenzaActivityData) => void;
  onSend: (activity: QuenzaActivityData) => void;
}

const PRESET_COVERS = [
  { label: 'Peaceful Mindfulness', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Calm Nature & Trees', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Morning Sunlight Desk', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Deep Ocean Waves', url: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Gentle Sunlight Glow', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80' },
];

const ELEMENT_LIBRARY: { type: QuenzaElementType; title: string; desc: string; icon: any }[] = [
  {
    type: 'text',
    title: 'Text & Psychoeducation',
    desc: 'Structured clinical explanations, instructions, or reading material.',
    icon: Type
  },
  {
    type: 'open_question',
    title: 'Open Reflection Prompt',
    desc: 'Freeform text prompt for introspective client journaling and answers.',
    icon: HelpCircle
  },
  {
    type: 'multiple_choice',
    title: 'Multiple Choice / Distortions',
    desc: 'Selectable options for identifying triggers, distortions, or emotions.',
    icon: CheckSquare
  },
  {
    type: 'scale_rating',
    title: 'SUDS / Likert Rating Scale',
    desc: '0–10 or custom slider to measure distress, mood, or anxiety intensity.',
    icon: Sliders
  },
  {
    type: 'breathing_pacer',
    title: 'Breathwork & Somatic Pacer',
    desc: 'Interactive guided breathing animation (Diaphragmatic, Box, 4-7-8).',
    icon: Wind
  },
  {
    type: 'checklist',
    title: 'Grounding Checklist',
    desc: 'Actionable steps (e.g. 5-4-3-2-1 grounding or routine micro-actions).',
    icon: Layers
  },
  {
    type: 'voice_guide',
    title: 'Voice Guidance Script',
    desc: 'Audio-guided spoken instructions with ambient tones and pacing.',
    icon: Volume2
  }
];

export const QuenzaActivityStudio: React.FC<QuenzaActivityStudioProps> = ({
  initialData,
  onBack,
  onSave,
  onSend
}) => {
  const { toast } = useToast();

  // Active Studio Tab: 'content' | 'instructions' | 'settings'
  const [activeTab, setActiveTab] = useState<'content' | 'instructions' | 'settings'>('content');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isElementPickerOpen, setIsElementPickerOpen] = useState(false);

  // Editable Activity Data State
  const [title, setTitle] = useState(initialData?.title || 'Untitled activity');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [format, setFormat] = useState(initialData?.format || 'Exercise');
  const [category, setCategory] = useState(initialData?.category || 'MINDFULNESS');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Easy');
  const [duration, setDuration] = useState(initialData?.duration || '5-10 mins');
  const [description, setDescription] = useState(initialData?.description || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || PRESET_COVERS[0].url);
  const [enablePageBreaks, setEnablePageBreaks] = useState(initialData?.enablePageBreaks ?? false);

  // Modular Elements State
  const [elements, setElements] = useState<QuenzaElement[]>(
    initialData?.elements && initialData.elements.length > 0
      ? initialData.elements
      : []
  );

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<QuenzaElement[][]>([elements]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Live Interactive Preview State
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [isVoicePlaying, setIsVoicePlaying] = useState<string | null>(null);
  const [pacerPhase, setPacerPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [pacerCount, setPacerCount] = useState(4);
  const [pacerActive, setPacerActive] = useState(false);

  // Record History State on Element Change
  const updateElementsWithHistory = (newElements: QuenzaElement[]) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newElements);
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setElements(history[historyIdx - 1]);
      audioEngine.playChime(600);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setElements(history[historyIdx + 1]);
      audioEngine.playChime(750);
    }
  };

  const handleAddElement = (type: QuenzaElementType) => {
    let newElem: QuenzaElement;
    const count = elements.length + 1;

    switch (type) {
      case 'text':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'text',
          title: `Psychoeducation & Section ${count}`,
          content: 'Explain the core psychological concept, rationale, and instructions for your client here.'
        };
        break;
      case 'open_question':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'open_question',
          title: 'Reflection & Introspection Prompt',
          description: 'What thoughts, bodily sensations, or emotions are most noticeable for you right now?',
          content: ''
        };
        break;
      case 'multiple_choice':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'multiple_choice',
          title: 'Cognitive Distortion / Symptom Picker',
          description: 'Select all thought patterns that apply to your current situation:',
          options: ['All-or-Nothing Thinking', 'Catastrophizing', 'Emotional Reasoning', 'Mind Reading', 'Overgeneralization']
        };
        break;
      case 'scale_rating':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'scale_rating',
          title: 'Distress / SUDS Scale (0-10)',
          description: 'Rate your subjective distress level right now.',
          minValue: 0,
          maxValue: 10,
          minLabel: '0 - Completely Calm & Grounded',
          maxLabel: '10 - Highest Anxiety / Panic'
        };
        break;
      case 'breathing_pacer':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'breathing_pacer',
          title: 'Embedded Somatic Breathwork Pacer',
          description: 'Follow the visual breathing rhythm for 4 cycles to stimulate parasympathetic vagal tone.',
          breathType: 'box'
        };
        break;
      case 'checklist':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'checklist',
          title: '5-4-3-2-1 Sensory Grounding Checklist',
          description: 'Check off each sensory item as you observe it in your immediate environment:',
          items: [
            '5 things you can see around you',
            '4 things you can physically touch or feel',
            '3 things you can hear right now',
            '2 things you can smell',
            '1 thing you can taste'
          ]
        };
        break;
      case 'voice_guide':
        newElem = {
          id: `elem-${Date.now()}`,
          type: 'voice_guide',
          title: 'Therapeutic Voice Guidance',
          description: 'Guided audio script delivered with soothing pacing.',
          voiceScript: 'Take a slow, deep breath in through your nose... and let it gently out through your mouth. Notice your body releasing physical tension.'
        };
        break;
    }

    updateElementsWithHistory([...elements, newElem]);
    setIsElementPickerOpen(false);
    audioEngine.playBinauralTone(432, 1.2);
    toast({
      title: 'Element Added',
      description: `Added "${newElem.title}" to your activity.`
    });
  };

  const handleUpdateElement = (id: string, updates: Partial<QuenzaElement>) => {
    const next = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    updateElementsWithHistory(next);
  };

  const handleDeleteElement = (id: string) => {
    const next = elements.filter((el) => el.id !== id);
    updateElementsWithHistory(next);
    audioEngine.playChime(350);
  };

  const handleDuplicateElement = (el: QuenzaElement) => {
    const copy: QuenzaElement = {
      ...el,
      id: `elem-${Date.now()}`,
      title: `${el.title} (Copy)`
    };
    updateElementsWithHistory([...elements, copy]);
    audioEngine.playChime(550);
  };

  const handleMoveElement = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === elements.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...elements];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIdx, 0, item);
    updateElementsWithHistory(copy);
  };

  // Compile Current Activity Object
  const getCurrentActivityPayload = (): QuenzaActivityData => ({
    id: initialData?.id || `ACT-${Date.now()}`,
    title: title.trim() || 'Untitled activity',
    format,
    category,
    difficulty,
    duration,
    description: description.trim() || 'Custom practitioner activity created with Quenza Studio.',
    instructions: instructions.trim(),
    imageUrl,
    enablePageBreaks,
    elements,
    assignedTo: initialData?.assignedTo || [],
    clientAssignments: initialData?.clientAssignments || [],
    frequency: initialData?.frequency || 'Daily',
    timeOfDay: initialData?.timeOfDay || 'Morning (8:00 AM)',
    updatedAt: new Date().toISOString()
  });

  const handleSaveActivity = () => {
    const payload = getCurrentActivityPayload();
    onSave(payload);
    audioEngine.playSuccess();
    toast({
      title: 'Activity Saved!',
      description: `"${payload.title}" has been saved to your activity library.`
    });
  };

  const handleSendActivity = () => {
    const payload = getCurrentActivityPayload();
    onSend(payload);
  };

  // Live Speech Synthesis Player
  const handlePlayVoice = (script: string, id: string) => {
    if (isVoicePlaying === id) {
      window.speechSynthesis.cancel();
      setIsVoicePlaying(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.72; // Paced therapeutic rate
    utterance.pitch = 0.95;
    utterance.onend = () => setIsVoicePlaying(null);
    utterance.onerror = () => setIsVoicePlaying(null);
    setIsVoicePlaying(id);
    window.speechSynthesis.speak(utterance);
    audioEngine.playBinauralTone(528, 2.0);
  };

  // Pacer Logic
  const togglePacer = () => {
    if (pacerActive) {
      setPacerActive(false);
      return;
    }
    setPacerActive(true);
    audioEngine.playChime(528);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] flex flex-col overflow-hidden text-slate-800 font-sans">
      {/* 1. Top Quenza Studio Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        {/* Left Side: Back + Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Activity Library</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Inline Editable Title */}
          <div className="flex items-center gap-2 group">
            {isEditingTitle ? (
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="h-9 font-bold text-base sm:text-lg text-slate-900 border-[#5e2be2] focus:ring-1 focus:ring-[#5e2be2] max-w-xs sm:max-w-md rounded-lg"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 transition-all"
                title="Click to rename activity"
              >
                <h1 className="text-base sm:text-xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                  {title || 'Untitled activity'}
                </h1>
                <span className="text-slate-400 group-hover:text-slate-700 transition-colors text-xs">✏️</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions: Undo, Redo, Preview, Save, Send */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            title="Undo"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            title="Redo"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Preview as Client"
            className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
              isPreviewMode
                ? "bg-purple-100 border-[#5e2be2] text-[#5e2be2]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>

          {/* Save Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveActivity}
            className="h-9 px-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Save
          </Button>

          {/* Send / Assign Button */}
          <Button
            type="button"
            onClick={handleSendActivity}
            className="h-9 px-4 sm:px-5 rounded-lg bg-[#5e2be2] hover:bg-[#4d1fc4] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </Button>

          {/* 3-Dot Options */}
          <button
            type="button"
            onClick={() => toast({ title: 'Activity Options', description: 'Duplication & JSON export ready.' })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Sub-Header Studio Tabs (Content, Instructions, Settings) */}
      {!isPreviewMode && (
        <div className="bg-white border-b border-slate-200/80 px-6 flex items-center gap-8 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={cn(
              "py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
              activeTab === 'content'
                ? "border-[#5e2be2] text-[#5e2be2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Content</span>
            {elements.length > 0 && (
              <span className="bg-purple-100 text-[#5e2be2] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {elements.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={cn(
              "py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
              activeTab === 'instructions'
                ? "border-[#5e2be2] text-[#5e2be2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Instructions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              "py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
              activeTab === 'settings'
                ? "border-[#5e2be2] text-[#5e2be2]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      )}

      {/* 3. Main Studio Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8f9fa] flex justify-center">
        {/* If in Preview Mode */}
        {isPreviewMode ? (
          <div className="w-full max-w-3xl space-y-6 animate-in fade-in duration-300">
            {/* Interactive Client View Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="relative h-48 w-full bg-slate-100">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
                    {format} • {category} • {duration}
                  </div>
                  <h1 className="text-2xl font-extrabold">{title}</h1>
                </div>
              </div>
              {description && (
                <div className="p-6 text-sm text-slate-700 leading-relaxed border-b border-slate-100 bg-slate-50/50">
                  {description}
                </div>
              )}
            </div>

            {/* Elements Interactive Playback */}
            {elements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                No elements added yet. Exit preview and add elements from the Content tab.
              </div>
            ) : (
              elements.map((el, idx) => (
                <div key={el.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Item {idx + 1} of {elements.length}
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                      {el.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{el.title}</h3>
                  {el.description && <p className="text-sm text-slate-600">{el.description}</p>}

                  {/* Element Specific Interactive Player */}
                  {el.type === 'text' && (
                    <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border border-slate-200/60">
                      {el.content}
                    </div>
                  )}

                  {el.type === 'open_question' && (
                    <textarea
                      rows={4}
                      placeholder="Type your reflection here..."
                      value={previewValues[el.id] || ''}
                      onChange={(e) => setPreviewValues({ ...previewValues, [el.id]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm focus:ring-2 focus:ring-[#5e2be2] focus:outline-none"
                    />
                  )}

                  {el.type === 'scale_rating' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>{el.minLabel || '0 - Calm'}</span>
                        <span className="text-lg font-bold text-[#5e2be2]">
                          {previewValues[el.id] ?? el.minValue ?? 0}
                        </span>
                        <span>{el.maxLabel || '10 - Severe'}</span>
                      </div>
                      <input
                        type="range"
                        min={el.minValue ?? 0}
                        max={el.maxValue ?? 10}
                        value={previewValues[el.id] ?? el.minValue ?? 0}
                        onChange={(e) => setPreviewValues({ ...previewValues, [el.id]: Number(e.target.value) })}
                        className="w-full accent-[#5e2be2] h-2.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {el.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {el.options?.map((opt) => {
                        const selected = (previewValues[el.id] || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const current = previewValues[el.id] || [];
                              const updated = selected ? current.filter((x: string) => x !== opt) : [...current, opt];
                              setPreviewValues({ ...previewValues, [el.id]: updated });
                              audioEngine.playChime(selected ? 400 : 700);
                            }}
                            className={cn(
                              "p-3 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-between",
                              selected
                                ? "bg-purple-50 border-[#5e2be2] text-[#5e2be2] shadow-xs"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span>{opt}</span>
                            {selected && <Check className="w-4 h-4 text-[#5e2be2]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {el.type === 'checklist' && (
                    <div className="space-y-2 pt-1">
                      {el.items?.map((item, i) => {
                        const checked = (previewValues[el.id] || []).includes(i);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              const current = previewValues[el.id] || [];
                              const updated = checked ? current.filter((x: number) => x !== i) : [...current, i];
                              setPreviewValues({ ...previewValues, [el.id]: updated });
                              audioEngine.playChime(checked ? 450 : 650);
                            }}
                            className={cn(
                              "p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all",
                              checked
                                ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                              checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                            )}>
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn("text-xs sm:text-sm font-medium", checked && "line-through text-slate-400")}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {el.type === 'voice_guide' && (
                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/70 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-purple-900">Audio Voice Guidance</div>
                        <div className="text-xs text-slate-600 italic">"{el.voiceScript}"</div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handlePlayVoice(el.voiceScript || '', el.id)}
                        className="rounded-xl bg-[#5e2be2] hover:bg-[#4d1fc4] text-white font-bold text-xs h-9 px-4 shrink-0"
                      >
                        {isVoicePlaying === el.id ? '⏸ Pause' : '▶ Play Voiceover'}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Studio Builder Tabs */
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-200">
            {/* TAB 1: CONTENT ELEMENTS BUILDER */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Empty State (Matching Screenshot 2) */}
                {elements.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-600 mb-6">
                      This activity contains no elements yet.
                    </h3>
                    <Button
                      type="button"
                      onClick={() => setIsElementPickerOpen(true)}
                      className="rounded-full bg-purple-50 hover:bg-purple-100 text-[#5e2be2] border border-purple-200 font-bold px-6 h-10 shadow-xs cursor-pointer gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#5e2be2]" />
                      <span>+ Element</span>
                    </Button>
                  </div>
                ) : (
                  /* Modular Elements Cards */
                  <div className="space-y-4">
                    {elements.map((el, index) => (
                      <div
                        key={el.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all"
                      >
                        {/* Block Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-purple-50 text-[#5e2be2] text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {el.type.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveElement(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveElement(index, 'down')}
                              disabled={index === elements.length - 1}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateElement(el)}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteElement(el.id)}
                              className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Element Title
                          </label>
                          <Input
                            value={el.title}
                            onChange={(e) => handleUpdateElement(el.id, { title: e.target.value })}
                            className="rounded-xl border-slate-200 font-semibold"
                          />
                        </div>

                        {/* Content / Inputs per type */}
                        {el.type === 'text' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Psychoeducation Text
                            </label>
                            <textarea
                              rows={3}
                              value={el.content || ''}
                              onChange={(e) => handleUpdateElement(el.id, { content: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                            />
                          </div>
                        )}

                        {el.type === 'open_question' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Reflection Question Prompt
                            </label>
                            <textarea
                              rows={2}
                              value={el.description || ''}
                              onChange={(e) => handleUpdateElement(el.id, { description: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                            />
                          </div>
                        )}

                        {el.type === 'scale_rating' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Min Label (0)
                              </label>
                              <Input
                                value={el.minLabel || ''}
                                onChange={(e) => handleUpdateElement(el.id, { minLabel: e.target.value })}
                                className="rounded-xl border-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Max Label (10)
                              </label>
                              <Input
                                value={el.maxLabel || ''}
                                onChange={(e) => handleUpdateElement(el.id, { maxLabel: e.target.value })}
                                className="rounded-xl border-slate-200"
                              />
                            </div>
                          </div>
                        )}

                        {el.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Options (Comma separated)
                            </label>
                            <Input
                              value={el.options?.join(', ') || ''}
                              onChange={(e) =>
                                handleUpdateElement(el.id, {
                                  options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                })
                              }
                              className="rounded-xl border-slate-200"
                            />
                          </div>
                        )}

                        {el.type === 'voice_guide' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Voice Guidance Script
                            </label>
                            <textarea
                              rows={2}
                              value={el.voiceScript || ''}
                              onChange={(e) => handleUpdateElement(el.id, { voiceScript: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Element Centered Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        type="button"
                        onClick={() => setIsElementPickerOpen(true)}
                        className="rounded-full bg-white hover:bg-slate-50 text-[#5e2be2] border-2 border-dashed border-purple-300 font-bold px-8 h-11 shadow-xs cursor-pointer gap-2 hover:border-[#5e2be2]"
                      >
                        <Plus className="w-4 h-4 text-[#5e2be2]" />
                        <span>+ Add Element</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INSTRUCTIONS (Matching Screenshot 3) */}
            {activeTab === 'instructions' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Rich Editor Toolbar */}
                <div className="bg-slate-50/80 border-b border-slate-200 p-2.5 flex flex-wrap items-center gap-1.5 text-slate-700">
                  <div className="px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md flex items-center gap-1">
                    <span>Paragraph</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"><Bold className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic"><Italic className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700 underline"><Underline className="w-4 h-4" /></button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><AlignLeft className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><AlignCenter className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><AlignRight className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><AlignJustify className="w-4 h-4" /></button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><List className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><ListOrdered className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><Link2 className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><ImageIcon className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-700"><TableIcon className="w-4 h-4" /></button>
                </div>

                {/* Main Instruction Textarea */}
                <div className="p-6">
                  <textarea
                    rows={12}
                    placeholder="Write something here..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full text-sm text-slate-800 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                    These instructions are only visible to you, not your clients.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS (Matching Screenshots 4 & 5) */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Settings
                </h2>

                {/* Presentation Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Presentation</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Add a cover image to make the activity more visually engaging.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cover Image
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-purple-400 transition-colors bg-slate-50/50 flex flex-col items-center justify-center">
                      {imageUrl ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                          <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      )}
                      <div className="text-xs font-bold text-[#5e2be2] cursor-pointer hover:underline">
                        Upload a file <span className="text-slate-500 font-normal">or drag and drop</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Best at 1600px x 800px
                      </div>
                    </div>

                    {/* Presets Row */}
                    <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
                      {PRESET_COVERS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border transition-all cursor-pointer",
                            imageUrl === preset.url
                              ? "bg-purple-50 border-[#5e2be2] text-[#5e2be2]"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Details</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Add details to help you manage and organize this activity. These details are not visible to clients.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Description
                        </label>
                        <span className="text-xs text-slate-400 font-semibold">
                          {description.length}/70 characters
                        </span>
                      </div>
                      <Input
                        maxLength={70}
                        placeholder="Briefly describe what this activity is about"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl border-slate-200 text-sm"
                      />
                    </div>

                    {/* Format Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Format
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold focus:ring-2 focus:ring-[#5e2be2] focus:outline-none"
                      >
                        <option value="Exercise">Exercise</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Lesson">Lesson</option>
                        <option value="Meditation">Meditation</option>
                        <option value="Breathwork">Breathwork</option>
                        <option value="Journal">Reflection Journal</option>
                        <option value="Form">Intake Form</option>
                      </select>
                    </div>

                    {/* Category & Duration */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Category Tag
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold focus:ring-2 focus:ring-[#5e2be2] focus:outline-none"
                        >
                          <option value="MINDFULNESS">MINDFULNESS</option>
                          <option value="CBT">CBT</option>
                          <option value="GRATITUDE">GRATITUDE</option>
                          <option value="BREATHING">BREATHING</option>
                          <option value="SOMATIC">SOMATIC</option>
                          <option value="EXPOSURE">EXPOSURE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Duration
                        </label>
                        <Input
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="rounded-xl border-slate-200 h-10 text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Page Breaks Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Page breaks</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Control how elements are grouped when clients fill in this activity.
                    </p>
                  </div>
                  <div className="md:col-span-2 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Enable manual page breaks</div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        When enabled, elements stay together on one page until you insert a page break. When disabled, each element appears on its own page automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnablePageBreaks(!enablePageBreaks)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5",
                        enablePageBreaks ? "bg-[#5e2be2]" : "bg-slate-300"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full transition-transform shadow-xs",
                          enablePageBreaks ? "translate-x-6" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Element Picker Modal */}
      {isElementPickerOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Element</h3>
              <button
                type="button"
                onClick={() => setIsElementPickerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-2.5 max-h-[70vh] overflow-y-auto">
              {ELEMENT_LIBRARY.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddElement(item.type)}
                    className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-200/80 hover:border-[#5e2be2] hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-[#5e2be2] text-[#5e2be2] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
