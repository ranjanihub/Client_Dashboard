import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Eye,
  Hand,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Heart,
  Zap,
  Tag,
  Compass,
  Droplets,
  Wind,
  Check,
  Activity,
  Info,
  Plus,
  Sliders,
  Copy,
  BookOpen,
  Award,
  HelpCircle,
  ShieldCheck,
  Play,
  Pause,
  Layers,
  Target
} from 'lucide-react';
import { audioEngine } from '../utils/therapeuticAudioEngine';

/* ─────────────────────────────────────────────────────────────
   ACT-13: 5-4-3-2-1 SENSORY & COGNITIVE GROUNDING ENGINE
   Inspired by: "The 5-4-3-2-1 Method: A Grounding Exercise to Manage Anxiety"
   (Evidence-based Somatic Sensory Protocol & Prefrontal Neuro-anchoring)
   ───────────────────────────────────────────────────────────── */

interface GroundingStepConfig {
  number: number;
  sense: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  description: string;
  instruction: string;
  suggestions: string[];
}

const FIVE_FOUR_THREE_TWO_ONE_CONFIG: GroundingStepConfig[] = [
  {
    number: 5,
    sense: 'SEE',
    title: '5 Things You Can See',
    icon: Eye,
    color: 'text-sky-500 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-300/60 dark:border-sky-700/60',
    description: 'Engage your visual cortex to scan your physical environment.',
    instruction: 'Look around your immediate space. Spot 5 distinct things you can see right now. Notice subtle colors, shadows, shapes, or details you normally overlook.',
    suggestions: [
      'A shadow pattern on the wall or floor',
      'The texture of my desk or table surface',
      'The color and weave of my clothing',
      'Light reflecting off a window or screen',
      'A plant, leaf, or wooden surface',
      'A pen, mug, or water bottle',
      'The outline of a doorway or picture frame',
      'Dust motes dancing in ambient light'
    ]
  },
  {
    number: 4,
    sense: 'FEEL',
    title: '4 Things You Can Physically Touch',
    icon: Hand,
    color: 'text-indigo-500 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/60',
    description: 'Anchor into somatic tactile feedback through your skin and body.',
    instruction: 'Bring your awareness into physical contact. Touch or feel 4 separate textures or sensations right now.',
    suggestions: [
      'My feet firmly planted on the floor',
      'The smooth, cool surface beneath my fingers',
      'The texture and weight of my clothing on my skin',
      'The warmth of my hands resting together',
      'The support and firmness of the chair beneath me',
      'A gentle cool or warm breeze across my face',
      'The rim of my mug or edges of a notebook',
      'The rhythm of my chest gently rising and falling'
    ]
  },
  {
    number: 3,
    sense: 'HEAR',
    title: '3 Things You Can Hear',
    icon: Volume2,
    color: 'text-teal-500 dark:text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-300/60 dark:border-teal-700/60',
    description: 'Tune your auditory awareness outward to ground in soundscapes.',
    instruction: 'Soften your gaze or close your eyes for a moment. Tune your ears like an antenna. Identify 3 distinct sounds in your environment.',
    suggestions: [
      'The quiet hum of an air conditioner or fan',
      'Distant traffic or footsteps outside',
      'My own steady, quiet breathing',
      'Birds singing outside the window',
      'The faint ticking of a clock or electronics',
      'The rustle of leaves or wind against glass',
      'Typing keys or subtle ambient movement',
      'The gentle silence between environmental sounds'
    ]
  },
  {
    number: 2,
    sense: 'SMELL',
    title: '2 Things You Can Smell',
    icon: Wind,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60',
    description: 'Stimulate the olfactory pathway directly wired to emotional regulation.',
    instruction: 'Take a gentle, slow breath in through your nose. Notice 2 aromas around you (or evoke a vivid, comforting scent memory).',
    suggestions: [
      'Clean, crisp ambient air in the room',
      'Scent of hand lotion or gentle soap',
      'Aroma of coffee, tea, or warm beverage',
      'Freshly washed cotton clothing',
      'The earthy scent of rain or outdoor breeze',
      'A nearby candle, essential oil, or wood',
      'The comforting memory of pine trees or lavender',
      'Subtle aroma of fresh paper or wooden furniture'
    ]
  },
  {
    number: 1,
    sense: 'TASTE & AFFIRM',
    title: '1 Thing You Can Taste or Affirm',
    icon: Sparkles,
    color: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60',
    description: 'Integrate the final sense or anchor your mind with an unshakeable grounding truth.',
    instruction: 'Notice a taste in your mouth (or take a mindful sip of water), and anchor yourself with one comforting affirmation.',
    suggestions: [
      'The cool, clean taste of a fresh sip of water',
      'A lingering minty or herbal warmth',
      'Truth: "I am safe and grounded in this exact moment."',
      'Truth: "My anxiety is a passing wave, not an emergency."',
      'Truth: "I am in control of my breath, body, and attention."',
      'Truth: "I have survived every difficult moment before this one."',
      'Truth: "Right here and right now, all is well."',
      'A mindful bite of fruit or soothing mint'
    ]
  }
];

interface CategoryChallenge {
  title: string;
  emoji: string;
  itemsNeeded: number;
  examples: string[];
}

const CATEGORY_CHALLENGES: CategoryChallenge[] = [
  { title: 'Animals with 4 Legs', emoji: '🦁', itemsNeeded: 5, examples: ['Lion', 'Elephant', 'Horse', 'Dog', 'Tiger'] },
  { title: 'Red or Orange Foods', emoji: '🍎', itemsNeeded: 5, examples: ['Apple', 'Carrot', 'Strawberry', 'Orange', 'Tomato'] },
  { title: 'World Capital Cities', emoji: '✈️', itemsNeeded: 5, examples: ['Tokyo', 'Paris', 'London', 'Berlin', 'New Delhi'] },
  { title: 'Movie or Book Titles', emoji: '🎬', itemsNeeded: 5, examples: ['Inception', 'The Matrix', 'Avatar', 'Interstellar', 'Gladiator'] },
  { title: 'Musical Instruments', emoji: '🎸', itemsNeeded: 5, examples: ['Guitar', 'Piano', 'Violin', 'Drums', 'Flute'] }
];

const REVERSE_SPELL_WORDS = [
  { word: 'GROUNDING', reversed: 'G • N • I • D • N • U • O • R • G', length: 9 },
  { word: 'CALMNESS', reversed: 'S • S • E • N • M • L • A • C', length: 8 },
  { word: 'RESILIENT', reversed: 'T • N • E • I • L • I • S • E • R', length: 9 },
  { word: 'PEACEFUL', reversed: 'L • U • F • E • C • A • E • P', length: 8 },
  { word: 'CLARITY', reversed: 'Y • T • I • R • A • L • C', length: 7 }
];

