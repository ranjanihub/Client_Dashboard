import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Check,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Type,
  HelpCircle,
  CheckSquare,
  Volume2,
  Wind,
  Layers,
  Save,
  Clock,
  UserPlus,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { audioEngine } from '../../admin/activities/utils/therapeuticAudioEngine';

export type QuenzaBlockType =
  | 'text'
  | 'open_question'
  | 'multiple_choice'
  | 'scale_rating'
  | 'breathing_pacer'
  | 'checklist'
  | 'voice_guide';

export interface QuenzaBlock {
  id: string;
  type: QuenzaBlockType;
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

interface QuenzaActivityBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveActivity: (newActivity: any, andAssign?: boolean) => void;
}

const PRESET_IMAGES = [
  { label: 'Calm Nature & Trees', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Morning Sunlight & Desk', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Deep Ocean & Waves', url: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80' },
  { label: 'Peaceful Meditation', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cozy Mindfulness Tea', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80' }
];

export const QuenzaActivityBuilderModal: React.FC<QuenzaActivityBuilderProps> = ({
  isOpen,
  onClose,
  onSaveActivity
}) => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'meta' | 'builder' | 'preview'>('meta');

  // Activity Meta
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MINDFULNESS');
  const [duration, setDuration] = useState('5-10 minutes');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [howItHelps, setHowItHelps] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  // Quenza Interactive Blocks State
  const [blocks, setBlocks] = useState<QuenzaBlock[]>([
    {
      id: 'b1',
      type: 'text',
      title: 'Therapeutic Introduction & Purpose',
      content: 'Welcome to this guided grounding exercise. Take a comfortable seat, uncross your arms and legs, and take a gentle centering breath.'
    },
    {
      id: 'b2',
      type: 'scale_rating',
      title: 'Initial Distress / Somatic Baseline Check-In',
      description: 'Rate your current distress or emotional tension on a scale of 0 to 10.',
      minValue: 0,
      maxValue: 10,
      minLabel: '0 - Completely Calm & Grounded',
      maxLabel: '10 - High Overwhelm / Distress'
    },
    {
      id: 'b3',
      type: 'open_question',
      title: 'Core Thought / Physical Sensations',
      description: 'What sensations, automatic thoughts, or triggers are currently most prominent in your awareness?'
    },
    {
      id: 'b4',
      type: 'checklist',
      title: 'Somatic Sensory Grounding Anchors',
      description: 'Check off each physical anchor as you consciously engage with it:',
      items: [
        'Feel the solid floor supporting both feet firmly',
        'Notice the ambient temperature of air on your forearms',
        'Identify three distinct colors in your visual periphery',
        'Release jaw tension and drop shoulder blades gently'
      ]
    },
    {
      id: 'b5',
      type: 'voice_guide',
      title: 'Compassionate Voice Guidance Cue',
      voiceScript: 'You are safe in this physical moment. Take a full gentle breath and let tension soften.'
    }
  ]);

  // Preview interactive response state
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({
    b2: 5,
    b3: '',
    b4: []
  });

  const addBlock = (type: QuenzaBlockType) => {
    const id = `b_${Date.now().toString().slice(-4)}`;
    let newBlock: QuenzaBlock;

    switch (type) {
      case 'text':
        newBlock = {
          id,
          type: 'text',
          title: 'Clinical Psychoeducation / Instructions',
          content: 'Add guidance, cognitive restructuring notes, or step-by-step instructions for the client here.'
        };
        break;
      case 'open_question':
        newBlock = {
          id,
          type: 'open_question',
          title: 'Reflection / Written Prompt',
          description: 'Ask the client to write their reflections, counter-evidence, or thoughts here.'
        };
        break;
      case 'multiple_choice':
        newBlock = {
          id,
          type: 'multiple_choice',
          title: 'Distortion / Symptom Check',
          description: 'Select all options that resonate with your experience right now:',
          options: ['Catastrophizing', 'All-or-Nothing Thinking', 'Mind Reading', 'Overgeneralization', 'Should Statements']
        };
        break;
      case 'scale_rating':
        newBlock = {
          id,
          type: 'scale_rating',
          title: 'Subjective Units of Distress (SUDS Rating)',
          description: 'Rate the intensity of your distress from 0 (Calm) to 10 (Peak Tension).',
          minValue: 0,
          maxValue: 10,
          minLabel: '0 - Total Serenity',
          maxLabel: '10 - Peak Anxiety'
        };
        break;
      case 'breathing_pacer':
        newBlock = {
          id,
          type: 'breathing_pacer',
          title: 'Embedded Therapeutic Breathwork Pacer',
          description: 'Follow the 4-second inhale and 6-second exhale wave to downregulate your sympathetic nervous system.',
          breathType: 'diaphragmatic'
        };
        break;
      case 'checklist':
        newBlock = {
          id,
          type: 'checklist',
          title: 'Action / Anchor Checklist',
          description: 'Tap each item as you complete it during the exercise:',
          items: ['Drink a mindful sip of water', 'Stretch neck gently left and right', 'Write down one empowering affirmation']
        };
        break;
      case 'voice_guide':
        newBlock = {
          id,
          type: 'voice_guide',
          title: 'Therapeutic Voice Audio Cue',
          voiceScript: 'Take a slow, deep breath in... and gently release all tension out.'
        };
        break;
    }

    setBlocks([...blocks, newBlock]);
    audioEngine.playSfx('tactile_tap');
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    audioEngine.playSfx('tactile_tap');
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const updated = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
    audioEngine.playSfx('tactile_tap');
  };

  const handleSave = (andAssign: boolean = false) => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please provide an activity title before publishing.',
        variant: 'destructive'
      });
      setActiveStep('meta');
      return;
    }

    const newActivityPayload = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      name: title.trim(),
      title: title.trim(),
      category: category.toUpperCase(),
      categoryTag: category.toUpperCase(),
      duration,
      difficulty,
      description: description.trim() || 'Custom consultant-created activity powered by Quenza block architecture.',
      howItHelps: howItHelps.trim() || description.trim(),
      benefits: ['Custom Clinical Protocol', 'Evidence-Based Practice', 'Interactive Guidance'],
      imageUrl,
      blocks,
      instructions: blocks.map((b) => `• ${b.title}: ${b.description || b.content || ''}`).join('\n\n'),
      dueDate: 'Today',
      repeat: 'Daily',
      frequency: 'Daily',
      isVisible: true,
      createdAt: new Date().toISOString()
    };

    onSaveActivity(newActivityPayload, andAssign);
    audioEngine.playSfx('celebration_chords');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-5xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-slate-50 text-slate-900 max-h-[94vh] flex flex-col font-['Plus_Jakarta_Sans']">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-[#5e2be2] border border-purple-100 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-[#5e2be2] border border-purple-100">
                  Quenza Activity Studio
                </span>
                <span className="text-xs text-slate-400 font-semibold">{blocks.length} Interactive Blocks</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {title || 'Create Custom Therapeutic Activity'}
              </h2>
            </div>
          </div>

          {/* Stepper Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveStep('meta')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStep === 'meta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              1. Overview & Meta
            </button>
            <button
              onClick={() => setActiveStep('builder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStep === 'builder' ? 'bg-[#5e2be2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              2. Quenza Block Builder
            </button>
            <button
              onClick={() => setActiveStep('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeStep === 'preview' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3. Live Preview</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ──────────────── STEP 1: ACTIVITY OVERVIEW & METADATA ──────────────── */}
          {activeStep === 'meta' && (
            <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900">Activity Information & Clinical Goals</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define title, target clinical domain, difficulty, and cover imagery for your activity.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Activity Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Cognitive Decatastrophizing & Somatic Safety Plan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-2xl border-slate-200 h-12 font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Clinical Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                    >
                      <option value="MINDFULNESS">MINDFULNESS</option>
                      <option value="CBT">CBT & THOUGHT WORK</option>
                      <option value="SOMATIC">SOMATIC & BODY</option>
                      <option value="BREATHING">BREATHWORK</option>
                      <option value="DBT">DBT & DISTRESS</option>
                      <option value="GRATITUDE">GRATITUDE</option>
                      <option value="EXPOSURE">EXPOSURE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Estimated Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                    >
                      <option value="2-3 minutes">2-3 minutes (Micro Drill)</option>
                      <option value="5-10 minutes">5-10 minutes (Standard)</option>
                      <option value="10-15 minutes">10-15 minutes (Deep Session)</option>
                      <option value="15-20 minutes">15-20 minutes (Comprehensive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                    >
                      <option value="Easy">Easy (Beginner)</option>
                      <option value="Medium">Medium (Guided)</option>
                      <option value="Advanced">Advanced (Deep Work)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Clinical Rationale & Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how this exercise assists the client's emotional regulation, neural rewiring, or nervous system recovery..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5e2be2] focus:bg-white"
                  />
                </div>

                {/* Cover Image Preset Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Cover Imagery
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRESET_IMAGES.map((img) => (
                      <div
                        key={img.url}
                        onClick={() => setImageUrl(img.url)}
                        className={`group relative h-20 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                          imageUrl === img.url ? 'border-[#5e2be2] ring-2 ring-purple-200 scale-102' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                          <span className="text-[9px] font-bold text-white line-clamp-1">{img.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setActiveStep('builder')}
                  className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold h-11 px-6 shadow-md shadow-purple-500/20 gap-2 cursor-pointer"
                >
                  <span>Proceed to Quenza Block Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ──────────────── STEP 2: QUENZA MODULAR BLOCK BUILDER ──────────────── */}
          {activeStep === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left Toolbar: Add Quenza Blocks */}
              <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-200/90 space-y-4 shadow-sm h-fit">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-[#5e2be2]">
                    Quenza Component Library
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Add Interactive Blocks</h3>
                  <p className="text-[11px] text-slate-500">Tap any block type to add it to your exercise sequence:</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => addBlock('text')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-purple-50 text-[#5e2be2] group-hover:scale-105 transition-transform">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Psychoeducation & Text</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Rich text, explanations, guidelines</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('scale_rating')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">SUDS / Likert Rating Scale</div>
                      <div className="text-[10px] text-slate-500 leading-snug">0-10 or 1-5 slider gauge check-in</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('open_question')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Open Reflection Prompt</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Free-form client response area</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('checklist')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Action & Sensory Checklist</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Multi-item interactive checkoff list</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('multiple_choice')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Distortion & Tag Selector</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Multiple choice pill chips</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('voice_guide')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Voice Guidance Script</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Autospeaks with therapeutic coach</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('breathing_pacer')}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Breathwork Widget</div>
                      <div className="text-[10px] text-slate-500 leading-snug">Embed live breathing animation</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Canvas: Blocks Sequence */}
              <div className="lg:col-span-2 space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 relative group"
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#5e2be2]">
                          {block.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveBlock(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Move Block Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveBlock(index, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Move Block Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer ml-1"
                          title="Delete Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block Title Field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Block Header / Title
                      </label>
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => {
                          const updated = [...blocks];
                          updated[index].title = e.target.value;
                          setBlocks(updated);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#5e2be2]"
                      />
                    </div>

                    {/* Specific Block Custom Fields */}
                    {block.type === 'text' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Guidance Content
                        </label>
                        <textarea
                          rows={3}
                          value={block.content || ''}
                          onChange={(e) => {
                            const updated = [...blocks];
                            updated[index].content = e.target.value;
                            setBlocks(updated);
                          }}
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none"
                        />
                      </div>
                    )}

                    {block.type === 'open_question' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Prompt Subtitle / Guidance
                        </label>
                        <input
                          type="text"
                          value={block.description || ''}
                          onChange={(e) => {
                            const updated = [...blocks];
                            updated[index].description = e.target.value;
                            setBlocks(updated);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    )}

                    {block.type === 'scale_rating' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-slate-400">Min Label (0)</label>
                          <input
                            type="text"
                            value={block.minLabel || ''}
                            onChange={(e) => {
                              const updated = [...blocks];
                              updated[index].minLabel = e.target.value;
                              setBlocks(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-slate-400">Max Label (10)</label>
                          <input
                            type="text"
                            value={block.maxLabel || ''}
                            onChange={(e) => {
                              const updated = [...blocks];
                              updated[index].maxLabel = e.target.value;
                              setBlocks(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'voice_guide' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" /> Spoken Script (Therapeutic Audio Synthesis)
                        </label>
                        <textarea
                          rows={2}
                          value={block.voiceScript || ''}
                          onChange={(e) => {
                            const updated = [...blocks];
                            updated[index].voiceScript = e.target.value;
                            setBlocks(updated);
                          }}
                          className="w-full p-3 rounded-xl bg-rose-50/40 border border-rose-200 text-xs text-slate-900 font-medium focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────── STEP 3: LIVE INTERACTIVE PREVIEW ──────────────── */}
          {activeStep === 'preview' && (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-fade-in font-['Plus_Jakarta_Sans']">
              {/* Preview Hero Cover */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30">
                    {category} • {duration}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">{title || 'Untitled Custom Activity'}</h3>
                </div>
              </div>

              {/* Render Blocks Live */}
              <div className="space-y-6">
                {blocks.map((block) => (
                  <div key={block.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 shadow-xs">
                    <h4 className="text-sm font-black text-slate-900">{block.title}</h4>

                    {block.type === 'text' && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                        {block.content}
                      </p>
                    )}

                    {block.type === 'scale_rating' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-extrabold text-slate-700">
                          <span>{block.minLabel}</span>
                          <span className="text-[#5e2be2] font-black text-sm bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                            {previewResponses[block.id] ?? 5} / {block.maxValue ?? 10}
                          </span>
                          <span>{block.maxLabel}</span>
                        </div>
                        <input
                          type="range"
                          min={block.minValue ?? 0}
                          max={block.maxValue ?? 10}
                          value={previewResponses[block.id] ?? 5}
                          onChange={(e) => setPreviewResponses({ ...previewResponses, [block.id]: Number(e.target.value) })}
                          className="w-full accent-[#5e2be2]"
                        />
                      </div>
                    )}

                    {block.type === 'open_question' && (
                      <div className="space-y-1.5">
                        {block.description && <p className="text-xs text-slate-500 font-medium">{block.description}</p>}
                        <textarea
                          rows={3}
                          placeholder="Client types their reflection or response here..."
                          value={previewResponses[block.id] || ''}
                          onChange={(e) => setPreviewResponses({ ...previewResponses, [block.id]: e.target.value })}
                          className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#5e2be2]"
                        />
                      </div>
                    )}

                    {block.type === 'checklist' && (
                      <div className="space-y-2">
                        {block.description && <p className="text-xs text-slate-500 font-medium">{block.description}</p>}
                        <div className="space-y-2">
                          {(block.items || []).map((item, idx) => {
                            const isChecked = (previewResponses[block.id] || []).includes(idx);
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  const current = previewResponses[block.id] || [];
                                  const next = isChecked ? current.filter((i: number) => i !== idx) : [...current, idx];
                                  setPreviewResponses({ ...previewResponses, [block.id]: next });
                                  audioEngine.playSfx('tactile_tap');
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isChecked ? 'bg-purple-50 border-[#5e2be2] text-[#5e2be2] font-bold' : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="text-xs">{item}</span>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-[#5e2be2] border-[#5e2be2] text-white' : 'border-slate-300'}`}>
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {block.type === 'voice_guide' && (
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-700 font-medium italic">"{block.voiceScript}"</div>
                        <button
                          onClick={() => {
                            if (block.voiceScript) {
                              audioEngine.playSfx('neural_sparkle');
                              audioEngine.speak(block.voiceScript);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#5e2be2] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Speak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-2xl border-slate-200 text-slate-600 font-semibold text-xs h-11 px-5 cursor-pointer"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              className="rounded-2xl border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs h-11 px-5 cursor-pointer gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save to Library</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleSave(true)}
              className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs h-11 px-6 shadow-md shadow-purple-500/20 gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Save & Assign to Client</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuenzaActivityBuilderModal;
