import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetDashboard } from '@workspace/api-client-react';
import { pageTransition, safeFormatDate } from '@/components/shared';
import {
  Video, Users, FileText, Clock, Calendar, CheckCircle2,
  PlayCircle, Activity as ActivityIcon, BookOpen, ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Dashboard() {
  const { data: apiData, isLoading } = useGetDashboard();
  const [scheduleTab, setScheduleTab] = useState<'today' | 'week' | 'month'>('today');

  const mockDashboardData = {
    clientName: "Alex Morgan",
    activitiesCompleted: 14,
    currentStreak: 7,
    goalsAchieved: 5,
    upcomingSession: {
      id: 1,
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      durationMinutes: 50,
      therapistName: "Dr. Sarah Jenkins",
      therapistAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
      joinUrl: "https://meet.google.com",
      notes: null,
      status: "upcoming"
    },
    todayTasks: [
      {
        id: 1,
        title: "Morning Mindfulness Meditation",
        category: "Mindfulness",
        description: "10-minute guided breathing session",
        dueDate: "Today",
        estimatedMinutes: 10,
        completionPercent: 0,
        difficulty: "Easy",
        status: "pending",
        reflection: null,
        completedAt: null
      },
      {
        id: 2,
        title: "CBT Thought Record Entry",
        category: "Cognitive Behavioral",
        description: "Document recent anxiety trigger and cognitive reframing",
        dueDate: "Today",
        estimatedMinutes: 15,
        completionPercent: 50,
        difficulty: "Medium",
        status: "pending",
        reflection: null,
        completedAt: null
      },
      {
        id: 3,
        title: "Evening Gratitude Journaling",
        category: "Reflection",
        description: "Write down 3 things you felt grateful for today",
        dueDate: "Today",
        estimatedMinutes: 8,
        completionPercent: 0,
        difficulty: "Easy",
        status: "pending",
        reflection: null,
        completedAt: null
      }
    ],
    recentMessage: {
      id: 1,
      type: "text",
      senderId: 2,
      senderName: "Dr. Sarah Jenkins",
      senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
      content: "Great progress on your thought records this week, Alex! Looking forward to discussing your insights in our session on Thursday.",
      sentAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      isRead: false
    },
    sharedResources: [
      {
        id: 1,
        title: "Understanding Panic & Somatic Grounding Techniques",
        category: "Guide",
        description: "Practical steps to de-escalate acute anxiety symptoms",
        thumbnailUrl: "",
        readingMinutes: 5,
        author: "Dr. Sarah Jenkins",
        isSaved: true,
        isSharedByTherapist: true,
        downloadUrl: "#"
      },
      {
        id: 2,
        title: "Cognitive Distortions Reference Sheet",
        category: "Worksheet",
        description: "Identify and label 10 common unhelpful thinking patterns",
        thumbnailUrl: "",
        readingMinutes: 7,
        author: "Hexpertify Clinical Team",
        isSaved: false,
        isSharedByTherapist: true,
        downloadUrl: "#"
      }
    ]
  };

  const today = new Date();
  const dayLabel = format(today, 'EEEE, MMMM d');
  const weekNum = getWeekNumber(today);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-56 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const isRealData = apiData && typeof apiData === 'object' && Array.isArray((apiData as any).todayTasks);
  const data = isRealData ? apiData : mockDashboardData;

  const clientName = data?.clientName || mockDashboardData.clientName;
  const activitiesCompleted = data?.activitiesCompleted ?? mockDashboardData.activitiesCompleted;
  const currentStreak = data?.currentStreak ?? mockDashboardData.currentStreak;
  const goalsAchieved = data?.goalsAchieved ?? mockDashboardData.goalsAchieved;
  const upcomingSession = data?.upcomingSession || mockDashboardData.upcomingSession;
  const todayTasks = Array.isArray(data?.todayTasks) ? data.todayTasks : mockDashboardData.todayTasks;
  const recentMessage = data?.recentMessage || mockDashboardData.recentMessage;
  const sharedResources = Array.isArray(data?.sharedResources) ? data.sharedResources : mockDashboardData.sharedResources;

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Activities Done',
      value: activitiesCompleted,
      sub: 'Completed total',
      delta: '+2',
      plus: true,
      iconColor: 'text-blue-500',
    },
    {
      icon: Users,
      label: 'Day Streak',
      value: `${currentStreak}d`,
      sub: 'Keep it going!',
      delta: '+3',
      plus: true,
      iconColor: 'text-violet-500',
    },
    {
      icon: Clock,
      label: 'Upcoming',
      value: upcomingSession ? 1 : 0,
      sub: 'Session scheduled',
      delta: '+1',
      plus: true,
      iconColor: 'text-teal-500',
    },
  ];

  return (
    <motion.div {...pageTransition} className="space-y-5 pb-12">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#4f28d9] via-[#5e2be2] to-[#3b1799] p-5 md:p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium backdrop-blur-sm border border-white/10">
              {dayLabel}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {clientName}
              </h1>
              <p className="text-primary-foreground/80 text-xs sm:text-sm max-w-lg">
                Your wellness journey continues &middot; {activitiesCompleted} activities completed so far.
              </p>
            </div>
          </div>

          {upcomingSession && (
            <div className="w-full lg:w-[320px] shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-bold tracking-wider text-primary-foreground/70 uppercase">
                  NEXT SESSION
                </h3>
                <div className="whitespace-nowrap inline-flex items-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover-elevate bg-green-500/20 text-green-300 hover:bg-green-500/20 border-green-500/30 text-[10px] px-2 py-0.5">
                  <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                  {safeFormatDate(upcomingSession.scheduledAt, 'MMM d')}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9 border border-white/20">
                  {upcomingSession.therapistAvatarUrl ? (
                    <img
                      src={upcomingSession.therapistAvatarUrl}
                      alt={upcomingSession.therapistName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold">
                      {initials(upcomingSession.therapistName)}
                    </span>
                  )}
                </span>
                <div>
                  <h4 className="font-bold text-sm leading-none mb-1">
                    {upcomingSession.therapistName}
                  </h4>
                  <p className="text-xs text-primary-foreground/80">
                    CBT &middot; {upcomingSession.durationMinutes} min
                  </p>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg px-3 py-2 mb-3 flex items-center justify-between text-xs">
                <div className="font-medium">
                  {safeFormatDate(upcomingSession.scheduledAt, 'h:mm a')}
                </div>
                <div className="text-primary-foreground/70">Session #12</div>
              </div>

              {upcomingSession.joinUrl ? (
                <a
                  href={upcomingSession.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors border border-primary-border min-h-9 px-4 py-2 w-full rounded-full bg-white text-primary hover:bg-white/90 font-bold h-9 text-xs cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Join session
                </a>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-white/20 min-h-9 px-4 py-2 w-full rounded-full bg-white/20 text-white font-bold h-9 text-xs opacity-75">
                  <Video className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Scheduled
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="hex-card flex flex-col">
            {/* Icon row + delta badge */}
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={1.75} />
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  stat.plus
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {stat.delta}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-[2rem] font-bold text-foreground leading-none mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom split ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today's schedule (2/3) */}
        <div className="lg:col-span-2 hex-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-foreground">Today's Focus</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {todayTasks.length} tasks &middot; Stay consistent
              </p>
            </div>
            {/* Tab switcher */}
            <div className="flex items-center gap-0.5 p-1 bg-muted rounded-lg">
              {(['Today', 'Week', 'Month'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setScheduleTab(tab.toLowerCase() as 'today' | 'week' | 'month')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    scheduleTab === tab.toLowerCase()
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 6).map(task => (
                <Link key={task.id} href="/activities" className="block">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.estimatedMinutes} min &middot; {task.difficulty}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-muted group-hover:bg-primary text-muted-foreground group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-semibold text-sm">All done for today!</p>
                <p className="text-xs text-muted-foreground mt-0.5">You've completed all tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent messages / pending panel (1/3) */}
        <div className="hex-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-foreground">Messages</h2>
              {recentMessage && (
                <p className="text-xs text-muted-foreground mt-0.5">1 unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[11px] font-semibold">
                <AlertCircle className="w-3 h-3" />
                Unread
              </span>
              <Link href="/messages" className="text-xs font-semibold text-primary hover:underline">
                Open
              </Link>
            </div>
          </div>

          {recentMessage ? (
            <Link href="/messages" className="block flex-1">
              <div className="space-y-3 cursor-pointer group">
                <div className="flex items-center gap-3">
                  {recentMessage.senderAvatarUrl ? (
                    <img
                      src={recentMessage.senderAvatarUrl}
                      className="w-9 h-9 rounded-full shrink-0"
                      alt=""
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {initials(recentMessage.senderName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {recentMessage.senderName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(recentMessage.sentAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                  {recentMessage.content}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No recent messages</p>
            </div>
          )}

          {/* Shared resources teaser */}
          {sharedResources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground">Recommended</p>
                <Link href="/resources" className="text-[11px] text-primary font-medium hover:underline flex items-center gap-0.5">
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {sharedResources.slice(0, 2).map(r => (
                  <div key={r.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-foreground line-clamp-1 font-medium">{r.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
