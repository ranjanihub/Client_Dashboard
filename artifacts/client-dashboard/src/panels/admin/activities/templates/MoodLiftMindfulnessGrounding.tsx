import React, { useState, useEffect } from 'react';
import {
  Brain,
  Eye,
  Hand,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Heart,
  Zap,
  Tag,
  Compass,
  Radio,
  Target
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

interface MindfulnessActivityProps extends BaseActivityComponentProps {
  activityId?: string;
}

export const MoodLiftMindfulnessGrounding: React.FC<MindfulnessActivityProps> = ({
  activityId = 'ACT-05',
  activityName,
  onComplete
}) => {
  if (activityId === 'ACT-05') {
    return <SensoryRoomScanner activityName={activityName} onComplete={onComplete} />;
  } else if (activityId === 'ACT-06') {
    return <EmotionalResonanceCompass activityName={activityName} onComplete={onComplete} />;
  } else if (activityId === 'ACT-07') {
    return <BioRadarPhysicalGrounding activityName={activityName} onComplete={onComplete} />;
  } else {
    return <PrefrontalCognitiveArcade activityName={activityName} onComplete={onComplete} />;
  }
};

/* ─────────────────────────────────────────────────────────────
   ACT-05: SENSORY ROOM SCANNER (Objective Environmental Grounding)
   ───────────────────────────────────────────────────────────── */
function SensoryRoomScanner({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [step, setStep] = useState<number>(1);
  const [items, setItems] = useState({
    item1: { name: '', color: '', texture: '', lightReflection: '' },
    item2: { name: '', color: '', texture: '', lightReflection: '' },
    item3: { name: '', color: '', texture: '', lightReflection: '' }
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentKey = `item${step}` as keyof typeof items;

  const handleNext = () => {
    audioEngine.playSfx('sonar_ping');
    if (step < 3) {
      setStep(step + 1);
      audioEngine.speak(`Target object ${step + 1}. Look around and describe its details.`);
    } else {
      setIsCompleted(true);
      audioEngine.playSfx('celebration_chords');
      audioEngine.speak('Environmental scan complete. You are fully present in this room.');
      if (onComplete) onComplete({ items });
    }
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setStep(1);
    setItems({
      item1: { name: '', color: '', texture: '', lightReflection: '' },
      item2: { name: '', color: '', texture: '', lightReflection: '' },
      item3: { name: '', color: '', texture: '', lightReflection: '' }
    });
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-purple-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100 text-cyan-600 shadow-inner">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
              ACT-05 • SENSORY FOCUS RADAR
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Describe Your Room'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Shift cognitive load from rumination to micro-environmental visual cataloging.
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {!isCompleted ? (
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-700">
            <span>Visual Scanning Target {step} of 3</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-black text-cyan-700">
              {Math.round((step / 3) * 100)}% COMPLETE
            </span>
          </div>

          <div className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-cyan-600" />
                Target an Object in Your Immediate Physical Space:
              </label>
              <input
                type="text"
                placeholder="e.g. Matte black notebook, Sunlight on wooden desk, Indoor succulent"
                value={items[currentKey].name}
                onChange={(e) => setItems({ ...items, [currentKey]: { ...items[currentKey], name: e.target.value } })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 font-bold shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Exact Color Tone</label>
                <input
                  type="text"
                  placeholder="e.g. Deep amber gold"
                  value={items[currentKey].color}
                  onChange={(e) => setItems({ ...items, [currentKey]: { ...items[currentKey], color: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Tactile Texture</label>
                <input
                  type="text"
                  placeholder="e.g. Cool, grainy wood"
                  value={items[currentKey].texture}
                  onChange={(e) => setItems({ ...items, [currentKey]: { ...items[currentKey], texture: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Light / Shadow Gradient</label>
                <input
                  type="text"
                  placeholder="e.g. Soft diagonal shadow"
                  value={items[currentKey].lightReflection}
                  onChange={(e) => setItems({ ...items, [currentKey]: { ...items[currentKey], lightReflection: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-[#5e2be2] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {step === 3 ? 'Lock Environmental Scan' : 'Scan Next Object'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-[#5e2be2] p-1 mx-auto shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-cyan-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Anchored in Physical Space</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              By mapping 3 distinct environmental targets with granular sensory accuracy, your visual cortex has confirmed real-time physical safety.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Practice Scan Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-06: NAME THE MOMENT (Mindful Emotional Check-In & Awareness)
   Reference: https://moodlift.hexpertify.com/games/name-the-moment
   ───────────────────────────────────────────────────────────── */
const CORE_EMOTIONS = [
  { name: 'Calm', emoji: '🌿', desc: 'Peaceful & Centered' },
  { name: 'Sad', emoji: '💙', desc: 'Heavy or Grieving' },
  { name: 'Stressed', emoji: '⚡', desc: 'Under Pressure' },
  { name: 'Angry', emoji: '🔥', desc: 'Boundary Alert' },
  { name: 'Overwhelmed', emoji: '🌊', desc: 'Carrying Too Much' },
  { name: 'Lonely', emoji: '🕊️', desc: 'Craving Connection' },
  { name: 'Grateful', emoji: '💖', desc: 'Present & Appreciative' },
  { name: 'Proud', emoji: '🌟', desc: 'Self-Respect & Dignity' },
  { name: 'Confused', emoji: '🌀', desc: 'Seeking Clarity' },
  { name: 'Hopeful', emoji: '✨', desc: 'Looking Forward' },
  { name: 'Tired', emoji: '🌙', desc: 'Needing Deep Rest' },
  { name: 'Numb', emoji: '☁️', desc: 'Protected & Sheltered' }
];

const EMOTION_VALIDATIONS: Record<string, string> = {
  calm: "It's okay to feel good. Breathe in that peace.",
  sad: "Sadness is a sign of caring. Your feelings are valid.",
  stressed: "Stress doesn't mean you're failing — it means you're carrying too much alone.",
  angry: "Anger is often a boundary, not a flaw.",
  overwhelmed: "It's okay to feel overwhelmed. You don't have to handle everything alone.",
  lonely: "Loneliness is a signal that you need connection. You deserve to be seen.",
  grateful: "Gratitude is a sign of presence and awareness. You're noticing what matters.",
  proud: "Pride in yourself is not arrogance — it's self-respect.",
  confused: "Confusion means you're learning. It's okay not to have all the answers.",
  hopeful: "Hope is a powerful force. Hold onto it gently.",
  tired: "Rest is not laziness — it's essential. You deserve care.",
  numb: "Numbness is a sign your mind and body are protecting you. That's okay."
};

const getIntensityMeta = (intensity: number) => {
  if (intensity <= 2) return { emoji: '🌱', label: 'Mild' };
  if (intensity <= 4) return { emoji: '🌿', label: 'Gentle' };
  if (intensity <= 6) return { emoji: '💭', label: 'Moderate' };
  if (intensity <= 8) return { emoji: '⚡', label: 'Strong' };
  return { emoji: '🔥', label: 'Intense' };
};

function EmotionalResonanceCompass({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [phase, setPhase] = useState<'start' | 'breathe' | 'emotion' | 'intensity' | 'reflection' | 'complete'>('start');
  const [countdown, setCountdown] = useState<number>(5);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [customEmotion, setCustomEmotion] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(5);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [voiceCoach, setVoiceCoach] = useState<boolean>(true);

  const activeEmotionName = isCustomMode ? customEmotion : selectedEmotion;

  // Countdown timer for 5s gentle breath
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'breathe' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'breathe' && countdown === 0) {
      audioEngine.playSfx('singing_bowl');
      if (voiceCoach) {
        audioEngine.speak('Breath centered. What emotion are you noticing right now?');
      }
      setPhase('emotion');
    }
    return () => clearTimeout(timer);
  }, [phase, countdown, voiceCoach]);

  const handleStart = () => {
    audioEngine.playSfx('tactile_tap');
    if (voiceCoach) {
      audioEngine.speak('Take a slow, gentle breath. Settle into the present moment.');
    }
    setCountdown(5);
    setPhase('breathe');
  };

  const handleSelectEmotion = (emotionName: string) => {
    audioEngine.playSfx('neural_sparkle');
    setSelectedEmotion(emotionName);
    setIsCustomMode(false);
    if (voiceCoach) {
      audioEngine.speak(`Noticing ${emotionName}.`);
    }
  };

  const handleCustomEmotionChange = (val: string) => {
    setCustomEmotion(val);
    setIsCustomMode(true);
    setSelectedEmotion('');
  };

  const handleProceedToIntensity = () => {
    if (!activeEmotionName.trim()) return;
    audioEngine.playSfx('tactile_tap');
    if (voiceCoach) {
      audioEngine.speak('How strong is this feeling on a scale of 1 to 10?');
    }
    setPhase('intensity');
  };

  const handleProceedToReflection = () => {
    audioEngine.playSfx('tactile_tap');
    if (voiceCoach) {
      audioEngine.speak('If this feeling had a voice, what would it say?');
    }
    setPhase('reflection');
  };

  const handleFinish = () => {
    audioEngine.playSfx('celebration_chords');
    if (voiceCoach) {
      audioEngine.speak('You did something meaningful. You named and honored your experience.');
    }
    setPhase('complete');
    if (onComplete) {
      const validation =
        EMOTION_VALIDATIONS[activeEmotionName.toLowerCase()] ||
        "Whatever you feel is allowed. There's no right or wrong emotion.";
      onComplete({
        emotion: activeEmotionName,
        intensity,
        intensityLabel: getIntensityMeta(intensity).label,
        reflection: reflectionText,
        validation
      });
    }
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setPhase('start');
    setCountdown(5);
    setSelectedEmotion('');
    setCustomEmotion('');
    setIsCustomMode(false);
    setIntensity(5);
    setReflectionText('');
  };

  const currentValidation =
    EMOTION_VALIDATIONS[activeEmotionName.toLowerCase()] ||
    "Whatever you feel is allowed. There's no right or wrong emotion. Giving it space is the first step to peace.";

  const intensityMeta = getIntensityMeta(intensity);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 text-[#5e2be2] dark:text-purple-300">
            <Heart className="w-5 h-5 text-[#5e2be2] dark:text-purple-400" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
              ACT-06 • Emotional Awareness Check-In
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activityName || 'Name the Moment'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceCoach(!voiceCoach)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            <Volume2 className={`w-3.5 h-3.5 ${voiceCoach ? 'text-[#5e2be2]' : 'text-slate-400'}`} />
            <span>{voiceCoach ? 'Voice On' : 'Muted'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Restart Exercise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-6 sm:p-10 relative z-10">
        {/* PHASE 1: START */}
        {phase === 'start' && (
          <div className="max-w-2xl mx-auto text-center space-y-6 py-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#5e2be2] to-indigo-500 p-0.5 mx-auto shadow-xl shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#5e2be2]" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Name the Moment
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Notice what you feel — an <span className="font-bold text-[#5e2be2]">Emotional Awareness Approach</span>
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
              Take a slow breath. Let's gently check in with how you're feeling right now in this present moment.
            </p>

            <div className="bg-purple-50/70 dark:bg-purple-950/40 border-l-4 border-[#5e2be2] p-4 sm:p-5 rounded-2xl text-left max-w-lg mx-auto">
              <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-200 italic leading-relaxed font-medium">
                "Whatever you feel is allowed. There is no right or wrong emotion."
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStart}
                className="px-10 py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-purple-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Emotional Check-In
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: PAUSE & BREATHE */}
        {phase === 'breathe' && (
          <div className="max-w-md mx-auto text-center space-y-8 py-8 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Just notice your breath
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No need to control it. Simply observe the natural rhythm.
              </p>
            </div>

            {/* Glowing Pulsing Breathing Orb with Countdown */}
            <div className="flex justify-center py-6">
              <div className="relative flex items-center justify-center">
                <div className="w-44 h-44 rounded-full bg-[#5e2be2]/10 dark:bg-[#5e2be2]/20 animate-ping duration-[3000ms] absolute" />
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-purple-100 via-indigo-50 to-purple-50 dark:from-purple-900/40 dark:via-indigo-950/40 dark:to-purple-950/40 border-2 border-[#5e2be2]/30 shadow-2xl shadow-purple-500/20 flex flex-col items-center justify-center relative animate-pulse duration-[2000ms]">
                  <span className="text-6xl font-black text-[#5e2be2] dark:text-purple-300">
                    {countdown}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mt-1">
                    Breathe In Peace
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Take your time. There's no rush.
            </p>

            <button
              onClick={() => {
                setCountdown(0);
                setPhase('emotion');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Skip breath to emotions →
            </button>
          </div>
        )}

        {/* PHASE 3: IDENTIFY EMOTION */}
        {phase === 'emotion' && (
          <div className="max-w-2xl mx-auto space-y-6 py-4 animate-fade-in">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                What are you feeling?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose or type the emotion that feels closest — even if it's uncertain.
              </p>
            </div>

            {/* 12 Emotion Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CORE_EMOTIONS.map((e) => {
                const isSelected = selectedEmotion === e.name && !isCustomMode;
                return (
                  <button
                    key={e.name}
                    onClick={() => handleSelectEmotion(e.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/70 border-[#5e2be2] text-[#5e2be2] dark:text-purple-300 shadow-md shadow-purple-500/10 ring-2 ring-[#5e2be2]/30 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50/50 dark:hover:bg-slate-800 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{e.emoji}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5e2be2] dark:text-purple-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{e.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{e.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Or type in your own words:
              </label>
              <textarea
                rows={2}
                value={customEmotion}
                onChange={(e) => handleCustomEmotionChange(e.target.value)}
                placeholder="Type what you're feeling in your own words (e.g., Anxious about tomorrow's presentation)..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/20 font-medium resize-none shadow-xs"
              />
            </div>

            <button
              onClick={handleProceedToIntensity}
              disabled={!activeEmotionName.trim()}
              className="w-full py-4 bg-[#5e2be2] hover:bg-[#4f28d9] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              Continue to Intensity →
            </button>
          </div>
        )}

        {/* PHASE 4: RATE INTENSITY */}
        {phase === 'intensity' && (
          <div className="max-w-xl mx-auto space-y-8 py-6 animate-fade-in">
            <div className="text-center space-y-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Acknowledged: {activeEmotionName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                How strong is this feeling?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Reflect on the somatic intensity on a scale of 1 to 10.
              </p>
            </div>

            {/* Slider & Tier Display */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>🌱 Mild (1)</span>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-2xl">{intensityMeta.emoji}</span>
                  <span className="text-base font-extrabold text-[#5e2be2] dark:text-purple-300">{intensityMeta.label}</span>
                </div>
                <span>🔥 Intense (10)</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5e2be2]"
              />

              <div className="text-center">
                <span className="text-5xl font-black text-[#5e2be2] dark:text-purple-300">
                  {intensity}
                </span>
                <span className="text-sm font-bold text-slate-400 ml-1.5">/ 10</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('emotion')}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleProceedToReflection}
                className="flex-1 py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                Continue to Reflection →
              </button>
            </div>
          </div>
        )}

        {/* PHASE 5: REFLECTION */}
        {phase === 'reflection' && (
          <div className="max-w-xl mx-auto space-y-6 py-6 animate-fade-in">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Reflect & Listen Inward
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                If this feeling had a voice, what would it say?
              </p>
            </div>

            {/* Inspiration Chips */}
            <div className="bg-purple-50/70 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-2">
              <div className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                ✨ Tap an inspiration phrase or write your own:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'I need rest.',
                  'I feel unseen right now.',
                  "I'm proud of myself for trying.",
                  'Everything feels loud right now.',
                  'I need a moment to breathe.'
                ].map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => setReflectionText(phrase)}
                    className="px-3 py-1 rounded-xl text-xs bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 hover:bg-purple-100/60 font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={4}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What does your feeling want to tell you? What support do you need right now?"
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/20 font-medium shadow-xs resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                Complete Check-In →
              </button>
            </div>
          </div>
        )}

        {/* PHASE 6: COMPASSIONATE VALIDATION & COMPLETION */}
        {phase === 'complete' && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#5e2be2] to-indigo-500 p-0.5 mx-auto shadow-xl shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl">
                ✨
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                {activeEmotionName}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5e2be2] dark:text-purple-300 mt-1">
                Emotional State Witnessed & Honored
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400">Intensity Level:</span>
                <span className="text-[#5e2be2] dark:text-purple-300 font-extrabold flex items-center gap-1.5">
                  {intensity}/10 {intensityMeta.emoji} ({intensityMeta.label})
                </span>
              </div>
              {reflectionText && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs space-y-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block">Inner Voice Reflection:</span>
                  <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{reflectionText}"</p>
                </div>
              )}
            </div>

            {/* Compassionate Clinical Validation Message */}
            <div className="bg-purple-50 dark:bg-purple-950/50 border-l-4 border-[#5e2be2] p-5 sm:p-6 rounded-2xl text-left shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5e2be2] dark:text-purple-300 mb-1.5">
                ✨ Compassionate Validation:
              </p>
              <p className="text-sm sm:text-base text-purple-950 dark:text-purple-100 font-medium italic leading-relaxed">
                "{currentValidation}"
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                You did something meaningful — you noticed and accepted your experience without judgment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Start Another Check-In
              </button>
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                }}
                className="flex-1 py-3.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Educational & Clinical Reference Accordion Section (Parity with live reference) */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What is Name the Moment?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
              Name the Moment is a compassionate emotional check-in practice that helps you recognize and label your current emotional state in a gentle, mindful, and non-judgmental way. Rather than trying to fix or change your emotions, this practice creates space to observe what you're feeling without criticism or resistance. It's a foundational skill in both mindfulness and cognitive behavioral therapy for building emotional intelligence and self-compassion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Increases Emotional Awareness</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Naming what you feel develops deeper insight into your emotional patterns and triggers, forming the base for self-understanding.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Reduces Emotional Overwhelm</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Labeling an emotion decreases amygdala reactivity. When you observe feelings instead of suppressing them, you process them more quickly.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Builds Self-Compassion</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Teaches you to meet yourself with kindness rather than judgment, cultivating a supportive inner voice.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Enhances Resilience</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Rewires the nervous system to respond to feelings with curiosity rather than avoidance, boosting emotional flexibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-07: BIO-RADAR PHYSICAL GROUNDING (5-Sense Somatic Sonar)
   ───────────────────────────────────────────────────────────── */
function BioRadarPhysicalGrounding({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const steps = [
    { num: 5, sense: 'SIGHT', icon: Eye, prompt: 'Scan and identify 5 specific visual patterns or colors in your field of view.', voice: 'Notice 5 things you can see right now.', color: '#06b6d4' },
    { num: 4, sense: 'TOUCH', icon: Hand, prompt: 'Feel 4 physical textures (fabric on thighs, solid chair support, feet on floor).', voice: 'Notice 4 physical sensations and textures.', color: '#8b5cf6' },
    { num: 3, sense: 'SOUND', icon: Volume2, prompt: 'Listen closely for 3 distant or subtle acoustic frequencies in the environment.', voice: 'Listen for 3 sounds around you.', color: '#ec4899' },
    { num: 2, sense: 'SMELL', icon: Sparkles, prompt: 'Detect 2 aromas in the room (fresh air, coffee, cedar, or skin scent).', voice: 'Notice 2 scents in the air.', color: '#f59e0b' },
    { num: 1, sense: 'BREATH', icon: Heart, prompt: 'Take 1 slow, deep abdominal breath and note the cool air entering your nostrils.', voice: 'Take 1 deep grounding breath.', color: '#10b981' }
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const step = steps[currentIdx];
  const StepIcon = step.icon;

  const handleNext = () => {
    audioEngine.playSfx('sonar_ping');
    if (currentIdx < steps.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      audioEngine.speak(steps[next].voice);
    } else {
      setIsCompleted(true);
      audioEngine.playSfx('celebration_chords');
      audioEngine.speak('Full 5-sense physical grounding achieved. Your body is safely connected.');
      if (onComplete) onComplete({ completed: true });
    }
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setCurrentIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-purple-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-teal-600 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
              ACT-07 • 5-SENSE RADAR MATRIX
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Physical Grounding'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Progressively engage all 5 afferent neural pathways to terminate fight-or-flight cascades.
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {!isCompleted ? (
        <div className="max-w-md mx-auto text-center space-y-6 relative z-10">
          <div
            className="w-32 h-32 rounded-3xl p-1 mx-auto shadow-lg shadow-teal-500/20 flex items-center justify-center transition-all duration-700"
            style={{ background: `linear-gradient(135deg, ${step.color}, #5e2be2)` }}
          >
            <div className="w-full h-full rounded-3xl bg-white flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">{step.num}</span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: step.color }}>
                {step.sense}
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: step.color }}>
              <StepIcon className="w-4 h-4" /> Somatic Channel {currentIdx + 1} of 5
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{step.prompt}</p>
          </div>

          <button
            onClick={handleNext}
            className="px-10 py-4 bg-gradient-to-r from-teal-600 to-[#5e2be2] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all mx-auto cursor-pointer"
          >
            {currentIdx === 4 ? 'Complete Full Grounding' : 'Channel Verified & Sensed'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-[#5e2be2] p-1 mx-auto shadow-lg shadow-teal-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Full Afferent Re-Anchoring</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              All 5 physical sensory channels have delivered confirmed safety signals to the thalamus.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Repeat Somatic Scan
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-13: PREFRONTAL COGNITIVE ARCADE (Cognitive Grounding)
   ───────────────────────────────────────────────────────────── */
function PrefrontalCognitiveArcade({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [puzzleType, setPuzzleType] = useState<'categories' | 'countdown' | 'alphabet'>('categories');
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsActive(false);
      audioEngine.playSfx('celebration_chords');
      audioEngine.speak(`Cognitive drill finished. You recalled ${score} items.`);
      if (onComplete) onComplete({ score, puzzleType });
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds, score, puzzleType, onComplete]);

  const handleStart = (type: 'categories' | 'countdown' | 'alphabet') => {
    audioEngine.playSfx('sonar_ping');
    setPuzzleType(type);
    setTimerSeconds(45);
    setScore(0);
    setIsActive(true);
    audioEngine.speak(`Challenge starting. Speak items aloud and tap to count.`);
  };

  const handleItemCount = () => {
    audioEngine.playSfx('neural_sparkle');
    setScore((s) => s + 1);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-purple-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 shadow-inner">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              ACT-13 • PREFRONTAL FOCUS DRILL
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Cognitive Grounding'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Force cognitive executive re-engagement via rapid structured working-memory tasks.
            </p>
          </div>
        </div>
      </div>

      {!isActive ? (
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <p className="text-xs text-center text-slate-600 font-bold mb-3">
            Select a working-memory challenge protocol to break the loop of emotional distress:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleStart('categories')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 text-left transition-all space-y-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <div className="font-black text-xs text-slate-900">Category Blitz</div>
              <div className="text-[10px] text-slate-500 leading-snug">Name 5 green foods, 5 capital cities, 5 movie titles.</div>
            </button>

            <button
              onClick={() => handleStart('countdown')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 text-left transition-all space-y-2 cursor-pointer shadow-sm"
            >
              <Compass className="w-5 h-5 text-cyan-600" />
              <div className="font-black text-xs text-slate-900">Reverse 7s</div>
              <div className="text-[10px] text-slate-500 leading-snug">Count backwards from 100 in decrements of 7.</div>
            </button>

            <button
              onClick={() => handleStart('alphabet')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 text-left transition-all space-y-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-fuchsia-600" />
              <div className="font-black text-xs text-slate-900">Alpha Chain</div>
              <div className="text-[10px] text-slate-500 leading-snug">Name a calming or empowering concept for A through Z.</div>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center space-y-6 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>{puzzleType.toUpperCase()} PROTOCOL</span>
            <span className="text-amber-600 font-black text-sm">{timerSeconds}s REMAINING</span>
          </div>

          <div className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            {puzzleType === 'categories' && (
              <>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Active Challenge</div>
                <div className="text-xl font-black text-slate-900 leading-snug">"Name 5 animals, 5 countries, and 5 book titles out loud"</div>
              </>
            )}
            {puzzleType === 'countdown' && (
              <>
                <div className="text-[10px] font-black text-cyan-600 uppercase tracking-wider">Active Challenge</div>
                <div className="text-2xl font-black text-slate-900 tracking-widest">100 → 93 → 86 → 79 → 72 → 65...</div>
              </>
            )}
            {puzzleType === 'alphabet' && (
              <>
                <div className="text-[10px] font-black text-fuchsia-600 uppercase tracking-wider">Active Challenge</div>
                <div className="text-xl font-black text-slate-900 leading-snug">A (Air) → B (Breathe) → C (Calm) → D (Dawn)...</div>
              </>
            )}

            <div className="pt-3">
              <button
                onClick={handleItemCount}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-[#5e2be2] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                +1 Item Recalled ({score} Total)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodLiftMindfulnessGrounding;
