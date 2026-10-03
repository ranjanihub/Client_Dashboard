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
   Precision Anatomical Vector Guides directly matching each posture instruction
   ───────────────────────────────────────────────────────────── */
function PostureVisualGuide({ step }: { step: PostureStepConfig }) {
  return (
    <div className="relative w-full max-w-[260px] h-[240px] sm:h-[260px] rounded-3xl bg-gradient-to-b from-[#1e1045] via-[#161233] to-[#0d0f22] border-2 border-purple-400/30 shadow-2xl flex flex-col items-center justify-between p-4 text-white overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5e2be2]/25 via-transparent to-purple-400/10 pointer-events-none" />

      {/* STEP 1: POSITION - CROWN LIFTING & UPRIGHT SEATED PLUMB LINE */}
      {step.visualType === 'position' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Background Grid Lines */}
            <line x1="80" y1="10" x2="80" y2="150" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
            
            {/* Upward Crown Lift String & Arrow */}
            <path d="M80 32 L80 12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="80,8 75,18 85,18" fill="#38bdf8" />
            <circle cx="80" cy="8" r="4" fill="#38bdf8" fillOpacity="0.4" className="animate-ping" />

            {/* Seated Ergonomic Chair */}
            <path d="M52 100 L52 140 M52 110 L108 110" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M52 65 L52 110" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />

            {/* Human Figure */}
            {/* Head */}
            <circle cx="80" cy="42" r="11" fill="#c084fc" stroke="#f3e8ff" strokeWidth="1.5" />
            {/* Spine */}
            <path d="M80 53 L80 100" stroke="#e9d5ff" strokeWidth="5" strokeLinecap="round" />
            {/* Shoulders */}
            <line x1="62" y1="62" x2="98" y2="62" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            {/* Thigh (horizontal) */}
            <path d="M80 100 L112 100" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
            {/* Shin (vertical to floor) */}
            <path d="M112 100 L112 135" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
            {/* Foot on floor */}
            <path d="M112 135 L124 135" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            {/* Floor line */}
            <line x1="30" y1="137" x2="140" y2="137" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="absolute top-1 right-1 bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>↑</span> Crown Lifted
          </div>
        </div>
      )}

      {/* STEP 2: SHOULDER RESET - UP, BACK, DOWN CIRCULAR ROLL */}
      {step.visualType === 'shoulders' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Head & Neck */}
            <circle cx="80" cy="36" r="12" fill="#e0e7ff" stroke="#818cf8" strokeWidth="1.5" />
            <path d="M74 48 L74 60 M86 48 L86 60" stroke="#818cf8" strokeWidth="2" />

            {/* Torso */}
            <path d="M80 62 L80 125" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 68 Q80 62 110 68" stroke="#a5b4fc" strokeWidth="5" fill="none" strokeLinecap="round" />

            {/* Left Shoulder Roll Cycle (Up -> Back -> Down) */}
            <path
              d="M48 68 C35 52, 28 60, 36 78 C42 86, 54 82, 50 68"
              stroke="#38bdf8"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 2"
              className="animate-spin"
              style={{ transformOrigin: '42px 70px', animationDuration: '4s' }}
            />
            {/* Right Shoulder Roll Cycle (Up -> Back -> Down) */}
            <path
              d="M112 68 C125 52, 132 60, 124 78 C118 86, 106 82, 110 68"
              stroke="#38bdf8"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 2"
              className="animate-spin"
              style={{ transformOrigin: '118px 70px', animationDuration: '4s' }}
            />

            {/* Roll Step Sequence Cues */}
            <g transform="translate(80, 135)">
              <rect x="-65" y="-12" width="130" height="20" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="2" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="bold">
                1. UP ➔ 2. BACK ➔ 3. DOWN
              </text>
            </g>
          </svg>
          <div className="absolute top-1 right-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            🔄 Scapular Roll
          </div>
        </div>
      )}

      {/* STEP 3: CHEST ALIGNMENT - STERNUM LIFT & THORACIC EXPANSION */}
      {step.visualType === 'chest' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Head */}
            <circle cx="80" cy="30" r="11" fill="#fce7f3" stroke="#f472b6" strokeWidth="1.5" />
            {/* Broad Open Shoulders */}
            <path d="M40 58 Q80 50 120 58" stroke="#f472b6" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            
            {/* Expanding Ribcage & Radiant Heart Center */}
            <circle cx="80" cy="74" r="22" fill="#ec4899" fillOpacity="0.2" className="animate-ping duration-[2500ms]" />
            <circle cx="80" cy="74" r="12" fill="#ec4899" />
            
            {/* Lateral Chest Expansion Arrows */}
            <path d="M64 74 L32 74" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
            <polygon points="30,74 38,69 38,79" fill="#fb7185" />
            
            <path d="M96 74 L128 74" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
            <polygon points="130,74 122,69 122,79" fill="#fb7185" />

            {/* Sternum Lift Upward Vector */}
            <path d="M80 64 L80 48" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="80,45 76,52 84,52" fill="#f43f5e" />

            {/* Torso Base */}
            <path d="M80 86 L80 130" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="absolute top-1 right-1 bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            ⟵ Open Chest ⟶
          </div>
        </div>
      )}

      {/* STEP 4: JAW RELAXATION - FACIAL PROFILE & TMJ RELEASE */}
      {step.visualType === 'jaw' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Detailed Head & Facial Profile */}
            <path
              d="M55 35 C55 18, 98 18, 98 42 C98 50, 105 58, 103 68 C101 75, 88 80, 84 94 C80 106, 70 114, 65 125"
              stroke="#34d399"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Eye (Closed in peaceful relaxation) */}
            <path d="M85 48 Q90 52 95 48" stroke="#6ee7b7" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Softly Parted Lips (Unclenched) */}
            <path d="M96 74 Q100 76 104 74" stroke="#a7f3d0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M97 78 Q100 80 103 78" stroke="#a7f3d0" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Masseter / Jaw Relaxation Halo */}
            <circle cx="86" cy="85" r="16" fill="#10b981" fillOpacity="0.25" className="animate-pulse" />
            <circle cx="86" cy="85" r="7" fill="#34d399" />

            {/* Downward Drop Arrow */}
            <path d="M86 98 L86 118" stroke="#6ee7b7" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
            <polygon points="86,122 81,114 91,114" fill="#6ee7b7" />
          </svg>
          <div className="absolute top-1 right-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            👄 Unclench Teeth
          </div>
        </div>
      )}

      {/* STEP 5: HAND RELEASE - UNCLENCHED SOFT PALMS */}
      {step.visualType === 'hands' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Left Hand Silhouette (Open & relaxed) */}
            <path
              d="M40 105 L40 70 Q40 58 48 58 Q56 58 56 70 L56 50 Q56 40 64 40 Q72 40 72 50 L72 54 Q72 44 80 44 Q88 44 88 56 L88 70 Q88 62 94 62 Q100 62 100 75 L100 95 Q100 120 70 120 Z"
              stroke="#fbbf24"
              strokeWidth="3.5"
              fill="#f59e0b"
              fillOpacity="0.25"
              strokeLinejoin="round"
            />
            {/* Soothing Release Waves */}
            <circle cx="70" cy="82" r="18" fill="#fbbf24" fillOpacity="0.2" className="animate-ping duration-[3000ms]" />
            <circle cx="70" cy="82" r="8" fill="#fbbf24" />

            {/* Release Wave Arcs */}
            <path d="M30 40 Q70 18 110 40" stroke="#fde68a" strokeWidth="2.5" strokeDasharray="4 4" fill="none" className="animate-pulse" />
            <path d="M22 28 Q70 2 118 28" stroke="#fcd34d" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
          </svg>
          <div className="absolute top-1 right-1 bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            ✋ Soft Open Palms
          </div>
        </div>
      )}

      {/* STEP 6: SPINE ALIGNMENT - 3-POINT AXIS (EAR • SHOULDER • HIP) */}
      {step.visualType === 'spine' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Vertical Plumb Line (Alignment Axis) */}
            <line x1="80" y1="12" x2="80" y2="148" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />

            {/* 3 Key Target Alignment Nodes */}
            {/* Node 1: Ear / Head */}
            <circle cx="80" cy="28" r="9" fill="#c084fc" stroke="#f3e8ff" strokeWidth="2" />
            <circle cx="80" cy="28" r="14" fill="#a855f7" fillOpacity="0.2" />

            {/* Node 2: Shoulder Center */}
            <circle cx="80" cy="62" r="7" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" />
            <circle cx="80" cy="62" r="12" fill="#0ea5e9" fillOpacity="0.2" />

            {/* Node 3: Hip / Pelvis Center */}
            <circle cx="80" cy="112" r="7" fill="#ec4899" stroke="#fce7f3" strokeWidth="2" />
            <circle cx="80" cy="112" r="12" fill="#ec4899" fillOpacity="0.2" />

            {/* Natural S-Spine Column connecting the nodes */}
            <path
              d="M80 37 Q74 50 80 62 Q86 86 80 112"
              stroke="#e9d5ff"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Alignment labels */}
            <text x="100" y="32" fill="#c084fc" fontSize="8" fontWeight="bold">EAR</text>
            <text x="100" y="66" fill="#38bdf8" fontSize="8" fontWeight="bold">SHOULDER</text>
            <text x="100" y="116" fill="#ec4899" fontSize="8" fontWeight="bold">HIP</text>
          </svg>
          <div className="absolute top-1 right-1 bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            📏 3-Point Axis
          </div>
        </div>
      )}

      {/* STEP 7: DEEP BREATH - 360° DIAPHRAGMATIC EXPANSION */}
      {step.visualType === 'breath' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Outer Expanding Breath Rings */}
            <circle cx="80" cy="80" r="54" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 6" fill="none" className="animate-spin duration-[14000ms]" />
            <circle cx="80" cy="80" r="40" fill="#0ea5e9" fillOpacity="0.2" className="animate-ping duration-[3000ms]" />
            
            {/* Expanding Torso / Diaphragm Core */}
            <circle cx="80" cy="80" r="24" fill="#38bdf8" stroke="#bae6fd" strokeWidth="2" />
            
            {/* 360° Expansion Radial Arrows */}
            <path d="M80 64 L80 48 M80 96 L80 112 M64 80 L48 80 M96 80 L112 80" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="80,44 76,52 84,52" fill="#ffffff" />
            <polygon points="80,116 76,108 84,108" fill="#ffffff" />
            <polygon points="44,80 52,76 52,84" fill="#ffffff" />
            <polygon points="116,80 108,76 108,84" fill="#ffffff" />

            <text x="80" y="84" textAnchor="middle" fill="#082f49" fontSize="9" fontWeight="900">
              BREATHE
            </text>
          </svg>
          <div className="absolute top-1 right-1 bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            🌬️ 360° Inhale
          </div>
        </div>
      )}

      {/* Focus Area Footer Badge */}
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
        audioEngine.speak(`${currentStep.title}. ${currentStep.instruction}`);
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
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 text-[#5e2be2] dark:text-purple-300">
            <Activity className="w-5 h-5 text-[#5e2be2] dark:text-purple-400 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
              ACT-08 • Somatic Grounding Technique
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activityName || 'Posture Reset'}
            </h2>
          </div>
        </div>

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
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Restart Exercise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-6 sm:p-10 relative z-10">
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
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-purple-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 shadow-inner">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              ACT-09 • DBT DISTRESS TOLERANCE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Self-Soothing'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Bathe autonomic sensory channels in safe, comforting stimuli to arrest acute distress loops.
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer">
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
