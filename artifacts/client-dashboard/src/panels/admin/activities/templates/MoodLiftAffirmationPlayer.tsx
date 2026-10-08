import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Heart,
  Shield,
  Feather,
  Flame,
  Plus,
  Compass,
  Check,
  Share2,
  Bookmark,
  Play
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

interface AffirmationCard {
  id: string;
  text: string;
  category: 'SELF-WORTH' | 'RELEASE' | 'RESILIENCE' | 'PEACE' | 'COMPASSION';
  theme: string;
  accent: string;
  reflectionPrompt: string;
}

const DEFAULT_AFFIRMATIONS: AffirmationCard[] = [
  {
    id: 'aff-1',
    text: 'I am inherently worthy, safe, and fully capable of navigating this day with calm confidence.',
    category: 'SELF-WORTH',
    theme: 'Self-Worth & Safety',
    accent: '#5e2be2',
    reflectionPrompt: 'Notice your shoulders dropping as you claim your right to occupy space.'
  },
  {
    id: 'aff-2',
    text: 'My value is not measured by relentless productivity. I am allowed to pause, rest, and restore.',
    category: 'PEACE',
    theme: 'Permission to Rest',
    accent: '#8b5cf6',
    reflectionPrompt: 'Feel the permission to simply exist without having to earn your breath.'
  },
  {
    id: 'aff-3',
    text: 'I have navigated storms before. I carry inside me the adaptive strength to handle whatever unfolds.',
    category: 'RESILIENCE',
    theme: 'Inner Strength',
    accent: '#06b6d4',
    reflectionPrompt: 'Connect with the quiet, unshakable resilience rooted deep in your spine.'
  },
  {
    id: 'aff-4',
    text: 'I release responsibility for things outside my control and fiercely protect my inner peace.',
    category: 'RELEASE',
    theme: 'Boundary Restoration',
    accent: '#ec4899',
    reflectionPrompt: 'Exhale the weight of expectations that were never yours to carry.'
  },
  {
    id: 'aff-5',
    text: 'I treat my mind and body with unconditional kindness, understanding, and radical compassion today.',
    category: 'COMPASSION',
    theme: 'Self-Compassion',
    accent: '#10b981',
    reflectionPrompt: 'Speak to yourself with the exact gentleness you would gift to someone you love.'
  }
];

const CATEGORIES = [
  { key: 'ALL', label: 'All', icon: Sparkles },
  { key: 'SELF-WORTH', label: 'Self-Worth', icon: Shield },
  { key: 'PEACE', label: 'Inner Peace', icon: Feather },
  { key: 'RESILIENCE', label: 'Resilience', icon: Flame },
  { key: 'RELEASE', label: 'Letting Go', icon: Compass },
  { key: 'COMPASSION', label: 'Compassion', icon: Heart }
];

