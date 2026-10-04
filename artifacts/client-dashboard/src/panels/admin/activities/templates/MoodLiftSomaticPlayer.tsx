import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Coffee,
  Eye,
  Hand,
  Check,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Shield,
  Wind
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

export const MoodLiftSomaticPlayer: React.FC<BaseActivityComponentProps> = ({
  activityId = 'ACT-08',
  activityName,
  onComplete
}) => {
  if (activityId === 'ACT-08') {
    return <BiomechanicalPostureHUD activityName={activityName} onComplete={onComplete} />;
  } else {
    return <DbtMultiSensoryComfortMatrix activityName={activityName} onComplete={onComplete} />;
  }
};

/* ─────────────────────────────────────────────────────────────
   ACT-08: POSTURE RESET (Somatic Alignment & Neuromuscular Grounding)
   Reference: https://moodlift.hexpertify.com/games/posture-reset
   ───────────────────────────────────────────────────────────── */
interface PostureStepConfig {
  id: number;
  title: string;
  instruction: string;
  voice: string;
  duration: number;
  tag: string;
  focusArea: string;
  imgUrl?: string;
  visualType: 'position' | 'shoulders' | 'chest' | 'jaw' | 'hands' | 'spine' | 'breath';
}

const POSTURE_STEPS: PostureStepConfig[] = [
  {
    id: 1,
    title: 'Position',
    instruction: 'Sit or stand tall. Imagine a string lifting the crown of your head upward.',
    voice: 'Sit or stand tall. Imagine a string gently lifting the crown of your head upward.',
    duration: 6,
    tag: 'CRANIAL AXIS',
    focusArea: 'Head Crown & Vertical Axis',
    imgUrl: '/images/postures/posture_1.jpg',
    visualType: 'position'
  },
  {
    id: 2,
    title: 'Shoulder Reset',
    instruction: 'Roll your shoulders up… back… and down. Feel the tension release.',
    voice: 'Roll your shoulders up, back, and down. Feel the accumulated tension melt away.',
    duration: 6,
    tag: 'SCAPULAR DEPRESSION',
    focusArea: 'Trapezius & Shoulder Blades',
    imgUrl: '/images/postures/posture_2.jpg',
    visualType: 'shoulders'
  },
  {
    id: 3,
    title: 'Chest Alignment',
    instruction: 'Lift your chest slightly. Open your shoulders wide, sitting tall and proud.',
    voice: 'Lift your chest slightly and open your shoulders wide, sitting tall and proud.',
    duration: 6,
    tag: 'THORACIC EXPANSION',
    focusArea: 'Pectorals & Sternum Opening',
    imgUrl: '/images/postures/posture_3.jpg',
    visualType: 'chest'
  },
  {
    id: 4,
    title: 'Jaw Relaxation',
    instruction: 'Relax your jaw and soften your facial muscles. Let your shoulders drop.',
    voice: 'Unclench your jaw and soften your facial muscles. Let your shoulders drop.',
    duration: 6,
    tag: 'FACIAL RELEASE',
    focusArea: 'Masseter & Facial Softening',
    imgUrl: '/images/postures/posture_4.jpg',
    visualType: 'jaw'
  },
  {
    id: 5,
    title: 'Hand Release',
    instruction: 'Unclench your hands and let your arms rest naturally at your sides.',
    voice: 'Unclench your hands and let your arms rest naturally at your sides.',
    duration: 6,
    tag: 'PALM RELAXATION',
    focusArea: 'Palms & Finger Flexors',
    imgUrl: '/images/postures/posture_5.jpg',
    visualType: 'hands'
  },
  {
    id: 6,
    title: 'Spine Alignment',
    instruction: 'Feel your entire spine lengthening. Align your head over your shoulders, shoulders over your hips.',
    voice: 'Feel your entire spine lengthening. Align your head over your shoulders, and shoulders over your hips.',
    duration: 6,
    tag: 'AXIAL LENGTHENING',
    focusArea: 'Vertebral Column Alignment',
    imgUrl: '/images/postures/posture_6.jpg',
    visualType: 'spine'
  },
  {
    id: 7,
    title: 'Deep Breath',
    instruction: 'Take one slow deep breath in… hold for a moment… and slowly exhale. Feel the alignment.',
    voice: 'Take one slow deep breath in... hold for a moment... and slowly exhale, feeling the alignment.',
    duration: 6,
    tag: 'INTEGRATED BREATH',
    focusArea: '360° Diaphragmatic Breath',
    imgUrl: '/images/postures/posture_7.jpg',
    visualType: 'breath'
  }
];

/* ─────────────────────────────────────────────────────────────
   VISUAL SOMATIC REFERENCE ILLUSTRATION COMPONENT
   AI 3D Cartoon Character Illustrations matching each posture
   ───────────────────────────────────────────────────────────── */
function PostureVisualGuide({ step }: { step: PostureStepConfig }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [step.id]);

  // Primary: AI Generated 3D Cartoon Character Image (Steps 1, 2, 3)
  if (step.imgUrl && !imgFailed) {
    return (
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden bg-gradient-to-tr from-purple-100 to-indigo-50 dark:bg-slate-900 shadow-2xl shadow-purple-900/25 border-2 border-white/60 dark:border-purple-400/40 flex items-center justify-center group transition-all">
        <img
          src={step.imgUrl}
          alt={step.title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle Bottom Focus Badge */}
        <div className="absolute bottom-2 inset-x-2 bg-slate-900/80 backdrop-blur-md rounded-xl py-1.5 px-2.5 text-center text-[10px] font-extrabold text-purple-200 border border-white/10 shadow-lg">
          ✨ {step.focusArea}
        </div>
      </div>
    );
  }

  // 3D Cartoon Character Vector Guides (Steps 4, 5, 6, 7)
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-[#2a1357] via-[#1c1444] to-[#0f1126] border-2 border-purple-400/40 shadow-2xl flex flex-col items-center justify-between p-3.5 text-white overflow-hidden group">
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5e2be2]/30 via-transparent to-purple-300/10 pointer-events-none" />

      {/* STEP 4: CUTE 3D CARTOON AVATAR - JAW RELAXATION */}
      {step.visualType === 'jaw' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 140 140" className="w-32 h-32">
            <defs>
              <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fba36e" />
              </radialGradient>
              <radialGradient id="hoodieGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#5e2be2" />
              </radialGradient>
            </defs>

            {/* Dropped Relaxed Shoulders (Purple Hoodie) */}
            <path d="M25 125 Q70 95 115 125 L115 140 L25 140 Z" fill="url(#hoodieGrad)" />
            <path d="M70 100 L70 140" stroke="#4c1d95" strokeWidth="2.5" />

            {/* 3D Cartoon Character Head */}
            <circle cx="70" cy="62" r="34" fill="url(#faceGrad)" />

            {/* Cute Cartoon Hair */}
            <path d="M38 55 Q70 20 102 55 Q90 32 70 34 Q50 32 38 55 Z" fill="#471b05" />

            {/* Serene Closed Cartoon Eyes (Curved happy lines) */}
            <path d="M52 58 Q58 64 64 58" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M76 58 Q82 64 88 58" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Soft Rosy Cheeks (Blush) */}
            <circle cx="48" cy="68" r="6" fill="#f43f5e" fillOpacity="0.35" />
            <circle cx="92" cy="68" r="6" fill="#f43f5e" fillOpacity="0.35" />

            {/* Soft Relaxed Open Smile / Unclenched Jaw */}
            <path d="M62 74 Q70 82 78 74" stroke="#78350f" strokeWidth="2.5" fill="#fbcfe8" strokeLinecap="round" />

            {/* Green Jaw Relaxation Aura */}
            <circle cx="70" cy="78" r="16" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
            <path d="M70 86 L70 98" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
            <polygon points="70,101 67,95 73,95" fill="#34d399" />
          </svg>
          <div className="absolute top-0 right-0 bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-[8.5px] font-black px-2 py-0.5 rounded-full">
            👄 Relaxed Jaw
          </div>
        </div>
      )}

      {/* STEP 5: CUTE 3D CARTOON AVATAR - HAND RELEASE */}
      {step.visualType === 'hands' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 140 140" className="w-32 h-32">
            <defs>
              <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fba36e" />
              </linearGradient>
            </defs>

            {/* Relaxed Seated Character Body */}
            <ellipse cx="70" cy="115" rx="42" ry="20" fill="#5e2be2" />

            {/* Pair of 3D Cartoon Open Resting Hands */}
            {/* Left Hand */}
            <g transform="translate(42, 75)">
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#handGrad)" />
              <circle cx="-6" cy="-8" r="3.5" fill="#fed7aa" />
              <circle cx="-1" cy="-10" r="3.5" fill="#fed7aa" />
              <circle cx="4" cy="-10" r="3.5" fill="#fed7aa" />
              <circle cx="9" cy="-8" r="3.5" fill="#fed7aa" />
              <circle cx="0" cy="0" r="10" fill="#fbbf24" fillOpacity="0.3" className="animate-ping duration-[2500ms]" />
            </g>

            {/* Right Hand */}
            <g transform="translate(98, 75)">
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#handGrad)" />
              <circle cx="-9" cy="-8" r="3.5" fill="#fed7aa" />
              <circle cx="-4" cy="-10" r="3.5" fill="#fed7aa" />
              <circle cx="1" cy="-10" r="3.5" fill="#fed7aa" />
              <circle cx="6" cy="-8" r="3.5" fill="#fed7aa" />
              <circle cx="0" cy="0" r="10" fill="#fbbf24" fillOpacity="0.3" className="animate-ping duration-[2500ms]" />
            </g>

            {/* Glowing Golden Sparkles */}
            <path d="M70 38 Q70 48 78 48 Q70 48 70 58 Q70 48 62 48 Q70 48 70 38" fill="#fde047" className="animate-pulse" />
          </svg>
          <div className="absolute top-0 right-0 bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[8.5px] font-black px-2 py-0.5 rounded-full">
            ✋ Open Palms
          </div>
        </div>
      )}

      {/* STEP 6: CUTE 3D CARTOON AVATAR - SPINE ALIGNMENT */}
      {step.visualType === 'spine' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 140 140" className="w-32 h-32">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>

            {/* Upright Plumb Alignment Beam */}
            <line x1="70" y1="8" x2="70" y2="132" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
            
            {/* Glowing Golden Crown Star */}
            <polygon points="70,6 72,12 78,12 73,15 75,21 70,17 65,21 67,15 62,12 68,12" fill="#fbbf24" className="animate-bounce" />

            {/* 3D Character Head */}
            <circle cx="70" cy="34" r="15" fill="#fed7aa" />
            <path d="M57 32 Q70 16 83 32 Q77 22 70 23 Q63 22 57 32 Z" fill="#471b05" />
            <circle cx="65" cy="34" r="1.5" fill="#451a03" />
            <circle cx="75" cy="34" r="1.5" fill="#451a03" />
            <path d="M67 39 Q70 42 73 39" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* 3D Aligned Torso & Spine */}
            <rect x="58" y="52" width="24" height="42" rx="12" fill="url(#bodyGrad)" />

            {/* Alignment Beads along spine */}
            <circle cx="70" cy="58" r="3.5" fill="#38bdf8" />
            <circle cx="70" cy="72" r="3.5" fill="#a855f7" />
            <circle cx="70" cy="86" r="3.5" fill="#ec4899" />

            {/* Seated Leg Base */}
            <ellipse cx="70" cy="110" rx="30" ry="10" fill="#312e81" />
          </svg>
          <div className="absolute top-0 right-0 bg-purple-500/30 border border-purple-400/50 text-purple-200 text-[8.5px] font-black px-2 py-0.5 rounded-full">
            ✨ Aligned Spine
          </div>
        </div>
      )}

      {/* STEP 7: CUTE 3D CARTOON AVATAR - DEEP BREATH */}
      {step.visualType === 'breath' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 140 140" className="w-32 h-32">
            <defs>
              <radialGradient id="breathAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Expanding 3D Breath Aura */}
            <circle cx="70" cy="70" r="48" fill="url(#breathAura)" className="animate-ping duration-[3500ms]" />
            <circle cx="70" cy="70" r="38" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" fill="none" className="animate-spin duration-[12000ms]" />

            {/* Cute Meditating Character */}
            <circle cx="70" cy="46" r="16" fill="#fed7aa" />
            <path d="M56 44 Q70 26 84 44 Q77 34 70 35 Q63 34 56 44 Z" fill="#471b05" />
            {/* Peaceful Closed Eyes */}
            <path d="M62 45 Q65 48 68 45" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 45 Q75 48 78 45" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Hands Gently Over Heart/Chest in Inhale */}
            <rect x="56" y="64" width="28" height="34" rx="14" fill="#0284c7" />
            <circle cx="66" cy="76" r="5" fill="#fed7aa" />
            <circle cx="74" cy="76" r="5" fill="#fed7aa" />

            {/* Glowing Heart Center */}
            <circle cx="70" cy="76" r="8" fill="#38bdf8" fillOpacity="0.5" className="animate-pulse" />
          </svg>
          <div className="absolute top-0 right-0 bg-sky-500/30 border border-sky-400/50 text-sky-200 text-[8.5px] font-black px-2 py-0.5 rounded-full">
            🌬️ Deep Breath
          </div>
        </div>
      )}

      {/* Focus Area Badge */}
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-100 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-md">
        ✨ {step.focusArea}
      </span>
    </div>
  );
}

function BiomechanicalPostureHUD({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isStepReady, setIsStepReady] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(6);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);

  const currentStep = POSTURE_STEPS[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / POSTURE_STEPS.length) * 100;
  const isLastStep = currentStepIndex === POSTURE_STEPS.length - 1;

  // Countdown timer for 6 seconds per step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isCompleted) {
      setIsStepReady(false);
      setCountdownSeconds(6);
      if (voiceEnabled) {
        audioEngine.speak(currentStep.voice || currentStep.instruction);
      }

      interval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setIsStepReady(true);
            audioEngine.playSfx('neural_sparkle');
            setCompletedStepIds((existing) => (existing.includes(currentStep.id) ? existing : [...existing, currentStep.id]));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStepIndex, isPlaying, isCompleted, voiceEnabled]);

  const handleStart = () => {
    audioEngine.playSfx('tactile_tap');
    setIsPlaying(true);
    setIsCompleted(false);
  };

  const handleNextStep = () => {
    audioEngine.playSfx('sonar_ping');
    if (isLastStep) {
      setIsPlaying(false);
      setIsCompleted(true);
      audioEngine.playSfx('celebration_chords');
      if (voiceEnabled) {
        audioEngine.speak('Posture reset complete. Your spine is aligned, relaxed, and open.');
      }
      if (onComplete) onComplete({ completed: true });
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    audioEngine.playSfx('tactile_tap');
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSelectStep = (idx: number) => {
    audioEngine.playSfx('tactile_tap');
    setCurrentStepIndex(idx);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setIsStepReady(false);
    setCountdownSeconds(6);
    setCompletedStepIds([]);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/80">
          Posture Reset • Step {currentStepIndex + 1} of {POSTURE_STEPS.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Restart Exercise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-4 sm:p-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            A <span className="font-bold text-[#5e2be2]">Somatic Grounding Technique</span> supported by <span className="font-bold text-slate-700 dark:text-slate-300">Cognitive Behavioral Therapy (CBT)</span> principles to help reconnect your mind and body.
          </p>

          {/* Progress Header & Bar */}
          <div className="space-y-1.5 text-left max-w-2xl mx-auto">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Step {currentStepIndex + 1} of {POSTURE_STEPS.length}</span>
              <span className="text-[#5e2be2] dark:text-purple-300">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-[#5e2be2] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hero Step Card with Integrated Visual Guide or Completion Box */}
          {!isCompleted ? (
            <div className="bg-gradient-to-br from-[#5e2be2] via-purple-600 to-indigo-700 rounded-3xl shadow-xl shadow-purple-500/15 p-6 sm:p-8 text-white min-h-[300px] flex flex-col justify-between relative overflow-hidden text-center transition-all">
              {/* Subtle light effect */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              <div className="space-y-1 relative z-10">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-200 bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
                  STEP {currentStep.id} • {currentStep.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-1.5">
                  {currentStep.title}
                </h3>
              </div>

              {/* Side-by-Side or Centered Visual Guide & Cue */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-3 relative z-10">
                {/* Visual Image / Diagram */}
                <div className="sm:col-span-5 flex justify-center">
                  <PostureVisualGuide step={currentStep} />
                </div>

                {/* Instruction Text & Guidance */}
                <div className="sm:col-span-7 text-left space-y-3">
                  <p className="text-base sm:text-lg font-normal leading-relaxed text-purple-50">
                    {currentStep.instruction}
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 block">
                      🎯 Anatomical Target
                    </span>
                    <p className="text-xs text-purple-100 font-medium">
                      {currentStep.focusArea}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-center pt-2">
                {isPlaying && !isStepReady ? (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md animate-pulse">
                    ⏱️ Hold posture: ready in {countdownSeconds}s
                  </span>
                ) : isStepReady ? (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-400 text-slate-900 shadow-md">
                    ✨ Hold complete! Ready for next step →
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 text-purple-200">
                    Ready to begin 6-second hold
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-xl shadow-emerald-500/15 p-8 sm:p-10 text-white min-h-[300px] flex flex-col items-center justify-center text-center animate-fade-in space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mx-auto">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black">Posture Reset Completed</h3>
              <p className="text-base text-emerald-100 max-w-md mx-auto font-medium">
                You’ve completed the full 7-step posture reset sequence. Your cervical spine is decompressed, shoulders are relaxed, and breathing capacity is restored.
              </p>
            </div>
          )}

          {/* 7 Numbered Stepper Buttons */}
          {!isCompleted && (
            <div className="flex justify-center gap-2 sm:gap-2.5 flex-wrap pt-1">
              {POSTURE_STEPS.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = completedStepIds.includes(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`w-10 h-10 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#5e2be2] text-white shadow-lg shadow-purple-500/30 scale-110 ring-2 ring-purple-300'
                        : isDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isDone ? '✓' : step.id}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Control Buttons */}
          <div className="flex gap-3 justify-center items-center flex-wrap pt-2">
            {!isCompleted ? (
              <>
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                )}

                {!isPlaying && (
                  <button
                    onClick={handleStart}
                    className="px-8 py-3.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Start Sequence
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={!isStepReady && isPlaying}
                  className={`px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md ${
                    isStepReady || !isPlaying
                      ? 'bg-[#5e2be2] hover:bg-[#4f28d9] text-white cursor-pointer shadow-purple-500/25'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isLastStep ? 'Complete Sequence' : 'Next Step →'}
                </button>

                <button
                  onClick={handleReset}
                  className="p-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Practice Again
                </button>
                <button
                  onClick={() => {
                    if (onComplete) onComplete({ completed: true });
                  }}
                  className="px-8 py-3.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Return to Activities
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Educational & Clinical Reference Accordion Section (Parity with live reference) */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What is Posture Reset?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
              Posture Reset is a guided sequence of posture-correcting somatic movements designed to counteract the neurological and musculoskeletal effects of prolonged sitting and stress. By focusing on each body part sequentially, you build proprioceptive awareness and establish effortless upright postural habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Release Tension</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Melt away accumulated stress and neuromuscular tension from shoulders, trapezius, and neck.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Improve Alignment</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Train your motor cortex for effortless, balanced posture and spinal decompression throughout the day.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Reduce Headaches</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Alleviate tension headaches caused by suboccipital constriction and forward-head slumping.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-[#5e2be2] dark:text-purple-300">Boost Energy & Oxygen</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Expand thoracic volume, improving diaphragm mobility, blood circulation, and cerebral oxygenation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-09: DBT MULTI-SENSORY COMFORT MATRIX (Self-Soothing)
   ───────────────────────────────────────────────────────────── */
function DbtMultiSensoryComfortMatrix({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const selectedItems = {
    sight: 'Warm sunlight / serene nature landscape',
    sound: 'Gentle ambient rain or 432Hz theta frequencies',
    touch: 'Soft weighted texture or cool smooth marble',
    smell: 'Calming lavender, fresh cedar, or citrus',
    taste: 'Mindful sip of warm herbal tea or cool mint'
  };

  const [checkedSenses, setCheckedSenses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const senses = [
    { key: 'sight', label: 'Visual Channel', icon: Eye, color: 'text-amber-500 bg-amber-50 border-amber-200', default: 'Warm sunlight or pleasing minimalist art', voice: 'Engaging visual comfort' },
    { key: 'sound', label: 'Auditory Channel', icon: Volume2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200', default: 'Gentle ambient acoustic tones or ocean waves', voice: 'Engaging auditory soundscape' },
    { key: 'touch', label: 'Tactile Somatosensory', icon: Hand, color: 'text-purple-600 bg-purple-50 border-purple-200', default: 'Comfortable textured fabric or smooth cool object', voice: 'Engaging tactile touch sensation' },
    { key: 'smell', label: 'Olfactory Scent', icon: Sparkles, color: 'text-rose-500 bg-rose-50 border-rose-200', default: 'Lavender, cedarwood, or clean morning air', voice: 'Engaging soothing scent' },
    { key: 'taste', label: 'Gustatory Savoring', icon: Coffee, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', default: 'Mindful warm chamomile tea or refreshing mint', voice: 'Mindful taste and hydration' }
  ];

  const toggleCheck = (key: string) => {
    audioEngine.playSfx('tactile_tap');
    if (checkedSenses.includes(key)) {
      setCheckedSenses(checkedSenses.filter((k) => k !== key));
    } else {
      const updated = [...checkedSenses, key];
      setCheckedSenses(updated);
      const sObj = senses.find((s) => s.key === key);
      if (sObj) {
        audioEngine.playSfx('neural_sparkle');
        audioEngine.speak(sObj.voice);
      }
      if (updated.length === senses.length) {
        setIsCompleted(true);
        audioEngine.playSfx('celebration_chords');
        audioEngine.speak('Full 5-sense self-soothing comfort activated.');
        if (onComplete) onComplete({ selectedItems });
      }
    }
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setCheckedSenses([]);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-6 text-slate-800 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-100 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200">
          DBT Comfort Matrix ({checkedSenses.length}/5 Senses)
        </span>
        <button onClick={handleReset} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs transition-all cursor-pointer" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {!isCompleted ? (
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <div className="flex justify-between text-xs font-bold text-rose-600">
            <span>Sensory Channels Engaged ({checkedSenses.length}/5)</span>
            <span>Tap card as you experience each element</span>
          </div>

          <div className="space-y-3">
            {senses.map((s) => {
              const Icon = s.icon;
              const isChecked = checkedSenses.includes(s.key);
              return (
                <div
                  key={s.key}
                  onClick={() => toggleCheck(s.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isChecked
                      ? 'bg-rose-50/50 border-rose-300 shadow-sm ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900">{s.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{(selectedItems as any)[s.key] || s.default}</div>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    isChecked ? 'bg-gradient-to-tr from-rose-500 to-[#5e2be2] border-rose-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-[#5e2be2] p-1 mx-auto shadow-lg shadow-rose-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-rose-500">
              <Heart className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Full Multisensory Comfort Reached</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              All 5 somatic channels have transmitted parasympathetic comfort signals to your nervous system.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Review Kit Again
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodLiftSomaticPlayer;
