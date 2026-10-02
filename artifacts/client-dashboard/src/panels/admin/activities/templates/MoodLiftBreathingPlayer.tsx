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
   ACT-02: BOX BREATHING TACTICAL HUD (4-Sided Perimeter Laser)
   ───────────────────────────────────────────────────────────── */
function BoxBreathingTacticalHUD({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sideIndex, setSideIndex] = useState<number>(0); // 0=Top(Inhale), 1=Right(Hold), 2=Bottom(Exhale), 3=Left(Hold)
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [completedBoxes, setCompletedBoxes] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const sides = [
    { name: 'Top: Inhale', desc: 'Inhale smoothly for 4 seconds', voice: 'Inhale for four seconds.', color: '#4f46e5' },
    { name: 'Right: Hold', desc: 'Retain oxygen with steady focus', voice: 'Hold breath for four seconds.', color: '#7c3aed' },
    { name: 'Bottom: Exhale', desc: 'Exhale smoothly and evenly', voice: 'Exhale smoothly for four seconds.', color: '#06b6d4' },
    { name: 'Left: Rest', desc: 'Rest empty in the quiet pause', voice: 'Rest empty for four seconds.', color: '#2563eb' }
  ];

  const currentSide = sides[sideIndex];

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            const nextSide = (sideIndex + 1) % 4;
            if (nextSide === 0) {
              setCompletedBoxes((b) => {
                const nextB = b + 1;
                if (nextB >= 4) {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  audioEngine.playSfx('celebration_chords');
                  audioEngine.speak('Box breathing drill complete. Nervous system balanced.');
                  if (onComplete) onComplete({ completedBoxes: nextB });
                }
                return nextB;
              });
            }
            setSideIndex(nextSide);
            if (nextSide === 0) audioEngine.playSfx('inhale_whoosh');
            else if (nextSide === 2) audioEngine.playSfx('exhale_whoosh');
            else audioEngine.playSfx('sonar_ping');
            if (voiceEnabled) audioEngine.speak(sides[nextSide].voice);
            return 4;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, sideIndex, isCompleted, voiceEnabled, onComplete]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      audioEngine.playSfx('inhale_whoosh');
      if (voiceEnabled) audioEngine.speak(currentSide.voice);
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setSideIndex(0);
    setSecondsLeft(4);
    setCompletedBoxes(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-indigo-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 shadow-sm">
            <Square className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              ACT-02 • 4x4 TACTICAL BOX MATRIX
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Box Breathing'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Navy SEAL 4-4-4-4 Autonomic Nervous System Equalization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              voiceEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
          <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCompleted ? (
        <div className="max-w-md mx-auto text-center space-y-6 relative z-10 py-2">
          {/* Unique Tactical 4-Sided Square HUD */}
          <div className="relative w-64 h-64 mx-auto p-4 flex items-center justify-center">
            {/* Box Borders with Active Side Highlight */}
            <div className="relative w-52 h-52 rounded-2xl border-4 border-slate-200 flex items-center justify-center bg-slate-50/50">
              {/* Top Side (Inhale) */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl transition-all duration-300 ${sideIndex === 0 && isPlaying ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.8)]' : 'bg-transparent'}`} />
              {/* Right Side (Hold) */}
              <div className={`absolute top-0 right-0 bottom-0 w-1.5 rounded-r-xl transition-all duration-300 ${sideIndex === 1 && isPlaying ? 'bg-purple-600 shadow-[0_0_15px_rgba(124,58,237,0.8)]' : 'bg-transparent'}`} />
              {/* Bottom Side (Exhale) */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 rounded-b-xl transition-all duration-300 ${sideIndex === 2 && isPlaying ? 'bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'bg-transparent'}`} />
              {/* Left Side (Hold) */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl transition-all duration-300 ${sideIndex === 3 && isPlaying ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-transparent'}`} />

              {/* Central Tactical Core */}
              <div className="text-center space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                  {isPlaying ? currentSide.name.split(':')[1].trim() : 'Tactical Lock'}
                </span>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {isPlaying ? `${secondsLeft}s` : '4x4'}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isPlaying ? `Side ${sideIndex + 1} of 4` : 'Press Start'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-1">
            <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700">Tactical Directives</div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">{isPlaying ? currentSide.desc : 'Maintain straight posture, uncross legs, and synchronize with the square perimeter.'}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleToggle}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all mx-auto cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause Box Routine' : 'Start Box Breathing'}
            </button>

            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Completed Boxes: {completedBoxes} / 4</span>
              <span className="text-indigo-600 font-black">{Math.round((completedBoxes / 4) * 100)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 p-1 mx-auto shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Autonomic Equilibrium Locked</h3>
            <p className="text-xs text-slate-600 mt-1">
              Four square breathing cycles executed. Cortisol suppressed and situational clarity restored.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Execute Another Box
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-03: 4-7-8 SOMATIC TRANQUILIZER (Ocean Tidal Surge)
   ───────────────────────────────────────────────────────────── */
function OceanWave478Player({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phase, setPhase] = useState<'inhale' | 'lock' | 'whoosh'>('inhale');
  const [secsLeft, setSecsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setSecsLeft((s) => {
          if (s <= 1) {
            if (phase === 'inhale') {
              setPhase('lock');
              audioEngine.playSfx('singing_bowl');
              if (voiceEnabled) audioEngine.speak('Hold your breath for seven seconds.');
              return 7;
            } else if (phase === 'lock') {
              setPhase('whoosh');
              audioEngine.playSfx('exhale_whoosh');
              if (voiceEnabled) audioEngine.speak('Whoosh exhale completely for eight seconds.');
              return 8;
            } else {
              setPhase('inhale');
              audioEngine.playSfx('inhale_whoosh');
              if (voiceEnabled) audioEngine.speak('Inhale quietly through nose for four seconds.');
              setCompletedCycles((c) => {
                const nextC = c + 1;
                if (nextC >= 4) {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  audioEngine.playSfx('celebration_chords');
                  audioEngine.speak('4-7-8 sedative cycle complete. Deep tranquility activated.');
                  if (onComplete) onComplete({ completedCycles: nextC });
                }
                return nextC;
              });
              return 4;
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase, isCompleted, voiceEnabled, onComplete]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      audioEngine.playSfx('inhale_whoosh');
      if (voiceEnabled) audioEngine.speak('Inhale quietly through your nose for four seconds.');
    } else {
      audioEngine.stopSpeaking();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setPhase('inhale');
    setSecsLeft(4);
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-teal-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-teal-600 shadow-sm">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
              ACT-03 • 4-7-8 RAPID SEDATIVE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || '4-7-8 Breathing'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              4s Inhale • 7s Oxygen Lock • 8s Extended Whoosh Exhale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              voiceEnabled ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
          <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCompleted ? (
        <div className="max-w-md mx-auto text-center space-y-6 relative z-10 py-2">
          {/* Tidal Surge Liquid Bar */}
          <div className="relative w-64 h-64 mx-auto rounded-full bg-slate-50 border-2 border-teal-200 overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out ${
                phase === 'inhale'
                  ? 'bg-gradient-to-t from-teal-500 to-cyan-400 opacity-60'
                  : phase === 'lock'
                  ? 'bg-gradient-to-t from-indigo-500 to-purple-400 opacity-80'
                  : 'bg-gradient-to-t from-emerald-500 to-teal-300 opacity-40'
              }`}
              style={{
                height: phase === 'inhale' ? '70%' : phase === 'lock' ? '95%' : '20%'
              }}
            />

            <div className="relative z-10 text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 text-slate-900 shadow-sm">
                {phase === 'inhale' ? '1. Quiet Inhale' : phase === 'lock' ? '2. Oxygen Lock' : '3. Whoosh Exhale'}
              </span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
                {isPlaying ? `${secsLeft}s` : '4-7-8'}
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                {phase === 'inhale' ? 'Target: 4s' : phase === 'lock' ? 'Target: 7s' : 'Target: 8s'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 text-center space-y-1">
            <div className="text-[10px] uppercase font-black tracking-wider text-teal-700">Clinical Ratio Guidance</div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {phase === 'inhale' && 'Inhale quietly through your nose with tongue touching roof of mouth.'}
              {phase === 'lock' && 'Retain oxygen fully. Allow carbon dioxide exchange in brain capillary beds.'}
              {phase === 'whoosh' && 'Make an audible whoosh sound through your mouth, completely emptying lungs.'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleToggle}
              className="px-10 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all mx-auto cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause 4-7-8 Wave' : 'Start 4-7-8 Tranquilizer'}
            </button>

            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Completed Sets: {completedCycles} / 4</span>
              <span className="text-teal-700 font-black">{Math.round((completedCycles / 4) * 100)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-teal-50 border border-teal-100 p-1 mx-auto shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Neural Sedation Achieved</h3>
            <p className="text-xs text-slate-600 mt-1">
              Four complete 4-7-8 cycles finished. Sympathetic surge deactivated and heart rate lowered.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Repeat Tranquilizer
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-04: ALTERNATE NOSTRIL HEMISPHERIC SYNAPSE (Left/Right Bridge)
   ───────────────────────────────────────────────────────────── */
function AlternateNostrilHemisphericPlayer({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [secsLeft, setSecsLeft] = useState<number>(4);
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const nostrilSteps = [
    { nostril: 'Left', action: 'Inhale', holdSecs: 4, handCue: 'Block Right Nostril with Thumb -> Inhale Left', voice: 'Block right nostril, inhale left.', color: '#06b6d4' },
    { nostril: 'Both', action: 'Hold', holdSecs: 2, handCue: 'Close Both Nostrils softly -> Pause in stillness', voice: 'Hold both nostrils closed.', color: '#7c3aed' },
    { nostril: 'Right', action: 'Exhale', holdSecs: 4, handCue: 'Release Right Nostril -> Exhale completely Right', voice: 'Open right nostril, exhale.', color: '#d97706' },
    { nostril: 'Right', action: 'Inhale', holdSecs: 4, handCue: 'Keep Right open -> Inhale smoothly Right', voice: 'Inhale through right nostril.', color: '#d97706' },
    { nostril: 'Both', action: 'Hold', holdSecs: 2, handCue: 'Close Both Nostrils softly -> Pause in stillness', voice: 'Hold gently.', color: '#7c3aed' },
    { nostril: 'Left', action: 'Exhale', holdSecs: 4, handCue: 'Release Left Nostril -> Exhale completely Left', voice: 'Open left nostril and exhale completely.', color: '#06b6d4' }
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
                if (nextR >= 3) {
                  setIsPlaying(false);
                  setIsCompleted(true);
                  audioEngine.playSfx('celebration_chords');
                  audioEngine.speak('Alternate nostril breathing complete. Hemispheric equilibrium restored.');
                  if (onComplete) onComplete({ completedRounds: nextR });
                }
                return nextR;
              });
            }
            setStepIdx(nextIdx);
            const nextS = nostrilSteps[nextIdx];
            if (nextS.action === 'Inhale') audioEngine.playSfx('inhale_whoosh');
            else if (nextS.action === 'Exhale') audioEngine.playSfx('exhale_whoosh');
            else audioEngine.playSfx('singing_bowl');
            if (voiceEnabled) audioEngine.speak(nextS.voice);
            return nextS.holdSecs;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepIdx, isCompleted, voiceEnabled, onComplete]);

  const handleToggle = () => {
    audioEngine.playSfx('tactile_tap');
    if (!isPlaying) {
      audioEngine.playSfx('inhale_whoosh');
      if (voiceEnabled) audioEngine.speak(currentStep.voice);
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
    setSecsLeft(4);
    setCompletedRounds(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl shadow-amber-500/5 border border-slate-100 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600 shadow-sm">
            <ArrowRightLeft className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              ACT-04 • NADI SHODHANA HARMONIZER
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {activityName || 'Alternate Nostril Breathing'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Left & Right Hemispheric Brainwave Balance Sequence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              voiceEnabled ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
          <button onClick={handleReset} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCompleted ? (
        <div className="max-w-md mx-auto text-center space-y-6 relative z-10 py-2">
          {/* Left / Right Brain Channel HUD */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Channel */}
            <div className={`p-4 rounded-2xl border-2 transition-all duration-500 text-center ${
              currentStep.nostril === 'Left' || currentStep.nostril === 'Both'
                ? 'bg-cyan-50/80 border-cyan-500 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Left Channel (Moon / Ida)</div>
              <div className="text-lg font-black text-slate-900 mt-1">Left Nostril</div>
              <div className="text-xs font-bold text-cyan-600 mt-0.5">
                {currentStep.nostril === 'Left' ? `Active: ${currentStep.action}` : currentStep.nostril === 'Both' ? 'Closed (Hold)' : 'Resting'}
              </div>
            </div>

            {/* Right Channel */}
            <div className={`p-4 rounded-2xl border-2 transition-all duration-500 text-center ${
              currentStep.nostril === 'Right' || currentStep.nostril === 'Both'
                ? 'bg-amber-50/80 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">Right Channel (Sun / Pingala)</div>
              <div className="text-lg font-black text-slate-900 mt-1">Right Nostril</div>
              <div className="text-xs font-bold text-amber-600 mt-0.5">
                {currentStep.nostril === 'Right' ? `Active: ${currentStep.action}` : currentStep.nostril === 'Both' ? 'Closed (Hold)' : 'Resting'}
              </div>
            </div>
          </div>

          {/* Center Timer Orb */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 via-purple-500 to-cyan-400 p-1 mx-auto shadow-xl shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{isPlaying ? secsLeft : 'Start'}</span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400">
                {isPlaying ? `${currentStep.action}` : 'Ready'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-1">
            <div className="text-[10px] uppercase font-black tracking-wider text-amber-800">Hand Mudra Position</div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">{isPlaying ? currentStep.handCue : 'Use right thumb on right nostril and ring finger on left nostril.'}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleToggle}
              className="px-10 py-4 bg-gradient-to-r from-amber-600 to-cyan-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all mx-auto cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause Alternate Flow' : 'Begin Nadi Shodhana'}
            </button>

            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Completed Rounds: {completedRounds} / 3</span>
              <span className="text-amber-700 font-black">{Math.round((completedRounds / 3) * 100)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-100 p-1 mx-auto shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-amber-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Hemispheric Harmony Restored</h3>
            <p className="text-xs text-slate-600 mt-1">
              Synchronized airflow across both cerebral hemispheres, dispelling cognitive fatigue and restoring calm.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Practice Again
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodLiftBreathingPlayer;
