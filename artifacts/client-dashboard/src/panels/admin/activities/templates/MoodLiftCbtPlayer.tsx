import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Lock,
  Archive,
  Clock,
  Scale,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX
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
   ACT-10: CBT NEURAL RE-WIRE MATRIX (Synaptic Distortion Breaker)
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const distortions = [
    { name: 'Catastrophizing', desc: 'Predicting extreme worst-case scenarios without factual basis', badge: 'HIGH ANXIETY', icon: '⚡' },
    { name: 'All-or-Nothing', desc: 'Viewing performance as absolute perfection or total failure', badge: 'PERFECTIONISM', icon: '🎯' },
    { name: 'Mind Reading', desc: 'Assuming you know what other people are negatively thinking', badge: 'SOCIAL FEAR', icon: '👥' },
    { name: 'Emotional Reasoning', desc: 'Assuming subjective feelings equal objective factual reality', badge: 'BIAS', icon: '🧠' },
    { name: 'Overgeneralization', desc: 'Extrapolating a single unpleasant event into an eternal rule', badge: 'HELPLESSNESS', icon: '📉' },
    { name: 'Should Statements', desc: 'Imposing rigid, punitive rules upon yourself or others', badge: 'SELF-CRITICISM', icon: '⚖️' }
  ];

  const quickThoughtPrompts = [
    "If I don't do this flawlessly, I will fail completely and lose respect.",
    "Everyone in the room is silently judging my performance.",
    "I'm overwhelmed right now, which means I can't handle this challenge.",
    "I made a small mistake, so the whole project is completely ruined."
  ];

  const quickCounterEvidenceSuggestions = [
    "My emotions and anxieties are perceptions, not verified factual reality.",
    "I have handled similar complex challenges successfully in the past.",
    "A single mistake or delay does not define my overall competence or value.",
    "Objective feedback has consistently shown that people appreciate my work."
  ];

  const quickReframeSuggestions: Record<string, string[]> = {
    'Catastrophizing': [
      "Even if challenges arise, I have the capability and resources to handle them step by step.",
      "The worst-case scenario is unlikely. The realistic outcome is manageable with steady effort."
    ],
    'All-or-Nothing': [
      "Iteration is a natural part of mastery. Partial progress is still genuine success.",
      "I choose self-compassion over perfectionism. Doing my best is more than enough."
    ],
    'Mind Reading': [
      "I cannot know what others think unless they tell me. Most people are focused on their own tasks.",
      "I will base my conclusions on observable actions and facts, not assumed judgments."
    ],
    'Emotional Reasoning': [
      "Feeling anxious does not mean danger is present. My feelings are valid, but they are not facts.",
      "I can feel temporary discomfort while remaining capable and grounded in reality."
    ],
    'Overgeneralization': [
      "One isolated setback does not dictate future outcomes. Every moment is a fresh opportunity.",
      "This is a specific situation, not an eternal pattern. I am constantly growing."
    ],
    'Should Statements': [
      "I replace rigid 'shoulds' with flexible preferences. I do what is reasonable and kind to myself.",
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

  // Neural Synapse Network Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 110);

    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
    for (let i = 0; i < 24; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 2,
        color: i % 3 === 0 ? '#5e2be2' : i % 3 === 1 ? '#06b6d4' : '#a855f7'
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Synaptic Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            ctx.strokeStyle = `rgba(94, 43, 226, ${(1 - dist / 85) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

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
        audioEngine.speak('Step 3: Synthesize a balanced, compassionate neural reframe.');
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
  // Calculate dynamic scale tilt based on evidence counter-balance
  const scaleTilt = againstLength > 0 ? Math.min(16, Math.max(-16, (againstLength - forLength) / 6)) : (forLength > 0 ? -10 : 0);
  const beliefReduction = Math.max(0, thoughtData.initialBelief - thoughtData.finalBelief);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────────
          1. MAIN INTERACTIVE CBT THOUGHT CHALLENGER STAGE
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden p-4 sm:p-6 sm:px-8 select-none">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 blur-3xl pointer-events-none" />

        {/* Top Header Bar (Step Indicator + Voice Toggle + Reset) */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5e2be2] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/80 dark:border-purple-800">
              CBT Thought Challenger • Step {step} of 3
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer flex items-center gap-1.5"
              title="Toggle Voice Guidance"
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5e2be2]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{voiceEnabled ? 'Voice On' : 'Muted'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer"
              title="Reset Activity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isCompleted ? (
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            {/* Neural Synapse Network Banner */}
            <div className="relative w-full h-20 sm:h-24 rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-cyan-50/60 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />
              <div className="relative z-10 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-800 text-xs font-bold text-[#5e2be2] dark:text-purple-300 backdrop-blur-md flex items-center gap-2 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>
                  {step === 1
                    ? 'Step 1: Capture Automatic Thought & Distortion'
                    : step === 2
                    ? 'Step 2: Neural Evidence Equilibrium Scales'
                    : 'Step 3: Synthesize Balanced Reframe'}
                </span>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                STEP 1: CAPTURE THOUGHT & DISTORTION
               ───────────────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* 1. Thought Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      1. Identify the Automatic Intrusive Thought:
                    </label>
                    <span className="text-[10.5px] text-slate-400 font-medium">Type or select a prompt</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. If I don't get this project right on the first try, I will fail completely and lose respect."
                    value={thoughtData.automaticThought}
                    onChange={(e) => setThoughtData({ ...thoughtData, automaticThought: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5e2be2] focus:bg-white dark:focus:bg-slate-800 transition-all font-medium leading-relaxed"
                  />

                  {/* Quick Example Prompt Pills */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ⚡ Quick Example Prompts (Click to Fill):
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
                          className="text-[10.5px] px-2.5 py-1 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 rounded-lg border border-purple-200/60 dark:border-purple-800 transition-all text-left font-medium cursor-pointer truncate max-w-full"
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Initial Belief Slider */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      How strongly do you believe this thought right now?
                    </span>
                    <span className="text-xs font-black text-[#5e2be2] dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                      {thoughtData.initialBelief}% Intensity
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={thoughtData.initialBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, initialBelief: Number(e.target.value) })}
                    className="w-full accent-[#5e2be2] cursor-pointer"
                  />
                </div>

                {/* 3. Distortion Pattern Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5e2be2]" />
                    2. Select the Primary Cognitive Distortion Pattern:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {distortions.map((d) => (
                      <button
                        key={d.name}
                        onClick={() => handleSelectDistortion(d.name)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          thoughtData.distortion === d.name
                            ? 'bg-purple-50/90 dark:bg-purple-950/70 border-[#5e2be2] dark:border-purple-500 shadow-sm ring-2 ring-[#5e2be2]/30'
                            : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-[#5e2be2]/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{d.icon}</span> {d.name}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300">
                            {d.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {d.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Step Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    disabled={!thoughtData.automaticThought.trim()}
                    onClick={() => handleStepAdvance(2)}
                    className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Weigh Neural Evidence</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 2: EVIDENCE WEIGHING SCALES
               ───────────────────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Tested Thought Summary */}
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800 text-xs flex items-center justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Tested Thought: </span>
                    <span className="font-bold text-slate-900 dark:text-white">"{thoughtData.automaticThought}"</span>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-[#5e2be2] dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    Pattern: {thoughtData.distortion}
                  </span>
                </div>

                {/* Dynamic Tilt Scale Graphic */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
                  <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase mb-3">
                    <Scale className="w-4 h-4 text-[#5e2be2]" /> Evidence Equilibrium Beam
                  </div>
                  <div
                    className="w-52 h-2.5 bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-500 rounded-full mx-auto transition-transform duration-500 shadow-sm"
                    style={{ transform: `rotate(${-scaleTilt}deg)` }}
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-2.5 max-w-sm mx-auto">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Distortion Weight: {forLength} pts</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Objective Reality: {againstLength} pts</span>
                  </div>
                </div>

                {/* Evidence Input Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Evidence For */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Evidence Supporting Thought:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="List observable facts that seem to support it..."
                      value={thoughtData.evidenceFor}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceFor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
                    />
                  </div>

                  {/* Counter-Evidence Against */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Counter-Evidence Against Thought:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="List past successes, objective facts, alternative outcomes..."
                      value={thoughtData.evidenceAgainst}
                      onChange={(e) => setThoughtData({ ...thoughtData, evidenceAgainst: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Counter-Evidence Suggestions Helper */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    💡 Helpful Counter-Evidence Prompts (Click to Add):
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
                        className="text-[10.5px] px-2.5 py-1 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200/80 dark:border-emerald-800 transition-all text-left font-medium cursor-pointer"
                      >
                        + "{sug}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleStepAdvance(3)}
                    className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Crystallize Reframe</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 3: SYNTHESIZE BALANCED REFRAME
               ───────────────────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Synthesize Grounded Neural Reframe:
                    </label>
                    <span className="text-[10.5px] text-slate-400 font-bold">Type or pick a suggestion</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. Iteration is a natural part of mastery. A single mistake does not diminish my competence or value, and I have proven capability."
                    value={thoughtData.balancedReframe}
                    onChange={(e) => setThoughtData({ ...thoughtData, balancedReframe: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium leading-relaxed"
                  />
                </div>

                {/* 1-Click Quick Reframe Suggestions for Selected Distortion */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    💡 Suggested Reframes for {thoughtData.distortion}:
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
                        className="text-xs p-2.5 px-3 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all text-left font-medium cursor-pointer"
                      >
                        "{sug}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post-Reframe Belief Intensity Slider */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Belief in Original Thought Now:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Now: {thoughtData.finalBelief}%
                      </span>
                      <span className="text-[10.5px] font-bold text-purple-600 dark:text-purple-300">
                        (Down from {thoughtData.initialBelief}%)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thoughtData.finalBelief}
                    onChange={(e) => setThoughtData({ ...thoughtData, finalBelief: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Step Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Lock Reframe into Memory</span> <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              COMPLETION STATE: COGNITIVE NEUTRALIZATION & SUMMARY
             ───────────────────────────────────────────────────────────── */
          <div className="py-6 text-center space-y-4 relative z-10 max-w-lg mx-auto animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 p-1 mx-auto flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Cognitive Distortion Neutralized
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Belief intensity reduced by <strong className="text-emerald-600 font-bold">{beliefReduction}%</strong> through objective cognitive restructuring.
              </p>
            </div>

            {/* Before vs After Comparison Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Before */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  ❌ Original Distorted Thought:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-through opacity-80 leading-relaxed font-medium">
                  "{thoughtData.automaticThought}"
                </p>
              </div>

              {/* After */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 shadow-2xs">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  ✨ Grounded Neural Reframe:
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-100 font-bold leading-relaxed">
                  "{thoughtData.balancedReframe}"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Process Another Thought
              </button>
              <button
                onClick={() => {
                  if (onComplete) onComplete(thoughtData);
                }}
                className="flex-1 py-2 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EDUCATIONAL DESCRIPTION CARD: What is CBT Thought Challenging?
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-purple-500/5 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8">
        {/* Section 1: Overview */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            What is CBT Thought Challenging?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-justify">
            CBT Thought Challenging (Cognitive Restructuring) is an evidence-based psychological intervention founded on Beck's Cognitive Model. When faced with stressful situations, our brain often produces automatic, negative thoughts driven by cognitive distortions. By systematically identifying these patterns, weighing observable evidence on both sides, and constructing a balanced reframe, you de-escalate anxiety and strengthen resilient neural pathways.
          </p>
        </div>

        {/* Section 2: How It Works */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>How It Works: 3-Step Neural Restructuring</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              The 3-stage protocol to intercept and transform cognitive distortions into grounded clarity:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Capture Thought & Pattern
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Write down the unfiltered intrusive thought and identify which specific distortion pattern (e.g. Catastrophizing, All-or-Nothing) is influencing your judgment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Weigh Factual Evidence
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Act as an objective juror. Separate genuine observable facts from emotional assumptions, balancing evidence for and counter-evidence against the thought.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-[#5e2be2]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5e2be2] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Synthesize Balanced Reframe
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                Formulate a compassionate, realistic replacement belief that aligns with objective reality, reducing emotional distress and locking in new neuroplastic pathways.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5e2be2]" />
              <span>Clinical Benefits</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-justify">
              Scientifically documented cognitive, emotional, and neurobiological improvements:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rewires Neural Pathways</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Strengthens prefrontal cortex control over the amygdala, reducing hyperactive stress reactivity and catastrophic thinking loops.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 hover:border-[#5e2be2]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5e2be2] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Builds Emotional Agility</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  Develops psychological flexibility by recognizing that thoughts are subjective mental events rather than immutable objective truths.
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
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-6 text-slate-800 dark:text-white shadow-xl shadow-amber-500/5 border border-amber-100/80 dark:border-slate-800 relative overflow-hidden font-['Plus_Jakarta_Sans']">
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