export const MoodLiftAffirmationPlayer: React.FC<BaseActivityComponentProps> = ({
  activityName,
  onComplete
}) => {
  const [affirmations, setAffirmations] = useState<AffirmationCard[]>(DEFAULT_AFFIRMATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [ritualStage, setRitualStage] = useState<'center' | 'speak' | 'absorb' | 'sealed'>('center');
  const [absorbSeconds, setAbsorbSeconds] = useState<number>(10);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sealedIds, setSealedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter affirmations by category
  const filteredAffirmations = selectedCategory === 'ALL'
    ? affirmations
    : affirmations.filter((a) => a.category === selectedCategory);

  const currentAffirmation = filteredAffirmations[currentIdx] || filteredAffirmations[0] || affirmations[0];
  const isLastAffirmation = currentIdx === filteredAffirmations.length - 1;
  const isCurrentSealed = sealedIds.includes(currentAffirmation.id);

  // Camera Management
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera access declined:', err);
          setCameraError('Camera access not granted. Using digital mirror.');
          setCameraActive(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Voice narration on card change only after user starts
  useEffect(() => {
    if (isStarted && voiceEnabled && !isCompleted && currentAffirmation) {
      audioEngine.speak(currentAffirmation.text);
    }
    setRitualStage('center');
    setAbsorbSeconds(10);
  }, [currentIdx, selectedCategory, voiceEnabled, isStarted]);

  // Absorb Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ritualStage === 'absorb' && absorbSeconds > 0) {
      interval = setInterval(() => {
        setAbsorbSeconds((prev) => {
          if (prev <= 1) {
            audioEngine.playSfx('neural_sparkle');
            setRitualStage('sealed');
            setSealedIds((prevIds) => prevIds.includes(currentAffirmation.id) ? prevIds : [...prevIds, currentAffirmation.id]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ritualStage, absorbSeconds, currentAffirmation]);

  const toggleVoice = () => {
    audioEngine.playSfx('tactile_tap');
    setVoiceEnabled(!voiceEnabled);
  };

  const handleStart = () => {
    audioEngine.playSfx('neural_sparkle');
    setIsStarted(true);
    if (voiceEnabled && currentAffirmation) {
      audioEngine.speak(currentAffirmation.text);
    }
  };

  const handleHearVoice = () => {
    audioEngine.playSfx('neural_sparkle');
    audioEngine.speak(currentAffirmation.text);
  };

  const handleStartAbsorb = () => {
    audioEngine.playSfx('sonar_ping');
    setRitualStage('absorb');
    setAbsorbSeconds(10);
    if (voiceEnabled) {
      audioEngine.speak('Breathe gently and absorb this truth into your core.');
    }
  };

  const handleNext = () => {
    audioEngine.playSfx('sonar_ping');
    if (!isCurrentSealed) {
      setSealedIds((prev) => [...prev, currentAffirmation.id]);
    }

    if (isLastAffirmation) {
      setIsCompleted(true);
      audioEngine.playSfx('celebration_chords');
      if (voiceEnabled) {
        audioEngine.speak('Mirror ritual complete. Carry these grounding truths with you throughout your day.');
      }
      if (onComplete) {
        onComplete({ sealedCount: sealedIds.length + 1, affirmations: affirmations.map((a) => a.text) });
      }
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    audioEngine.playSfx('tactile_tap');
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setIsStarted(false);
    setCurrentIdx(0);
    setRitualStage('center');
    setAbsorbSeconds(10);
    setSealedIds([]);
    setIsCompleted(false);
  };

  const handleAddCustomAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const newCard: AffirmationCard = {
      id: `custom-${Date.now()}`,
      text: customText.trim(),
      category: 'SELF-WORTH',
      theme: 'Personal Intent',
      accent: '#5e2be2',
      reflectionPrompt: 'Your chosen truth, spoken from personal agency.'
    };
    setAffirmations([newCard, ...affirmations]);
    setCustomText('');
    setShowCustomModal(false);
    setSelectedCategory('ALL');
    setCurrentIdx(0);
    audioEngine.playSfx('celebration_chords');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN, VIEWPORT-FITTED AFFIRMATION MIRROR CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-lg shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden p-4 sm:p-5 select-none">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

          {/* Top Controls Bar: Digital Mirror & Voice On */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-xs">
                Affirmation {currentIdx + 1} of {filteredAffirmations.length}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                • {currentAffirmation.theme}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  cameraActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border-purple-200/80 dark:border-purple-800'
                }`}
                title="Toggle Live Camera Reflection"
              >
                {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                <span>{cameraActive ? 'Live Camera' : 'Digital Mirror'}</span>
              </button>

              <button
                onClick={toggleVoice}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Toggle Voice Guidance"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
              </button>
            </div>
          </div>

          {!isCompleted ? (
            <div className="space-y-3.5 relative z-10 animate-fade-in max-w-2xl mx-auto">
              {/* Category Filter Tabs */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        audioEngine.playSfx('tactile_tap');
                        setSelectedCategory(cat.key);
                        setCurrentIdx(0);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                      isSelected
                        ? 'bg-[#5e2be2] text-white shadow-sm border border-[#5e2be2]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowCustomModal(true)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Write your own custom affirmation"
              >
                <Plus className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>

            {/* 🪞 HOLOGRAPHIC SHIMMER MIRROR FRAME */}
            <div className="relative w-full rounded-2xl p-1 bg-gradient-to-b from-purple-400/30 via-indigo-500/20 to-fuchsia-400/30 shadow-md shadow-purple-500/10 border border-purple-200/60 dark:border-purple-500/30">
              <div className="relative w-full min-h-[220px] sm:min-h-[240px] rounded-xl bg-gradient-to-b from-slate-900/95 via-purple-950/90 to-indigo-950/95 p-5 sm:p-7 flex flex-col justify-between items-center text-white overflow-hidden backdrop-blur-xl">
                {/* Live Camera View if Active */}
                {cameraActive && (
                  <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1] opacity-40 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-purple-950/60 to-slate-950/70" />
                  </div>
                )}

                {/* Shimmer Light Rays Animation */}
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-radial from-purple-400/20 to-transparent blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-radial from-fuchsia-400/20 to-transparent blur-3xl pointer-events-none animate-pulse" />

                {/* Top Mirror Header Badge */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[9.5px] font-black tracking-wider text-purple-200 border border-white/10 uppercase">
                    🪞 {currentAffirmation.category}
                  </span>
                  {isCurrentSealed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                      <Check className="w-3 h-3" /> Sealed in Core
                    </span>
                  )}
                </div>

                {/* Affirmation Hero Text */}
                <div className="relative z-10 my-3 text-center space-y-2 max-w-xl">
                  <p className="text-lg sm:text-2xl sm:leading-snug font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-fuchsia-100 tracking-tight drop-shadow-md">
                    "{currentAffirmation.text}"
                  </p>

                  <p className="text-[11px] sm:text-xs text-purple-200/80 font-medium max-w-md mx-auto italic">
                    ✨ {currentAffirmation.reflectionPrompt}
                  </p>
                </div>

                {/* Bottom Stage Action Area */}
                <div className="relative z-10 w-full flex flex-col items-center gap-2">
                  {!isStarted ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={handleStart}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-[#5e2be2] via-purple-600 to-indigo-600 hover:from-[#5123cc] hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Practice</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {ritualStage === 'center' && (
                        <div className="flex items-center gap-2.5 flex-wrap justify-center">
                          <button
                            onClick={handleHearVoice}
                            className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-purple-100 border border-white/20 text-[11px] font-bold transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 shadow-xs"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Speak Aloud</span>
                          </button>

                          <button
                            onClick={handleStartAbsorb}
                            className="px-5 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-[#5e2be2] hover:opacity-95 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md shadow-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Begin 10s Absorb</span>
                          </button>
                        </div>
                      )}

                      {ritualStage === 'absorb' && (
                        <div className="flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 backdrop-blur-md animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                          <span className="text-[11px] font-black text-purple-100">
                            Breathe & Absorb: {absorbSeconds}s remaining...
                          </span>
                        </div>
                      )}

                      {ritualStage === 'sealed' && (
                        <div className="flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-black backdrop-blur-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Truth anchored in your nervous system</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stepper Dots & Navigation Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {filteredAffirmations.map((aff, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isSealed = sealedIds.includes(aff.id);
                  return (
                    <button
                      key={aff.id}
                      onClick={() => {
                        audioEngine.playSfx('tactile_tap');
                        setCurrentIdx(idx);
                        if (!isStarted) handleStart();
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? 'w-6 bg-[#5e2be2]'
                          : isSealed
                          ? 'w-2 bg-emerald-500'
                          : 'w-2 bg-slate-200 dark:bg-slate-700'
                      }`}
                      title={`Go to affirmation ${idx + 1}`}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (!isStarted) {
                    handleStart();
                  } else {
                    handleNext();
                  }
                }}
                className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{!isStarted ? 'Start' : isLastAffirmation ? 'Complete Ritual' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion State & Reflection Gallery */
          <div className="max-w-md mx-auto py-4 text-center space-y-4 animate-fade-in relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 p-0.5 mx-auto shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-[#5e2be2] dark:text-purple-400">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Mirror Ritual Completed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                You have integrated {sealedIds.length || affirmations.length} grounding affirmations into your nervous system.
              </p>
            </div>

            {/* Anchored Affirmations Deck Summary */}
            <div className="space-y-2 text-left max-w-sm mx-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                📜 Anchored Self-Worth Affirmations:
              </span>
              <div className="space-y-1.5">
                {affirmations.slice(0, 3).map((aff) => (
                  <div
                    key={aff.id}
                    className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-2 shadow-xs"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#5e2be2] text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#5e2be2] dark:text-purple-300">
                        {aff.theme}
                      </span>
                      <p className="text-[11px] font-medium text-slate-800 dark:text-purple-100 leading-snug line-clamp-2">
                        "{aff.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <RotateCcw className="w-3 h-3" /> Practice Again
              </button>

              <button
                onClick={() => {
                  if (onComplete) onComplete({ completed: true });
                }}
                className="flex-1 py-2 bg-[#5e2be2] hover:bg-[#4f28d9] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Write Custom Affirmation Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-200 dark:border-purple-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5e2be2]" /> Write Custom Affirmation
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomAffirmation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  What truth do you need to speak to yourself today?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. I am proud of how hard I am trying, and I deserve peace."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5e2be2]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-6 py-2 bg-[#5e2be2] hover:bg-[#4f28d9] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Project into Mirror
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Educational Clinical Notes */}
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#5e2be2] dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" /> Evidence-Based Methodology
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Mirror Exposure Works in Neuroplasticity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            Looking directly into a reflection while reciting affirmations activates the <strong>mirror neuron system</strong> and the <strong>medial prefrontal cortex (mPFC)</strong>. It breaks the cycle of negative self-evaluation by marrying visual self-recognition with cognitive safety cues, reducing default mode network (DMN) rumination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodLiftAffirmationPlayer;
