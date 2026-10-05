import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  Scale,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  TrendingDown,
  Info,
  Check,
  Flame,
  HelpCircle,
  Lightbulb,
  Heart
} from 'lucide-react';
import type { BaseActivityComponentProps } from '../types';
import { audioEngine } from '../utils/therapeuticAudioEngine';

export const MoodLiftCbtPlayer: React.FC<BaseActivityComponentProps> = ({
  activityId = 'ACT-10',
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

  if (activityId === 'ACT-10') {
    return <CbtNeuralSynapseChallenger activityName={activityName} onComplete={onComplete} />;
  } else {
    return <HolographicWorryVault activityName={activityName} onComplete={onComplete} />;
  }
};

/* ─────────────────────────────────────────────────────────────
   ACT-10: CBT THOUGHT CHALLENGER (Clean, Minimal Words Flow)
   ───────────────────────────────────────────────────────────── */
function CbtNeuralSynapseChallenger({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [thoughtData, setThoughtData] = useState({
    automaticThought: '',
    distortion: 'Catastrophizing',
    evidenceFor: '',
    evidenceAgainst: '',
    balancedReframe: '',
    initialBelief: 85,
    finalBelief: 20
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const distortions = [
    {
      id: 'Catastrophizing',
      name: 'Catastrophizing',
      desc: 'Assuming the absolute worst will happen.',
      icon: '⚡'
    },
    {
      id: 'All-or-Nothing',
      name: 'All-or-Nothing',
      desc: 'Seeing only perfection or total failure.',
      icon: '🎯'
    },
    {
      id: 'Mind Reading',
      name: 'Mind Reading',
      desc: 'Assuming negative judgments from others.',
      icon: '👥'
    },
    {
      id: 'Emotional Reasoning',
      name: 'Emotional Reasoning',
      desc: 'Treating anxious feelings as proven facts.',
      icon: '🧠'
    },
    {
      id: 'Overgeneralization',
      name: 'Overgeneralization',
      desc: 'Believing one mistake ruins everything.',
      icon: '📉'
    },
    {
      id: 'Should Statements',
      name: 'Should Statements',
      desc: 'Harsh, rigid rules on yourself.',
      icon: '⚖️'
    }
  ];

  const quickThoughtPrompts = [
    "If I fail, I'll lose respect.",
    "Everyone is silently judging me.",
    "I'm overwhelmed and can't handle this.",
    "One small mistake ruined everything."
  ];

  const quickCounterEvidenceSuggestions = [
    "Feelings are not verified facts.",
    "I have handled similar challenges before.",
    "One mistake does not define my worth.",
    "Most people are focused on themselves."
  ];

  const quickReframeSuggestions: Record<string, string[]> = {
    'Catastrophizing': [
      "Even if challenges arise, I can handle them step by step.",
      "The worst-case is unlikely. The realistic outcome is manageable."
    ],
    'All-or-Nothing': [
      "Partial progress is still genuine success.",
      "I choose self-compassion over perfectionism."
    ],
    'Mind Reading': [
      "I cannot know what others think unless they tell me.",
      "I focus on facts, not assumed judgments."
    ],
    'Emotional Reasoning': [
      "Feeling anxious does not mean danger is real. Feelings are not facts.",
      "I can feel discomfort while remaining capable."
    ],
    'Overgeneralization': [
      "One setback does not dictate the future.",
      "This is a specific event, not a permanent pattern."
    ],
    'Should Statements': [
      "I replace rigid 'shoulds' with flexible goals.",
      "I treat myself with patience and realistic expectations."
    ]
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    audioEngine.setVoiceEnabled(next);
    if (!next) {
      audioEngine.stopSpeaking();
    }
  };

  const handleSelectDistortion = (dName: string) => {
    audioEngine.playSfx('tactile_tap');
    setThoughtData((prev) => ({ ...prev, distortion: dName }));
  };

  const handleStepAdvance = (nextStep: 1 | 2 | 3 | 4) => {
    audioEngine.playSfx('tactile_tap');
    setStep(nextStep);
    if (voiceEnabledRef.current) {
      if (nextStep === 2) {
        audioEngine.speak('Step 2: Choose the thinking trap.');
      } else if (nextStep === 3) {
        audioEngine.speak('Step 3: Weigh the evidence.');
      } else if (nextStep === 4) {
        audioEngine.speak('Step 4: Create a balanced reframe.');
      }
    }
  };

  const handleFinish = () => {
    let reframeText = thoughtData.balancedReframe.trim();
    if (!reframeText) {
      const suggestions = quickReframeSuggestions[thoughtData.distortion] || quickReframeSuggestions['Catastrophizing'];
      reframeText = suggestions[0] || "I choose to view this with clarity and self-compassion.";
    }
    const finalData = { ...thoughtData, balancedReframe: reframeText };
    setThoughtData(finalData);
    audioEngine.playSfx('celebration_chords');
    if (voiceEnabledRef.current) {
      audioEngine.speak('Distortion successfully reframed and neutralized.');
    }
    setIsCompleted(true);
    if (onComplete) onComplete(finalData);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    audioEngine.stopSpeaking();
    setStep(1);
    setThoughtData({
      automaticThought: '',
      distortion: 'Catastrophizing',
      evidenceFor: '',
      evidenceAgainst: '',
      balancedReframe: '',
      initialBelief: 85,
      finalBelief: 20
    });
    setIsCompleted(false);
  };

  const forLength = thoughtData.evidenceFor.trim().length;
  const againstLength = thoughtData.evidenceAgainst.trim().length;
  const totalEvidence = forLength + againstLength;
  const againstRatio = totalEvidence > 0 ? Math.round((againstLength / totalEvidence) * 100) : 50;
  const beliefReduction = Math.max(0, thoughtData.initialBelief - thoughtData.finalBelief);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN, MINIMAL WORDS CBT THOUGHT CHALLENGER CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-lg shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden p-4 sm:p-5 select-none">
        {/* Soft Glows */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

        {/* Top Controls (Voice Toggle Only) */}
        <div className="relative z-10 flex items-center justify-end mb-2.5">
          <button
            onClick={handleToggleVoice}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>

        {!isCompleted ? (
          <div className="space-y-4 relative z-10">
            {/* 4-Step Stepper */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {[
                { num: 1, label: '1. Thought' },
                { num: 2, label: '2. Trap' },
                { num: 3, label: '3. Evidence' },
                { num: 4, label: '4. Reframe' }
              ].map((s) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => {
                      if (s.num === 1 || thoughtData.automaticThought.trim()) setStep(s.num as any);
                    }}
                    disabled={s.num > 1 && !thoughtData.automaticThought.trim()}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-[#5e2be2] text-white shadow-sm border border-[#5e2be2]'
                        : isPassed
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 cursor-pointer'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200/60 dark:border-slate-700/60 disabled:opacity-50 cursor-pointer'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 font-black" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.num}
                      </span>
                    )}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                STEP 1: CAPTURE AUTOMATIC THOUGHT
               ───────────────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-3.5 animate-fade-in max-w-2xl mx-auto">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    What thought is causing distress?
                  </h3>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Type the intrusive or negative thought on your mind..."
                    value={thoughtData.automaticThought}
                    onChange={(e) => setThoughtData({ ...thoughtData, automaticThought: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5e2be2] focus:bg-white dark:focus:bg-slate-900 font-medium leading-relaxed transition-all shadow-xs"
                  />

                  {/* 1-Click Example Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {quickThoughtPrompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          audioEngine.playSfx('tactile_tap');
                          setThoughtData({ ...thoughtData, automaticThought: p });
                        }}
                        className="text-[11px] px-2.5 py-1.5 bg-white hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/50 text-slate-700 dark:text-slate-300 hover:text-[#5e2be2] dark:hover:text-purple-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 transition-all text-left font-medium cursor-pointer shadow-xs truncate block w-full"
                        title={p}
                      >
                        "{p}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Belief Conviction Slider */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Belief Intensity:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-black">
                      {thoughtData.initialBelief}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={thoughtData.initialBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, initialBelief: Number(e.target.value) })}
                    className="w-full accent-[#5e2be2] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[9.5px] font-bold text-slate-400">
                    <span>10% (Doubt)</span>
                    <span>50% (Moderate)</span>
                    <span>100% (Certain)</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="flex justify-end pt-1">
                  <button
                    disabled={!thoughtData.automaticThought.trim()}
                    onClick={() => handleStepAdvance(2)}
                    className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Next: Thinking Trap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 2: IDENTIFY THINKING TRAP (DISTORTION)
               ───────────────────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-3.5 animate-fade-in max-w-2xl mx-auto">
                {/* Active Thought Pill */}
                <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-black uppercase text-[#5e2be2] dark:text-purple-300 shrink-0">
                      Thought:
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      "{thoughtData.automaticThought}"
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5e2be2]" />
                    Which thinking trap matches?
                  </h3>
                </div>

                {/* 6 Distortion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {distortions.map((d) => {
                    const isSelected = thoughtData.distortion === d.name;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectDistortion(d.name)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative shadow-xs ${
                          isSelected
                            ? 'bg-purple-50/90 dark:bg-purple-950/70 border-[#5e2be2] dark:border-purple-500 ring-2 ring-[#5e2be2]/30'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
                            isSelected
                              ? 'bg-[#5e2be2] text-white'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {d.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-black text-xs text-slate-900 dark:text-white">
                              {d.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#5e2be2] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {d.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepAdvance(3)}
                    className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Next: Weigh Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 3: WEIGH OBJECTIVE EVIDENCE
               ───────────────────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-3 animate-fade-in">
                {/* Active Thought Header Banner */}
                <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 flex items-center justify-between flex-wrap gap-2 shadow-xs">
                  <div className="flex-1 min-w-[200px] flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-black uppercase text-[#5e2be2] dark:text-purple-300 shrink-0">
                      Thought:
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      "{thoughtData.automaticThought}"
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold shrink-0">
                    {thoughtData.distortion}
                  </span>
                </div>

                {/* Balance Progress Indicator */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> For ({forLength})
                  </span>

                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-400 transition-all duration-300"
                      style={{ width: `${100 - againstRatio}%` }}
                    />
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{ width: `${againstRatio}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Against ({againstLength})
                  </span>
                </div>

                {/* Side-by-Side Textareas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Evidence For */}
                  <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5 shadow-xs">
                    <label className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Evidence For (Why it feels true):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What makes this thought feel real?..."
                      value={thoughtData.evidenceFor}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium leading-relaxed transition-all shadow-xs"
                    />
                  </div>

                  {/* Counter-Evidence Against */}
                  <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5 shadow-xs">
                    <label className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Evidence Against (Objective facts):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What facts or experiences contradict it?..."
                      value={thoughtData.evidenceAgainst}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceAgainst: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium leading-relaxed transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap gap-1">
                  {quickCounterEvidenceSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        audioEngine.playSfx('tactile_tap');
                        const updated = thoughtData.evidenceAgainst
                          ? `${thoughtData.evidenceAgainst}\n• ${sug}`
                          : `• ${sug}`;
                        setThoughtData({ ...thoughtData, evidenceAgainst: updated });
                      }}
                      className="text-[10.5px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-md border border-emerald-200 dark:border-emerald-800 transition-all font-medium cursor-pointer shadow-xs"
                    >
                      + "{sug}"
                    </button>
                  ))}
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepAdvance(4)}
                    className="px-5 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Next: Reframe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 4: SYNTHESIZE GROUNDED REFRAME
               ───────────────────────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-3.5 animate-fade-in max-w-2xl mx-auto">
                {/* Strikethrough Original Thought */}
                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-0.5 shadow-xs">
                  <span className="text-[9.5px] font-black uppercase text-rose-700 dark:text-rose-400 block">
                    Original Distortion ({thoughtData.distortion}):
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-through opacity-80 font-medium leading-snug">
                    "{thoughtData.automaticThought}"
                  </p>
                </div>

                {/* Grounded Reframe Textarea */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2 shadow-xs">
                  <label className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Balanced Reframe:
                  </label>

                  <textarea
                    rows={2.5}
                    placeholder="Write a realistic, compassionate reframe..."
                    value={thoughtData.balancedReframe}
                    onChange={(e) => setThoughtData({ ...thoughtData, balancedReframe: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium leading-relaxed transition-all shadow-xs"
                  />

                  {/* 1-Click Suggestions */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex flex-col gap-1">
                      {(quickReframeSuggestions[thoughtData.distortion] || quickReframeSuggestions['Catastrophizing']).map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            audioEngine.playSfx('tactile_tap');
                            setThoughtData({ ...thoughtData, balancedReframe: sug });
                          }}
                          className="text-[11px] p-2 bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-left font-medium cursor-pointer shadow-xs flex items-center justify-between gap-1.5"
                        >
                          <span className="truncate flex-1">"{sug}"</span>
                          <span className="shrink-0 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Use
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post-Reframe Belief Slider */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      Belief in old thought now:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black">
                        Now: {thoughtData.finalBelief}%
                      </span>
                      <span className="text-[10.5px] font-bold text-purple-600 dark:text-purple-300">
                        (-{beliefReduction}% Relief)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thoughtData.finalBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, finalBelief: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Complete Reframe</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              COMPLETION STATE: MINIMAL CELEBRATION SUMMARY
             ───────────────────────────────────────────────────────────── */
          <div className="py-3 text-center space-y-3 relative z-10 max-w-lg mx-auto animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 p-0.5 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-md shadow-emerald-500/10">
              <div className="w-full h-full rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Thought Successfully Reframed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Belief dropped by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{beliefReduction}%</strong>.
              </p>
            </div>

            {/* Before vs After Comparison Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {/* Before */}
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 space-y-1 shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  ❌ Distorted Thought:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 line-through opacity-80 leading-snug font-medium line-clamp-3">
                  "{thoughtData.automaticThought}"
                </p>
              </div>

              {/* After */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1 shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  ✨ Grounded Reframe:
                </span>
                <p className="text-[11px] text-slate-900 dark:text-slate-100 font-bold leading-snug line-clamp-3">
                  "{thoughtData.balancedReframe}"
                </p>
              </div>
            </div>

            {/* Compact Metric Bar */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Before</span>
                <span className="text-xs font-black text-rose-600">{thoughtData.initialBelief}%</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">After</span>
                <span className="text-xs font-black text-emerald-600">{thoughtData.finalBelief}%</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Relief</span>
                <span className="text-xs font-black text-[#5e2be2]">+{beliefReduction}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <RotateCcw className="w-3 h-3" /> Reframe Another Thought
              </button>
              <button
                onClick={() => {
                  if (onComplete) onComplete(thoughtData);
                }}
                className="flex-1 py-2 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EDUCATIONAL & CLINICAL DEEP-DIVE SECTION (Below Activity)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-6">
        {/* Section 1: Overview */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#5e2be2] dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" /> Evidence-Based Methodology
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            What is CBT Thought Challenging?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            CBT Thought Challenging (Cognitive Restructuring) is the gold-standard therapeutic intervention founded on Aaron Beck's Cognitive Model. When faced with stress, uncertainty, or emotional triggers, the brain often defaults to automated, rigid negative thoughts. By intentionally identifying the underlying distortion, evaluating verified objective evidence, and generating an adaptive neural reframe, you de-escalate amygdala reactivity and build long-term emotional resilience.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5e2be2]" />
              <span>How It Works: The 3-Step Neural Restructuring Model</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              A systematic protocol to intercept intrusive distortions and replace them with grounded clarity:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-1.5 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[9px] font-bold">1</span>
                  Capture Thought & Pattern
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Write down the unfiltered intrusive sentence and pinpoint which cognitive trap is skewing your perception.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-1.5 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[9px] font-bold">2</span>
                  Weigh Objective Evidence
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Separate verifiable facts from emotional assumptions, balancing what feels true with concrete counter-evidence.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-1.5 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[9px] font-bold">3</span>
                  Synthesize Grounded Reframe
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Formulate a compassionate, realistic replacement belief that aligns with objective reality and relieves distress.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Benefits */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5e2be2]" />
              <span>Clinical Benefits & Neuroplasticity</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Documented psychological and physiological outcomes of regular cognitive reframing:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rewires Neural Pathways</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Strengthens prefrontal cortex control over the amygdala, reducing involuntary stress responses and catastrophic looping.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fosters Psychological Agility</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Cultivates cognitive defusion—the understanding that thoughts are transient mental events rather than immutable objective truths.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT-12: HOLOGRAPHIC WORRY VAULT (Postponement & Externalization)
   ───────────────────────────────────────────────────────────── */
function HolographicWorryVault({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [worryText, setWorryText] = useState<string>('');
  const [worryTime, setWorryTime] = useState<string>('5:30 PM');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [vaultPulse, setVaultPulse] = useState<boolean>(false);

  const handleDeposit = () => {
    if (!worryText.trim()) return;
    setVaultPulse(true);
    audioEngine.playSfx('vault_lock');
    audioEngine.speak('Worry safely sealed in the vault. You are released to focus on the present.');

    setTimeout(() => {
      setIsLocked(true);
      setVaultPulse(false);
      if (onComplete) onComplete({ worryText, worryTime });
    }, 600);
  };

  const handleReset = () => {
    audioEngine.playSfx('tactile_tap');
    setWorryText('');
    setIsLocked(false);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 text-slate-800 dark:text-white shadow-lg shadow-amber-500/5 border border-amber-100/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-100/50 dark:bg-amber-950/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-100/40 dark:bg-purple-950/20 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200">
          Cognitive Worry Vault
        </span>
      </div>

      {!isLocked ? (
        <div className="max-w-md mx-auto space-y-3 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> What worry is consuming your cognitive bandwidth?
            </label>
            <textarea
              rows={3}
              placeholder="Deposit your raw thought or fear into the vault to mentally disengage..."
              value={worryText}
              onChange={(e) => setWorryText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-amber-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Scheduled Review Time:
              </label>
              <input
                type="text"
                value={worryTime}
                onChange={(e) => setWorryTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-600">Container Status:</label>
              <div className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-[#5e2be2] font-black">
                {vaultPulse ? 'ENCRYPTING...' : 'AWAITING LOCK'}
              </div>
            </div>
          </div>

          <button
            disabled={!worryText.trim()}
            onClick={handleDeposit}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all cursor-pointer mt-1"
          >
            <Lock className="w-4 h-4" /> Lock & Seal in Worry Vault
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 p-1 mx-auto shadow-md shadow-amber-500/10 flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-amber-600">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Worry Safely Quarantined</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              Your concern is secured. You have permission to live in the present until your scheduled worry window at <strong className="text-amber-700 font-bold">{worryTime}</strong>.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
          >
            Deposit Another Thought
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodLiftCbtPlayer;
