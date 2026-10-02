import React, { useState, useEffect } from 'react';
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
  Heart
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
   ACT-01: DIAPHRAGMATIC BELLY BREATHING (Serenity Crystal Orb UI)
   ───────────────────────────────────────────────────────────── */
function DiaphragmaticBellyPlayer({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [phaseSecsLeft, setPhaseSecsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(10);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<"chimes" | "ocean" | "silent">("chimes");

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
  } catch {}

  const phases = [
    { 
      name: 'Inhale', 
      text: 'inhale...', 
      duration: 4, 
      voice: 'Inhale... expand your lower belly.', 
      cue: 'Push your abdomen gently outward as your diaphragm descends.',
      scale: 1.28,
      glow: 'rgba(192, 132, 252, 0.65)',
      rate: 0.9
    },
    { 
      name: 'Hold', 
      text: 'hold...', 
      duration: 2, 
      voice: 'Hold.', 
      cue: 'Rest in the full expansion without strain or tension.',
      scale: 1.28,
      glow: 'rgba(168, 85, 247, 0.75)',
      rate: 1.0
    },
    { 
      name: 'Exhale', 
      text: 'exhale...', 
      duration: 6, 
      voice: 'Exhale slowly... relax your belly.', 
      cue: 'Gently draw your belly button back toward your spine.',
      scale: 0.82,
      glow: 'rgba(129, 140, 248, 0.45)',
      rate: 0.85
    }
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);

  // Timer & Phase Orchestration
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
            audioEngine.speak('Diaphragmatic session complete. Deep relaxation and vagal stimulation achieved.', true, 0.9);
            if (onComplete) {
              onComplete({ 
                completedCycles: completedCycles + 1,
                durationMinutes: selectedDurationMinutes,
                calmScore: 98,
                parasympatheticTone: "High",
                completedAt: new Date().toISOString()
              });
            }
          }
          return nextTotal;
        });

        setPhaseSecsLeft((prev) => {
          if (prev <= 1) {
            const nextIdx = (phaseIndex + 1) % phases.length;
            if (nextIdx === 0) {
              setCompletedCycles((c) => {
                const nextC = c + 1;
                return nextC;
              });
            }
            setPhaseIndex(nextIdx);
            const nextP = phases[nextIdx];
            if (soundscape !== "silent") {
              if (nextIdx === 0) audioEngine.playSfx('inhale_whoosh');
              else if (nextIdx === 2) audioEngine.playSfx('exhale_whoosh');
              else audioEngine.playSfx('singing_bowl');
            }
            if (voiceEnabled) {
              audioEngine.speak(nextP.voice, true, nextP.rate);
            }
            return nextP.duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phaseIndex, isCompleted, voiceEnabled, soundscape, onComplete, targetTotalSeconds, completedCycles, selectedDurationMinutes]);

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
    setTotalSecondsElapsed(0);
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG Progress Ring calculations
  const progressRatio = targetTotalSeconds > 0 ? (totalSecondsElapsed / targetTotalSeconds) : 0;
  const ringRadius = 38;

  return (
    <div className="w-full min-h-[640px] rounded-3xl bg-gradient-to-b from-[#dce5fa] via-[#ece5fc] to-[#fbfaff] text-slate-800 shadow-2xl border border-white/60 relative overflow-hidden font-['Plus_Jakarta_Sans'] flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Soft Ambient Floating Light Blurs */}
      <div className="absolute top-10 left-12 w-72 h-72 rounded-full bg-cyan-300/35 blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-16 right-10 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />

      {/* Ambient Sparkling Stardust Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 left-1/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-ping duration-[3000ms]" />
        <div className="absolute top-24 right-1/4 w-2 h-2 bg-purple-100 rounded-full shadow-[0_0_10px_#ffffff]" />
        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-cyan-100 rounded-full shadow-[0_0_8px_#ffffff]" />
        <div className="absolute top-1/3 right-12 w-2 h-2 bg-indigo-100 rounded-full shadow-[0_0_10px_#ffffff]" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION & SERENITY HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-3">
        {/* Info button top right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLibraryModal(true)}
              className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 hover:bg-white text-indigo-900 shadow-xs border border-white/80 transition-all cursor-pointer backdrop-blur-md"
            >
              📚 Library
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/50 hover:bg-white/80 text-purple-900 border border-white/60 transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
            >
              {voiceEnabled ? <Mic className="w-3 h-3 text-purple-600" /> : <MicOff className="w-3 h-3 text-slate-400" />}
              <span>{voiceEnabled ? 'Coach Voice' : 'Silent'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowInfoModal(true)}
            className="w-8 h-8 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 flex items-center justify-center font-serif text-sm font-bold shadow-xs border border-indigo-200/50 backdrop-blur-md transition-all cursor-pointer"
            title="Technique Information"
          >
            i
          </button>
        </div>

        {/* Personalized Greeting & Focus Pill */}
        <div className="text-center space-y-2 pt-1">
          <p className="text-sm font-medium text-slate-600 tracking-tight">
            Good to see you, {clientName}
          </p>

          <div className="inline-block">
            <span className="px-4 py-1.5 rounded-full bg-white/80 text-indigo-900 text-xs font-semibold shadow-xs border border-white backdrop-blur-md">
              You choose to focus on <span className="font-bold text-[#5e2be2]">Relaxation</span>
            </span>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-500/90 block">
              RELAX
            </span>
            <p className="text-xs text-slate-500 italic mt-0.5">
              rest and recuperate • {activityName || "Diaphragmatic Breathing"}
            </p>
          </div>

          {/* Duration Selector Pills (When not playing) */}
          {!isPlaying && !isCompleted && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {[3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedDurationMinutes(mins)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedDurationMinutes === mins
                      ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200 scale-105'
                      : 'bg-white/40 text-slate-500 hover:bg-white/70'
                  }`}
                >
                  {mins} MIN
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE SERENE 3D CRYSTALLINE BREATHING ORB (CENTERPIECE)
         ───────────────────────────────────────────────────────────── */}
      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-center my-6">
          {/* Outer Pulsing Aura Glow */}
          <div
            className="absolute rounded-full transition-all duration-[4000ms] ease-out pointer-events-none"
            style={{
              width: isPlaying ? (currentPhase.name === 'Inhale' ? '340px' : '260px') : '280px',
              height: isPlaying ? (currentPhase.name === 'Inhale' ? '340px' : '260px') : '280px',
              backgroundColor: currentPhase.glow,
              filter: 'blur(45px)',
              opacity: isPlaying ? 0.75 : 0.4
            }}
          />

          {/* The Multi-Faceted 3D Crystalline Breathing Sphere */}
          <div
            className="relative rounded-full flex items-center justify-center transition-all duration-[3500ms] ease-in-out cursor-pointer shadow-2xl"
            onClick={handleTogglePlay}
            style={{
              width: '240px',
              height: '240px',
              transform: `scale(${isPlaying ? currentPhase.scale : 1})`,
              background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #e0e7ff 25%, #c4b5fd 55%, #a78bfa 75%, #818cf8 100%)',
              boxShadow: isPlaying 
                ? '0 20px 60px rgba(124, 58, 237, 0.35), inset 0 2px 20px rgba(255, 255, 255, 0.9), inset 0 -15px 30px rgba(99, 102, 241, 0.4)'
                : '0 15px 45px rgba(124, 58, 237, 0.2), inset 0 2px 15px rgba(255, 255, 255, 0.85)'
            }}
          >
            {/* Polygonal Crystalline / Geometric Facet Overlay */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay pointer-events-none"
            >
              <polygon points="100,10 150,50 130,120 70,120 50,50" fill="url(#facet1)" opacity="0.6" />
              <polygon points="100,10 180,90 150,170 50,170 20,90" fill="url(#facet2)" opacity="0.4" />
              <polygon points="100,190 170,120 150,50 50,50 30,120" fill="url(#facet3)" opacity="0.5" />
              <circle cx="100" cy="100" r="95" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
              <defs>
                <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="facet2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="facet3" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Sheen & Specular Highlight */}
            <div className="absolute top-4 left-8 w-20 h-12 rounded-full bg-white/50 blur-md pointer-events-none transform -rotate-25" />

            {/* Center Breathing Text or Floating Start Button */}
            <div className="relative z-10 text-center flex flex-col items-center justify-center">
              {isPlaying ? (
                <div className="space-y-1 animate-fade-in">
                  <span className="text-xl sm:text-2xl font-serif tracking-widest text-indigo-950 font-normal opacity-90 drop-shadow-xs lowercase">
                    {currentPhase.text}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-800/75 block">
                    {phaseSecsLeft}s
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleTogglePlay}
                  className="px-6 py-2.5 rounded-full bg-[#7064e9] hover:bg-[#5e51dc] text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  Start
                </button>
              )}
            </div>
          </div>

          {/* Gentle Somatic Technique Cue */}
          <div className="text-center mt-5 max-w-xs px-2">
            <p className="text-xs font-medium text-slate-600 transition-all duration-700 leading-relaxed">
              {isPlaying ? currentPhase.cue : 'Place hands gently on lower belly. Feel it expand outward with each breath.'}
            </p>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           SESSION COMPLETED CARD
           ───────────────────────────────────────────────────────────── */
        <div className="relative z-10 text-center py-6 space-y-5 max-w-sm mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 p-1 mx-auto shadow-xl shadow-purple-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#5e2be2]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif text-slate-800 font-light">Serenity Restored</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              You completed {completedCycles} deep diaphragmatic breath cycles ({selectedDurationMinutes} minutes of mindful parasympathetic activation).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white/80 rounded-2xl border border-white text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vagal Tone</span>
              <span className="text-lg font-black text-indigo-600">Optimal</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-white text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Paced Cycles</span>
              <span className="text-lg font-black text-[#5e2be2]">{completedCycles} Cycles</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3.5 bg-[#5e2be2] hover:bg-[#4d20c5] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            Practice Again
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ELEGANT BOTTOM CONTROLS (MATCHING SCREENSHOT)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/50">
        {/* Back Button */}
        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-900 text-xs font-bold transition-all cursor-pointer backdrop-blur-md shadow-xs"
        >
          Back
        </button>

        {/* Central Dynamic Circular Pause/Play with Progress Ring */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-16 h-16 transform -rotate-90 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r={ringRadius - 10}
                stroke="rgba(99, 102, 241, 0.15)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r={ringRadius - 10}
                stroke="#6366f1"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={2 * Math.PI * (ringRadius - 10)}
                strokeDashoffset={2 * Math.PI * (ringRadius - 10) * (1 - progressRatio)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className="absolute w-11 h-11 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-900 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md shadow-sm"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-indigo-900" />
              ) : (
                <Play className="w-4 h-4 fill-indigo-900 ml-0.5" />
              )}
            </button>
          </div>

          {/* Time Remaining Counter (e.g. 8:20) */}
          <span className="text-[11px] font-semibold text-slate-500 mt-1 font-mono">
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Favorite / Heart Button */}
        <button
          onClick={() => {
            setIsFavorited(!isFavorited);
            audioEngine.playSfx('tactile_tap');
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xs ${
            isFavorited
              ? 'bg-rose-500/20 text-rose-600 scale-110'
              : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-900'
          }`}
          title={isFavorited ? "Favorited" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TECHNIQUE INFO MODAL (DIAPHRAGMATIC GUIDANCE)
         ───────────────────────────────────────────────────────────── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5e2be2]">Clinical Science</span>
              <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <h3 className="text-lg font-bold text-slate-900">How Diaphragmatic Breathing Works</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you inhale by expanding your abdomen, the dome-shaped diaphragm muscle moves downward, massaging internal organs and sending signals via the <strong>Vagus nerve</strong> to trigger the parasympathetic ("rest and digest") nervous system.
            </p>
            <div className="bg-purple-50 p-3.5 rounded-2xl space-y-1.5 text-xs text-purple-900">
              <div className="font-bold">✨ Step-by-Step Technique:</div>
              <div>1. Inhale gently for 4s, feeling your lower belly expand like a balloon.</div>
              <div>2. Hold softly for 2s with relaxed neck and shoulders.</div>
              <div>3. Exhale smoothly for 6s through pursed lips, letting tension release.</div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-[#5e2be2] text-white rounded-2xl text-xs font-bold uppercase cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TECHNIQUE LIBRARY DRAWER / MODAL
         ───────────────────────────────────────────────────────────── */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-purple-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Breathing & Relaxation Library</h3>
              <button onClick={() => setShowLibraryModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-700">Newly Released</span>
                <h4 className="text-sm font-bold text-slate-900">Diaphragmatic Serenity</h4>
                <p className="text-[11px] text-slate-500">4s Inhale • 2s Hold • 6s Exhale</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-700">Navy SEAL</span>
                <h4 className="text-sm font-bold text-slate-900">Box Breathing</h4>
                <p className="text-[11px] text-slate-500">4-4-4-4 Square Pacer</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-700">Sleep & Calm</span>
                <h4 className="text-sm font-bold text-slate-900">4-7-8 Ocean Wave</h4>
                <p className="text-[11px] text-slate-500">Natural Tranquilizer</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-teal-700">Hemispheric</span>
                <h4 className="text-sm font-bold text-slate-900">Alternate Nostril</h4>
                <p className="text-[11px] text-slate-500">Nadi Shodhana Balance</p>
              </div>
            </div>
            <button
              onClick={() => setShowLibraryModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase cursor-pointer"
            >
              Close Library
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
    { name: 'Inhale', voice: 'Inhale... for four seconds.', cue: 'Inhale smoothly through your nose, filling your lungs.', sound: 'inhale_whoosh' },
    { name: 'Hold', voice: 'Hold.', cue: 'Hold with calm and relaxed chest.', sound: 'singing_bowl' },
    { name: 'Exhale', voice: 'Exhale... for four seconds.', cue: 'Exhale smoothly and steadily through your mouth.', sound: 'exhale_whoosh' },
    { name: 'Hold', voice: 'Hold.', cue: 'Rest empty in the quiet pause before next breath.', sound: 'singing_bowl' }
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = selectedDurationMinutes * 60;
  const remainingTotalSeconds = Math.max(0, targetTotalSeconds - totalSecondsElapsed);

  // Smooth sub-second animation frame for gliding perimeter orb
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;
    const phaseDurationMs = 4000;

    const animateDot = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % phaseDurationMs;
      setPhaseProgress(elapsed / phaseDurationMs);
      if (isPlaying && !isCompleted) {
        animFrame = requestAnimationFrame(animateDot);
      }
    };

    if (isPlaying && !isCompleted) {
      animFrame = requestAnimationFrame(animateDot);
    } else {
      setPhaseProgress(0);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isCompleted, phaseIndex]);

  // Main 1-second interval timer & state machine
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
            audioEngine.speak('Box breathing complete. Autonomic nervous system balanced.', true, 0.9);
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

        setSecondsLeftInPhase((s) => {
          if (s <= 1) {
            const nextSide = (phaseIndex + 1) % 4;
            if (nextSide === 0) {
              setCompletedBoxes((b) => b + 1);
            }
            setPhaseIndex(nextSide);
            const nextP = phases[nextSide];
            if (nextP.sound === 'inhale_whoosh') audioEngine.playSfx('inhale_whoosh');
            else if (nextP.sound === 'exhale_whoosh') audioEngine.playSfx('exhale_whoosh');
            else audioEngine.playSfx('singing_bowl');

            if (voiceEnabled) {
              audioEngine.speak(nextP.voice, true, nextSide % 2 === 1 ? 1.0 : 0.9);
            }
            return 4;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phaseIndex, isCompleted, voiceEnabled, targetTotalSeconds, onComplete, completedBoxes, selectedDurationMinutes]);

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
    <div className="w-full min-h-[600px] rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans'] flex flex-col items-center justify-between p-6 sm:p-10 select-none">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#5e2be2]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Header & Voice Switcher */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-100 dark:border-purple-900/50 text-[#5e2be2]">
            <Square className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5e2be2] bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200/50">
                ACT-02 • 4x4 MATRIX
              </span>
              <span className="text-xs font-bold text-slate-400">Navy SEAL Pacer</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activityName || 'Box Breathing'}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            voiceEnabled 
              ? 'bg-purple-50 dark:bg-purple-950/50 text-[#5e2be2] border-purple-200 dark:border-purple-800' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-[#5e2be2]" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{voiceEnabled ? 'Voice Coach ON' : 'Voice Coach OFF'}</span>
        </button>
      </div>

      {!isCompleted ? (
        <div className="flex flex-col items-center justify-center space-y-7 my-6 z-10 w-full max-w-md">
          {/* ─────────────────────────────────────────────────────────────
              THE GLOWING PERIMETER SQUARE BOX (HEXPERTIFY SIGNATURE)
             ───────────────────────────────────────────────────────────── */}
          <div className="relative w-[290px] h-[290px] flex items-center justify-center">
            {/* Ambient Purple Glow Halo */}
            <div className="absolute inset-0 rounded-[34px] bg-[#5e2be2]/15 blur-2xl pointer-events-none" />

            {/* Rounded Perimeter Border Container */}
            <div className="absolute inset-0 rounded-[32px] border-[2.5px] border-[#5e2be2]/70 dark:border-[#5e2be2] shadow-[0_0_30px_rgba(94,43,226,0.22)] bg-slate-50/60 dark:bg-slate-800/40 backdrop-blur-sm" />

            {/* Active Edge Laser Beam (Visual Highlight on Active Side) */}
            {isPlaying && (
              <div
                className={`absolute transition-all duration-300 pointer-events-none ${
                  phaseIndex === 0 ? 'top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-cyan-400 via-[#5e2be2] to-purple-400 shadow-[0_0_15px_#5e2be2]' :
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
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDurationMinutes === mins
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
      voice: 'Inhale quietly through your nose for four seconds.',
      cue: 'Fill your lower lungs smoothly while tongue rests against the roof of your mouth.',
      color: '#5e2be2', // Hexpertify Royal Purple
      glow: 'rgba(94, 43, 226, 0.75)',
    },
    {
      name: 'Hold',
      label: '2. Retain & Oxygen Lock',
      duration: 7,
      voice: 'Hold your breath gently for seven seconds.',
      cue: 'Hold without tension. Carbon dioxide accumulates to optimize cellular oxygen uptake.',
      color: '#8b5cf6', // Violet
      glow: 'rgba(139, 92, 246, 0.85)',
    },
    {
      name: 'Exhale',
      label: '3. Extended Whoosh Exhale',
      duration: 8,
      voice: 'Whoosh exhale completely through your mouth for eight seconds.',
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
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          HEXPERTIFY AMBIENT LIGHT & VIOLET GLOWS
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

      {!isCompleted ? (
        <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto">
          {/* ─────────────────────────────────────────────────────────────
              DYNAMIC HARMONIC BREATHING WAVE CANVAS (SVG ∿)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full relative flex flex-col items-center justify-center py-2">
            <svg
              viewBox="0 0 600 240"
              className="w-full h-48 sm:h-56 overflow-visible drop-shadow-[0_0_20px_rgba(94,43,226,0.18)]"
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
                    className={`w-5 h-2 rounded-full transition-all ${
                      i < completedCycles
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
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [targetRounds, setTargetRounds] = useState<number>(4);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const nostrilSteps = [
    {
      nostril: 'Left Nostril',
      channelName: 'Ida (Lunar / Cooling)',
      action: 'Inhale',
      holdSecs: 5,
      handCue: 'Close right nostril with right thumb ➔ Inhale deeply through Left nostril.',
      voice: 'Close right nostril with thumb, inhale smoothly through left nostril for five seconds.',
      color: '#06b6d4', // Cyan
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      direction: 'up',
    },
    {
      nostril: 'Both Nostrils',
      channelName: 'Sushumna (Equilibrium)',
      action: 'Retention',
      holdSecs: 2,
      handCue: 'Close both nostrils softly with thumb & ring finger ➔ Rest in stillness.',
      voice: 'Hold both nostrils closed softly.',
      color: '#8b5cf6', // Violet
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      direction: 'hold',
    },
    {
      nostril: 'Right Nostril',
      channelName: 'Pingala (Solar / Warming)',
      action: 'Exhale',
      holdSecs: 5,
      handCue: 'Release right nostril (keep left closed with ring finger) ➔ Exhale completely Right.',
      voice: 'Release right nostril, exhale completely through right nostril for five seconds.',
      color: '#d97706', // Amber/Gold
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      direction: 'down',
    },
    {
      nostril: 'Right Nostril',
      channelName: 'Pingala (Solar / Warming)',
      action: 'Inhale',
      holdSecs: 5,
      handCue: 'Keep right nostril open ➔ Inhale deeply through Right nostril.',
      voice: 'Inhale smoothly through right nostril for five seconds.',
      color: '#d97706', // Amber/Gold
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      direction: 'up',
    },
    {
      nostril: 'Both Nostrils',
      channelName: 'Sushumna (Equilibrium)',
      action: 'Retention',
      holdSecs: 2,
      handCue: 'Close both nostrils softly ➔ Pause gently in stillness.',
      voice: 'Hold gently.',
      color: '#8b5cf6', // Violet
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      direction: 'hold',
    },
    {
      nostril: 'Left Nostril',
      channelName: 'Ida (Lunar / Cooling)',
      action: 'Exhale',
      holdSecs: 5,
      handCue: 'Release left nostril (keep right closed with thumb) ➔ Exhale completely Left.',
      voice: 'Release left nostril, exhale completely through left nostril for five seconds.',
      color: '#06b6d4', // Cyan
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      direction: 'down',
    },
  ];

  const currentStep = nostrilSteps[stepIdx];

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
    setCompletedRounds(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden font-sans select-none min-h-[580px] flex flex-col justify-between p-6 sm:p-8">
      {/* ─────────────────────────────────────────────────────────────
          HEXPERTIFY AMBIENT LIGHT & VIOLET GLOWS
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

      {!isCompleted ? (
        <div className="relative z-10 flex flex-col items-center justify-between h-full space-y-6 max-w-xl mx-auto w-full">
          {/* ─────────────────────────────────────────────────────────────
              TITLE & PRANAYAMA HEADER
             ───────────────────────────────────────────────────────────── */}
          <div className="text-center pt-1 space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#5e2be2] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5e2be2] dark:text-purple-300">
                ACT-04 • Nadi Shodhana Pranayama
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Alternate Nostril Breathing
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Hemispheric brain synchronization & autonomic equilibrium
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MAIN VISUAL STAGE: MEDITATING YOGI + RIGHT SIDE PACER CUES
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-auto py-2">
            {/* Meditating Yogi Floating Avatar (Breathing & Tilting dynamically) */}
            <div className="relative flex items-center justify-center">
              {/* Concentric Energy Aura Waves */}
              <div
                className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full pointer-events-none transition-all duration-1000 ${
                  isPlaying && currentStep.action === 'Inhale'
                    ? 'scale-125 opacity-70'
                    : isPlaying && currentStep.action === 'Retention'
                    ? 'scale-110 opacity-50 animate-pulse'
                    : 'scale-90 opacity-20'
                }`}
                style={{
                  background: `radial-gradient(circle, ${currentStep.color}44 0%, ${currentStep.color}11 60%, transparent 80%)`,
                }}
              />

              {/* Vector Yogi Frame */}
              <div className="relative p-2 rounded-3xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                {/* Character - Dynamically Moving with Inhale/Exhale and Left/Right Tilt */}
                <div
                  className={`relative w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-md transition-all duration-1000 ease-in-out ${
                    !isPlaying
                      ? 'scale-100 translate-x-0 translate-y-0 rotate-0'
                      : currentStep.nostril.includes('Left')
                      ? currentStep.action === 'Inhale'
                        ? 'scale-[1.06] -translate-y-2.5 -translate-x-2.5 -rotate-2'
                        : 'scale-[0.96] translate-y-2 -translate-x-1.5 -rotate-1'
                      : currentStep.nostril.includes('Right')
                      ? currentStep.action === 'Inhale'
                        ? 'scale-[1.06] -translate-y-2.5 translate-x-2.5 rotate-2 scale-x-[-1]'
                        : 'scale-[0.96] translate-y-2 translate-x-1.5 rotate-1 scale-x-[-1]'
                      : /* Both Nostrils / Retention */
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

            {/* Right Side: Timing & Multi-Color Animated Airflow Chevrons */}
            <div className="flex flex-col items-center sm:items-start justify-center space-y-3.5 text-center sm:text-left">
              {/* Timing and Phase Label */}
              <div className="space-y-0.5">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {isPlaying ? `${secsLeft}s` : '5s'}
                </div>
                <div
                  className="text-xs sm:text-sm font-black tracking-widest uppercase"
                  style={{ color: currentStep.color }}
                >
                  {isPlaying ? currentStep.action : 'INHALE'}
                </div>
              </div>

              {/* Multi-Color Animated Airflow Chevrons */}
              <div className="flex flex-col items-center justify-center gap-1 py-1">
                {currentStep.direction === 'down' ? (
                  /* Downward Chevrons (Exhale) */
                  <div className="flex flex-col items-center gap-1">
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#6366f1] ${isPlaying ? 'animate-pulse' : ''}`} fill="currentColor">
                      <path d="M12 14L0 2L2.8 0L12 9.2L21.2 0L24 2L12 14Z" />
                    </svg>
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#f59e0b] ${isPlaying ? 'animate-bounce delay-75' : ''}`} fill="currentColor">
                      <path d="M12 14L0 2L2.8 0L12 9.2L21.2 0L24 2L12 14Z" />
                    </svg>
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#f43f5e] ${isPlaying ? 'animate-bounce delay-150' : ''}`} fill="currentColor">
                      <path d="M12 14L0 2L2.8 0L12 9.2L21.2 0L24 2L12 14Z" />
                    </svg>
                  </div>
                ) : (
                  /* Upward Chevrons (Inhale / Retention) */
                  <div className="flex flex-col items-center gap-1">
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#f43f5e] ${isPlaying ? 'animate-bounce' : ''}`} fill="currentColor">
                      <path d="M12 0L24 12L21.2 14L12 4.8L2.8 14L0 12L12 0Z" />
                    </svg>
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#f59e0b] ${isPlaying ? 'animate-bounce delay-75' : ''}`} fill="currentColor">
                      <path d="M12 0L24 12L21.2 14L12 4.8L2.8 14L0 12L12 0Z" />
                    </svg>
                    <svg viewBox="0 0 24 14" className={`w-8 h-4 transition-transform text-[#6366f1] ${isPlaying ? 'animate-pulse delay-150' : ''}`} fill="currentColor">
                      <path d="M12 0L24 12L21.2 14L12 4.8L2.8 14L0 12L12 0Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Active Nostril Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStep.color }} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {currentStep.nostril}
                </span>
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
                      className={`w-5 h-2 rounded-full transition-all ${
                        i < completedRounds
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
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                voiceEnabled
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
