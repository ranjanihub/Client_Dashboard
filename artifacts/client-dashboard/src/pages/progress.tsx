import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, PageHeader } from '@/components/shared';
import { 
  Activity, 
  BarChart2, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  Flame, 
  Calendar, 
  Award,
  ArrowDownRight,
  ShieldCheck,
  TrendingUp,
  Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function ProgressPage() {
  // Data matching the Consultant Panel progress charts
  const whoWellbeingData = [
    { milestone: "S0 Base", score: 32 },
    { milestone: "Session 3", score: 50 },
    { milestone: "Session 6", score: 64 },
    { milestone: "Session 9", score: 75 },
    { milestone: "Session 12", score: 84 },
  ];

  const pssStressData = [
    { milestone: "S0 Base", score: 28 },
    { milestone: "Session 3", score: 22 },
    { milestone: "Session 6", score: 16 },
    { milestone: "Session 9", score: 11 },
    { milestone: "Session 12", score: 8 },
  ];

  const personalizedData = [
    { milestone: "S0 Base", score: 18 },
    { milestone: "Session 3", score: 14 },
    { milestone: "Session 6", score: 9 },
    { milestone: "Session 9", score: 7 },
    { milestone: "Session 12", score: 6 },
  ];

  const activityCompletionData = [
    { day: "Mon", count: 3 },
    { day: "Tue", count: 4 },
    { day: "Wed", count: 2 },
    { day: "Thu", count: 5 },
    { day: "Fri", count: 4 },
    { day: "Sat", count: 3 },
    { day: "Sun", count: 4 },
  ];

  const activeGoals = [
    { id: 1, title: "Mindfulness & Grounding Practice", current: 9, total: 10, progress: 90, color: "bg-emerald-500" },
    { id: 2, title: "Sleep Hygiene & Evening Routine Adherence", current: 7, total: 8, progress: 87.5, color: "bg-blue-500" },
    { id: 3, title: "Cognitive Restructuring Thought Records", current: 8, total: 10, progress: 80, color: "bg-purple-500" },
    { id: 4, title: "Workplace Assertiveness Exercises", current: 6, total: 10, progress: 60, color: "bg-amber-500" },
  ];

  return (
    <motion.div {...pageTransition} className="w-full space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader 
        title="Progress Insights" 
        description="View clinical outcome metrics, wellbeing trends, stress reduction, and goal milestones."
        badge="CLINICAL OUTCOMES"
        icon={<Activity className="w-4 h-4 text-purple-200" />}
      />

      {/* ── 3-SESSION MILESTONE CLINICAL OUTCOME GRAPHS SECTION (Exact Consultant Panel Match) ── */}
      <div className="hex-card !p-6 md:!p-8 space-y-6 shadow-sm border border-border">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-foreground">Clinical Outcome</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Outcome assessments performed by Sarah Jenkins after therapy sessions
              </p>
            </div>
          </div>
          <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
            Evaluation Cycle
          </span>
        </div>

        {/* 3 Side-by-Side Graph Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Graph 1: Overall Wellbeing */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 via-background to-background space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground">Overall Wellbeing</h4>
              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <span className="text-3xl font-black text-foreground font-mono">
                  84 <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Base Score: <strong className="text-foreground font-bold">32/100</strong>
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={whoWellbeingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="whoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={5} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '14px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} / 100`, 'Wellbeing Index']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#whoGradient)" 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Category: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Wellbeing</strong></span>
              <span className="text-muted-foreground/70">3-Session Intervals</span>
            </div>
          </div>

          {/* Graph 2: General Stress */}
          <div className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 via-background to-background space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground">General Stress</h4>
              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <span className="text-3xl font-black text-foreground font-mono">
                  8 <span className="text-xs text-muted-foreground font-normal">/ 40</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Base Score: <strong className="text-foreground font-bold">28/40</strong>
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pssStressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pssGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={5} />
                  <YAxis domain={[0, 40]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '14px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} pts`, 'Perceived Stress']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#pssGradient)" 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Category: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">Stress</strong></span>
              <span className="text-muted-foreground/70">3-Session Intervals</span>
            </div>
          </div>

          {/* Graph 3: Personalized */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground">Personalized</h4>
              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <span className="text-3xl font-black text-foreground font-mono">
                  6 <span className="text-xs text-muted-foreground font-normal">/ 21</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Base Score: <strong className="text-foreground font-bold">18/21</strong>
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={personalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="personalizedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5e2be2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5e2be2" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={5} />
                  <YAxis domain={[0, 21]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '14px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} / 21`, 'Anxiety (GAD-7)']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#5e2be2" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#personalizedGradient)" 
                    dot={{ r: 4, fill: '#5e2be2', strokeWidth: 2, stroke: '#fff' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Category: <strong className="text-primary font-extrabold">Anxiety (GAD-7)</strong></span>
              <span className="text-muted-foreground/70">Session 12 Outcome</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── ADDITIONAL PROGRESS DETAILS (Weekly Exercises & Treatment Objectives) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Active Treatment Objectives */}
        <div className="lg:col-span-2 hex-card !p-6 md:!p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Current Treatment Objectives</h3>
              <p className="text-xs text-muted-foreground">Active milestones set with Dr. Sarah Jenkins</p>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              Session 12 / 15 Milestone
            </span>
          </div>

          <div className="space-y-6">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-foreground">{goal.title}</span>
                  <span className="text-primary font-mono">{goal.current} / {goal.total} ({goal.progress}%)</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                  <div 
                    className={`h-full ${goal.color} rounded-full transition-all duration-500`} 
                    style={{ width: `${goal.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Weekly Exercise Bar Chart */}
        <div className="hex-card !p-6 space-y-6 flex flex-col justify-between">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-foreground">Weekly Exercises</h3>
            </div>
            <p className="text-xs text-muted-foreground">Daily activity completion rate</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '12px', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" name="Completed Exercises" fill="#10b981" radius={[8, 8, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span className="font-semibold">25 Exercises finished this week</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}