export const CognitiveGrounding54321: React.FC<{
  activityName?: string;
  onComplete?: any;
}> = ({ activityName, onComplete }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'54321' | 'drills' | 'science'>('54321');

  // 5-4-3-2-1 Flow state
  // Step 0: Pre-check & Centering Breath
  // Step 1: 5 SEE
  // Step 2: 4 FEEL
  // Step 3: 3 HEAR
  // Step 4: 2 SMELL
  // Step 5: 1 TASTE/AFFIRM
  // Step 6: Session Blueprint & Post-Rating
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [preDistress, setPreDistress] = useState<number>(7);
  const [postDistress, setPostDistress] = useState<number>(3);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [customInput, setCustomInput] = useState<string>('');
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Stored items for each step: index 0 -> SEE (5), index 1 -> FEEL (4), index 2 -> HEAR (3), index 3 -> SMELL (2), index 4 -> TASTE (1)
  const [loggedItems, setLoggedItems] = useState<{ [stepIndex: number]: string[] }>({
    0: [], // SEE
    1: [], // FEEL
    2: [], // HEAR
    3: [], // SMELL
    4: []  // TASTE
  });

  // Prefrontal drills state (Tab 2)
  const [drillCategoryIdx, setDrillCategoryIdx] = useState<number>(0);
  const [drillCustomCategoryItems, setDrillCustomCategoryItems] = useState<string[]>([]);
  const [drillSpellIdx, setDrillSpellIdx] = useState<number>(0);

  // Reality anchors state (Tab 2)
  const [realityAnchors, setRealityAnchors] = useState<{ [key: string]: boolean }>({
    time: false,
    date: false,
    location: false,
    physicalSafety: false,
    bodyPresence: false
  });

  // Breathing animation cycle for Step 0
  useEffect(() => {
    if (groundingStep !== 0) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [groundingStep]);

  // Voice guidance triggered on step changes
  useEffect(() => {
    if (!voiceEnabled) return;

    if (groundingStep === 0) {
      audioEngine.speak('Take a slow, deep breath in, and gently exhale. Welcome to the five, four, three, two, one grounding exercise.');
    } else if (groundingStep >= 1 && groundingStep <= 5) {
      const stepCfg = FIVE_FOUR_THREE_TWO_ONE_CONFIG[groundingStep - 1];
      audioEngine.speak(`${stepCfg.title}. ${stepCfg.instruction}`);
    } else if (groundingStep === 6) {
      audioEngine.speak('Remarkable work. You have engaged all five senses and re-anchored your mind into safety and presence.');
    }
  }, [groundingStep, voiceEnabled]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  const currentStepCfg = groundingStep >= 1 && groundingStep <= 5 ? FIVE_FOUR_THREE_TWO_ONE_CONFIG[groundingStep - 1] : null;
  const currentStepLogged = groundingStep >= 1 && groundingStep <= 5 ? loggedItems[groundingStep - 1] || [] : [];
  const currentTargetCount = currentStepCfg ? currentStepCfg.number : 0;

  // Handler to add item to current step
  const handleAddItem = (item: string) => {
    if (!item.trim() || !currentStepCfg) return;
    const stepIdx = groundingStep - 1;
    const existing = loggedItems[stepIdx] || [];
    if (existing.includes(item.trim())) return;
    if (existing.length >= currentTargetCount) return;

    audioEngine.playSfx('sonar_ping');
    setLoggedItems(prev => ({
      ...prev,
      [stepIdx]: [...(prev[stepIdx] || []), item.trim()]
    }));
    setCustomInput('');
  };

  // Handler to remove item
  const handleRemoveItem = (indexToRemove: number) => {
    if (!currentStepCfg) return;
    const stepIdx = groundingStep - 1;
    audioEngine.playSfx('tactile_tap');
    setLoggedItems(prev => ({
      ...prev,
      [stepIdx]: (prev[stepIdx] || []).filter((_, i) => i !== indexToRemove)
    }));
  };

  // Move to next grounding step
  const handleNextStep = () => {
    audioEngine.playSfx('tactile_tap');
    if (groundingStep < 5) {
      setGroundingStep(prev => prev + 1);
    } else if (groundingStep === 5) {
      audioEngine.playSfx('celebration_chords');
      setGroundingStep(6);
    }
  };

  // Move to previous grounding step
  const handlePrevStep = () => {
    audioEngine.playSfx('tactile_tap');
    if (groundingStep > 0) {
      setGroundingStep(prev => prev - 1);
    }
  };

  // Reset 5-4-3-2-1 exercise
  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setGroundingStep(0);
    setLoggedItems({ 0: [], 1: [], 2: [], 3: [], 4: [] });
    setCustomInput('');
  };

  // Copy blueprint summary
  const handleCopyBlueprint = () => {
    const summary = FIVE_FOUR_THREE_TWO_ONE_CONFIG.map((cfg, idx) => {
      const items = loggedItems[idx] || [];
      return `${cfg.number} ${cfg.sense}:\n${items.map(it => `  • ${it}`).join('\n') || '  (Completed)'}`;
    }).join('\n\n');

    const textToCopy = `🌿 5-4-3-2-1 SENSORY GROUNDING BLUEPRINT\nDistress Shift: ${preDistress}/10 ➔ ${postDistress}/10\n\n${summary}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedBlueprint(true);
    audioEngine.playSfx('tactile_tap');
    setTimeout(() => setCopiedBlueprint(false), 2500);
  };

  // Complete activity
  const handleFinishSession = () => {
    audioEngine.playSfx('celebration_chords');
    const distressDelta = Math.max(0, preDistress - postDistress);
    const reliefPct = Math.round((distressDelta / Math.max(1, preDistress)) * 100);

    if (onComplete) {
      onComplete({
        score: 100,
        distressBefore: preDistress,
        distressAfter: postDistress,
        reliefPercentage: reliefPct,
        anchorsCount: Object.values(loggedItems).reduce((acc, curr) => acc + curr.length, 0)
      });
    }
  };

  // Distress shift calculation
  const reliefPercent = Math.max(0, Math.round(((preDistress - postDistress) / Math.max(1, preDistress)) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
      {/* ───── CLEAN CLINICAL HEADER CARD (HEXPERTIFY TEMPLATE) ───── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden p-5 sm:p-7 select-none font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Soft Ambient Floating Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 text-[11px] font-bold tracking-wider text-[#5e2be2] dark:text-purple-300 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#5e2be2]" />
              Somatic & Prefrontal Grounding Protocol
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              5-4-3-2-1 Sensory Grounding Method
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Step-by-step reality re-anchoring inspired by the proven 5-4-3-2-1 technique. Neutralize sensory overload, panic spikes, and spiraling thoughts by systematically activating all five senses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
            {/* Start Button */}
            <button
              onClick={() => {
                audioEngine.playSfx('tactile_tap');
                setActiveTab('54321');
                if (groundingStep === 0) {
                  setGroundingStep(1);
                } else if (groundingStep >= 6) {
                  handleReset();
                  setGroundingStep(1);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5e2be2] hover:bg-[#4f28d9] text-white shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Start 5-4-3-2-1 Sensory Grounding Session"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>

            {/* Voice Guide Button */}
            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                audioEngine.setVoiceEnabled(next);
                if (!next) audioEngine.stopSpeaking();
                audioEngine.playSfx('tactile_tap');
              }}
              className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={voiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-[#5e2be2] bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Reset session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Nav Tabs */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('54321')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === '54321'
                ? 'bg-[#5e2be2] text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>5-4-3-2-1 Guided Journey</span>
          </button>

          <button
            onClick={() => setActiveTab('drills')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'drills'
                ? 'bg-[#5e2be2] text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Prefrontal Focus Drills</span>
          </button>

          <button
            onClick={() => setActiveTab('science')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'science'
                ? 'bg-[#5e2be2] text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clinical Science & DBT</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: 5-4-3-2-1 SENSORY JOURNEY ── */}
      {activeTab === '54321' && (
        <div className="space-y-8">
          {/* Progress Flow Indicator */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {/* Step 0: Check-In */}
              <button
                onClick={() => setGroundingStep(0)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  groundingStep === 0
                    ? 'bg-[#5e2be2] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Start & Breath
              </button>

              {/* Steps 1 to 5 */}
              {FIVE_FOUR_THREE_TWO_ONE_CONFIG.map((cfg, idx) => {
                const stepNum = idx + 1;
                const isCurrent = groundingStep === stepNum;
                const isPast = groundingStep > stepNum;
                const isDone = (loggedItems[idx] || []).length >= cfg.number;
                const StepIcon = cfg.icon;

                return (
                  <button
                    key={cfg.number}
                    onClick={() => setGroundingStep(stepNum)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-[#5e2be2] text-white shadow-sm ring-2 ring-purple-400/50'
                        : isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : isPast
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">
                      {cfg.number}
                    </span>
                    <StepIcon className="w-3.5 h-3.5" />
                    <span>{cfg.sense}</span>
                    {isDone && <Check className="w-3 h-3 text-emerald-500 ml-0.5" />}
                  </button>
                );
              })}

              {/* Step 6: Summary */}
              <button
                onClick={() => setGroundingStep(6)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  groundingStep === 6
                    ? 'bg-[#5e2be2] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Blueprint
              </button>
            </div>
          </div>

          {/* ── STEP 0: PRE-CHECK & CENTERING BREATH ── */}
          {groundingStep === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                  <Wind className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Step 0: Center with a Deep Breath
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Before we begin scanning your five senses, slow down your breathing. This sends an immediate calming signal to the autonomic nervous system.
                </p>
              </div>

              {/* Interactive Breathing Sphere */}
              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-4 shadow-2xl relative ${
                    breathPhase === 'inhale'
                      ? 'scale-110 bg-gradient-to-tr from-sky-400/20 to-indigo-500/30 border-sky-400'
                      : breathPhase === 'hold'
                      ? 'scale-105 bg-gradient-to-tr from-indigo-400/20 to-purple-500/30 border-indigo-400'
                      : 'scale-90 bg-gradient-to-tr from-teal-400/20 to-emerald-500/30 border-teal-400'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Paced Breath
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300 capitalize mt-1">
                    {breathPhase === 'inhale' && 'Breathe In...'}
                    {breathPhase === 'hold' && 'Gently Hold...'}
                    {breathPhase === 'exhale' && 'Release & Exhale'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    {breathPhase === 'inhale' ? 'Feel lungs expand' : breathPhase === 'hold' ? 'Rest in stillness' : 'Soften shoulders'}
                  </span>
                </div>
              </div>

              {/* Subjective Units of Distress (SUDs) */}
              <div className="max-w-lg mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Current Distress Level (SUDs Scale)
                  </label>
                  <span className="text-base font-extrabold px-3 py-1 rounded-xl bg-[#5e2be2] text-white shadow-sm">
                    {preDistress} / 10
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preDistress}
                  onChange={(e) => setPreDistress(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>1 (Calm & Grounded)</span>
                  <span>5 (Moderate Anxiety)</span>
                  <span>10 (Overwhelmed / Panic)</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    audioEngine.playSfx('tactile_tap');
                    setGroundingStep(1);
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-[#5e2be2] hover:bg-[#4d22be] text-white shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02]"
                >
                  <span>Begin Step 5: Things You Can See</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEPS 1 TO 5: SENSORY COUNTDOWN (5-4-3-2-1) ── */}
          {groundingStep >= 1 && groundingStep <= 5 && currentStepCfg && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${currentStepCfg.badgeBg}`}>
                    {currentStepCfg.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Sensory Stage {6 - currentStepCfg.number} of 5
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentStepCfg.badgeBg}`}>
                        Sense: {currentStepCfg.sense}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {currentStepCfg.title}
                    </h2>
                  </div>
                </div>

                {/* Counter Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recorded:</span>
                  <span className={`text-base font-black ${currentStepLogged.length >= currentTargetCount ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {currentStepLogged.length} / {currentTargetCount}
                  </span>
                  {currentStepLogged.length >= currentTargetCount && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Clinical Instruction Callout */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <currentStepCfg.icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                    {currentStepCfg.instruction}
                  </p>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
                    {currentStepCfg.description}
                  </p>
                </div>
              </div>

              {/* Already Logged Anchors List */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Your Anchors for this step ({currentStepLogged.length} of {currentTargetCount})</span>
                  {currentStepLogged.length < currentTargetCount && (
                    <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400">
                      Need {currentTargetCount - currentStepLogged.length} more
                    </span>
                  )}
                </label>

                {currentStepLogged.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No items selected yet. Click the quick suggestions below or type your own observation!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {currentStepLogged.map((item, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800/80 shadow-sm text-sm font-semibold text-slate-800 dark:text-slate-200 group transition-all"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="w-5 h-5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all ml-1"
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input for Custom Anchor */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Type a custom observation or detail:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem(customInput);
                      }
                    }}
                    disabled={currentStepLogged.length >= currentTargetCount}
                    placeholder={
                      currentStepLogged.length >= currentTargetCount
                        ? `All ${currentTargetCount} items logged for this step! Click Next below.`
                        : `E.g., ${currentStepCfg.suggestions[0]}...`
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleAddItem(customInput)}
                    disabled={!customInput.trim() || currentStepLogged.length >= currentTargetCount}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Quick Suggestion Chips (Inspired by Video Guidance) */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Tap Suggestions (Click to add directly):
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentStepCfg.suggestions.map((suggestion, sIdx) => {
                    const isAdded = currentStepLogged.includes(suggestion);
                    return (
                      <button
                        key={sIdx}
                        onClick={() => {
                          if (isAdded) {
                            const foundIdx = currentStepLogged.indexOf(suggestion);
                            handleRemoveItem(foundIdx);
                          } else {
                            handleAddItem(suggestion);
                          }
                        }}
                        disabled={!isAdded && currentStepLogged.length >= currentTargetCount}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left flex items-center gap-2 border ${
                          isAdded
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                            : currentStepLogged.length >= currentTargetCount
                            ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300'
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span>{suggestion}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  {currentStepLogged.length < currentTargetCount && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium hidden sm:inline">
                      Tip: You can proceed or log all {currentTargetCount} items
                    </span>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#5e2be2] hover:bg-[#4d22be] text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all transform hover:scale-[1.02]"
                  >
                    <span>
                      {groundingStep === 5
                        ? 'Finish Grounding & View Blueprint'
                        : `Next: Step ${5 - groundingStep} (${FIVE_FOUR_THREE_TWO_ONE_CONFIG[groundingStep].sense})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: BLUEPRINT & POST-RATING SUMMARY ── */}
          {groundingStep === 6 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
              {/* Header */}
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Grounding Complete: Senses Re-Anchored
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  You have successfully brought your executive cognitive control back online by cycling through sight, touch, sound, smell, and taste.
                </p>
              </div>

              {/* Before vs After Distress Shift */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Before */}
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Initial Distress (Before)
                    </span>
                    <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                      {preDistress} <span className="text-base font-medium text-slate-500">/ 10</span>
                    </div>
                  </div>

                  {/* Shift Badge */}
                  <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">SUDs Relief Shift</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {reliefPercent}% Reduction
                    </span>
                  </div>

                  {/* After */}
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Post-Grounding (Current)
                    </span>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {postDistress} <span className="text-base font-medium text-slate-500">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Post Slider */}
                <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Rate your current distress right now:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{postDistress} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={postDistress}
                    onChange={(e) => setPostDistress(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>1 (Completely Grounded)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Still Distressed)</span>
                  </div>
                </div>
              </div>

              {/* Sensory Anchors Blueprint Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Your Present-Moment Sensory Blueprint
                  </h3>
                  <button
                    onClick={handleCopyBlueprint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedBlueprint ? 'Copied to Clipboard!' : 'Copy Blueprint'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FIVE_FOUR_THREE_TWO_ONE_CONFIG.map((cfg, idx) => {
                    const items = loggedItems[idx] || [];
                    const StepIcon = cfg.icon;

                    return (
                      <div
                        key={cfg.number}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${cfg.badgeBg}`}>
                            {cfg.number}
                          </span>
                          <StepIcon className={`w-4 h-4 ${cfg.color}`} />
                          <span className="text-xs font-bold tracking-wide uppercase text-slate-700 dark:text-slate-300">
                            {cfg.sense}
                          </span>
                        </div>

                        {items.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No specific items logged</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {items.map((it, i) => (
                              <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold shrink-0">•</span>
                                <span className="leading-tight">{it}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all w-full sm:w-auto justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  Practice Again
                </button>

                <button
                  onClick={handleFinishSession}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02] w-full sm:w-auto justify-center"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Save & Complete Activity
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PREFRONTAL COGNITIVE DRILLS (Verbal & Executive Control) ── */}
      {activeTab === 'drills' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Category Blitz */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Drill 1: Executive Category Retrieval
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Category Blitz Challenge
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Forces your brain to query semantic memory, shutting down autonomic panic responses.
                </p>
              </div>

              <div className="flex gap-2">
                {CATEGORY_CHALLENGES.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDrillCategoryIdx(idx);
                      setDrillCustomCategoryItems([]);
                      audioEngine.playSfx('tactile_tap');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      drillCategoryIdx === idx
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat.emoji} {cat.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Challenge Box */}
            <div className="p-6 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CATEGORY_CHALLENGES[drillCategoryIdx].emoji}</span>
                <div>
                  <h4 className="text-lg font-bold text-purple-950 dark:text-purple-200">
                    Name 5 {CATEGORY_CHALLENGES[drillCategoryIdx].title}
                  </h4>
                  <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                    Say them aloud or tap the sample items below to ground your thoughts.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {CATEGORY_CHALLENGES[drillCategoryIdx].examples.map((ex, i) => {
                  const isChecked = drillCustomCategoryItems.includes(ex);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        audioEngine.playSfx('sonar_ping');
                        setDrillCustomCategoryItems(prev =>
                          prev.includes(ex) ? prev.filter(x => x !== ex) : [...prev, ex]
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5" /> : <span>•</span>}
                      <span>{ex}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reverse Spelling Drill */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Drill 2: Working Memory Inversion
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Reverse Spelling Exercise
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Spell words backward in your mind. Working memory cannot support catastrophic loops while reversing letter order.
                </p>
              </div>

              <div className="flex gap-2">
                {REVERSE_SPELL_WORDS.map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDrillSpellIdx(idx);
                      audioEngine.playSfx('tactile_tap');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      drillSpellIdx === idx
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">Spell this word backward:</span>
                  <div className="text-3xl font-black text-teal-950 dark:text-teal-100 tracking-widest mt-1">
                    {REVERSE_SPELL_WORDS[drillSpellIdx].word}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500">Letter Count:</span>
                  <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {REVERSE_SPELL_WORDS[drillSpellIdx].length} letters
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-center">
                <span className="text-xs font-medium text-slate-400 block mb-1">Target Inversion:</span>
                <span className="text-lg font-mono font-bold tracking-widest text-teal-600 dark:text-teal-300">
                  {REVERSE_SPELL_WORDS[drillSpellIdx].reversed}
                </span>
              </div>
            </div>
          </div>

          {/* Drill 3: Reality Anchors Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Drill 3: Trauma-Informed Reality Re-Orientation
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Safety & Reality Verification Checklist
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                When panic creates sensations of doom or derealization, explicitly acknowledging objective facts grounds the nervous system in immediate physical safety.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'time',
                  title: 'Current Time & Year Verification',
                  desc: `I verify the current time is approximately ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, and the year is ${new Date().getFullYear()}. The past threat is not happening now.`
                },
                {
                  id: 'date',
                  title: 'Today’s Calendar Reality',
                  desc: `Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. I am anchored in the present date.`
                },
                {
                  id: 'location',
                  title: 'Physical Location Orienting',
                  desc: 'I recognize the room I am in right now. I see the walls, the floor beneath my feet, and doors that keep me secure.'
                },
                {
                  id: 'physicalSafety',
                  title: 'Objective Immediate Safety',
                  desc: 'In this exact second, no physical harm is occurring. My heart may beat fast, but my body is physically secure.'
                },
                {
                  id: 'bodyPresence',
                  title: 'Somatic Body Claim',
                  desc: 'I feel the weight of my body resting on this surface. I am alive, breathing, and present.'
                }
              ].map((anchor) => {
                const isChecked = realityAnchors[anchor.id];

                return (
                  <div
                    key={anchor.id}
                    onClick={() => {
                      setRealityAnchors(prev => ({ ...prev, [anchor.id]: !isChecked }));
                      audioEngine.playSfx('tactile_tap');
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isChecked
                        ? 'bg-teal-500/10 border-teal-500/40 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                      isChecked
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {anchor.title}
                      </span>
                      <p className="text-xs leading-relaxed">
                        {anchor.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CLINICAL SCIENCE & WHY IT WORKS ── */}
      {activeTab === 'science' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Neuroscience Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Evidence-Based Mechanism of Action
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                The Neuroscience of the 5-4-3-2-1 Sensory Protocol
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                When anxiety spikes or panic manifests, the brain’s salience network and amygdala hijack neural resources. The body enters fight-or-flight, flooding the bloodstream with epinephrine and cortisol while impairing working memory. The 5-4-3-2-1 technique works as an immediate neurobiological circuit breaker.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                  Amygdala Downregulation via Sensory Redirection
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  By deliberately requiring the brain to process five external visual cues, four tactile touch sensations, three environmental sounds, two aromas, and one taste, neural processing is forcibly shifted away from catastrophic rumination and onto primary sensory cortices (occipital, somatosensory, and temporal lobes).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-base font-bold text-purple-950 dark:text-purple-200">
                  Prefrontal Cortex (dlPFC) Re-Engagement
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  The numerical countdown (5 ➔ 4 ➔ 3 ➔ 2 ➔ 1) requires active cognitive tracking in the dorsolateral prefrontal cortex. Because the brain cannot simultaneously sustain acute panic and rigorous executive categorization, this conscious numbering sequence re-establishes top-down cognitive dominance.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-base font-bold text-teal-950 dark:text-teal-200">
                  DBT & Somatic Experiencing Foundation
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  Dialectical Behavior Therapy (DBT) categorizes the 5-4-3-2-1 technique as a core Distress Tolerance skill. It grounds clients in the objective physical reality of "Right here, right now, I am physically safe," disproving the phantom threats generated by an overactive nervous system.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                  Vagus Nerve & Parasympathetic Activation
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  Beginning with paced centering breaths stimulates the vagus nerve, lowering heart rate and blood pressure within 60 to 90 seconds. Combining somatic sensory anchors with deep breathing achieves reliable physiological and psychological stabilization.
                </p>
              </div>
            </div>

            {/* Clinical Takeaway */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border border-indigo-200/80 dark:border-indigo-800/80 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#5e2be2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-justify">
                <strong>Clinical Rule of Thumb:</strong> When in severe sensory overwhelm or panic, do not attempt to "reason" with anxious thoughts. Instead, physically anchor your five senses with 5-4-3-2-1 first. Once physiology settles, cognitive reframing becomes effortless.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CognitiveGrounding54321;
