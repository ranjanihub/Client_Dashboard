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
   ACT-10: CBT THOUGHT CHALLENGER (Cognitive Restructuring Studio)
   Reference: Beckian Cognitive Therapy & Neural Restructuring Model
   ───────────────────────────────────────────────────────────── */
function CbtNeuralSynapseChallenger({ activityName, onComplete }: { activityName?: string; onComplete?: any }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
      desc: 'Anticipating worst-case scenarios without factual probability.',
      badge: 'High Anxiety',
      icon: '⚡',
      color: 'amber'
    },
    {
      id: 'All-or-Nothing',
      name: 'All-or-Nothing',
      desc: 'Viewing situations as total success or absolute failure with no middle ground.',
      badge: 'Perfectionism',
      icon: '🎯',
      color: 'purple'
    },
    {
      id: 'Mind Reading',
      name: 'Mind Reading',
      desc: 'Assuming you know others are judging you negatively without evidence.',
      badge: 'Social Fear',
      icon: '👥',
      color: 'blue'
    },
    {
      id: 'Emotional Reasoning',
      name: 'Emotional Reasoning',
      desc: 'Assuming because you feel anxious or incompetent, it must be factually true.',
      badge: 'Cognitive Bias',
      icon: '🧠',
      color: 'rose'
    },
    {
      id: 'Overgeneralization',
      name: 'Overgeneralization',
      desc: 'Treating a single negative incident as a never-ending pattern of defeat.',
      badge: 'Helplessness',
      icon: '📉',
      color: 'indigo'
    },
    {
      id: 'Should Statements',
      name: 'Should Statements',
      desc: 'Imposing rigid, punitive rules and demands upon yourself or others.',
      badge: 'Self-Criticism',
      icon: '⚖️',
      color: 'emerald'
    }
  ];

  const quickThoughtPrompts = [
    "If I don't do this flawlessly, I will fail completely and lose respect.",
    "Everyone in the room is silently judging my performance.",
    "I'm overwhelmed right now, which means I can't handle this challenge.",
    "I made a small mistake, so the whole project is completely ruined."
  ];

  const quickCounterEvidenceSuggestions = [
    "My feelings are perceptions, not verified objective facts.",
    "I have successfully handled similar complex challenges before.",
    "A single mistake or delay does not define my competence or worth.",
    "Objective feedback has consistently shown that my efforts are valued."
  ];

  const quickReframeSuggestions: Record<string, string[]> = {
    'Catastrophizing': [
      "Even if challenges arise, I have the capability and tools to manage them step by step.",
      "The worst-case scenario is unlikely. The realistic outcome is manageable with steady effort."
    ],
    'All-or-Nothing': [
      "Iteration is a natural part of growth. Partial progress is still genuine success.",
      "I choose self-compassion over perfectionism. Doing my best is more than enough."
    ],
    'Mind Reading': [
      "I cannot know what others think unless they communicate it. Most people are focused on themselves.",
      "I will base my conclusions on observable facts and direct communication, not assumptions."
    ],
    'Emotional Reasoning': [
      "Feeling anxious does not mean danger is present. My feelings are valid, but they are not facts.",
      "I can feel temporary discomfort while remaining capable and grounded in reality."
    ],
    'Overgeneralization': [
      "One isolated setback does not dictate future outcomes. Every moment is a fresh opportunity.",
      "This is a specific situation, not an eternal pattern. I continue to learn and adapt."
    ],
    'Should Statements': [
      "I replace rigid 'shoulds' with flexible preferences. I treat myself with kindness and realistic goals.",
      "I accept where things are today and move forward with curiosity rather than self-criticism."
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

  const handleStepAdvance = (nextStep: 1 | 2 | 3) => {
    audioEngine.playSfx('tactile_tap');
    setStep(nextStep);
    if (voiceEnabledRef.current) {
      if (nextStep === 2) {
        audioEngine.speak('Step 2: Weigh the objective factual evidence for and against this automatic thought.');
      } else if (nextStep === 3) {
        audioEngine.speak('Step 3: Synthesize a balanced, compassionate cognitive reframe.');
      }
    }
  };

  const handleFinish = () => {
    let reframeText = thoughtData.balancedReframe.trim();
    if (!reframeText) {
      const suggestions = quickReframeSuggestions[thoughtData.distortion] || quickReframeSuggestions['Catastrophizing'];
      reframeText = suggestions[0] || "I choose to view this situation with objective clarity, grounded perspective, and self-compassion.";
    }
    const finalData = { ...thoughtData, balancedReframe: reframeText };
    setThoughtData(finalData);
    audioEngine.playSfx('celebration_chords');
    if (voiceEnabledRef.current) {
      audioEngine.speak('Cognitive distortion successfully reframed and neutralized. Your perspective is balanced and clear.');
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
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────────
          1. MAIN INTERACTIVE CBT THOUGHT CHALLENGER CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden p-5 sm:p-7 select-none">
        {/* Soft Ambient Floating Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  CBT Thought Challenger
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/70 dark:border-purple-800">
                  ACT-10 • Cognitive Restructuring
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Toggle Voice Guidance"
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer shadow-xs"
              title="Reset Activity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isCompleted ? (
          <div className="space-y-6 relative z-10">
            {/* 3-Step Progress Timeline Bar */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <button
                onClick={() => setStep(1)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  step === 1
                    ? 'bg-[#5e2be2] text-white shadow-sm'
                    : step > 1
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {step > 1 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-black" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">1</span>
                )}
                <span className="truncate">1. Capture Thought</span>
              </button>

              <button
                onClick={() => {
                  if (thoughtData.automaticThought.trim()) setStep(2);
                }}
                disabled={!thoughtData.automaticThought.trim()}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  step === 2
                    ? 'bg-[#5e2be2] text-white shadow-sm'
                    : step > 2
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5e2be2] dark:text-purple-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 disabled:opacity-40 cursor-pointer'
                }`}
              >
                {step > 2 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-black" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">2</span>
                )}
                <span className="truncate">2. Weigh Evidence</span>
              </button>

              <button
                onClick={() => {
                  if (thoughtData.automaticThought.trim()) setStep(3);
                }}
                disabled={!thoughtData.automaticThought.trim()}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  step === 3
                    ? 'bg-[#5e2be2] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 disabled:opacity-40 cursor-pointer'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">3</span>
                <span className="truncate">3. Reframe Perspective</span>
              </button>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                STEP 1: CAPTURE INTRUSIVE THOUGHT & IDENTIFY DISTORTION
               ───────────────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Thought Input Box */}
                <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      1. What automatic thought is creating distress?
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Type or select a sample thought</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. If I don't get this project right on the first try, I will fail completely and lose respect..."
                    value={thoughtData.automaticThought}
                    onChange={(e) => setThoughtData({ ...thoughtData, automaticThought: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5e2be2] focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-950 font-medium leading-relaxed transition-all shadow-xs"
                  />

                  {/* Quick Prompts */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      ⚡ Quick 1-Click Example Prompts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickThoughtPrompts.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            audioEngine.playSfx('tactile_tap');
                            setThoughtData({ ...thoughtData, automaticThought: p });
                          }}
                          className="text-[11px] px-3 py-1.5 bg-white hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/50 text-slate-700 dark:text-slate-300 hover:text-[#5e2be2] dark:hover:text-purple-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left font-medium cursor-pointer shadow-xs"
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Belief Intensity Slider */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                        Initial Belief Conviction
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        How strongly do you believe this thought right now?
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-black">
                      {thoughtData.initialBelief}% Intensity
                    </div>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={thoughtData.initialBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, initialBelief: Number(e.target.value) })}
                    className="w-full accent-[#5e2be2] cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Slight Doubt (10%)</span>
                    <span>Moderate (50%)</span>
                    <span>Absolute Conviction (100%)</span>
                  </div>
                </div>

                {/* 3. Distortion Selector */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#5e2be2]" />
                      2. Identify the Thinking Trap (Cognitive Distortion):
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose the specific cognitive pattern that best matches this automatic thought.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {distortions.map((d) => {
                      const isSelected = thoughtData.distortion === d.name;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectDistortion(d.name)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative shadow-xs ${
                            isSelected
                              ? 'bg-purple-50/90 dark:bg-purple-950/70 border-[#5e2be2] dark:border-purple-500 ring-2 ring-[#5e2be2]/30'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span className="text-sm">{d.icon}</span>
                              <span>{d.name}</span>
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-[#5e2be2] text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {d.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {d.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Step Button */}
                <div className="flex justify-end pt-2">
                  <button
                    disabled={!thoughtData.automaticThought.trim()}
                    onClick={() => handleStepAdvance(2)}
                    className="px-6 py-3 bg-[#5e2be2] hover:bg-[#4f28d9] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Weigh Objective Evidence</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 2: WEIGH FACTUAL EVIDENCE (Side-by-Side Dual Analysis)
               ───────────────────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Active Thought Banner */}
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 flex items-center justify-between flex-wrap gap-3 shadow-xs">
                  <div className="space-y-0.5 flex-1 min-w-[220px]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#5e2be2] dark:text-purple-300 block">
                      Active Thought Under Investigation:
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      "{thoughtData.automaticThought}"
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold shadow-xs">
                    Pattern: {thoughtData.distortion}
                  </span>
                </div>

                {/* Evidence Balance Indicator */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Supporting Assumptions ({forLength} chars)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Objective Reality ({againstLength} chars)
                    </span>
                  </div>

                  {/* Dual Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-amber-400 transition-all duration-300"
                      style={{ width: `${100 - againstRatio}%` }}
                    />
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{ width: `${againstRatio}%` }}
                    />
                  </div>
                  <div className="text-center text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                    {againstLength > forLength
                      ? '🌿 Objective evidence outweighs emotional distortion.'
                      : '⚖️ Add verified facts on the right to balance your perspective.'}
                  </div>
                </div>

                {/* Side-by-Side Dual Textareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Evidence For */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Evidence Supporting Thought
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="What observable facts or immediate feelings seem to support this thought?..."
                      value={thoughtData.evidenceFor}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceFor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium leading-relaxed transition-all shadow-xs"
                    />
                    <p className="text-[10.5px] text-amber-700 dark:text-amber-400 leading-snug">
                      Notice: Are these objective external facts, or internal feelings treated as facts?
                    </p>
                  </div>

                  {/* Right Column: Counter-Evidence Against */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Objective Counter-Evidence
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="What facts, past successes, alternative explanations, or supportive evidence contradict it?..."
                      value={thoughtData.evidenceAgainst}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceAgainst: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium leading-relaxed transition-all shadow-xs"
                    />
                    <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 leading-snug">
                      Include verifiable facts, past resilience, and realistic alternative viewpoints.
                    </p>
                  </div>
                </div>

                {/* Quick Add Counter-Evidence Suggestion Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    💡 Therapeutic Counter-Evidence Prompts (Click to Add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
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
                        className="text-[11px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all text-left font-medium cursor-pointer shadow-xs"
                      >
                        + "{sug}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Thought
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepAdvance(3)}
                    className="px-6 py-3 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Synthesize Balanced Reframe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 3: SYNTHESIZE GROUNDED REFRAME
               ───────────────────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                {/* Before vs Reframe Comparison Top Card */}
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                    Original Automatic Thought (Distorted):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-through opacity-80 leading-relaxed font-medium">
                    "{thoughtData.automaticThought}"
                  </p>
                </div>

                {/* Grounded Reframe Builder */}
                <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Synthesize Grounded Neural Reframe:
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Type or pick a suggestion</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write a realistic, compassionate replacement thought that acknowledges the facts..."
                    value={thoughtData.balancedReframe}
                    onChange={(e) => setThoughtData({ ...thoughtData, balancedReframe: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium leading-relaxed transition-all shadow-xs"
                  />

                  {/* 1-Click Suggestions tailored to selected distortion */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      💡 Recommended Reframes for {thoughtData.distortion}:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {(quickReframeSuggestions[thoughtData.distortion] || quickReframeSuggestions['Catastrophizing']).map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            audioEngine.playSfx('tactile_tap');
                            setThoughtData({ ...thoughtData, balancedReframe: sug });
                          }}
                          className="text-xs p-3 bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left font-medium cursor-pointer shadow-xs flex items-center justify-between gap-2"
                        >
                          <span>"{sug}"</span>
                          <span className="shrink-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                            Use This
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post-Reframe Belief Slider */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                        Belief in Original Thought Now
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        How strongly do you believe the original distortion after examining the evidence?
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                        Now: {thoughtData.finalBelief}%
                      </span>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                        ({beliefReduction}% reduction!)
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thoughtData.finalBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, finalBelief: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Complete Relief (0%)</span>
                    <span>Moderate (50%)</span>
                    <span>Still Strong (100%)</span>
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Evidence
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Lock In Grounded Reframe</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              COMPLETION STATE: COGNITIVE NEUTRALIZATION & SUMMARY
             ───────────────────────────────────────────────────────────── */
          <div className="py-6 text-center space-y-5 relative z-10 max-w-xl mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 p-1 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Cognitive Distortion Neutralized
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Belief intensity dropped by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{beliefReduction}%</strong> through objective cognitive restructuring.
              </p>
            </div>

            {/* Before vs After Comparison Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {/* Before */}
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  ❌ Automatic Distortion:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-through opacity-80 leading-relaxed font-medium">
                  "{thoughtData.automaticThought}"
                </p>
              </div>

              {/* After */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  ✨ Grounded Neural Reframe:
                </span>
                <p className="text-xs text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
                  "{thoughtData.balancedReframe}"
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Initial Belief</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">{thoughtData.initialBelief}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Reframed Belief</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{thoughtData.finalBelief}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cognitive Relief</span>
                <span className="text-sm font-black text-[#5e2be2] dark:text-purple-300">+{beliefReduction}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Challenge Another Thought
              </button>
              <button
                onClick={() => {
                  if (onComplete) onComplete(thoughtData);
                }}
                className="flex-1 py-3 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EDUCATIONAL & CLINICAL DEEP-DIVE SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8">
        {/* Section 1: Overview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#5e2be2] dark:text-purple-300">
            <Sparkles className="w-4 h-4" /> Evidence-Based Methodology
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            What is CBT Thought Challenging?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            CBT Thought Challenging (Cognitive Restructuring) is the gold-standard therapeutic intervention founded on Aaron Beck's Cognitive Model. When faced with stress, uncertainty, or emotional triggers, the brain often defaults to automated, rigid negative thoughts. By intentionally identifying the underlying distortion, evaluating verified objective evidence, and generating an adaptive neural reframe, you de-escalate amygdala reactivity and build long-term emotional resilience.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>How It Works: The 3-Step Neural Restructuring Model</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              A systematic protocol to intercept intrusive distortions and replace them with grounded clarity:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Capture Thought & Pattern
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Write down the unfiltered intrusive sentence and pinpoint which cognitive trap (e.g. Catastrophizing, All-or-Nothing) is skewing your perception.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Weigh Objective Evidence
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Act as an objective investigator. Separate verifiable facts from emotional assumptions, balancing what seems true with concrete counter-evidence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Synthesize Grounded Reframe
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Formulate a compassionate, realistic replacement belief that aligns with objective reality, relieving distress and reinforcing adaptive neuroplastic pathways.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Benefits */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>Clinical Benefits & Neuroplasticity</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Documented psychological and physiological outcomes of regular cognitive reframing:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rewires Neural Pathways</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Strengthens prefrontal cortex control over the amygdala, reducing involuntary stress responses and catastrophic looping.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fosters Psychological Agility</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
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
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 text-slate-800 dark:text-white shadow-xl shadow-amber-500/5 border border-amber-100/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-100/50 dark:bg-amber-950/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-100/40 dark:bg-purple-950/20 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200">
          Cognitive Worry Vault
        </span>
      </div>

      {!isLocked ? (
        <div className="max-w-md mx-auto space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> What worry is consuming your cognitive bandwidth?
            </label>
            <textarea
              rows={4}
              placeholder="Deposit your raw thought or fear into the vault to mentally disengage..."
              value={worryText}
              onChange={(e) => setWorryText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-amber-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Scheduled Review Time:
              </label>
              <input
                type="text"
                value={worryTime}
                onChange={(e) => setWorryTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Container Status:</label>
              <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-[#5e2be2] font-black">
                {vaultPulse ? 'ENCRYPTING...' : 'AWAITING LOCK'}
              </div>
            </div>
          </div>

          <button
            disabled={!worryText.trim()}
            onClick={handleDeposit}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer mt-2"
          >
            <Lock className="w-4 h-4" /> Lock & Seal in Worry Vault
          </button>
        </div>
      ) : (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fade-in relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-200 p-1 mx-auto shadow-xl shadow-amber-500/10 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center text-amber-600">
              <Lock className="w-12 h-12 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Worry Safely Quarantined</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-medium">
              Your concern is secured. You have permission to live in the present until your scheduled worry window at <strong className="text-amber-700 font-bold">{worryTime}</strong>.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
          >
            Deposit Another Thought
          </button>
        </div>
      )}
    </div>
  );
}

export default MoodLiftCbtPlayer;
