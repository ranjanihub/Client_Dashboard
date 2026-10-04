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
  VolumeX
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

export const MoodLiftBreathingPlayer: React.FC<BaseActivityComponentProps> = ({
  activityId = 'ACT-01',
  activityName,
  onComplete
}) => {
  if (activityId === 'ACT-02') {
    return <BoxBreathingTacticalHUD activityName={activityName} onComplete={onComplete} />;
  } else if (activityId === 'ACT-03') {
    return <OceanWave478Player activityName={activityName} onComplete={onComplete} />;
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
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showAnatomyGuide, setShowAnatomyGuide] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<"chimes" | "ocean" | "bowl" | "silent">("chimes");

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
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      rate: 1.0
    },
    {
      name: 'Hold',
      instruction: 'Hold gently',
      cue: 'Rest effortlessly in full expansion without muscular strain.',
      duration: 2,
      voice: 'Hold.',
      color: '#059669',
      glow: 'rgba(5, 150, 105, 0.5)',
      rate: 1.0
    },
    {
      name: 'Exhale',
      instruction: 'Exhale slowly',
      cue: 'Release all tension as your belly button draws gently toward spine.',
      duration: 6,
      voice: 'Exhale.',
      color: '#047857',
      glow: 'rgba(4, 120, 87, 0.45)',
      rate: 1.0
    },
    {
      name: 'Rest',
      instruction: 'Relax your belly',
      cue: 'Soften your abdominal wall and shoulders before next breath.',
      duration: 2,
      voice: 'Rest.',
      color: '#34d399',
      glow: 'rgba(52, 211, 153, 0.35)',
      rate: 1.0
    }
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);

  const phaseIndexRef = useRef(phaseIndex);
  phaseIndexRef.current = phaseIndex;

  // High-precision subsecond 60FPS animation loop and smooth phase transitions
  useEffect(() => {
    let animFrame: number;
    let phaseStartTimestamp: number | null = null;

    const tick = (now: number) => {
      if (!isPlaying || isCompleted) return;

      if (!phaseStartTimestamp) {
        phaseStartTimestamp = now;
      }

      const pIdx = phaseIndexRef.current;
      const curP = phases[pIdx];
      const phaseDurationMs = curP.duration * 1000;
      const elapsedMs = now - phaseStartTimestamp;
      const progress = Math.min(1, Math.max(0, elapsedMs / phaseDurationMs));
      setPhaseProgress(progress);

      const secsRemaining = Math.max(1, Math.ceil((phaseDurationMs - elapsedMs) / 1000));
      setPhaseSecsLeft(secsRemaining);

      if (elapsedMs >= phaseDurationMs) {
        // Complete current phase and transition smoothly to the next
        phaseStartTimestamp = now;
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
          else if (nextIdx === 2) audioEngine.playSfx('exhale_whoosh');
          else if (nextIdx === 1) audioEngine.playSfx('singing_bowl');
          else audioEngine.playSfx('neural_sparkle');
        }

        if (voiceEnabled) {
          audioEngine.speak(nextP.voice, true, nextP.rate);
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(tick);
    } else {
      setPhaseProgress(0);
      setPhaseSecsLeft(phases[phaseIndex].duration);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted, voiceEnabled, soundscape]);

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
            audioEngine.speak('Diaphragmatic breathing complete. Your nervous system is calm.', true, 1.0);
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
        else if (phaseIndex === 2) audioEngine.playSfx('exhale_whoosh');
        else audioEngine.playSfx('singing_bowl');
      }
      if (voiceEnabled) {
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

  // SVG Circle Geometry (Compact viewport fit)
  const svgSize = 220;
  const strokeWidth = 11;
  const center = svgSize / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;

  // Calculate the current stroke-dashoffset based on progress
  const strokeDashoffset = circumference - (phaseProgress * circumference);

  // Position of the orbiting green head-dot
  // Angle starts at top (-90 degrees or -PI/2) and goes clockwise
  const angle = (phaseProgress * 2 * Math.PI) - (Math.PI / 2);
  const dotX = center + radius * Math.cos(angle);
  const dotY = center + radius * Math.sin(angle);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Soft Ambient Floating Glows */}
      <div className="absolute top-6 left-8 w-60 h-60 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-64 h-64 rounded-full bg-[#5e2be2]/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONTROLS (VOICE TOGGLE ONLY)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-end">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          title="Toggle Voice Guidance"
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN INTERACTIVE CIRCULAR PACER STAGE
         ───────────────────────────────────────────────────────────── */}
      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-center my-2 sm:my-3">
          {showAnatomyGuide ? (
            /* Anatomical 360 Diaphragm Guide Overlay */
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-5 border border-emerald-200/60 dark:border-emerald-900/60 max-w-sm text-center space-y-2.5 animate-fade-in shadow-inner">
              <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto border border-emerald-300/60 shadow-md">
                <img src="/images/postures/posture_7.jpg" alt="Diaphragmatic Breath" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Anatomical Belly Expansion</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep chest still. As you inhale, let your diaphragm push down so your lower abdomen balloons outward 360°.
              </p>
              <button
                onClick={() => setShowAnatomyGuide(false)}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
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
                  width: '260px',
                  height: '260px',
                  background: isPlaying ? `radial-gradient(circle, ${currentPhase.glow} 0%, transparent 70%)` : 'transparent',
                  filter: 'blur(24px)'
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
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="1" />
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

                  {/* Active Emerald Green Dynamic Progress Arc */}
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
                      className="transition-all duration-75 ease-linear"
                    />
                  )}

                  {/* Glowing Orbiting Green Head-Dot */}
                  {isPlaying ? (
                    <g className="transition-all duration-75 ease-linear">
                      {/* Pulse aura around bead */}
                      <circle
                        cx={dotX}
                        cy={dotY}
                        r={strokeWidth / 2 + 5}
                        fill="#059669"
                        opacity="0.35"
                        className="animate-ping duration-[1800ms]"
                      />
                      {/* Solid Green Dot */}
                      <circle
                        cx={dotX}
                        cy={dotY}
                        r={strokeWidth / 2 + 1}
                        fill="#047857"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#dotGlow)"
                      />
                    </g>
                  ) : (
                    /* Resting Top Dot when idle */
                    <circle
                      cx={center}
                      cy={center - radius}
                      r={strokeWidth / 2 + 1}
                      fill="#047857"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                {/* Center Content: Phase Name, Cue, and Countdown (MATCHING SCREENSHOT) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  {isPlaying ? (
                    <div className="space-y-1.5 animate-fade-in">
                      {/* Phase Title: Inhale / Hold / Exhale */}
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {currentPhase.name}
                      </h3>
                      {/* Action Subtext: Breathe in slowly */}
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[170px] mx-auto leading-tight">
                        {currentPhase.instruction}
                      </p>
                      {/* Countdown seconds: 4s */}
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 pt-0.5">
                        {phaseSecsLeft}s
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleTogglePlay}
                        className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Start
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Somatic Cue Pill */}
              <div className="mt-2 text-center max-w-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full inline-block border border-slate-200 dark:border-slate-700">
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
        <div className="relative z-10 text-center py-6 space-y-5 max-w-sm mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 p-1 mx-auto flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Diaphragmatic Session Complete</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              You completed {completedCycles} deep diaphragmatic breath cycles ({selectedDurationMinutes} minutes of mindful parasympathetic vagal stimulation).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vagal Tone</span>
              <span className="text-lg font-black text-emerald-600">Parasympathetic</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Breath Cycles</span>
              <span className="text-lg font-black text-[#5e2be2]">{completedCycles} Cycles</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            Practice Again
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM CONTROLS (DURATION SELECTORS & PLAY/PAUSE)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedDurationMinutes === mins
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
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
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Central Play/Pause with Time remaining */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {formatTime(remainingSeconds)} remaining
            </span>
          </div>

          {/* Balanced spacer for perfect symmetry (Favorite removed) */}
          <div className="w-[76px] hidden sm:block" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TECHNIQUE INFO MODAL
         ───────────────────────────────────────────────────────────── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-100 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Clinical Mechanism</span>
              <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>
            <h3 className="text-lg font-bold">How Diaphragmatic Breathing Works</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When inhaling by expanding your abdomen, the dome-shaped diaphragm muscle moves downward, stimulating the <strong>Vagus nerve</strong> to slow heart rate, lower blood pressure, and activate parasympathetic relaxation.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3.5 rounded-2xl space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60">
              <div className="font-bold">🌿 4-2-6 Cadence:</div>
              <div>• <strong>Inhale (4s)</strong>: Breathe in through nose, belly expands.</div>
              <div>• <strong>Hold (2s)</strong>: Gentle pause without tension.</div>
              <div>• <strong>Exhale (6s)</strong>: Smooth release through mouth, belly contracts.</div>
              <div>• <strong>Rest (2s)</strong>: Abdominal softening.</div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase cursor-pointer transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-02: BOX BREATHING (Hexpertify 4x4 Matrix Pacer)
   ───────────────────────────────────────────────────────────── */
function BoxBreathingTacticalHUD({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0); // 0=Inhale(Top), 1=Hold(Right), 2=Exhale(Bottom), 3=Hold(Left)
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState<number>(4);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(2);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [completedBoxes, setCompletedBoxes] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0 to 1 for smooth dot animation

  const phases = [
    { name: 'Inhale', voice: 'Inhale.', cue: 'Inhale smoothly through your nose, filling your lungs.', sound: 'inhale_whoosh' },
    { name: 'Hold', voice: 'Hold.', cue: 'Hold with calm and relaxed chest.', sound: 'singing_bowl' },
    { name: 'Exhale', voice: 'Exhale.', cue: 'Exhale smoothly and steadily through your mouth.', sound: 'exhale_whoosh' },
    { name: 'Hold', voice: 'Hold.', cue: 'Rest empty in the quiet pause before next breath.', sound: 'singing_bowl' }
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingTotalSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);

  const phaseIndexRef = useRef(phaseIndex);
  phaseIndexRef.current = phaseIndex;

  // Smooth sub-second animation frame for gliding perimeter orb and phase changes
  useEffect(() => {
    let animFrame: number;
    let phaseStartMs: number | null = null;
    const phaseDurationMs = 4000;

    const animateDot = (timestamp: number) => {
      if (!isPlaying || isCompleted) return;

      if (!phaseStartMs) phaseStartMs = timestamp;
      const elapsed = timestamp - phaseStartMs;
      const progress = Math.min(1, Math.max(0, elapsed / phaseDurationMs));
      setPhaseProgress(progress);

      const secsRemaining = Math.max(1, Math.ceil((phaseDurationMs - elapsed) / 1000));
      setSecondsLeftInPhase(secsRemaining);

      if (elapsed >= phaseDurationMs) {
        phaseStartMs = timestamp;
        const nextSide = (phaseIndexRef.current + 1) % 4;
        if (nextSide === 0) {
          setCompletedBoxes((b) => b + 1);
        }
        setPhaseIndex(nextSide);
        phaseIndexRef.current = nextSide;
        const nextP = phases[nextSide];
        if (nextP.sound === 'inhale_whoosh') audioEngine.playSfx('inhale_whoosh');
        else if (nextP.sound === 'exhale_whoosh') audioEngine.playSfx('exhale_whoosh');
        else audioEngine.playSfx('singing_bowl');

        if (voiceEnabled) {
          audioEngine.speak(nextP.voice, true, 1.0);
        }
      }

      animFrame = requestAnimationFrame(animateDot);
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(animateDot);
    } else {
      setPhaseProgress(0);
      setSecondsLeftInPhase(4);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted, voiceEnabled]);

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
            audioEngine.speak('Box breathing complete. Autonomic nervous system balanced.', true, 1.0);
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
      audioEngine.playSfx('inhale_whoosh');
      if (voiceEnabled) {
        audioEngine.speak(currentPhase.voice, true, 0.9);
      }
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setPhaseIndex(0);
    setSecondsLeftInPhase(4);
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

  // Calculate coordinates for the glowing orb gliding along the rounded perimeter
  // Box is 290 x 290, with corner radius 30. Inner path bounds: 18 to 272.
  const getOrbPosition = () => {
    if (!isPlaying) return { x: 18, y: 18 };
    const min = 18;
    const max = 272;
    const p = Math.max(0, Math.min(1, phaseProgress));

    switch (phaseIndex) {
      case 0: // Top: left to right (Inhale)
        return { x: min + p * (max - min), y: min };
      case 1: // Right: top to bottom (Hold)
        return { x: max, y: min + p * (max - min) };
      case 2: // Bottom: right to left (Exhale)
        return { x: max - p * (max - min), y: max };
      case 3: // Left: bottom to top (Hold)
        return { x: min, y: max - p * (max - min) };
      default:
        return { x: min, y: min };
    }
  };

  const orbPos = getOrbPosition();

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans'] flex flex-col items-center justify-between p-4 sm:p-6 select-none">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between gap-3 z-10 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/50">
            4-4-4-4 Navy SEAL Cadence
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Target: 4 Cycles
          </span>
        </div>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${voiceEnabled
              ? 'bg-purple-50 dark:bg-purple-950/50 text-[#5e2be2] border-purple-200 dark:border-purple-800'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-[#5e2be2]" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
        </button>
      </div>

      {!isCompleted ? (
        <div className="flex flex-col items-center justify-center space-y-4 my-2 sm:my-3 z-10 w-full max-w-md">
          {/* ─────────────────────────────────────────────────────────────
              THE GLOWING PERIMETER SQUARE BOX (HEXPERTIFY SIGNATURE)
             ───────────────────────────────────────────────────────────── */}
          <div className="relative w-[220px] h-[220px] flex items-center justify-center">
            {/* Ambient Purple Glow Halo */}
            <div className="absolute inset-0 rounded-[28px] bg-[#5e2be2]/15 blur-2xl pointer-events-none" />

            {/* Rounded Perimeter Border Container */}
            <div className="absolute inset-0 rounded-[26px] border-[2px] border-[#5e2be2]/70 dark:border-[#5e2be2] shadow-[0_0_24px_rgba(94,43,226,0.2)] bg-slate-50/60 dark:bg-slate-800/40 backdrop-blur-sm" />

            {/* Active Edge Laser Beam (Visual Highlight on Active Side) */}
            {isPlaying && (
              <div
                className={`absolute transition-all duration-300 pointer-events-none ${phaseIndex === 0 ? 'top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-cyan-400 via-[#5e2be2] to-purple-400 shadow-[0_0_15px_#5e2be2]' :
                    phaseIndex === 1 ? 'top-6 bottom-6 right-0 w-[3px] bg-gradient-to-b from-purple-400 via-[#5e2be2] to-indigo-500 shadow-[0_0_15px_#5e2be2]' :
                      phaseIndex === 2 ? 'bottom-0 left-6 right-6 h-[3px] bg-gradient-to-r from-purple-400 via-[#5e2be2] to-cyan-400 shadow-[0_0_15px_#5e2be2]' :
                        'top-6 bottom-6 left-0 w-[3px] bg-gradient-to-b from-indigo-500 via-[#5e2be2] to-purple-400 shadow-[0_0_15px_#5e2be2]'
                  }`}
              />
            )}

            {/* The Glowing Neon Laser Orb gliding along the perimeter */}
            <div
              className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-[#5e2be2] to-[#a855f7] shadow-[0_0_16px_#5e2be2,0_0_32px_rgba(94,43,226,0.8)] pointer-events-none ring-2 ring-white transition-transform duration-75"
              style={{
                left: `${orbPos.x - 14}px`,
                top: `${orbPos.y - 14}px`,
              }}
            />

            {/* Center Display (Timer & Phase Text) */}
            <div className="relative z-10 text-center space-y-1.5">
              <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">
                {formatTime(remainingTotalSeconds)}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#5e2be2] dark:text-purple-300 uppercase tracking-widest transition-all duration-300">
                {isPlaying ? currentPhase.name : 'Ready'}
              </div>
              <div className="text-xs font-bold text-slate-400 font-mono">
                {isPlaying ? `${secondsLeftInPhase}s remaining` : 'Press Begin to Start'}
              </div>
            </div>
          </div>

          {/* Clinical Somatic Directive Cue */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-3.5 text-center">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              {isPlaying ? currentPhase.cue : 'Maintain steady upright posture. Follow the luminous orb around the perimeter.'}
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              DURATION SELECTOR PILLS (2m, 3m, 5m)
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3">
            {[2, 3, 5].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  if (!isPlaying) {
                    setSelectedDurationMinutes(mins);
                    setTotalSecondsElapsed(0);
                  }
                }}
                disabled={isPlaying}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${selectedDurationMinutes === mins
                    ? 'bg-[#5e2be2] text-white shadow-lg shadow-purple-500/25 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  } disabled:opacity-75`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              BOTTOM ACTION BUTTONS (BEGIN / RESET)
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1">
            {/* Begin / Pause Pill Button */}
            <button
              onClick={handleToggle}
              className="px-10 py-4 rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer min-w-[150px] flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Exercise' : 'Begin Exercise'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-13 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title="Reset timer and box"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           SESSION COMPLETED CARD
           ───────────────────────────────────────────────────────────── */
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in z-10">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 p-1 mx-auto shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-[#5e2be2]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Autonomic Balance Achieved</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              You completed {completedBoxes} full 4x4 box breathing cycles ({selectedDurationMinutes} minutes of equalized parasympathetic regulation).
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-purple-500/25 transition-all cursor-pointer"
          >
            Practice Another Box
          </button>
        </div>
      )}

      {/* Subtle Somatic Directive Footer */}
      <div className="w-full text-center border-t border-slate-100 dark:border-slate-800 pt-3 z-10">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          4s Inhale ➔ 4s Hold ➔ 4s Exhale ➔ 4s Hold • Tactical Autonomic Equalization
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-03: 4-7-8 SOMATIC TRANQUILIZER (Dynamic Harmonic Wave ∿)
   ───────────────────────────────────────────────────────────── */
function OceanWave478Player({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0); // 0: Inhale (4s), 1: Hold (7s), 2: Exhale (8s)
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0.0 to 1.0 within current phase
  const [secsLeftInPhase, setSecsLeftInPhase] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [targetCycles, setTargetCycles] = useState<number>(4);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [soundscape, setSoundscape] = useState<'ocean' | 'binaural' | 'rain' | 'silent'>('ocean');
  const [visualMode, setVisualMode] = useState<'wave' | 'triangle' | 'box' | 'line'>('wave');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showAudioMenu, setShowAudioMenu] = useState<boolean>(false);

  const phases = [
    {
      name: 'Inhale',
      label: '1. Inhale Quietly',
      duration: 4,
      voice: 'Inhale.',
      cue: 'Fill your lower lungs smoothly while tongue rests against the roof of your mouth.',
      color: '#5e2be2', // Hexpertify Royal Purple
      glow: 'rgba(94, 43, 226, 0.75)',
    },
    {
      name: 'Hold',
      label: '2. Retain & Oxygen Lock',
      duration: 7,
      voice: 'Hold.',
      cue: 'Hold without tension. Carbon dioxide accumulates to optimize cellular oxygen uptake.',
      color: '#8b5cf6', // Violet
      glow: 'rgba(139, 92, 246, 0.85)',
    },
    {
      name: 'Exhale',
      label: '3. Extended Whoosh Exhale',
      duration: 8,
      voice: 'Exhale.',
      cue: 'Make an audible whoosh sound as lungs empty completely, dropping heart rate.',
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.8)',
    },
  ];

  const currentPhase = phases[currentPhaseIndex];

  // High-frequency animation loop for silky smooth traveling orb
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;

    if (isPlaying && !isCompleted) {
      const phaseDurationMs = currentPhase.duration * 1000;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / phaseDurationMs, 1);
        setPhaseProgress(progress);

        const remainingSecs = Math.max(1, Math.ceil(currentPhase.duration * (1 - progress)));
        setSecsLeftInPhase(remainingSecs);

        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        }
      };
      animFrame = requestAnimationFrame(step);
    } else {
      setPhaseProgress(0);
      setSecsLeftInPhase(currentPhase.duration);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, currentPhaseIndex, isCompleted, currentPhase.duration]);

  // Discrete second timer & phase transition orchestration
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setCurrentPhaseIndex((prevIdx) => {
          const nextIdx = (prevIdx + 1) % phases.length;
          const nextPhase = phases[nextIdx];

          // Trigger audio & voice coaching
          if (soundscape !== 'silent') {
            if (nextIdx === 0) audioEngine.playSfx('inhale_whoosh');
            else if (nextIdx === 1) audioEngine.playSfx('singing_bowl');
            else audioEngine.playSfx('exhale_whoosh');
          }
          if (voiceEnabled) {
            audioEngine.speak(nextPhase.voice, true, 0.9);
          }

          if (nextIdx === 0) {
            // Cycle finished
            setCompletedCycles((c) => {
              const nextCount = c + 1;
              if (nextCount >= targetCycles) {
                setIsPlaying(false);
                setIsCompleted(true);
                audioEngine.playSfx('celebration_chords');
                audioEngine.speak('4-7-8 sedative practice complete. Autonomic nervous system calmed.');
                if (onComplete) {
                  onComplete({
                    completedCycles: nextCount,
                    durationSeconds: nextCount * 19,
                    calmScore: 99,
                    parasympatheticTone: 'Ultra High',
                    completedAt: new Date().toISOString(),
                  });
                }
              }
              return nextCount;
            });
          }

          return nextIdx;
        });
      }, currentPhase.duration * 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentPhaseIndex, isCompleted, voiceEnabled, soundscape, targetCycles, currentPhase.duration, onComplete]);

  const handleTogglePlay = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (soundscape !== 'silent') {
        if (currentPhaseIndex === 0) audioEngine.playSfx('inhale_whoosh');
        else if (currentPhaseIndex === 1) audioEngine.playSfx('singing_bowl');
        else audioEngine.playSfx('exhale_whoosh');
      }
      if (voiceEnabled) {
        audioEngine.speak(currentPhase.voice, true, 0.9);
      }
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setSecsLeftInPhase(4);
    setPhaseProgress(0);
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  // ─────────────────────────────────────────────────────────────
  // HARMONIC SINE WAVE COORDINATE CALCULATOR
  // SVG Canvas: viewBox="0 0 600 240"
  // Wave geometry:
  // Phase 0 (Inhale 4s):  X: 60 -> 210, Y: 180 -> 50 (Rising Crest)
  // Phase 1 (Hold 7s):    X: 210 -> 390, Y: 50 + slight harmonic oscillation (Peak Plateau)
  // Phase 2 (Exhale 8s):  X: 390 -> 540, Y: 50 -> 180 (Gentle Trough)
  // ─────────────────────────────────────────────────────────────
  const getOrbCoords = () => {
    const p = Math.max(0, Math.min(1, phaseProgress));
    if (currentPhaseIndex === 0) {
      // Inhale: Smooth cubic-bezier ease up
      const ease = Math.sin((p * Math.PI) / 2);
      const x = 60 + p * 150;
      const y = 180 - ease * 130;
      return { x, y };
    } else if (currentPhaseIndex === 1) {
      // Hold: Float across crest plateau with micro wave ripple
      const x = 210 + p * 180;
      const ripple = Math.sin(p * Math.PI * 4) * 4;
      const y = 50 + ripple;
      return { x, y };
    } else {
      // Exhale: Smooth ease down into relaxing trough
      const ease = 0.5 - Math.cos(p * Math.PI) / 2;
      const x = 390 + p * 150;
      const y = 50 + ease * 130;
      return { x, y };
    }
  };

  const orbPos = getOrbCoords();

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-sans select-none p-4 sm:p-6">
      {/* ─────────────────────────────────────────────────────────────
          HEXPERTIFY AMBIENT LIGHT & VIOLET GLOWS
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
          {/* Top Cadence Pill */}
          <div className="w-full flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-200">
              4-7-8 Harmonic Wave
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Cycle {completedCycles + 1} of 4
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              DYNAMIC HARMONIC BREATHING WAVE CANVAS (SVG ∿)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full relative flex flex-col items-center justify-center py-1">
            <svg
              viewBox="0 0 600 240"
              className="w-full h-36 sm:h-44 overflow-visible drop-shadow-[0_0_20px_rgba(94,43,226,0.18)]"
            >
              <defs>
                {/* Hexpertify Wave Gradient */}
                <linearGradient id="waveGradientHex" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5e2be2" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#5e2be2" stopOpacity="1" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#5e2be2" stopOpacity="0.4" />
                </linearGradient>

                {/* Under-Wave Soft Violet Fill Gradient */}
                <linearGradient id="waveFillHex" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5e2be2" stopOpacity="0.14" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#5e2be2" stopOpacity="0" />
                </linearGradient>

                {/* Laser Glow Filter */}
                <filter id="waveGlowHex" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Baseline Ghost Wave Track */}
              <path
                d="M 40 180 C 120 180, 140 50, 210 50 C 290 50, 310 50, 390 50 C 460 50, 480 180, 560 180"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Shimmering Ambient Wave Fill Area */}
              <path
                d="M 40 180 C 120 180, 140 50, 210 50 C 290 50, 310 50, 390 50 C 460 50, 480 180, 560 180 L 560 230 L 40 230 Z"
                fill="url(#waveFillHex)"
              />

              {/* The Active Glowing Harmonic Sine Wave Path */}
              <path
                d="M 40 180 C 120 180, 140 50, 210 50 C 290 50, 310 50, 390 50 C 460 50, 480 180, 560 180"
                fill="none"
                stroke="url(#waveGradientHex)"
                strokeWidth="4.5"
                strokeLinecap="round"
                filter="url(#waveGlowHex)"
              />

              {/* Phase Demarcation Markers */}
              <g className="text-[10px] font-bold select-none">
                <circle cx="60" cy="180" r="3.5" fill="#5e2be2" />
                <text x="48" y="206" fill="#5e2be2" fontSize="11" fontWeight="700">Inhale (4s)</text>

                <circle cx="300" cy="45" r="3.5" fill="#8b5cf6" />
                <text x="275" y="28" fill="#8b5cf6" fontSize="11" fontWeight="700">Hold (7s)</text>

                <circle cx="540" cy="180" r="3.5" fill="#06b6d4" />
                <text x="505" y="206" fill="#06b6d4" fontSize="11" fontWeight="700">Exhale (8s)</text>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  THE LUMINOUS TRAVELING WAVE ORB & AURA
                 ───────────────────────────────────────────────────────────── */}
              {isPlaying && (
                <g>
                  {/* Outer Pulsing Halo */}
                  <circle
                    cx={orbPos.x}
                    cy={orbPos.y}
                    r="20"
                    fill={currentPhase.glow}
                    className="animate-ping opacity-35"
                  />
                  {/* Medium Glow Aura */}
                  <circle
                    cx={orbPos.x}
                    cy={orbPos.y}
                    r="13"
                    fill={currentPhase.color}
                    opacity="0.35"
                  />
                  {/* Solid Glowing Core */}
                  <circle
                    cx={orbPos.x}
                    cy={orbPos.y}
                    r="7.5"
                    fill="#ffffff"
                    stroke={currentPhase.color}
                    strokeWidth="3.5"
                    className="drop-shadow-[0_0_8px_rgba(94,43,226,0.6)]"
                  />
                </g>
              )}
            </svg>

            {/* Central Rhythm Stats (Overlayed below wave) */}
            <div className="text-center space-y-1.5 mt-3">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: currentPhase.color }}
                />
                <span className="text-xs font-black uppercase tracking-widest text-[#5e2be2] dark:text-purple-300">
                  {isPlaying ? currentPhase.label : 'Press Start Wave to Begin'}
                </span>
              </div>

              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                {isPlaying ? `${secsLeftInPhase}s` : '4-7-8'}
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {isPlaying ? currentPhase.cue : 'A steady 4s inhale, a gentle 7s oxygen lock, and an 8s extended whoosh exhale.'}
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SETS & CYCLE PROGRESS PILLS
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 px-5 shadow-xs">
            <span>Cycle Progress</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {Array.from({ length: targetCycles }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-2 rounded-full transition-all ${i < completedCycles
                        ? 'bg-[#5e2be2] shadow-[0_0_8px_rgba(94,43,226,0.5)]'
                        : i === completedCycles && isPlaying
                          ? 'bg-purple-400 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                  />
                ))}
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold ml-2">{completedCycles} / {targetCycles} Waves</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              BOTTOM CONTROLS (START / PAUSE / RESET)
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 w-full justify-center pt-1">
            <button
              onClick={handleTogglePlay}
              className="px-10 py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer min-w-[190px]"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause 4-7-8 Wave' : 'Start 4-7-8 Wave'}</span>
            </button>

            <button
              onClick={handleReset}
              className="w-13 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title="Reset Wave"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           SESSION COMPLETED CARD
           ───────────────────────────────────────────────────────────── */
        <div className="relative z-10 text-center py-12 px-6 space-y-6 max-w-md mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 p-1 mx-auto shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-[#5e2be2]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deep Sedation Achieved</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              You completed all {completedCycles} waves of the 4-7-8 Somatic Tranquilizer. Your heart rate has slowed, parasympathetic tone is engaged, and neural fatigue is relieved.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-purple-500/25 transition-all cursor-pointer"
          >
            Practice Another Wave Session
          </button>
        </div>
      )}
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
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const nostrilSteps = [
    {
      side: 'L',
      nostril: 'Left Nostril',
      channelName: 'Ida (Lunar / Cooling)',
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
      channelName: 'Sushumna (Equilibrium)',
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
      channelName: 'Pingala (Solar / Warming)',
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
      channelName: 'Pingala (Solar / Warming)',
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
      channelName: 'Sushumna (Equilibrium)',
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
      channelName: 'Ida (Lunar / Cooling)',
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

  // Smooth 60fps animation loop for fluid circular pacer progress
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;
    const durationMs = currentStep.holdSecs * 1000;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      setStepProgress(progress);
      if (progress < 1 && isPlaying && !isCompleted) {
        animFrame = requestAnimationFrame(step);
      }
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(step);
    } else {
      setStepProgress(0);
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
            const nextIdx = (stepIdx + 1) % nostrilSteps.length;
            if (nextIdx === 0) {
              setCompletedRounds((r) => {
                const nextR = r + 1;
                if (nextR >= targetRounds) {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  audioEngine.playSfx('celebration_chords');
                  audioEngine.speak('Alternate nostril pranayama complete. Hemispheric brain balance restored.');
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

            if (voiceEnabled) audioEngine.speak(nextS.voice, true, 0.9);
            return nextS.holdSecs;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepIdx, isCompleted, voiceEnabled, targetRounds, onComplete]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      if (currentStep.action === 'Inhale') audioEngine.playSfx('inhale_whoosh');
      else if (currentStep.action === 'Exhale') audioEngine.playSfx('exhale_whoosh');
      else audioEngine.playSfx('singing_bowl');

      if (voiceEnabled) audioEngine.speak(currentStep.voice, true, 0.9);
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setStepIdx(0);
    setSecsLeft(5);
    setStepProgress(0);
    setCompletedRounds(0);
    setIsCompleted(false);
  };

  const isLeftActive = currentStep.side === 'L' || currentStep.side === 'BOTH';
  const isRightActive = currentStep.side === 'R' || currentStep.side === 'BOTH';

  // Calculate dynamic circular stroke progress (circumference for r=46 is ~289)
  const ringCircumference = 2 * Math.PI * 46;
  const strokeOffset = ringCircumference * (1 - (currentStep.action === 'Exhale' ? 1 - stepProgress : stepProgress));

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-sans select-none p-4 sm:p-6 flex flex-col justify-between">
      {/* ─────────────────────────────────────────────────────────────
          HEXPERTIFY AMBIENT LIGHT & VIOLET GLOWS
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-between h-full space-y-4 max-w-2xl mx-auto w-full">
          {/* Top Pill Controls */}
          <div className="w-full flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200">
              Nadi Shodhana Pranayama
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Round {completedRounds + 1} of {targetRounds}
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MAIN 3-COLUMN ANIMATION STAGE: LEFT PACER | YOGI | RIGHT PACER
              (INSPIRED BY VIDEO: https://youtube.com/shorts/Mw8O0UFYaD0)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-6 my-auto py-3">
            {/* ─── LEFT NOSTRIL (L) DYNAMIC PACER RING ─── */}
            <div
              className={`flex flex-col items-center justify-center transition-all duration-500 ${isLeftActive && isPlaying
                  ? 'opacity-100 scale-105'
                  : isPlaying
                    ? 'opacity-25 scale-90 blur-[0.5px]'
                    : 'opacity-70 scale-95'
                }`}
            >
              <span
                className={`text-2xl sm:text-3xl font-black mb-2 transition-colors ${isLeftActive ? 'text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-300 dark:text-slate-700'
                  }`}
              >
                L
              </span>

              {/* Expanding/Contracting SVG Circular Ring Pacer */}
              <div
                className={`relative w-28 h-28 sm:w-34 sm:h-34 rounded-full flex items-center justify-center transition-transform duration-700 ease-out ${isPlaying && isLeftActive
                    ? currentStep.action === 'Inhale'
                      ? 'scale-110 shadow-lg shadow-cyan-500/20'
                      : currentStep.action === 'Hold'
                        ? 'scale-105 shadow-md shadow-cyan-500/15'
                        : 'scale-90'
                    : 'scale-95'
                  }`}
              >
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46"
                    stroke={isLeftActive ? currentStep.color : '#94a3b8'}
                    strokeWidth="8"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={isLeftActive && isPlaying ? strokeOffset : 0}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>

                {/* Internal Instruction / Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span
                    className="text-xs sm:text-sm font-black uppercase tracking-wider transition-colors"
                    style={{ color: isLeftActive ? currentStep.color : '#94a3b8' }}
                  >
                    {isLeftActive && isPlaying ? currentStep.action : 'Left'}
                  </span>
                  {isLeftActive && isPlaying && (
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {secsLeft}s
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── CENTER: MEDITATING YOGI CHARACTER WITH DYNAMIC MUDRA ─── */}
            <div className="relative flex items-center justify-center mx-1 sm:mx-2">
              {/* Concentric Energy Aura Waves */}
              <div
                className={`absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full pointer-events-none transition-all duration-1000 ${isPlaying && currentStep.action === 'Inhale'
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
              <div className="relative p-1.5 rounded-3xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                {/* Character - Dynamically Moving with Inhale/Exhale and Left/Right Tilt */}
                <div
                  className={`relative w-38 h-50 sm:w-46 sm:h-58 rounded-2xl overflow-hidden shadow-md transition-all duration-1000 ease-in-out ${!isPlaying
                      ? 'scale-100 translate-x-0 translate-y-0 rotate-0'
                      : currentStep.side === 'L'
                        ? currentStep.action === 'Inhale'
                          ? 'scale-[1.06] -translate-y-2 -translate-x-2 -rotate-2'
                          : 'scale-[0.96] translate-y-1.5 -translate-x-1 -rotate-1'
                        : currentStep.side === 'R'
                          ? currentStep.action === 'Inhale'
                            ? 'scale-[1.06] -translate-y-2 translate-x-2 rotate-2 scale-x-[-1]'
                            : 'scale-[0.96] translate-y-1.5 translate-x-1 rotate-1 scale-x-[-1]'
                          : /* BOTH / Retention */
                          'scale-[1.02] -translate-y-1 translate-x-0 rotate-0'
                    }`}
                >
                  <img
                    src="/pranayama_vector_yogi.jpg"
                    alt="Pranayama Meditating Yogi"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>

            {/* ─── RIGHT NOSTRIL (R) DYNAMIC PACER RING ─── */}
            <div
              className={`flex flex-col items-center justify-center transition-all duration-500 ${isRightActive && isPlaying
                  ? 'opacity-100 scale-105'
                  : isPlaying
                    ? 'opacity-25 scale-90 blur-[0.5px]'
                    : 'opacity-70 scale-95'
                }`}
            >
              <span
                className={`text-2xl sm:text-3xl font-black mb-2 transition-colors ${isRightActive ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-300 dark:text-slate-700'
                  }`}
              >
                R
              </span>

              {/* Expanding/Contracting SVG Circular Ring Pacer */}
              <div
                className={`relative w-28 h-28 sm:w-34 sm:h-34 rounded-full flex items-center justify-center transition-transform duration-700 ease-out ${isPlaying && isRightActive
                    ? currentStep.action === 'Inhale'
                      ? 'scale-110 shadow-lg shadow-amber-500/20'
                      : currentStep.action === 'Hold'
                        ? 'scale-105 shadow-md shadow-amber-500/15'
                        : 'scale-90'
                    : 'scale-95'
                  }`}
              >
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46"
                    stroke={isRightActive ? currentStep.color : '#94a3b8'}
                    strokeWidth="8"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={isRightActive && isPlaying ? strokeOffset : 0}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>

                {/* Internal Instruction / Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span
                    className="text-xs sm:text-sm font-black uppercase tracking-wider transition-colors"
                    style={{ color: isRightActive ? currentStep.color : '#94a3b8' }}
                  >
                    {isRightActive && isPlaying ? currentStep.action : 'Right'}
                  </span>
                  {isRightActive && isPlaying && (
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {secsLeft}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SOMATIC DIRECTIVE & PROGRESS PILLS
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full space-y-3">
            {/* Vishnu Mudra Directive */}
            <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl p-3 text-center shadow-xs">
              <p className="text-xs font-semibold text-[#5e2be2] dark:text-purple-300">
                {isPlaying ? currentStep.handCue : 'Vishnu Mudra: Use thumb to close right nostril, ring finger for left nostril.'}
              </p>
            </div>

            {/* Round Progress Tracker */}
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 px-4 shadow-xs">
              <span>Round Progress</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: targetRounds }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-2 rounded-full transition-all ${i < completedRounds
                          ? 'bg-[#5e2be2] shadow-[0_0_8px_rgba(94,43,226,0.5)]'
                          : i === completedRounds && isPlaying
                            ? 'bg-purple-400 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-slate-900 dark:text-white font-extrabold ml-1">
                  {completedRounds} / {targetRounds}
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              BOTTOM ACTION CONTROLS
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 w-full justify-center pt-1">
            <button
              onClick={handleToggle}
              className="px-10 py-3.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer min-w-[200px]"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Pranayama' : 'Start Pranayama'}</span>
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${voiceEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              title="Toggle Voice"
            >
              {voiceEnabled ? <Mic className="w-4 h-4 text-[#5e2be2] dark:text-purple-300" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           SESSION COMPLETED CARD
           ───────────────────────────────────────────────────────────── */
        <div className="relative z-10 text-center py-12 px-6 space-y-6 max-w-md mx-auto my-auto animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 p-1 mx-auto shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-[#5e2be2]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hemispheric Balance Achieved</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              You completed all {completedRounds} rounds of Nadi Shodhana Pranayama. Right and left brain hemispheres are synchronized in autonomic equilibrium.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-4 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-purple-500/25 transition-all cursor-pointer"
          >
            Practice Another Session
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodLiftBreathingPlayer;
