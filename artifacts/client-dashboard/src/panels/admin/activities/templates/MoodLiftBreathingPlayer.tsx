import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Square,
  Waves,
  ArrowRightLeft,
  CircleDot,
  Heart,
  Wind,
  Volume2,
  VolumeX,
  Brain,
  TrendingDown,
  Smile,
  ShieldCheck,
  Activity,
  Info,
  Triangle,
  Moon
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

export const MoodLiftBreathingPlayer: React.FC<BaseActivityComponentProps> = ({
  activityId = 'ACT-01',
  activityName,
  onComplete
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [activityId]);

  if (activityId === 'ACT-02') {
    return <BoxBreathingTacticalHUD activityName={activityName} onComplete={onComplete} />;
  } else if (activityId === 'ACT-03') {
    return <Triangle478BreathingPlayer activityName={activityName} onComplete={onComplete} />;
  } else if (activityId === 'ACT-04') {
    return <AlternateNostrilHemisphericPlayer activityName={activityName} onComplete={onComplete} />;
  } else {
    return <DiaphragmaticBellyPlayer activityName={activityName} onComplete={onComplete} />;
  }
};

/* ─────────────────────────────────────────────────────────────
   ACT-01: DIAPHRAGMATIC BELLY BREATHING (Orbiting Pacer Ring UI)
   Reference: Clinical Vagus Nerve Stimulation & Diaphragmatic Pacing
   ───────────────────────────────────────────────────────────── */
function DiaphragmaticBellyPlayer({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [phaseSecsLeft, setPhaseSecsLeft] = useState<number>(4);
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0 to 1 smooth progress
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(5);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    audioEngine.setVoiceEnabled(next);
    if (!next) {
      audioEngine.stopSpeaking();
    }
  };

  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showAnatomyGuide, setShowAnatomyGuide] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<"chimes" | "ocean" | "bowl" | "silent">("chimes");

  // Unmount cleanup to stop voice
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  // Get user name if available
  let clientName = "Kristen";
  try {
    const rawAuth = localStorage.getItem("client_auth") || localStorage.getItem("auth_user") || localStorage.getItem("user");
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.name) {
        clientName = parsed.name.split(" ")[0];
      }
    }
  } catch { }

  const phases = [
    {
      name: 'Inhale',
      instruction: 'Breathe in slowly',
      cue: 'Expand your lower abdomen gently as your diaphragm descends.',
      duration: 4,
      voice: 'Inhale.',
      color: '#5e2be2',
      glow: 'rgba(94, 43, 226, 0.45)',
      rate: 1.0
    },
    {
      name: 'Hold',
      instruction: 'Hold gently',
      cue: 'Rest effortlessly in full expansion without muscular strain.',
      duration: 2,
      voice: 'Hold.',
      color: '#7c3aed',
      glow: 'rgba(124, 58, 237, 0.5)',
      rate: 1.0
    },
    {
      name: 'Exhale',
      instruction: 'Exhale slowly',
      cue: 'Release all tension as your belly button draws gently toward spine.',
      duration: 8,
      voice: 'Exhale.',
      color: '#4f46e5',
      glow: 'rgba(79, 70, 229, 0.45)',
      rate: 1.0
    }
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);

  const phaseIndexRef = useRef(phaseIndex);
  phaseIndexRef.current = phaseIndex;
  const elapsedInPhaseRef = useRef<number>(0);

  // High-precision subsecond 60FPS animation loop and smooth phase transitions
  useEffect(() => {
    let animFrame: number;
    let phaseStartTimestamp: number | null = null;

    const tick = (now: number) => {
      if (!isPlaying || isCompleted) return;

      if (!phaseStartTimestamp) {
        // Resume seamlessly from the exact elapsed position within the active phase
        phaseStartTimestamp = now - elapsedInPhaseRef.current;
      }

      const pIdx = phaseIndexRef.current;
      const curP = phases[pIdx];
      const phaseDurationMs = curP.duration * 1000;
      const elapsedMs = Math.max(0, now - phaseStartTimestamp);
      elapsedInPhaseRef.current = elapsedMs;

      const progress = Math.min(1, Math.max(0, elapsedMs / phaseDurationMs));
      setPhaseProgress(progress);

      const secsRemaining = Math.max(1, Math.ceil((phaseDurationMs - elapsedMs) / 1000));
      setPhaseSecsLeft(secsRemaining);

      if (elapsedMs >= phaseDurationMs) {
        // Complete current phase and transition smoothly to the next
        phaseStartTimestamp = now;
        elapsedInPhaseRef.current = 0;
        const nextIdx = (pIdx + 1) % phases.length;
        if (nextIdx === 0) {
          setCompletedCycles((c) => c + 1);
        }
        setPhaseIndex(nextIdx);
        phaseIndexRef.current = nextIdx;
        const nextP = phases[nextIdx];

        // Soundscape trigger
        if (soundscape !== "silent") {
          if (nextIdx === 0) audioEngine.playSfx('inhale_whoosh');
          else if (nextIdx === 1) audioEngine.playSfx('singing_bowl');
          else if (nextIdx === 2) audioEngine.playSfx('exhale_whoosh');
          else audioEngine.playSfx('neural_sparkle');
        }

        if (voiceEnabledRef.current) {
          audioEngine.speak(nextP.voice, true, nextP.rate);
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted, soundscape]);

  // Overall session elapsed duration timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setTotalSecondsElapsed((prev) => {
          const nextTotal = prev + 1;
          if (nextTotal >= targetTotalSeconds) {
            setIsPlaying(false);
            setIsCompleted(true);
            audioEngine.playSfx('celebration_chords');
            if (voiceEnabledRef.current) {
              audioEngine.speak('Diaphragmatic breathing complete. Your nervous system is calm.', true, 1.0);
            }
            if (onComplete) {
              onComplete({ 
                completedCycles: completedCycles + 1,
                durationMinutes: selectedDurationMinutes,
                calmScore: 99,
                parasympatheticTone: "Optimal",
                completedAt: new Date().toISOString()
              });
            }
          }
          return nextTotal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isCompleted, targetTotalSeconds, completedCycles, selectedDurationMinutes, onComplete]);

  const handleTogglePlay = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (soundscape !== "silent") {
        if (phaseIndex === 0) audioEngine.playSfx('inhale_whoosh');
        else if (phaseIndex === 1) audioEngine.playSfx('singing_bowl');
        else if (phaseIndex === 2) audioEngine.playSfx('exhale_whoosh');
      }
      if (voiceEnabledRef.current) {
        audioEngine.speak(currentPhase.voice, true, currentPhase.rate);
      }
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    elapsedInPhaseRef.current = 0;
    setIsPlaying(false);
    setPhaseIndex(0);
    phaseIndexRef.current = 0;
    setPhaseSecsLeft(phases[0].duration);
    setPhaseProgress(0);
    setTotalSecondsElapsed(0);
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG Circle Geometry (Optimized to fit in single viewport without scrolling)
  const svgSize = 200;
  const strokeWidth = 10;
  const center = svgSize / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;

  // Calculate the current stroke-dashoffset based on progress
  const strokeDashoffset = circumference - (phaseProgress * circumference);

  // Position of the orbiting purple head-dot
  // In the rotated (-90deg) SVG, angle = 0 is the exact TOP (12 o'clock)
  const angle = phaseProgress * 2 * Math.PI;
  const dotX = center + radius * Math.cos(angle);
  const dotY = center + radius * Math.sin(angle);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between p-4 sm:p-5 sm:px-8 select-none">
        {/* Soft Ambient Floating Glows */}
        <div className="absolute top-6 left-8 w-60 h-60 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-8 w-64 h-64 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* ─────────────────────────────────────────────────────────────
            1. TOP CONTROLS (VOICE TOGGLE ONLY)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-end">
          <button
            onClick={handleToggleVoice}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN INTERACTIVE CIRCULAR PACER STAGE
         ───────────────────────────────────────────────────────────── */}
      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-1.5">
          {showAnatomyGuide ? (
            /* Anatomical 360 Diaphragm Guide Overlay */
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-4 border border-purple-200/60 dark:border-purple-900/60 max-w-sm text-center space-y-2 animate-fade-in shadow-inner">
              <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border border-purple-300/60 shadow-md">
                <img src="/images/postures/posture_7.jpg" alt="Diaphragmatic Breath" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Anatomical Belly Expansion</h4>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep chest still. As you inhale, let your diaphragm push down so your lower abdomen balloons outward 360°.
              </p>
              <button
                onClick={() => setShowAnatomyGuide(false)}
                className="px-3.5 py-1 bg-[#5e2be2] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to Pacer
              </button>
            </div>
          ) : (
            /* THE INSPIRATION CIRCULAR PACER */
            <div className="relative flex flex-col items-center justify-center">
              {/* Soft Radial Ambient Glow */}
              <div
                className="absolute rounded-full transition-all duration-1000 ease-out pointer-events-none"
                style={{
                  width: '220px',
                  height: '220px',
                  background: isPlaying ? `radial-gradient(circle, ${currentPhase.glow} 0%, transparent 70%)` : 'transparent',
                  filter: 'blur(20px)'
                }}
              />

              {/* Circular SVG Track & Orbiting Head-Dot */}
              <div className="relative flex items-center justify-center cursor-pointer group" onClick={handleTogglePlay}>
                <svg
                  width={svgSize}
                  height={svgSize}
                  viewBox={`0 0 ${svgSize} ${svgSize}`}
                  className="transform -rotate-90 pointer-events-none transition-transform duration-700"
                >
                  <defs>
                    <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                      <stop offset="50%" stopColor="#7c3aed" stopOpacity="1" />
                      <stop offset="100%" stopColor="#5e2be2" stopOpacity="1" />
                    </linearGradient>
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Subtle Grey/Pale Guide Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(226, 232, 240, 0.9)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="dark:stroke-slate-800"
                  />

                  {/* Active Hexpertify Purple Dynamic Progress Arc */}
                  {isPlaying && (
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="url(#orbitGrad)"
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Glowing Orbiting Purple Head-Dot */}
                  {isPlaying ? (
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r={strokeWidth / 2 + 1}
                      fill="#5e2be2"
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="url(#dotGlow)"
                    />
                  ) : (
                    /* Resting Top Dot when idle (12 o'clock in -rotate-90 SVG) */
                    <circle
                      cx={center + radius}
                      cy={center}
                      r={strokeWidth / 2 + 1}
                      fill="#5e2be2"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                {/* Center Content: Phase Name, Cue, and Countdown */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                  {isPlaying ? (
                    <div className="space-y-1 animate-fade-in">
                      {/* Phase Title: Inhale / Hold / Exhale */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {currentPhase.name}
                      </h3>
                      {/* Action Subtext: Breathe in slowly */}
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[150px] mx-auto leading-tight">
                        {currentPhase.instruction}
                      </p>
                      {/* Countdown seconds: 4s */}
                      <div className="text-xl font-black text-[#5e2be2] dark:text-purple-400 pt-0.5">
                        {phaseSecsLeft}s
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleTogglePlay}
                        className="px-5 py-2 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Start
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Somatic Cue Pill */}
              <div className="mt-1.5 text-center max-w-xs">
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full inline-block border border-slate-200 dark:border-slate-700">
                  {isPlaying ? currentPhase.cue : 'Place hand on lower belly. Expand abdomen naturally.'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           SESSION COMPLETE CELEBRATION
           ───────────────────────────────────────────────────────────── */
        <div className="relative z-10 text-center py-4 space-y-3 max-w-sm mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 p-1 mx-auto flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#5e2be2] flex items-center justify-center text-white shadow-md shadow-purple-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Diaphragmatic Session Complete</h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              You completed {completedCycles} deep breath cycles ({selectedDurationMinutes} mins of mindful vagal stimulation).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Vagal Tone</span>
              <span className="text-base font-black text-[#5e2be2]">Parasympathetic</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Breath Cycles</span>
              <span className="text-base font-black text-[#5e2be2]">{completedCycles} Cycles</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          >
            Practice Again
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM CONTROLS (DURATION SELECTORS & PLAY/PAUSE)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Duration Selectors in Bottom Section */}
        {!isPlaying && !isCompleted && (
          <div className="flex items-center justify-center gap-1.5">
            {[1, 3, 5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  audioEngine.playSfx('tactile_tap');
                  setSelectedDurationMinutes(mins);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${selectedDurationMinutes === mins
                    ? 'bg-[#5e2be2] text-white shadow-sm shadow-purple-500/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
              >
                {mins} MIN
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Central Play/Pause with Time remaining */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {formatTime(remainingSeconds)} remaining
            </span>
          </div>

          {/* Balanced spacer for perfect symmetry */}
          <div className="w-[70px] hidden sm:block" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TECHNIQUE INFO MODAL
         ───────────────────────────────────────────────────────────── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-100 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5e2be2]">Clinical Mechanism</span>
              <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>
            <h3 className="text-lg font-bold">How Diaphragmatic Breathing Works</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When inhaling by expanding your abdomen, the dome-shaped diaphragm muscle moves downward, stimulating the <strong>Vagus nerve</strong> to slow heart rate, lower blood pressure, and activate parasympathetic relaxation.
            </p>
            <div className="bg-purple-50 dark:bg-purple-950/60 p-3.5 rounded-2xl space-y-1.5 text-xs text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60">
              <div className="font-bold">🌿 4-2-8 Cadence (No Rest):</div>
              <div>• <strong>Inhale (4s)</strong>: Breathe in through nose, abdomen expands as diaphragm descends.</div>
              <div>• <strong>Hold (1-2s)</strong>: The Pause — gentle resting pause without muscular strain.</div>
              <div>• <strong>Exhale (8s)</strong>: Smooth release through mouth, belly button draws toward spine.</div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-[#5e2be2] hover:bg-[#4d1fc4] text-white rounded-2xl text-xs font-bold uppercase cursor-pointer transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>

    {/* ─────────────────────────────────────────────────────────────
        4. EDUCATIONAL DESCRIPTION CARD: What is Diaphragmatic Breathing?
       ───────────────────────────────────────────────────────────── */}
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Section 1: Overview */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          What is Diaphragmatic Breathing?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
          Diaphragmatic breathing, also known as belly breathing or deep breathing, is a foundational technique that engages your diaphragm to maximize oxygen intake. Unlike shallow chest breathing, this technique encourages your belly to expand fully as you breathe in, allowing your lungs to fill with oxygen and triggering your body's natural relaxation response.
        </p>
      </div>

      {/* Section 2: How It Works */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#5e2be2]" />
            <span>How It Works</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
            Follow this 3-step rhythmic cadence to engage your diaphragm and optimize vagal nerve stimulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 1: Inhale */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                Inhale
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 text-[10px] font-bold">
                4 SECONDS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Slowly inhale through your nose, focusing on expanding your belly and diaphragm. Your chest should move minimally while your belly expands like a balloon filling with air.
            </p>
          </div>

          {/* Step 2: Hold (The Pause) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#7c3aed] dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">2</span>
                Hold (The Pause)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950 text-[#7c3aed] dark:text-indigo-300 text-[10px] font-bold">
                1–2 SECONDS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Gently pause your breath without muscular strain, allowing oxygen to be absorbed and activating your parasympathetic nervous system.
            </p>
          </div>

          {/* Step 3: Exhale */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4f46e5] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#4f46e5] dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">3</span>
                Exhale
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950 text-[#4f46e5] dark:text-blue-300 text-[10px] font-bold">
                8 SECONDS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Slowly release your breath through your mouth, allowing your belly to naturally deflate. The extended 8-second exhale helps calm your nervous system even more.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Benefits */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#5e2be2]" />
            <span>Benefits</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
            Scientifically documented psychological and physiological benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Benefit 1: Instant Calm */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#5e2be2]/10 dark:bg-[#5e2be2]/20 flex items-center justify-center text-[#5e2be2]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant Calm</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Activates your parasympathetic nervous system, creating an immediate sense of relaxation and peace.
            </p>
          </div>

          {/* Benefit 2: Mental Clarity */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mental Clarity</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Increased oxygen flow to your brain enhances focus, reduces brain fog, and sharpens mental clarity.
            </p>
          </div>

          {/* Benefit 3: Lowers Heart Rate */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2 hover:border-rose-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lowers Heart Rate</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Reduces cortisol and adrenaline levels, naturally lowering your heart rate and blood pressure.
            </p>
          </div>

          {/* Benefit 4: Emotional Balance */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-2 hover:border-teal-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Smile className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emotional Balance</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Releases tension stored in your body and promotes emotional stability and resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Closing Takeaway */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3.5">
        <div className="w-7 h-7 rounded-full bg-[#5e2be2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-justify">
          By practicing diaphragmatic breathing regularly, you can build emotional resilience, reduce anxiety, and strengthen your mind-body connection.
        </p>
      </div>
    </div>
  </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-02: BOX BREATHING (Hexpertify 4x4 Matrix Pacer)
   ───────────────────────────────────────────────────────────── */
function BoxBreathingTacticalHUD({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0); // 0=Inhale(Top), 1=Hold(Right), 2=Exhale(Bottom), 3=Hold(Left)
  const [cycleProgress, setCycleProgress] = useState<number>(0); // 0.0 to 1.0 continuous monotonic progress
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(2);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [completedBoxes, setCompletedBoxes] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    audioEngine.setVoiceEnabled(next);
    if (!next) {
      audioEngine.stopSpeaking();
    }
  };

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Unmount cleanup to stop voice
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  const phases = [
    { name: 'Inhale', voice: 'Inhale.', cue: 'Inhale smoothly through your nose, filling your lungs.' },
    { name: 'Hold', voice: 'Hold.', cue: 'Hold with calm and relaxed chest.' },
    { name: 'Exhale', voice: 'Exhale.', cue: 'Exhale smoothly and steadily through your mouth.' },
    { name: 'Hold', voice: 'Hold.', cue: 'Rest empty in the quiet pause before next breath.' }
  ];

  const currentPhase = phases[phaseIndex] || phases[0];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingTotalSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);
  const cycleElapsedMsRef = useRef<number>(0);

  // Smooth unified continuous animation frame loop (zero frame jitter or desync)
  useEffect(() => {
    let animFrame: number;
    let cycleStartMs: number | null = null;
    const cycleDurationMs = 16000;
    let lastPhase = -1;

    const animateDot = (timestamp: number) => {
      if (!isPlaying || isCompleted) return;

      if (!cycleStartMs) {
        // Seamlessly resume from exact position within the 16s square cycle
        cycleStartMs = timestamp - cycleElapsedMsRef.current;
      }

      const totalElapsed = timestamp - cycleStartMs;
      const cycleElapsed = totalElapsed % cycleDurationMs;
      cycleElapsedMsRef.current = cycleElapsed;
      const progress = cycleElapsed / cycleDurationMs; // 0.0 -> 1.0 monotonic
      setCycleProgress(progress);

      const curPhase = Math.min(3, Math.floor(progress * 4));
      if (curPhase !== lastPhase) {
        lastPhase = curPhase;
        setPhaseIndex(curPhase);
        if (curPhase === 0 && totalElapsed >= cycleDurationMs) {
          setCompletedBoxes((b) => b + 1);
        }
        audioEngine.playSfx('singing_bowl');
        if (voiceEnabledRef.current) {
          audioEngine.speak(phases[curPhase].voice, true, 1.0);
        }
      }

      animFrame = requestAnimationFrame(animateDot);
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(animateDot);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted]);

  // Main session timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setTotalSecondsElapsed((prevTotal) => {
          const nextTotal = prevTotal + 1;
          if (nextTotal >= targetTotalSeconds) {
            setIsPlaying(false);
            setIsCompleted(true);
            audioEngine.playSfx('celebration_chords');
            if (voiceEnabledRef.current) {
              audioEngine.speak('Box breathing complete. Autonomic nervous system balanced.', true, 1.0);
            }
            if (onComplete) {
              onComplete({
                completedBoxes: completedBoxes + 1,
                durationMinutes: selectedDurationMinutes,
                calmScore: 97,
                completedAt: new Date().toISOString()
              });
            }
          }
          return nextTotal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isCompleted, targetTotalSeconds, onComplete, completedBoxes, selectedDurationMinutes]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (voiceEnabledRef.current) {
        audioEngine.speak(phases[phaseIndex].voice, true, 1.0);
      }
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    cycleElapsedMsRef.current = 0;
    setIsPlaying(false);
    setPhaseIndex(0);
    setCycleProgress(0);
    setTotalSecondsElapsed(0);
    setCompletedBoxes(0);
    setIsCompleted(false);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate coordinates for the glowing orb gliding directly on top of the square perimeter lines
  // Box is 180 x 180 with rounded-[24px] (R = 23, stroke center = 1px / 179px)
  const perimeterLength = 672.513; // 4 * 132 + 4 * (23 * PI / 2)
  const currentFilledLength = cycleProgress * perimeterLength;
  const strokeDashoffset = perimeterLength - currentFilledLength;

  const getOrbPosition = (p: number) => {
    const R = 23;
    const S = 180;
    const strLen = S - 2 * R - 2; // 132px straight line segment
    const arcLen = R * (Math.PI / 2); // ~36.128px corner arc
    const qtrLen = strLen + arcLen; // ~168.128px per quadrant
    const L = qtrLen * 4; // 672.513px

    const clampedP = Math.max(0, Math.min(0.999999, p));
    const totalDist = clampedP * L;
    const side = Math.min(3, Math.floor(totalDist / qtrLen));
    const d = totalDist - side * qtrLen;

    switch (side) {
      case 0: { // Top: left to right (Inhale)
        if (d <= strLen) {
          return { x: 24 + d, y: 1 };
        }
        const theta = (d - strLen) / R; // 0 to PI/2
        return {
          x: 156 + R * Math.sin(theta),
          y: 24 - R * Math.cos(theta)
        };
      }
      case 1: { // Right: top to bottom (Hold)
        if (d <= strLen) {
          return { x: 179, y: 24 + d };
        }
        const theta = (d - strLen) / R;
        return {
          x: 156 + R * Math.cos(theta),
          y: 156 + R * Math.sin(theta)
        };
      }
      case 2: { // Bottom: right to left (Exhale)
        if (d <= strLen) {
          return { x: 156 - d, y: 179 };
        }
        const theta = (d - strLen) / R;
        return {
          x: 24 - R * Math.sin(theta),
          y: 156 + R * Math.cos(theta)
        };
      }
      case 3: { // Left: bottom to top (Hold)
        if (d <= strLen) {
          return { x: 1, y: 156 - d };
        }
        const theta = (d - strLen) / R;
        return {
          x: 24 - R * Math.cos(theta),
          y: 24 - R * Math.sin(theta)
        };
      }
      default:
        return { x: 24, y: 1 };
    }
  };

  const orbPos = getOrbPosition(cycleProgress);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans'] flex flex-col items-center justify-between p-4 sm:p-5 sm:px-8 select-none">
        {/* Background Soft Glow Orbs */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        {/* Top Header Controls (Voice Toggle Only) */}
        <div className="w-full flex items-center justify-end z-10 pb-1">
          <button
            onClick={handleToggleVoice}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>

        {!isCompleted ? (
          <div className="flex flex-col items-center justify-center space-y-2.5 my-1 sm:my-1.5 z-10 w-full max-w-md">
            {/* ─────────────────────────────────────────────────────────────
                THE GLOWING PERIMETER SQUARE BOX (HEXPERTIFY SIGNATURE)
               ───────────────────────────────────────────────────────────── */}
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              {/* Ambient Purple Glow Halo */}
              <div className="absolute inset-0 rounded-[24px] bg-[#5e2be2]/15 blur-xl pointer-events-none" />

              {/* Clean Rounded Perimeter Box Container (No interior fill shading) */}
              <div className="absolute inset-0 rounded-[24px] border-[2px] border-[#5e2be2]/40 dark:border-purple-800/60 bg-slate-50/60 dark:bg-slate-800/40 backdrop-blur-sm pointer-events-none shadow-[0_0_20px_rgba(94,43,226,0.15)]" />

              {/* SVG Dynamic Glowing Perimeter Stroke that fills with the ball */}
              <svg className="absolute inset-0 w-[180px] h-[180px] pointer-events-none overflow-visible z-10" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="activeBoxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="40%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#5e2be2" />
                  </linearGradient>
                  <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Base Guide Outline */}
                <path
                  d="M 24 1 L 156 1 A 23 23 0 0 1 179 24 L 179 156 A 23 23 0 0 1 156 179 L 24 179 A 23 23 0 0 1 1 156 L 1 24 A 23 23 0 0 1 24 1 Z"
                  fill="none"
                  stroke="rgba(94, 43, 226, 0.25)"
                  strokeWidth="2"
                  className="dark:stroke-purple-900/40"
                />

                {/* Animated Perimeter Stroke that fills continuously behind the ball */}
                {isPlaying && (
                  <path
                    d="M 24 1 L 156 1 A 23 23 0 0 1 179 24 L 179 156 A 23 23 0 0 1 156 179 L 24 179 A 23 23 0 0 1 1 156 L 1 24 A 23 23 0 0 1 24 1 Z"
                    fill="none"
                    stroke="url(#activeBoxGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={perimeterLength}
                    strokeDashoffset={strokeDashoffset}
                    filter="url(#activeGlow)"
                  />
                )}
              </svg>

              {/* The Glowing Laser Ball directly centered on top of perimeter lines */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5e2be2] to-[#a855f7] shadow-[0_0_8px_#5e2be2,0_0_14px_rgba(94,43,226,0.85)] pointer-events-none ring-1.5 ring-white dark:ring-slate-900 transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${orbPos.x}px`,
                  top: `${orbPos.y}px`,
                }}
              />

              {/* Center Display (Timer & Phase Text or Start Button) */}
              <div className="relative z-10 text-center space-y-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                {isPlaying ? (
                  <div className="space-y-0.5 animate-fade-in">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                      {formatTime(remainingTotalSeconds)}
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#5e2be2] dark:text-purple-300 uppercase tracking-wider transition-all duration-300">
                      {currentPhase.name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleToggle}
                      className="px-5 py-2 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Start
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Somatic Directive Cue */}
            <div className="mt-1.5 text-center max-w-xs">
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full inline-block border border-slate-200 dark:border-slate-700">
                {isPlaying ? currentPhase.cue : 'Maintain steady upright posture. Follow the luminous orb around the perimeter.'}
              </span>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. BOTTOM CONTROLS (DURATION SELECTORS & PLAY/PAUSE/RESET)
               ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
              {/* Duration Selectors in Bottom Section */}
              {!isPlaying && !isCompleted && (
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 5].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        audioEngine.playSfx('tactile_tap');
                        setSelectedDurationMinutes(mins);
                        setTotalSecondsElapsed(0);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        selectedDurationMinutes === mins
                          ? 'bg-[#5e2be2] text-white shadow-sm shadow-purple-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {mins} MIN
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Reset Button on Left */}
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>

                {/* Central Play/Pause with Time remaining */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleToggle}
                    className="w-10 h-10 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {formatTime(remainingTotalSeconds)} remaining
                  </span>
                </div>

                {/* Balanced spacer for perfect symmetry */}
                <div className="w-[70px] hidden sm:block" />
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             SESSION COMPLETED CARD
             ───────────────────────────────────────────────────────────── */
          <div className="text-center py-6 space-y-4 max-w-sm mx-auto animate-fade-in z-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 p-1 mx-auto shadow-md shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-[#5e2be2]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Autonomic Balance Achieved</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                You completed {completedBoxes} full 4x4 box breathing cycles ({selectedDurationMinutes} minutes of equalized parasympathetic regulation).
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-500/25 transition-all cursor-pointer"
            >
              Practice Another Box
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          EDUCATIONAL DESCRIPTION CARD: What is Box Breathing?
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Section 1: Overview */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            What is Box Breathing?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            Box breathing is a powerful breathing technique that follows a simple 4-4-4-4 pattern: breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, and hold for 4 seconds. This rhythmic pattern helps regulate your nervous system and brings balance to your mind and body. It's commonly used by athletes, military personnel, and wellness practitioners to manage stress and improve focus.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Square className="w-5 h-5 text-[#5e2be2]" />
              <span>How It Works</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Follow the 4 equal sides of the square to reset your autonomic nervous system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Step 1: Breathe In */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Breathe In
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 text-[10px] font-bold">
                  4 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Slowly inhale through your nose, expanding your diaphragm and filling your lungs with fresh oxygen.
              </p>
            </div>

            {/* Step 2: Hold */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#7c3aed] dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Hold
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950 text-[#7c3aed] dark:text-indigo-300 text-[10px] font-bold">
                  4 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Hold your breath to allow oxygen to circulate through your body, activating the parasympathetic nervous system.
              </p>
            </div>

            {/* Step 3: Breathe Out */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#4f46e5] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#4f46e5] dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Breathe Out
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950 text-[#4f46e5] dark:text-blue-300 text-[10px] font-bold">
                  4 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Gently exhale through your mouth, releasing tension and stress from your body.
              </p>
            </div>

            {/* Step 4: Hold */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold">4</span>
                  Hold
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                  4 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Hold before beginning the cycle again, allowing your body to settle into a calm state.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>Benefits</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Key physiological and psychological benefits of structured box breathing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Benefit 1: Reduces Anxiety */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2 hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5e2be2]/10 dark:bg-[#5e2be2]/20 flex items-center justify-center text-[#5e2be2]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reduces Anxiety</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Activates your vagus nerve, triggering a relaxation response and calming anxious thoughts.
              </p>
            </div>

            {/* Benefit 2: Enhances Focus */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Brain className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enhances Focus</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Calms your nervous system, allowing you to regain clarity and sharpen concentration.
              </p>
            </div>

            {/* Benefit 3: Lowers Heart Rate */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2 hover:border-rose-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lowers Heart Rate</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Helps regulate blood pressure and heart rate during high-stress moments.
              </p>
            </div>

            {/* Benefit 4: Deepens Relaxation */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-2 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Moon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Deepens Relaxation</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Promotes emotional stability and resilience by clearing stress hormones.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Closing Takeaway */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-full bg-[#5e2be2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-justify">
            Box breathing is a fast, powerful way to regain composure under pressure. Regular practice builds autonomic control and mental resilience.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-03: 4-7-8 TRANQUILITY PACER (Triangle Breathwork System)
   Reference: Clinical Vagus Activation & Triangle Sedative Pacing
   ───────────────────────────────────────────────────────────── */
function Triangle478BreathingPlayer({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0); // 0: Inhale (4s), 1: Hold (7s), 2: Exhale (8s)
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0.0 to 1.0 continuous progress within phase
  const [phaseSecsLeft, setPhaseSecsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(5);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    audioEngine.setVoiceEnabled(next);
    if (!next) {
      audioEngine.stopSpeaking();
    }
  };

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Unmount cleanup to stop voice
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  const phases = [
    {
      name: 'Inhale',
      instruction: 'Breathe in slowly',
      cue: 'Inhale quietly through your nose into your diaphragm as the orb ascends.',
      duration: 4,
      voice: 'Inhale.',
      color: '#5e2be2',
      glow: 'rgba(94, 43, 226, 0.45)',
      rate: 1.0,
    },
    {
      name: 'Hold',
      instruction: 'Hold gently',
      cue: 'Gently retain your breath without muscular strain or tension.',
      duration: 7,
      voice: 'Hold.',
      color: '#7c3aed',
      glow: 'rgba(124, 58, 237, 0.5)',
      rate: 1.0,
    },
    {
      name: 'Exhale',
      instruction: 'Breathe out slowly',
      cue: 'Smoothly release breath through your mouth with a gentle whoosh sound.',
      duration: 8,
      voice: 'Exhale.',
      color: '#4f46e5',
      glow: 'rgba(79, 70, 229, 0.45)',
      rate: 1.0,
    },
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);
  const cycleElapsedMsRef = useRef<number>(0);

  // High-precision seamless continuous 60FPS animation loop (zero pauses at vertices)
  useEffect(() => {
    let animFrame: number;
    let cycleStartTimestamp: number | null = null;
    const cycleDurationMs = 19000; // 4s + 7s + 8s = 19000ms total
    let lastPhaseIdx = -1;

    const tick = (now: number) => {
      if (!isPlaying || isCompleted) return;

      if (!cycleStartTimestamp) {
        // Resume seamlessly from exact timestamp in 19s triangle cycle
        cycleStartTimestamp = now - cycleElapsedMsRef.current;
      }

      const totalElapsedMs = now - cycleStartTimestamp;
      const cycleElapsedMs = totalElapsedMs % cycleDurationMs;
      cycleElapsedMsRef.current = cycleElapsedMs;

      let curPhase = 0;
      let pProgress = 0;
      let secsLeft = 4;

      if (cycleElapsedMs < 4000) {
        // Phase 0: Inhale (4 seconds: 0 -> 4000ms)
        curPhase = 0;
        pProgress = cycleElapsedMs / 4000;
        secsLeft = Math.max(1, Math.ceil((4000 - cycleElapsedMs) / 1000));
      } else if (cycleElapsedMs < 11000) {
        // Phase 1: Hold (7 seconds: 4000ms -> 11000ms)
        curPhase = 1;
        const holdElapsed = cycleElapsedMs - 4000;
        pProgress = holdElapsed / 7000;
        secsLeft = Math.max(1, Math.ceil((7000 - holdElapsed) / 1000));
      } else {
        // Phase 2: Exhale (8 seconds: 11000ms -> 19000ms)
        curPhase = 2;
        const exhaleElapsed = cycleElapsedMs - 11000;
        pProgress = exhaleElapsed / 8000;
        secsLeft = Math.max(1, Math.ceil((8000 - exhaleElapsed) / 1000));
      }

      setPhaseProgress(pProgress);
      setPhaseSecsLeft(secsLeft);

      // Track completed full cycles
      const fullCycles = Math.floor(totalElapsedMs / cycleDurationMs);
      setCompletedCycles(fullCycles);

      // Trigger vertex transition bell and spoken voice smoothly
      if (curPhase !== lastPhaseIdx) {
        lastPhaseIdx = curPhase;
        setPhaseIndex(curPhase);
        audioEngine.playSfx('singing_bowl');
        if (voiceEnabledRef.current) {
          audioEngine.speak(phases[curPhase].voice, true, phases[curPhase].rate);
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted]);

  // Overall session elapsed duration timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setTotalSecondsElapsed((prev) => {
          const nextTotal = prev + 1;
          if (nextTotal >= targetTotalSeconds) {
            setIsPlaying(false);
            setIsCompleted(true);
            audioEngine.playSfx('celebration_chords');
            if (voiceEnabledRef.current) {
              audioEngine.speak('4-7-8 breathing complete. Your nervous system is deeply calm.', true, 1.0);
            }
            if (onComplete) {
              onComplete({
                completedCycles: completedCycles + 1,
                durationMinutes: selectedDurationMinutes,
                calmScore: 99,
                parasympatheticTone: 'Optimal',
                completedAt: new Date().toISOString(),
              });
            }
          }
          return nextTotal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isCompleted, targetTotalSeconds, completedCycles, selectedDurationMinutes, onComplete]);

  const handleTogglePlay = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (voiceEnabledRef.current) {
        audioEngine.speak(phases[phaseIndex].voice, true, phases[phaseIndex].rate);
      }
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    cycleElapsedMsRef.current = 0;
    setIsPlaying(false);
    setPhaseIndex(0);
    setPhaseSecsLeft(4);
    setPhaseProgress(0);
    setTotalSecondsElapsed(0);
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ─────────────────────────────────────────────────────────────
  // TRIANGLE GEOMETRY & CONTINUOUS FLUID ORB TRACKING
  // Canvas: width=230, height=210
  // Vertex 1 (Bottom-Left):  (18, 190)
  // Vertex 2 (Top Apex):     (115, 18)
  // Vertex 3 (Bottom-Right): (212, 190)
  // Phase 0 (Inhale 4s):  (18, 190)  -> (115, 18)  [Ascending Left Edge]
  // Phase 1 (Hold 7s):    (115, 18)  -> (212, 190) [Descending Right Edge]
  // Phase 2 (Exhale 8s):  (212, 190) -> (18, 190)  [Horizontal Bottom Base - Immediate Movement]
  // ─────────────────────────────────────────────────────────────
  const getOrbCoords = () => {
    const p = Math.max(0, Math.min(1, phaseProgress));
    if (phaseIndex === 0) {
      const x = 18 + 97 * p;
      const y = 190 - 172 * p;
      return { x, y };
    } else if (phaseIndex === 1) {
      const x = 115 + 97 * p;
      const y = 18 + 172 * p;
      return { x, y };
    } else {
      const x = 212 - 194 * p;
      const y = 190;
      return { x, y };
    }
  };

  const orbPos = isPlaying ? getOrbCoords() : { x: 115, y: 18 };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between p-4 sm:p-5 sm:px-8 select-none">
        {/* Soft Ambient Floating Glows */}
        <div className="absolute top-6 left-8 w-60 h-60 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-8 w-64 h-64 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* ─────────────────────────────────────────────────────────────
            1. TOP CONTROLS (VOICE TOGGLE ONLY)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-end">
          <button
            onClick={handleToggleVoice}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN INTERACTIVE TRIANGLE PACER STAGE
           ───────────────────────────────────────────────────────────── */}
        {!isCompleted ? (
          <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-1.5">
            <div className="relative flex flex-col items-center justify-center">
              {/* Soft Radial Ambient Glow */}
              <div
                className="absolute rounded-full transition-all duration-1000 ease-out pointer-events-none"
                style={{
                  width: '240px',
                  height: '240px',
                  background: isPlaying ? `radial-gradient(circle, ${currentPhase.glow} 0%, transparent 70%)` : 'transparent',
                  filter: 'blur(22px)',
                }}
              />

              {/* Triangle SVG Track & Orbiting Head-Dot */}
              <div className="relative flex items-center justify-center cursor-pointer group" onClick={handleTogglePlay}>
                <svg
                  width={230}
                  height={210}
                  viewBox="0 0 230 210"
                  className="pointer-events-none transition-transform duration-700"
                >
                  <defs>
                    <linearGradient id="triangleOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                      <stop offset="50%" stopColor="#7c3aed" stopOpacity="1" />
                      <stop offset="100%" stopColor="#5e2be2" stopOpacity="1" />
                    </linearGradient>
                    <filter id="dotGlow478" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Subtle Grey/Pale Guide Triangle */}
                  <polygon
                    points="18,190 115,18 212,190"
                    stroke="rgba(226, 232, 240, 0.9)"
                    strokeWidth={10}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                    className="dark:stroke-slate-800"
                  />

                  {/* Active Glowing Purple Stroke */}
                  {isPlaying && (
                    <polygon
                      points="18,190 115,18 212,190"
                      stroke="url(#triangleOrbitGrad)"
                      strokeWidth={10}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                      strokeOpacity="0.9"
                    />
                  )}

                  {/* Glowing Orbiting Purple Head-Dot */}
                  {isPlaying ? (
                    <circle
                      cx={orbPos.x}
                      cy={orbPos.y}
                      r={9}
                      fill="#5e2be2"
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="url(#dotGlow478)"
                    />
                  ) : (
                    /* Resting Top Dot when idle */
                    <circle
                      cx={115}
                      cy={18}
                      r={9}
                      fill="#5e2be2"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                {/* Center Content: Phase Name and Countdown - Clean, spacious, and perfectly centered in Triangle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pt-11 sm:pt-13 pointer-events-none">
                  {isPlaying ? (
                    <div className="space-y-0.5 animate-fade-in flex flex-col items-center justify-center">
                      {/* Phase Title: Inhale / Hold / Exhale */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                        {currentPhase.name}
                      </h3>
                      {/* Countdown seconds: 4s / 7s / 8s */}
                      <div className="text-base sm:text-lg font-bold text-[#5e2be2] dark:text-purple-400 pt-0.5">
                        {phaseSecsLeft}s
                      </div>
                    </div>
                  ) : (
                    <div className="pointer-events-auto">
                      <button
                        onClick={handleTogglePlay}
                        className="px-5 py-2 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Start
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Somatic Cue Pill */}
              <div className="mt-1.5 text-center max-w-xs">
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full inline-block border border-slate-200 dark:border-slate-700">
                  {isPlaying ? currentPhase.cue : 'Maintain steady upright posture. Follow the purple orb around the triangle.'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             SESSION COMPLETE CELEBRATION
             ───────────────────────────────────────────────────────────── */
          <div className="relative z-10 text-center py-4 space-y-3 max-w-sm mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 p-1 mx-auto flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#5e2be2] flex items-center justify-center text-white shadow-lg shadow-purple-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">4-7-8 Session Complete</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You completed {completedCycles} tranquility waves ({selectedDurationMinutes} minutes of parasympathetic regulation).
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-500/20"
            >
              Practice Again
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. BOTTOM CONTROLS (DURATION SELECTORS & PLAY/PAUSE)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
          {/* Duration Selectors in Bottom Section */}
          {!isPlaying && !isCompleted && (
            <div className="flex items-center justify-center gap-1.5">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    audioEngine.playSfx('tactile_tap');
                    setSelectedDurationMinutes(mins);
                    setTotalSecondsElapsed(0);
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    selectedDurationMinutes === mins
                      ? 'bg-[#5e2be2] text-white shadow-sm shadow-purple-500/20 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {mins} MIN
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            {/* Central Play/Pause with Time remaining */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {formatTime(remainingSeconds)} remaining
              </span>
            </div>

            {/* Balanced spacer for perfect symmetry */}
            <div className="w-[70px] hidden sm:block" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          EDUCATIONAL DESCRIPTION CARD: What is 4-7-8 Breathing?
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Section 1: Overview */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            What is 4-7-8 Breathing?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            4-7-8 breathing is a rhythmic mindfulness technique backed by relaxation response science. This powerful breathing pattern follows a 4-7-8 rhythm: inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds. For best results, practice for 2 - 3 minutes. The extended exhale activates your parasympathetic nervous system, shifting your body from stress mode to calm mode.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Triangle className="w-5 h-5 text-[#5e2be2]" />
              <span>How It Works</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Follow the 3 distinct phases along each side of the triangle to calm your mind and body.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Step 1: Inhale */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Inhale
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 text-[10px] font-bold">
                  4 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Breathe in slowly through your nose, filling your lungs completely with fresh oxygen.
              </p>
            </div>

            {/* Step 2: Hold */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#7c3aed] dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Hold
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950 text-[#7c3aed] dark:text-indigo-300 text-[10px] font-bold">
                  7 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Retain your breath gently, allowing oxygen to circulate and calm your nervous system.
              </p>
            </div>

            {/* Step 3: Exhale */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#06b6d4] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-[#06b6d4] dark:text-cyan-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Exhale
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950 text-[#06b6d4] dark:text-cyan-300 text-[10px] font-bold">
                  8 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Slowly release your breath through your mouth with a sigh, letting tension flow out of your body.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>Benefits</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Key physiological and psychological benefits of 4-7-8 breathing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Benefit 1: Reduces Anxiety */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2 hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5e2be2]/10 dark:bg-[#5e2be2]/20 flex items-center justify-center text-[#5e2be2]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reduces Anxiety</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                The extended exhale activates your vagus nerve, triggering immediate calming responses.
              </p>
            </div>

            {/* Benefit 2: Improves Sleep */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Improves Sleep</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Regular practice helps regulate your sleep-wake cycle and promotes deeper rest.
              </p>
            </div>

            {/* Benefit 3: Enhances Focus */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-2 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Brain className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enhances Focus</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Calming your nervous system increases mental clarity and concentration.
              </p>
            </div>

            {/* Benefit 4: Deepens Mindfulness */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2 hover:border-rose-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Deepens Mindfulness</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Regular practice builds your ability to stay present and aware.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Closing Takeaway */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-full bg-[#5e2be2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-justify">
            By practicing 4-7-8 breathing regularly, you train your nervous system to shift quickly into relaxation. Just 2 to 3 minutes can ease anxiety, improve sleep quality, and bring clarity to your day.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-04: ALTERNATE NOSTRIL PRANAYAMA (Animated Mudra & Flow)
   ───────────────────────────────────────────────────────────── */
function AlternateNostrilHemisphericPlayer({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [secsLeft, setSecsLeft] = useState<number>(5);
  const [stepProgress, setStepProgress] = useState<number>(0); // 0 to 1 smooth sub-second progress
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [targetRounds, setTargetRounds] = useState<number>(4);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    audioEngine.setVoiceEnabled(next);
    if (!next) {
      audioEngine.stopSpeaking();
    }
  };

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Unmount cleanup to stop voice
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  const nostrilSteps = [
    {
      side: 'L',
      nostril: 'Left Nostril',
      channelName: 'Calming Channel',
      action: 'Inhale',
      holdSecs: 5,
      handCue: 'Close right nostril with right thumb ➔ Inhale smoothly through Left nostril.',
      voice: 'Inhale left.',
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.4)',
      direction: 'up',
    },
    {
      side: 'BOTH',
      nostril: 'Both Nostrils',
      channelName: 'Central Equilibrium',
      action: 'Hold',
      holdSecs: 2,
      handCue: 'Close both nostrils softly with thumb & ring finger ➔ Rest in stillness.',
      voice: 'Hold.',
      color: '#8b5cf6', // Violet
      glow: 'rgba(139, 92, 246, 0.4)',
      direction: 'hold',
    },
    {
      side: 'R',
      nostril: 'Right Nostril',
      channelName: 'Focus Channel',
      action: 'Exhale',
      holdSecs: 5,
      handCue: 'Release right nostril (keep left closed with ring finger) ➔ Exhale completely Right.',
      voice: 'Exhale right.',
      color: '#f59e0b', // Amber/Gold
      glow: 'rgba(245, 158, 11, 0.4)',
      direction: 'down',
    },
    {
      side: 'R',
      nostril: 'Right Nostril',
      channelName: 'Focus Channel',
      action: 'Inhale',
      holdSecs: 5,
      handCue: 'Keep right nostril open ➔ Inhale deeply through Right nostril.',
      voice: 'Inhale right.',
      color: '#f59e0b', // Amber/Gold
      glow: 'rgba(245, 158, 11, 0.4)',
      direction: 'up',
    },
    {
      side: 'BOTH',
      nostril: 'Both Nostrils',
      channelName: 'Central Equilibrium',
      action: 'Hold',
      holdSecs: 2,
      handCue: 'Close both nostrils softly ➔ Pause gently in stillness.',
      voice: 'Hold.',
      color: '#8b5cf6', // Violet
      glow: 'rgba(139, 92, 246, 0.4)',
      direction: 'hold',
    },
    {
      side: 'L',
      nostril: 'Left Nostril',
      channelName: 'Calming Channel',
      action: 'Exhale',
      holdSecs: 5,
      handCue: 'Release left nostril (keep right closed with thumb) ➔ Exhale completely Left.',
      voice: 'Exhale left.',
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.4)',
      direction: 'down',
    },
  ];

  const currentStep = nostrilSteps[stepIdx];
  const stepElapsedMsRef = useRef<number>(0);

  // Smooth 60fps animation loop for fluid circular pacer progress
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;
    const durationMs = currentStep.holdSecs * 1000;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp - stepElapsedMsRef.current;
      const elapsed = timestamp - startTime;
      stepElapsedMsRef.current = elapsed;
      const progress = Math.min(1, elapsed / durationMs);
      setStepProgress(progress);
      if (progress < 1 && isPlaying && !isCompleted) {
        animFrame = requestAnimationFrame(step);
      }
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, stepIdx, isCompleted, currentStep.holdSecs]);

  // Main countdown timer & phase transition orchestration
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setSecsLeft((s) => {
          if (s <= 1) {
            stepElapsedMsRef.current = 0;
            const nextIdx = (stepIdx + 1) % nostrilSteps.length;
            if (nextIdx === 0) {
              setCompletedRounds((r) => {
                const nextR = r + 1;
                if (nextR >= targetRounds) {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  audioEngine.playSfx('celebration_chords');
                  if (voiceEnabledRef.current) {
                    audioEngine.speak('Alternate nostril breathing complete. Hemispheric brain balance restored.');
                  }
                  if (onComplete) {
                    onComplete({
                      completedRounds: nextR,
                      durationSeconds: nextR * 24,
                      calmScore: 98,
                      brainwaveBalance: 'Optimal Hemispheric Sync',
                      completedAt: new Date().toISOString(),
                    });
                  }
                }
                return nextR;
              });
            }
            setStepIdx(nextIdx);
            const nextS = nostrilSteps[nextIdx];
            if (nextS.action === 'Inhale') audioEngine.playSfx('inhale_whoosh');
            else if (nextS.action === 'Exhale') audioEngine.playSfx('exhale_whoosh');
            else audioEngine.playSfx('singing_bowl');

            if (voiceEnabledRef.current) audioEngine.speak(nextS.voice, true, 0.9);
            return nextS.holdSecs;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepIdx, isCompleted, targetRounds, onComplete]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (currentStep.action === 'Inhale') audioEngine.playSfx('inhale_whoosh');
      else if (currentStep.action === 'Exhale') audioEngine.playSfx('exhale_whoosh');
      else audioEngine.playSfx('singing_bowl');

      if (voiceEnabledRef.current) audioEngine.speak(currentStep.voice, true, 0.9);
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    stepElapsedMsRef.current = 0;
    setIsPlaying(false);
    setStepIdx(0);
    setSecsLeft(5);
    setStepProgress(0);
    setCompletedRounds(0);
    setIsCompleted(false);
  };

  const isLeftActive = currentStep.side === 'L' || currentStep.side === 'BOTH';
  const isRightActive = currentStep.side === 'R' || currentStep.side === 'BOTH';

  // Calculate dynamic circular stroke progress (circumference for r=36 is ~226.19)
  const ringCircumference = 2 * Math.PI * 36;
  const strokeOffset = ringCircumference * (1 - (currentStep.action === 'Exhale' ? 1 - stepProgress : stepProgress));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans'] flex flex-col items-center justify-between p-4 sm:p-5 sm:px-8 select-none">
        {/* Background Soft Glow Orbs */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

        {/* Top Header Controls (Voice Toggle Only) */}
        <div className="w-full flex items-center justify-end z-10 pb-1">
          <button
            onClick={handleToggleVoice}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>

        {!isCompleted ? (
          <div className="relative z-10 flex flex-col items-center justify-between w-full max-w-2xl mx-auto space-y-2.5">
            {/* ─────────────────────────────────────────────────────────────
                MAIN 3-COLUMN ANIMATION STAGE: LEFT PACER | YOGI | RIGHT PACER
               ───────────────────────────────────────────────────────────── */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-6 my-1 py-1">
              {/* ─── LEFT NOSTRIL (L) DYNAMIC PACER RING ─── */}
              <div
                className={`flex flex-col items-center justify-center transition-all duration-500 ${
                  isLeftActive && isPlaying
                    ? 'opacity-100 scale-105'
                    : isPlaying
                      ? 'opacity-30 scale-90 blur-[0.5px]'
                      : 'opacity-70 scale-95'
                }`}
              >
                <span
                  className={`text-xl sm:text-2xl font-black mb-1 transition-colors ${
                    isLeftActive ? 'text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  L
                </span>

                {/* Expanding/Contracting SVG Circular Ring Pacer */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-transform duration-700 ease-out ${
                    isPlaying && isLeftActive
                      ? currentStep.action === 'Inhale'
                        ? 'scale-110 shadow-lg shadow-cyan-500/20'
                        : currentStep.action === 'Hold'
                          ? 'scale-105 shadow-md shadow-cyan-500/15'
                          : 'scale-90'
                      : 'scale-95'
                  }`}
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke={isLeftActive ? currentStep.color : '#94a3b8'}
                      strokeWidth="6"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={isLeftActive && isPlaying ? strokeOffset : 0}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-100 ease-linear"
                    />
                  </svg>

                  {/* Internal Instruction / Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                    <span
                      className="text-[11px] sm:text-xs font-black uppercase tracking-wider transition-colors leading-tight"
                      style={{ color: isLeftActive ? currentStep.color : '#94a3b8' }}
                    >
                      {isLeftActive && isPlaying ? currentStep.action : 'Left'}
                    </span>
                    {isLeftActive && isPlaying && (
                      <span className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {secsLeft}s
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── CENTER: MEDITATING YOGI CHARACTER WITH DYNAMIC MUDRA ─── */}
              <div className="relative flex items-center justify-center mx-1">
                {/* Concentric Energy Aura Waves */}
                <div
                  className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none transition-all duration-1000 ${
                    isPlaying && currentStep.action === 'Inhale'
                      ? 'scale-125 opacity-70'
                      : isPlaying && currentStep.action === 'Hold'
                        ? 'scale-110 opacity-50 animate-pulse'
                        : 'scale-90 opacity-20'
                  }`}
                  style={{
                    background: `radial-gradient(circle, ${currentStep.color}44 0%, ${currentStep.color}11 60%, transparent 80%)`,
                  }}
                />

                {/* Vector Yogi Frame */}
                <div className="relative p-1 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                  <div
                    className={`relative w-28 h-36 sm:w-34 sm:h-42 rounded-xl overflow-hidden shadow-md transition-all duration-1000 ease-in-out ${
                      !isPlaying
                        ? 'scale-100 translate-x-0 translate-y-0 rotate-0'
                        : currentStep.side === 'L'
                          ? currentStep.action === 'Inhale'
                            ? 'scale-[1.05] -translate-y-1.5 -translate-x-1.5 -rotate-2'
                            : 'scale-[0.96] translate-y-1 -translate-x-1 -rotate-1'
                          : currentStep.side === 'R'
                            ? currentStep.action === 'Inhale'
                              ? 'scale-[1.05] -translate-y-1.5 translate-x-1.5 rotate-2 scale-x-[-1]'
                              : 'scale-[0.96] translate-y-1 translate-x-1 rotate-1 scale-x-[-1]'
                            : 'scale-[1.02] -translate-y-0.5 translate-x-0 rotate-0'
                    }`}
                  >
                    <img
                      src="/pranayama_vector_yogi.jpg"
                      alt="Mindfulness Breathing Guide"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* ─── RIGHT NOSTRIL (R) DYNAMIC PACER RING ─── */}
              <div
                className={`flex flex-col items-center justify-center transition-all duration-500 ${
                  isRightActive && isPlaying
                    ? 'opacity-100 scale-105'
                    : isPlaying
                      ? 'opacity-30 scale-90 blur-[0.5px]'
                      : 'opacity-70 scale-95'
                }`}
              >
                <span
                  className={`text-xl sm:text-2xl font-black mb-1 transition-colors ${
                    isRightActive ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  R
                </span>

                {/* Expanding/Contracting SVG Circular Ring Pacer */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-transform duration-700 ease-out ${
                    isPlaying && isRightActive
                      ? currentStep.action === 'Inhale'
                        ? 'scale-110 shadow-lg shadow-amber-500/20'
                        : currentStep.action === 'Hold'
                          ? 'scale-105 shadow-md shadow-amber-500/15'
                          : 'scale-90'
                      : 'scale-95'
                  }`}
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke={isRightActive ? currentStep.color : '#94a3b8'}
                      strokeWidth="6"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={isRightActive && isPlaying ? strokeOffset : 0}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-100 ease-linear"
                    />
                  </svg>

                  {/* Internal Instruction / Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                    <span
                      className="text-[11px] sm:text-xs font-black uppercase tracking-wider transition-colors leading-tight"
                      style={{ color: isRightActive ? currentStep.color : '#94a3b8' }}
                    >
                      {isRightActive && isPlaying ? currentStep.action : 'Right'}
                    </span>
                    {isRightActive && isPlaying && (
                      <span className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {secsLeft}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Somatic Cue Pill */}
            <div className="mt-1 text-center max-w-md">
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full inline-block border border-slate-200 dark:border-slate-700">
                {isPlaying ? currentStep.handCue : 'Use your right thumb to close right nostril, and ring finger for left nostril.'}
              </span>
            </div>

            {/* 3. BOTTOM CONTROLS (ROUND SELECTORS & PLAY/PAUSE/RESET) */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Round Selectors when idle */}
              {!isPlaying && !isCompleted && (
                <div className="flex items-center justify-center gap-1.5">
                  {[2, 4, 6, 8].map((rounds) => (
                    <button
                      key={rounds}
                      onClick={() => {
                        audioEngine.playSfx('tactile_tap');
                        setTargetRounds(rounds);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        targetRounds === rounds
                          ? 'bg-[#5e2be2] text-white shadow-md shadow-purple-500/25 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rounds} ROUNDS
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Reset Button on Left */}
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>

                {/* Central Circular Play/Pause with Rounds remaining */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleToggle}
                    className="w-10 h-10 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {Math.max(0, targetRounds - completedRounds)} rounds remaining
                  </span>
                </div>

                {/* Balanced spacer for perfect symmetry */}
                <div className="w-[70px] hidden sm:block" />
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             SESSION COMPLETED CARD
             ───────────────────────────────────────────────────────────── */
          <div className="relative z-10 text-center py-8 px-6 space-y-4 max-w-md mx-auto my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 p-1 mx-auto flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#5e2be2] flex items-center justify-center text-white shadow-lg shadow-purple-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Hemispheric Balance Achieved</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                You completed all {completedRounds} rounds of Alternate Nostril Breathing. Right and left brain hemispheres are synchronized in autonomic equilibrium.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-purple-500/25 transition-all cursor-pointer"
            >
              Practice Another Session
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. EDUCATIONAL DESCRIPTION CARD: What is Alternate Nostril Breathing?
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Section 1: Overview */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            What is Alternate Nostril Breathing?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            Alternate Nostril Breathing is a mindfulness breathwork practice designed to balance the sympathetic and parasympathetic branches of the nervous system. By systematically alternating airflow between the left nostril (calming channel) and right nostril (focus channel), this technique synchronizes both cerebral hemispheres, quiets mental chatter, and promotes deep autonomic harmony.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#5e2be2]" />
              <span>How It Works</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Use your right hand: place your thumb to close the right nostril and ring finger for the left nostril.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Step 1: Inhale Left */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Inhale Left
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                  5 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Close your right nostril with your thumb and inhale smoothly through your left nostril, stimulating parasympathetic and calming neural networks.
              </p>
            </div>

            {/* Step 2: Hold Gently */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Hold Gently
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 text-[10px] font-bold">
                  2 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Close both nostrils gently with your thumb and ring finger. Rest in effortless stillness, centering brain activity in the equilibrium channel.
              </p>
            </div>

            {/* Step 3: Exhale Right */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Exhale Right
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  5 SECONDS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Release your right nostril and exhale completely. Then inhale back through the right nostril, hold, and exhale left to complete the rhythmic cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>Benefits</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Practicing Alternate Nostril Breathing regularly offers profound psychological and physiological advantages:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hemispheric Brain Balance</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Equalizes airflow between nostrils, synchronizing EEG brainwave activity between the logical left and intuitive right cerebral hemispheres.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stress & Blood Pressure Reduction</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Engages parasympathetic reflexes, lowering resting heart rate, stabilizing respiratory rhythm, and reducing circulating cortisol levels.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <Smile className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enhanced Mental Focus</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Clears respiratory passages and delivers optimal oxygen saturation to prefrontal cortex circuits for elevated concentration and mental alertness.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emotional Equilibrium</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Calms overactive sympathetic fight-or-flight reactivity, fostering emotional stability and grounded mental poise under pressure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Closing Takeaway */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3.5">
          <div className="w-7 h-7 rounded-full bg-[#5e2be2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-justify">
            By practicing alternate nostril breathing regularly, you cultivate mental clarity, emotional steadiness, and profound hemispheric balance in just a few minutes each day.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MoodLiftBreathingPlayer;
