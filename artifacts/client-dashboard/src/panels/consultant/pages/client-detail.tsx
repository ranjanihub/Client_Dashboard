import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetClient,
  useGetClientAssessments,
  useGetClientMood,
  useGetClientHomework,
  useGetClientSessionHistory
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Clock, Calendar, Video, FileText, CheckCircle2, TrendingUp, TrendingDown,
  Activity, AlertCircle, FilePlus, Plus, HelpCircle, User, MessageSquare, Bell, Brain,
  Calculator, Send, Sparkles, ChevronDown, ChevronUp, ClipboardCheck, ArrowUpRight, Check,
  Target, RefreshCw, Eye, ShieldCheck, FileSpreadsheet, Scale, Layers, AlertTriangle, ArrowRight, Minus, Lock, Edit3,
  LineChart as LineChartIcon, Trophy, Flame, Heart, BarChart2, Gamepad2
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import { useOutcomeStore } from "@/lib/outcome-store";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetail() {
  const { id } = useParams<{ id?: string }>();
  const clientId = Number(id);
  const { toast } = useToast();
  const { outcomes, calculateOutcome: triggerOutcomeCalc } = useOutcomeStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [showFullIntakeSummary, setShowFullIntakeSummary] = useState(false);
  const [personalizedScale, setPersonalizedScale] = useState<string>(
    clientId === 2 ? "PHQ-9" : clientId === 3 ? "PCL-5" : "GAD-7"
  );

  // Personal Therapist Notes State
  const [personalNotesStore, setPersonalNotesStore] = useState<Record<number, string>>({
    1: "Prefers direct feedback on homework adherence. Responds well to 5-4-3-2-1 grounding exercises. Sensitive regarding supervisor feedback at work; approach cognitive restructuring topics gently.",
    2: "Reports fatigue in late afternoon sessions. High compliance with behavioral activation worksheets.",
    3: "EMDR preparation protocols proceeding smoothly. High motivation and homework completion.",
  });
  const [noteInputText, setNoteInputText] = useState<string>(
    personalNotesStore[clientId] || "Client responds well to structured CBT exercises and goal tracking. Note any private clinical observations here."
  );
  const [isNoteSavedFeedback, setIsNoteSavedFeedback] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // WHO-5 Well-being Index 3-Session Milestone Trends (0-100%)
  const WHO_WELLBEING_DATA: Record<number, { milestone: string; score: number }[]> = {
    1: [
      { milestone: "S0 Base", score: 32 },
      { milestone: "Session 3", score: 48 },
      { milestone: "Session 6", score: 62 },
      { milestone: "Session 9", score: 74 },
      { milestone: "Session 12", score: 84 },
    ],
    2: [
      { milestone: "S0 Base", score: 28 },
      { milestone: "Session 3", score: 40 },
      { milestone: "Session 6", score: 55 },
      { milestone: "Session 9", score: 68 },
    ],
    3: [
      { milestone: "S0 Base", score: 35 },
      { milestone: "Session 3", score: 50 },
      { milestone: "Session 6", score: 64 },
      { milestone: "Session 9", score: 72 },
      { milestone: "Session 12", score: 78 },
    ]
  };

  // PSS Perceived Stress Scale 3-Session Milestone Trends (0-40 pts)
  const PSS_STRESS_DATA: Record<number, { milestone: string; score: number }[]> = {
    1: [
      { milestone: "S0 Base", score: 28 },
      { milestone: "Session 3", score: 22 },
      { milestone: "Session 6", score: 16 },
      { milestone: "Session 9", score: 11 },
      { milestone: "Session 12", score: 8 },
    ],
    2: [
      { milestone: "S0 Base", score: 30 },
      { milestone: "Session 3", score: 24 },
      { milestone: "Session 6", score: 18 },
      { milestone: "Session 9", score: 14 },
    ],
    3: [
      { milestone: "S0 Base", score: 26 },
      { milestone: "Session 3", score: 20 },
      { milestone: "Session 6", score: 15 },
      { milestone: "Session 9", score: 12 },
      { milestone: "Session 12", score: 10 },
    ]
  };

  // Therapist Allocated Personalized Outcome Datasets (3-Session Milestones)
  const PERSONALIZED_INSTRUMENTS_DATA: Record<string, { maxScore: number; data: { milestone: string; score: number }[] }> = {
    "GAD-7": {
      maxScore: 21,
      data: [
        { milestone: "S0 Base", score: 18 },
        { milestone: "Session 3", score: 14 },
        { milestone: "Session 6", score: 9 },
        { milestone: "Session 9", score: 7 },
        { milestone: "Session 12", score: 6 },
      ]
    },
    "PHQ-9": {
      maxScore: 27,
      data: [
        { milestone: "S0 Base", score: 18 },
        { milestone: "Session 3", score: 14 },
        { milestone: "Session 6", score: 10 },
        { milestone: "Session 9", score: 8 },
        { milestone: "Session 12", score: 5 },
      ]
    },
    "PCL-5": {
      maxScore: 80,
      data: [
        { milestone: "S0 Base", score: 42 },
        { milestone: "Session 3", score: 35 },
        { milestone: "Session 6", score: 28 },
        { milestone: "Session 9", score: 25 },
        { milestone: "Session 12", score: 24 },
      ]
    },
    "PSQI": {
      maxScore: 21,
      data: [
        { milestone: "S0 Base", score: 16 },
        { milestone: "Session 3", score: 12 },
        { milestone: "Session 6", score: 8 },
        { milestone: "Session 9", score: 6 },
        { milestone: "Session 12", score: 4 },
      ]
    },
    "PDSS": {
      maxScore: 28,
      data: [
        { milestone: "S0 Base", score: 19 },
        { milestone: "Session 3", score: 14 },
        { milestone: "Session 6", score: 9 },
        { milestone: "Session 9", score: 6 },
        { milestone: "Session 12", score: 3 },
      ]
    }
  };

  const FULL_INTAKE_SUMMARIES: Record<number, {
    background: string;
    symptoms: string[];
    riskAssessment: string;
    treatmentPlan: string;
    clinicalObservations: string;
  }> = {
    1: {
      background: "Client (Sarah Jenkins, 34) presented for intake following a workplace promotion to Director. Reports a 6-month history of escalating Generalized Anxiety Disorder (GAD), characterized by persistent catastrophizing, sleep onset insomnia (sleeping 4-5 hours/night), and somatic tension in neck and shoulders.",
      symptoms: [
        "Escalating panic spikes prior to weekly executive leadership presentations.",
        "Perfectionistic thought patterns & fear of exposure/imposter syndrome.",
        "Restlessness, fatigue, and difficulty concentrating during sustained focus blocks."
      ],
      riskAssessment: "Low risk for self-harm or suicide. Safety protocol established and reviewed. Client has strong social support through spouse and family.",
      treatmentPlan: "Weekly Cognitive Behavioral Therapy (CBT). Protocol includes 10-step gradual exposure hierarchy for public speaking, daily 4-7-8 box breathing protocols, and thought record logs to challenge all-or-nothing cognitive distortions.",
      clinicalObservations: "Client exhibits exceptionally high clinical motivation, insightful self-reflection, and 95%+ compliance with assigned homework logs. Baseline GAD-7 of 18 has dropped to 6 (Mild/Remission)."
    },
    2: {
      background: "Client (Michael Chen, 36) presented with low mood, lethargy, and social withdrawal following a recent corporate restructuring. Meets diagnostic criteria for Mild Major Depressive Disorder.",
      symptoms: [
        "Persistent low mood and anhedonia (loss of interest in cycling and social events).",
        "Negative self-talk regarding career trajectory and financial security.",
        "Early morning awakenings with fatigue throughout the day."
      ],
      riskAssessment: "Low risk. Denies passive or active suicidal ideation. Contracted for safety.",
      treatmentPlan: "Acceptance and Commitment Therapy (ACT) combined with Behavioral Activation. Target: schedule 5 weekly activity blocks and complete values clarification exercises.",
      clinicalObservations: "Engaging well in sessions. Has successfully completed 4 consecutive weeks of activity tracking, leading to a 6-point reduction in PHQ-9 score."
    },
    3: {
      background: "Client (Emily Rodriguez, 29) initiated intake following a motor vehicle incident 8 months ago. Exhibits symptoms consistent with Post-Traumatic Stress Disorder (PTSD).",
      symptoms: [
        "Intrusive memories and heightened physiological reactivity when driving in heavy traffic.",
        "Hypervigilance and sleep disruption.",
        "Avoidance of highway routes and driving at night."
      ],
      riskAssessment: "Low risk. No self-harm history. Supported by partner.",
      treatmentPlan: "Dialectical Behavior Therapy (DBT) Distress Tolerance paired with gradual prolonged exposure for driving triggers.",
      clinicalObservations: "Demonstrating solid distress tolerance skills. PCL-5 score improved from baseline 42 down to 24 (below clinical cutoff)."
    }
  };

  // Dialog States for Outcomes & Assessments
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [itemDetailsScale, setItemDetailsScale] = useState<any | null>(null);

  // Dialog & Form states for Assign Activity
  const [assignActivityModalOpen, setAssignActivityModalOpen] = useState(false);
  const [activityTitle, setActivityTitle] = useState("Zen Breath & Focus Chamber");
  const [activityCategory, setActivityCategory] = useState("MINDFULNESS");
  const [activityInstructions, setActivityInstructions] = useState("Practice 5 minutes of mindful breath awareness & thought bubble popping before sleep.");
  const [activityFrequency, setActivityFrequency] = useState("Daily");
  const [activityDueDate, setActivityDueDate] = useState("2026-08-22");

  // Form states for Assign Assessment
  const [selectedAssignScale, setSelectedAssignScale] = useState("GAD-7");
  const [assignNote, setAssignNote] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("2026-08-15");

  // Form states for Calculate Outcome
  const [calcMilestone, setCalcMilestone] = useState("12");
  const [calcScale, setCalcScale] = useState("GAD-7");
  const [calcPrevScore, setCalcPrevScore] = useState("18");
  const [calcCurrScore, setCalcCurrScore] = useState("6");

  const { data: clientData, isLoading: clientLoading } = useGetClient(clientId, { query: { enabled: !!clientId, queryKey: ['client', clientId] } });
  const { data: assessmentsData, isLoading: assessmentsLoading } = useGetClientAssessments(clientId, { query: { enabled: !!clientId, queryKey: ['assessments', clientId] } });
  const { data: moodData, isLoading: moodLoading } = useGetClientMood(clientId, { query: { enabled: !!clientId, queryKey: ['mood', clientId] } });
  const { data: homeworkData, isLoading: homeworkLoading } = useGetClientHomework(clientId, { query: { enabled: !!clientId, queryKey: ['homework', clientId] } });
  const { data: historyData, isLoading: historyLoading } = useGetClientSessionHistory(clientId, { query: { enabled: !!clientId, queryKey: ['history', clientId] } });

  const DEMO_CLIENTS_MAP: Record<number, any> = {
    1: {
      id: 1,
      name: "Sarah Jenkins",
      initials: "SJ",
      age: 29,
      gender: "Female",
      status: "active",
      primaryGoal: "Manage generalized anxiety and workplace stress",
      presentingProblems: ["Generalized Anxiety Disorder", "Insomnia", "Workplace Stress", "Imposter Syndrome"],
      identifiedConcerns: ["Frequent panic sensations during team presentations", "Ruminative night thoughts", "Fear of failure"],
      therapyGoals: ["Reduce GAD-7 score below 5", "Establish healthy sleep hygiene routine", "Practice assertiveness techniques at work"],
      preferredLanguage: "English",
      communicationPreference: "Video",
      therapyTimeline: "3-6 months",
      aiIntakeSummary: "Client reports 6-month history of escalating anxiety following a promotion. High motivation for CBT intervention. Responding very well to cognitive restructuring.",
      progressPercent: 75,
      startDate: "2026-02-10",
      lastSession: "2026-07-20",
      nextSession: "2026-07-27",
      sessionCount: 12,
    },
    2: {
      id: 2,
      name: "Michael Chen",
      initials: "MC",
      age: 36,
      gender: "Male",
      status: "active",
      primaryGoal: "Overcome depressive episodes and build daily routine",
      presentingProblems: ["Major Depressive Disorder (Mild)", "Social Isolation", "Low Energy"],
      identifiedConcerns: ["Lack of motivation for exercise", "Negative self-talk", "Withdrawal from friendships"],
      therapyGoals: ["Complete behavioral activation logs 5x/week", "Re-engage in weekend cycling group", "Identify and challenge 3 cognitive distortions daily"],
      preferredLanguage: "English",
      communicationPreference: "Video",
      therapyTimeline: "6-12 months",
      aiIntakeSummary: "Client reports persistent low mood following recent career pivot. Responding positively to Behavioral Activation and ACT values clarification exercises.",
      progressPercent: 60,
      startDate: "2026-03-01",
      lastSession: "2026-07-21",
      nextSession: "2026-07-28",
      sessionCount: 8,
    },
    3: {
      id: 3,
      name: "Emily Rodriguez",
      initials: "ER",
      age: 42,
      gender: "Female",
      status: "active",
      primaryGoal: "Process relationship dynamics and improve emotional regulation",
      presentingProblems: ["Emotional Dysregulation", "Work-Life Imbalance", "Chronic Stress"],
      identifiedConcerns: ["Difficulty setting boundaries with extended family", "Overworking under tight deadlines", "Tension headaches"],
      therapyGoals: ["Master DBT TIPP & STOP distress tolerance skills", "Set clear boundaries at work and home", "Engage in daily mindfulness practice"],
      preferredLanguage: "Spanish",
      communicationPreference: "Video",
      therapyTimeline: "6-12 months",
      aiIntakeSummary: "Client seeking support for burnout and interpersonal effectiveness. Highly engaged in DBT skill rehearsals.",
      progressPercent: 80,
      startDate: "2026-01-15",
      lastSession: "2026-07-22",
      nextSession: "2026-07-26",
      sessionCount: 15,
    },
    4: {
      id: 4,
      name: "David Kim",
      initials: "DK",
      age: 31,
      gender: "Male",
      status: "new",
      primaryGoal: "Manage social anxiety in leadership role",
      presentingProblems: ["Social Anxiety Disorder", "Public Speaking Anxiety", "Performance Fear"],
      identifiedConcerns: ["Heart palpitations before executive briefings", "Avoidance of optional networking events", "Self-consciousness"],
      therapyGoals: ["Build 10-tier exposure hierarchy for public speaking", "Practice grounding techniques during meetings", "Reduce post-event rumination"],
      preferredLanguage: "English",
      communicationPreference: "In-Person",
      therapyTimeline: "3-6 months",
      aiIntakeSummary: "New client presenting with performance anxiety following recent promotion to VP of Engineering. Motivated for CBT exposure therapy.",
      progressPercent: 35,
      startDate: "2026-07-01",
      lastSession: "2026-07-17",
      nextSession: "2026-07-24",
      sessionCount: 2,
    },
    5: {
      id: 5,
      name: "Jessica Taylor",
      initials: "JT",
      age: 25,
      gender: "Female",
      status: "completed",
      primaryGoal: "Address panic symptoms and return to comfortable social activities",
      presentingProblems: ["Panic Disorder", "Agoraphobia (Mild)"],
      identifiedConcerns: ["Avoidance of crowded subways", "Interoceptive panic triggers", "Fear of fainting"],
      therapyGoals: ["Completed interoceptive exposure exercises", "Traveled independently on subway", "Achieved full remission of panic attacks"],
      preferredLanguage: "English",
      communicationPreference: "Video",
      therapyTimeline: "3-6 months",
      aiIntakeSummary: "Client completed 16-session CBT panic protocol. Achieved full symptom remission and successfully graduated therapy.",
      progressPercent: 100,
      startDate: "2026-02-01",
      lastSession: "2026-07-12",
      nextSession: undefined,
      sessionCount: 16,
    },
  };

  const rawFallback = DEMO_CLIENTS_MAP[clientId] || DEMO_CLIENTS_MAP[1];

  const client = {
    ...rawFallback,
    ...(clientData || {}),
    name: clientData?.name || rawFallback.name,
    initials: (clientData as any)?.initials || rawFallback.initials,
    age: (clientData as any)?.age || rawFallback.age,
    gender: (clientData as any)?.gender || rawFallback.gender,
    status: clientData?.status || rawFallback.status,
    primaryGoal: clientData?.primaryGoal || rawFallback.primaryGoal,
    presentingProblems: (Array.isArray((clientData as any)?.presentingProblems) && (clientData as any).presentingProblems.length > 0) ? (clientData as any).presentingProblems : rawFallback.presentingProblems,
    therapyGoals: (Array.isArray((clientData as any)?.therapyGoals) && (clientData as any).therapyGoals.length > 0) ? (clientData as any).therapyGoals : rawFallback.therapyGoals,
    preferredLanguage: (clientData as any)?.preferredLanguage || rawFallback.preferredLanguage,
    communicationPreference: (clientData as any)?.communicationPreference || rawFallback.communicationPreference,
    therapyTimeline: (clientData as any)?.therapyTimeline || rawFallback.therapyTimeline,
    startDate: (clientData as any)?.startDate || rawFallback.startDate,
    sessionCount: clientData?.sessionCount ?? rawFallback.sessionCount,
    progressPercent: (clientData as any)?.progressPercent ?? rawFallback.progressPercent,
  };

  const DEMO_ASSESSMENTS = [
    {
      id: 101,
      type: "GAD-7",
      name: "Generalized Anxiety Disorder-7",
      currentScore: 6.0,
      maxScore: 21.0,
      previousScore: 18.0,
      severity: "Mild Anxiety",
      completedAt: "2026-07-18",
      trend: [
        { date: "2026-04-15", score: 18 },
        { date: "2026-05-15", score: 14 },
        { date: "2026-06-15", score: 9 },
        { date: "2026-07-18", score: 6 },
      ]
    },
    {
      id: 102,
      type: "PHQ-9",
      name: "Patient Health Questionnaire-9",
      currentScore: 4.0,
      maxScore: 27.0,
      previousScore: 14.0,
      severity: "Minimal Depression",
      completedAt: "2026-07-18",
      trend: [
        { date: "2026-04-15", score: 14 },
        { date: "2026-05-15", score: 10 },
        { date: "2026-06-15", score: 7 },
        { date: "2026-07-18", score: 4 },
      ]
    }
  ];

  const DEMO_HOMEWORK = [
    {
      id: 201,
      activity: "CBT Thought Record Log",
      instructions: "Complete daily thought record whenever stress level exceeds 5/10.",
      frequency: "Daily",
      dueDate: "2026-07-27",
      status: "completed",
      completionPercent: 90,
      streak: 5,
      clientReflection: "Recognized catastrophizing thoughts early and reframed effectively.",
    },
    {
      id: 202,
      activity: "Box Breathing & Grounding",
      instructions: "Practice 5 minutes of 4-4-4-4 box breathing before work team meetings.",
      frequency: "Daily",
      dueDate: "2026-07-28",
      status: "pending",
      completionPercent: 80,
      streak: 4,
      clientReflection: "Helped reduce physical heart rate elevation prior to speaking.",
    }
  ];

  const DEMO_HISTORY = [
    {
      id: 301,
      date: "2026-07-20",
      durationMinutes: 60,
      sessionType: "CBT",
      summary: "CBT Cognitive Restructuring - Session #12",
      homeworkAssigned: "Daily Thought Record Log",
      therapistNotes: "Client showed high engagement and successfully identified catastrophizing triggers.",
    },
    {
      id: 302,
      date: "2026-07-13",
      durationMinutes: 60,
      sessionType: "CBT",
      summary: "CBT Exposure Hierarchy Construction - Session #11",
      homeworkAssigned: "Box Breathing Protocol",
      therapistNotes: "Constructed 10-step workplace exposure hierarchy. Client motivated to proceed.",
    }
  ];

  const DEMO_MOOD = [
    { date: "2026-07-17", mood: 6.0, note: "Slight anxiety regarding morning presentation." },
    { date: "2026-07-18", mood: 6.5, note: "Practiced box breathing, felt steady." },
    { date: "2026-07-19", mood: 7.0, note: "Weekend rest, enjoyable outdoor walk." },
    { date: "2026-07-20", mood: 7.5, note: "Good sleep, positive session discussion." },
    { date: "2026-07-21", mood: 7.0, note: "Productive workday." },
    { date: "2026-07-22", mood: 8.0, note: "Completed thought record log with ease." },
    { date: "2026-07-23", mood: 8.5, note: "Felt confident and calm all day." },
  ];

  const DEFAULT_CLIENT_MILESTONE_LOGS: Record<number, any[]> = {
    1: [
      { milestone: 3, code: "GAD-7", baseline: 18, score: 14, delta: -4, label: "-4 pts (-22%)", status: "Improved", notified: true, date: "2026-03-15" },
      { milestone: 6, code: "GAD-7", baseline: 18, score: 9, delta: -9, label: "-9 pts (-50%)", status: "Substantial Improvement", notified: true, date: "2026-05-01" },
      { milestone: 9, code: "PHQ-9", baseline: 14, score: 7, delta: -7, label: "-7 pts (-50%)", status: "Moderate Remission", notified: true, date: "2026-06-15" },
      { milestone: 12, code: "GAD-7", baseline: 18, score: 6, delta: -12, label: "-12 pts (-66.7%)", status: "Significant Remission Target Met", notified: true, date: "2026-07-20" },
    ],
    2: [
      { milestone: 3, code: "PHQ-9", baseline: 18, score: 15, delta: -3, label: "-3 pts (-16.7%)", status: "Mild Improvement", notified: true, date: "2026-04-01" },
      { milestone: 6, code: "PHQ-9", baseline: 18, score: 12, delta: -6, label: "-6 pts (-33.3%)", status: "Responding to BA Protocol", notified: true, date: "2026-05-20" },
      { milestone: 8, code: "PHQ-9", baseline: 18, score: 8, delta: -10, label: "-10 pts (-55.5%)", status: "Substantial Improvement", notified: true, date: "2026-07-15" },
    ],
    3: [
      { milestone: 3, code: "PCL-5", baseline: 42, score: 35, delta: -7, label: "-7 pts (-16.7%)", status: "Improved", notified: true, date: "2026-03-01" },
      { milestone: 6, code: "PCL-5", baseline: 42, score: 28, delta: -14, label: "-14 pts (-33.3%)", status: "Clinically Significant", notified: true, date: "2026-04-30" },
      { milestone: 12, code: "PCL-5", baseline: 42, score: 24, delta: -18, label: "-18 pts (-42.8%)", status: "Below Clinical Cutoff", notified: true, date: "2026-07-10" },
    ],
    4: [
      { milestone: 2, code: "GAD-7", baseline: 15, score: 11, delta: -4, label: "-4 pts (-26.7%)", status: "Early Response", notified: true, date: "2026-07-17" },
    ],
    5: [
      { milestone: 3, code: "GAD-7", baseline: 19, score: 14, delta: -5, label: "-5 pts", status: "Improved", notified: true, date: "2026-03-01" },
      { milestone: 8, code: "GAD-7", baseline: 19, score: 8, delta: -11, label: "-11 pts", status: "Substantial", notified: true, date: "2026-05-01" },
      { milestone: 16, code: "GAD-7", baseline: 19, score: 4, delta: -15, label: "-15 pts (-78.9%)", status: "Full Symptom Remission", notified: true, date: "2026-07-12" },
    ]
  };

  const DEMO_QUESTION_BREAKDOWNS: Record<string, any[]> = {
    "GAD-7": [
      { q: "1. Feeling nervous, anxious, or on edge", baseline: "Nearly every day (3/3)", current: "Several days (1/3)", change: "-2" },
      { q: "2. Not being able to stop or control worrying", baseline: "Nearly every day (3/3)", current: "Several days (1/3)", change: "-2" },
      { q: "3. Worrying too much about different things", baseline: "More than half the days (2/3)", current: "Several days (1/3)", change: "-1" },
      { q: "4. Trouble relaxing", baseline: "Nearly every day (3/3)", current: "Several days (1/3)", change: "-2" },
      { q: "5. Being so restless that it's hard to sit still", baseline: "More than half the days (2/3)", current: "Not at all (0/3)", change: "-2" },
      { q: "6. Becoming easily annoyed or irritable", baseline: "Several days (1/3)", current: "Not at all (0/3)", change: "-1" },
      { q: "7. Feeling afraid as if something awful might happen", baseline: "Nearly every day (3/3)", current: "Several days (1/3)", change: "-2", flagged: true }
    ],
    "PHQ-9": [
      { q: "1. Little interest or pleasure in doing things", baseline: "Nearly every day (3/3)", current: "Several days (1/3)", change: "-2" },
      { q: "2. Feeling down, depressed, or hopeless", baseline: "Nearly every day (3/3)", current: "Not at all (0/3)", change: "-3" },
      { q: "3. Trouble falling or staying asleep, or sleeping too much", baseline: "More than half the days (2/3)", current: "Several days (1/3)", change: "-1" },
      { q: "4. Feeling tired or having little energy", baseline: "More than half the days (2/3)", current: "Several days (1/3)", change: "-1" },
      { q: "5. Poor appetite or overeating", baseline: "Several days (1/3)", current: "Not at all (0/3)", change: "-1" },
      { q: "6. Feeling bad about yourself or that you are a failure", baseline: "More than half the days (2/3)", current: "Not at all (0/3)", change: "-2" },
      { q: "7. Trouble concentrating on things", baseline: "Several days (1/3)", current: "Not at all (0/3)", change: "-1" },
      { q: "8. Moving or speaking slowly / fidgety", baseline: "Not at all (0/3)", current: "Not at all (0/3)", change: "0" },
      { q: "9. Thoughts that you would be better off dead or hurting yourself", baseline: "Not at all (0/3)", current: "Not at all (0/3)", change: "0" }
    ],
    "PCL-5": [
      { q: "1. Repeated, disturbing memories or thoughts of stressful experience", baseline: "Extremely (4/4)", current: "Moderately (2/4)", change: "-2" },
      { q: "2. Repeated, disturbing dreams of stressful experience", baseline: "Quite a bit (3/4)", current: "A little bit (1/4)", change: "-2" },
      { q: "3. Suddenly feeling or acting as if stressful experience were happening", baseline: "Moderately (2/4)", current: "Not at all (0/4)", change: "-2" },
      { q: "4. Avoidance of external reminders (people, places, conversations)", baseline: "Extremely (4/4)", current: "Moderately (2/4)", change: "-2", flagged: true },
      { q: "5. Trouble remembering important parts of stressful experience", baseline: "Moderately (2/4)", current: "A little bit (1/4)", change: "-1" }
    ]
  };

  const assessments = (Array.isArray(assessmentsData) && assessmentsData.length > 0) ? assessmentsData : DEMO_ASSESSMENTS;
  const homework = (Array.isArray(homeworkData) && homeworkData.length > 0) ? homeworkData : DEMO_HOMEWORK;
  const history = (Array.isArray(historyData) && historyData.length > 0) ? historyData : DEMO_HISTORY;
  const moodTrend = (Array.isArray(moodData?.weeklyTrend) && moodData.weeklyTrend.length > 0) ? moodData.weeklyTrend : DEMO_MOOD;
  const clientMilestoneLogs = DEFAULT_CLIENT_MILESTONE_LOGS[clientId] || DEFAULT_CLIENT_MILESTONE_LOGS[1];

  const SCALE_TITLES: Record<string, string> = {
    "PSS-10": "Perceived Stress Scale-10",
    "WHO-5": "WHO-5 Well-Being Index",
    "WSAS": "Work and Social Adjustment Scale",
    "PHQ-9": "Patient Health Questionnaire-9",
    "GAD-7": "Generalized Anxiety Disorder-7",
    "PCL-5": "PTSD Checklist for DSM-5",
    "OCI-R": "Obsessive-Compulsive Inventory - Revised",
    "ASRS v1.1": "Adult ADHD Self-Report Scale v1.1",
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("hexpertify_auth_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const assignmentDoc = {
      id: `ASN-${Date.now().toString().slice(-6)}`,
      assessmentId: `ASS-${selectedAssignScale}`,
      assessmentAcronym: selectedAssignScale,
      assessmentTitle: SCALE_TITLES[selectedAssignScale] || selectedAssignScale,
      clientId: client.id || clientId || '',
      clientName: client.name,
      clientEmail: client.email || '',
      consultantId: user?.id || '',
      consultantName: user?.name || 'Dr. Alex Harrison',
      therapistName: user?.name || 'Dr. Alex Harrison',
      dueDate: assignDueDate,
      notes: assignNote,
      frequency: 'Weekly Check-in',
      status: 'Pending',
      assignedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // 1. Post to Backend API
    try {
      await fetch('/api/assessments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentDoc)
      });
    } catch (err) {
      console.warn('Failed to post assignment to API:', err);
    }

    // 2. Persist to local storage & broadcast real-time event
    try {
      const existing = JSON.parse(localStorage.getItem('hexpertify_assignments') || '[]');
      localStorage.setItem('hexpertify_assignments', JSON.stringify([assignmentDoc, ...existing]));
      window.dispatchEvent(new CustomEvent('hexpertify-assignment-created', { detail: assignmentDoc }));
    } catch {}

    setAssignModalOpen(false);
    toast({
      title: "Assessment Scale Dispatched! 🚀",
      description: `${selectedAssignScale} assigned to ${client.name} with due date ${formatDate(assignDueDate)}. Synchronized with Client Panel.`,
    });
    setAssignNote("");
  };

  const handleAssignActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignActivityModalOpen(false);
    toast({
      title: "Therapeutic Activity Assigned! 🎮",
      description: `"${activityTitle}" (${activityCategory}) assigned to ${client.name} due by ${formatDate(activityDueDate)}. Synchronized to client portal.`,
    });
  };

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prev = Number(calcPrevScore);
    const curr = Number(calcCurrScore);
    const ms = Number(calcMilestone);

    triggerOutcomeCalc({
      clientId: String(clientId),
      clientName: client.name,
      clientInitials: client.initials,
      assessmentName: calcScale === "GAD-7" ? "Generalized Anxiety" : calcScale === "PHQ-9" ? "Patient Health Questionnaire" : "Clinical Scale",
      assessmentCode: calcScale,
      sessionMilestone: ms,
      previousScore: prev,
      currentScore: curr,
      maxScore: calcScale === "GAD-7" ? 21 : calcScale === "PHQ-9" ? 27 : 80,
    });

    setCalcModalOpen(false);
    toast({
      title: "3-Session Outcome Calculated! ⚡",
      description: `Session ${ms} milestone calculated for ${client.name}. Score change: ${curr - prev > 0 ? '+' : ''}${curr - prev} points. Therapist alert dispatched.`,
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/consultant/clients" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#5e2be2] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clients
        </Link>
      </div>

      <PageHeader
        title={client.name}
        description={`${client.age} yrs · ${client.gender} · ${client.primaryGoal}`}
      >
        <div className="flex items-center gap-3">
          <Link href="/consultant/messages">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5e2be2] hover:bg-white/90 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-full border border-white/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Session</span>
          </button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-border w-full justify-start p-1 h-14 rounded-xl overflow-x-auto flex-nowrap shrink-0 hide-scrollbar">
          <TabsTrigger value="overview" className="rounded-lg h-11 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-muted-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="outcomes" className="rounded-lg h-11 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-muted-foreground">
            Progress
          </TabsTrigger>
          <TabsTrigger value="assessments" className="rounded-lg h-11 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-muted-foreground">
            Assessments
          </TabsTrigger>
          <TabsTrigger value="homework" className="rounded-lg h-11 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-muted-foreground">
            Activities &amp; Homework
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg h-11 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-muted-foreground">
            Session History
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Therapy Goals</h4>
                      <div className="space-y-3">
                        {(Array.isArray(client.therapyGoals) ? client.therapyGoals : []).map((goal: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Presenting Problems</h4>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(client.presentingProblems) ? client.presentingProblems : []).map((prob: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal">{prob}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-purple-200/80 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white rounded-3xl overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#5e2be2]" />
                        AI Intake Summary
                      </CardTitle>
                      <Badge variant="outline" className="bg-purple-100 text-[#5e2be2] border-purple-200 text-[10px] font-extrabold">
                        AI Clinical Insights
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
                      {client.aiIntakeSummary}
                    </p>

                    {/* Read More / Read Less Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowFullIntakeSummary(!showFullIntakeSummary)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5e2be2] hover:text-[#4f28d9] transition-colors cursor-pointer pt-1"
                    >
                      <span>{showFullIntakeSummary ? "Read Less" : "Read More"}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", showFullIntakeSummary && "rotate-180")} />
                    </button>

                    {/* Full Detailed Clinical Summary Report */}
                    {showFullIntakeSummary && (
                      <div className="mt-4 pt-4 border-t border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 bg-white rounded-2xl border border-purple-100 space-y-3.5 shadow-2xs">
                          <div>
                            <h5 className="text-[11px] font-extrabold text-[#5e2be2] uppercase tracking-wider mb-1">Clinical Background & Presenting Problem</h5>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {FULL_INTAKE_SUMMARIES[clientId]?.background || `${client.name} presented for clinical intake with symptoms impacting workplace performance and daily emotional regulation. Reports a multi-month history of stress reactivity and somatic tension.`}
                            </p>
                          </div>

                          <div>
                            <h5 className="text-[11px] font-extrabold text-[#5e2be2] uppercase tracking-wider mb-1">Primary Reported Symptoms</h5>
                            <ul className="space-y-1.5">
                              {(FULL_INTAKE_SUMMARIES[clientId]?.symptoms || [
                                "Escalating anxiety spikes prior to key performance evaluations.",
                                "Perfectionistic thought patterns and cognitive distortions.",
                                "Restlessness, fatigue, and difficulty maintaining sleep continuity."
                              ]).map((symptom: string, idx: number) => (
                                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5e2be2] shrink-0 mt-1.5" />
                                  <span>{symptom}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-[11px] font-extrabold text-[#5e2be2] uppercase tracking-wider mb-1">Formulated Treatment Strategy</h5>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {FULL_INTAKE_SUMMARIES[clientId]?.treatmentPlan || "Structured Evidence-Based Cognitive Behavioral Therapy (CBT). Protocol includes thought record logs, box breathing exercises, and gradual exposure hierarchy."}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Risk & Safety Assessment</span>
                              <p className="text-[11px] text-slate-700 font-medium">
                                {FULL_INTAKE_SUMMARIES[clientId]?.riskAssessment || "Low risk for self-harm or suicide. Safety protocol established and reviewed."}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-0.5">
                              <span className="text-[10px] font-extrabold text-[#5e2be2] uppercase tracking-wider block">Clinical Progress Notes</span>
                              <p className="text-[11px] text-slate-700 font-medium">
                                {FULL_INTAKE_SUMMARIES[clientId]?.clinicalObservations || "High motivation, strong homework compliance, and consistent assessment progress."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Personal Notes Box UI (Therapist Reference) */}
                <div className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-2xl bg-purple-100/80 text-[#5e2be2]">
                        <Edit3 className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">Personal Notes</h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-50 text-[#5e2be2] border border-purple-100 rounded-full text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-amber-500" />
                      Therapist Only
                    </span>
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-3">
                      <textarea
                        autoFocus
                        value={noteInputText}
                        onChange={(e) => {
                          setNoteInputText(e.target.value);
                          setIsNoteSavedFeedback(false);
                        }}
                        rows={4}
                        placeholder="Type personal reference notes about this client..."
                        className="w-full p-4 bg-white border border-[#5e2be2] rounded-2xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-100 leading-relaxed resize-none transition-all shadow-sm"
                      />
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[11px] text-slate-400 font-medium">Click Save when finished</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setNoteInputText(personalNotesStore[clientId] || "");
                              setIsEditingNote(false);
                            }}
                            className="text-xs font-bold text-slate-500 h-8 px-3 rounded-xl hover:bg-slate-100 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setPersonalNotesStore((prev) => ({ ...prev, [clientId]: noteInputText }));
                              setIsNoteSavedFeedback(true);
                              setIsEditingNote(false);
                              toast({
                                title: "Personal Note Saved",
                                description: "Therapist reference note updated for this client.",
                              });
                            }}
                            className="bg-[#5e2be2] hover:bg-[#4d22be] text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Save Note</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl min-h-[90px] flex flex-col justify-between space-y-3">
                      <p className="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {noteInputText.trim() ? (
                          noteInputText
                        ) : (
                          <span className="text-slate-400 italic">No personal notes added yet. Click "Edit Note" to add reference notes for this client...</span>
                        )}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          {isNoteSavedFeedback && (
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved to record
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingNote(true)}
                          className="text-[11px] font-extrabold text-[#5e2be2] flex items-center gap-1 bg-purple-100/70 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/60 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Edit Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Card className="shadow-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Assessments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assessmentsLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : (
                      <div className="space-y-4">
                        {assessments?.slice(0, 3).map((assessment) => (
                          <div key={assessment.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{assessment.type}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{assessment.currentScore}</span>
                                <span className="text-xs text-muted-foreground">/ {assessment.maxScore}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={cn("font-medium",
                                assessment.severity === 'Severe' ? 'text-red-600' :
                                  assessment.severity === 'Moderate' ? 'text-amber-600' : 'text-green-600'
                              )}>
                                {assessment.severity}
                              </span>
                              <span className="text-muted-foreground">{formatDate(assessment.completedAt)}</span>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full text-sm h-9 cursor-pointer font-bold text-[#5e2be2]"
                          onClick={() => setActiveTab("assessments")}
                        >
                          View Diagnostic Assessments →
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-primary/5 border-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary">Next Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(client as any).nextSession ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{formatDate((client as any).nextSession)}</p>
                            <p className="text-sm text-muted-foreground">Follow-up · Video</p>
                          </div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90">Prepare Session Note</Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm mb-4">No upcoming sessions scheduled.</p>
                        <Button variant="outline" className="w-full border-primary/20 text-primary">Schedule Session</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CLINICAL OUTCOMES TAB */}
          <TabsContent value="outcomes" className="space-y-6 outline-none">



            {/* ── 3-SESSION MILESTONE CLINICAL OUTCOME GRAPHS SECTION (Before Activity Completion) ── */}
            {(() => {
              const whoWellbeingData = WHO_WELLBEING_DATA[clientId] || WHO_WELLBEING_DATA[1];
              const pssStressData = PSS_STRESS_DATA[clientId] || PSS_STRESS_DATA[1];
              const personalizedInfo = PERSONALIZED_INSTRUMENTS_DATA[personalizedScale] || PERSONALIZED_INSTRUMENTS_DATA["GAD-7"];

              const baseWhoScore = whoWellbeingData[0]?.score || 32;
              const currentWhoScore = whoWellbeingData[whoWellbeingData.length - 1]?.score || 84;

              const basePssScore = pssStressData[0]?.score || 28;
              const currentPssScore = pssStressData[pssStressData.length - 1]?.score || 8;

              const currentPersonalizedScore = personalizedInfo.data[personalizedInfo.data.length - 1].score;
              const initialPersonalizedScore = personalizedInfo.data[0].score;
              const maxPersonalizedScore = personalizedInfo.maxScore;

              const personalizedCategoryMap: Record<string, string> = {
                "GAD-7": "Anxiety",
                "PHQ-9": "Depression",
                "PCL-5": "PTSD",
                "PSQI": "Sleep Quality",
                "PDSS": "Panic Disorder",
              };
              const personalizedCategory = personalizedCategoryMap[personalizedScale] || "Anxiety";

              return (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-purple-100 text-[#5e2be2]">
                        <Activity className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Clinical Outcome</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Outcome assessments performed by {client.name} after therapy sessions
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-[#5e2be2] border-purple-200 text-xs font-bold px-3 py-1">
                      Evaluation Cycle
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Graph 1: Overall Wellbeing (WHO-5 Index) */}
                    <div className="p-5 rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/40 via-white to-white space-y-3 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-2">

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Overall Wellbeing</h4>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            {currentWhoScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Base Score: <strong className="text-slate-800 font-bold">{baseWhoScore}/100</strong></span>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                              formatter={(val: any) => [`${val} / 100`, 'Wellbeing Index']}
                            />
                            <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#whoGradient)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Category: <strong className="text-emerald-700 font-extrabold">Wellbeing</strong></span>
                        <span className="text-slate-400">3-Session Intervals</span>
                      </div>
                    </div>

                    {/* Graph 2: General Stress Graph (PSS Assessment) */}
                    <div className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/40 via-white to-white space-y-3 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-2">

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">General Stress</h4>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                          <span className="text-2xl font-black text-slate-900 font-mono">{currentPssScore} <span className="text-xs text-slate-400 font-normal">/ 40</span></span>
                          <span className="text-[11px] text-slate-500 font-medium">Base Score: <strong className="text-slate-800 font-bold">{basePssScore}/40</strong></span>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                            <YAxis domain={[0, 40]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                              formatter={(val: any) => [`${val} pts`, 'Perceived Stress']}
                            />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#pssGradient)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Category: <strong className="text-blue-700 font-extrabold">Stress</strong></span>
                        <span className="text-slate-400">3-Session Intervals</span>
                      </div>
                    </div>

                    {/* Graph 3: Personalised Graph (Allocated by Therapist) */}
                    <div className="p-5 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/40 via-white to-white space-y-3 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-2">

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Personalized</h4>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            {currentPersonalizedScore} <span className="text-xs text-slate-400 font-normal">/ {maxPersonalizedScore}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Base Score: <strong className="text-slate-800 font-bold">{initialPersonalizedScore}/{maxPersonalizedScore}</strong></span>
                        </div>
                      </div>

                      <div className="h-48 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={personalizedInfo.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="personalizedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5e2be2" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#5e2be2" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="milestone" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                            <YAxis domain={[0, maxPersonalizedScore]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                              formatter={(val: any) => [`${val} / ${maxPersonalizedScore}`, personalizedScale]}
                            />
                            <Area type="monotone" dataKey="score" stroke="#5e2be2" strokeWidth={3} fillOpacity={1} fill="url(#personalizedGradient)" dot={{ r: 4, fill: '#5e2be2', strokeWidth: 2, stroke: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Category: <strong className="text-purple-700 font-extrabold">{personalizedCategory}</strong></span>
                        <span className="text-slate-400">Enabled at Session 3</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MIDDLE SECTION: CHART (Exact Screenshot Match) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Right Chart: Activity Completion */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                      <BarChart2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Activity Completion</h3>
                      <p className="text-xs text-slate-500 font-medium">Weekly exercises finished by {client.name}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                    Weekly Exercises
                  </Badge>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: "Mon", count: 2 },
                      { day: "Tue", count: 1 },
                      { day: "Wed", count: 3 },
                      { day: "Thu", count: 2 },
                      { day: "Fri", count: 4 },
                      { day: "Sat", count: 1 },
                      { day: "Sun", count: 3 },
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CURRENT GOALS PROGRESS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Current Goals for {client.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    3-session outcome milestones &amp; active treatment objectives
                  </p>
                </div>
                <Badge className="bg-[#5e2be2] text-white border-none text-xs font-bold px-3 py-1">
                  Session 12 / 15
                </Badge>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Mindfulness & Grounding Practice", current: 8, total: 10, progress: 80 },
                  { title: "Sleep Hygiene & Routine Adherence", current: 6, total: 8, progress: 75 },
                  { title: "Cognitive Restructuring Thought Records", current: 7, total: 10, progress: 70 },
                  { title: "Workplace Assertiveness Exercises", current: 5, total: 10, progress: 50 },
                ].map((goal, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{goal.title}</span>
                      <span className="text-[#5e2be2] font-mono font-extrabold">{goal.current} / {goal.total}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className="h-full bg-[#5e2be2] rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: DIAGNOSTIC ASSESSMENTS TAB */}
          <TabsContent value="assessments" className="space-y-6 outline-none">

            {/* Diagnostic Assessment Battery Cards & Recharts Trends */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[#5e2be2]" />
                    Active Assessment Instruments &amp; Longitudinal Trends
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track score trajectories across sessions and inspect question breakdowns
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold text-slate-600 bg-white">
                  {assessments?.length || 2} Instruments Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assessments?.map((assessment) => (
                  <Card key={assessment.id} className="shadow-sm border-border hover:border-purple-200 transition-colors">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between border-b border-slate-100 bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold text-slate-900">{assessment.type}</CardTitle>
                          <Badge variant="outline" className="text-[10px] font-mono bg-white">
                            Instrument Code
                          </Badge>
                        </div>
                        <CardDescription className="text-xs text-slate-500 mt-0.5">{assessment.name}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          {assessment.currentScore}
                          <span className="text-xs font-normal text-slate-400">/{assessment.maxScore}</span>
                        </div>
                        <div className={cn(
                          "text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1",
                          assessment.severity === 'Severe' || assessment.severity === 'Severe Anxiety' ? 'bg-red-100 text-red-700' :
                            assessment.severity === 'Moderate' || assessment.severity === 'Mild Anxiety' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        )}>
                          {assessment.severity}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Score Trajectory across sessions:</span>
                        <span className="text-slate-700 font-bold">Last completed: {formatDate(assessment.completedAt)}</span>
                      </div>

                      {/* Chart */}
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={Array.isArray(assessment?.trend) ? assessment.trend : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            <YAxis domain={[0, assessment.maxScore]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              labelFormatter={(label) => formatDate(label as string)}
                            />
                            <Line type="monotone" dataKey="score" stroke="#5e2be2" strokeWidth={3} dot={{ r: 5, fill: "#5e2be2", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          Baseline: <span className="font-bold text-slate-900">{assessment.previousScore || (assessment.currentScore + 8)}</span> → Latest: <span className="font-bold text-[#5e2be2]">{assessment.currentScore}</span>
                        </div>
                        <Button
                          onClick={() => setItemDetailsScale(assessment)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold text-[#5e2be2] border-purple-200 hover:bg-purple-50 h-8 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Item Breakdown
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: ACTIVITIES & HOMEWORK */}
          <TabsContent value="homework" className="space-y-6 outline-none">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setAssignActivityModalOpen(true)}
                className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Activity
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {homework?.map((item) => (
                <Card key={item.id} className="shadow-sm border-border overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{item.activity}</h3>
                          <Badge variant="outline" className={cn(
                            "uppercase text-[10px] tracking-wider font-bold",
                            item.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" :
                              item.status === 'pending' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Due: {formatDate(item.dueDate)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{item.instructions}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">Completion ({item.frequency})</span>
                          <span className="font-bold">{item.completionPercent}%</span>
                        </div>
                        <Progress value={item.completionPercent} className="h-2" />
                      </div>
                    </div>
                    {item.clientReflection && (
                      <div className="bg-secondary/50 p-6 md:w-1/3 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                          <MessageSquareIcon className="w-4 h-4" /> Client Reflection
                        </h4>
                        <p className="text-sm italic text-slate-700">"{item.clientReflection}"</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 5: SESSION HISTORY */}
          <TabsContent value="history" className="space-y-6 outline-none">
            <div className="relative border-l-2 border-border ml-4 pl-8 space-y-8 py-4">
              {history?.map((session, i) => (
                <div key={session.id} className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-sm" />

                  <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-secondary/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Session {history.length - i}
                            <Badge variant="outline" className="font-normal text-muted-foreground bg-white">{session.sessionType}</Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(session.date)}
                            <span className="mx-1">•</span>
                            <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} min
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white">View Full Report</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clinical Summary</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{session.summary}</p>
                      </div>

                      {session.therapistNotes && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Private Notes
                          </h4>
                          <p className="text-sm text-amber-900/80">{session.therapistNotes}</p>
                        </div>
                      )}

                      {session.homeworkAssigned && (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <BookOpenIcon className="w-3.5 h-3.5" /> Assigned Activity
                          </h4>
                          <p className="text-sm text-primary/80">{session.homeworkAssigned}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* DIALOG 1: ASSIGN ASSESSMENT SCALE */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Send className="w-5 h-5 text-[#5e2be2]" />
              Assign Assessment Scale
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Dispatch a standardized clinical assessment to {client.name}'s client app.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Select Assessment Instrument</label>
              <Select value={selectedAssignScale} onValueChange={setSelectedAssignScale}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    General Assessments (Common for All Clients)
                  </div>
                  <SelectItem value="PSS-10">1. PSS-10 (Perceived Stress Scale - 10 Items)</SelectItem>
                  <SelectItem value="WHO-5">2. WHO-5 (Well-Being Index - 5 Items)</SelectItem>
                  <SelectItem value="WSAS">3. WSAS (Work and Social Adjustment Scale - 5 Items)</SelectItem>

                  <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 pt-1.5 border-t border-slate-100">
                    Specific Clinical Concern Assessments (Consultant Assigned)
                  </div>
                  <SelectItem value="PHQ-9">4. PHQ-9 (Patient Health Questionnaire / Depression - 9 Items)</SelectItem>
                  <SelectItem value="GAD-7">5. GAD-7 (Generalized Anxiety Disorder - 7 Items)</SelectItem>
                  <SelectItem value="PCL-5">6. PCL-5 (PTSD Checklist for DSM-5 - 20 Items)</SelectItem>
                  <SelectItem value="OCI-R">7. OCI-R (Obsessive-Compulsive Inventory - 18 Items)</SelectItem>
                  <SelectItem value="ASRS v1.1">8. ASRS v1.1 (Adult ADHD Self-Report Scale - 18 Items)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Due Date</label>
              <Input
                type="date"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Therapist Instructions (Optional)</label>
              <Input
                placeholder="e.g. Please complete prior to our Session #13 discussion."
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold cursor-pointer">Dispatch Scale</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: CALCULATE 3-SESSION OUTCOME */}
      <Dialog open={calcModalOpen} onOpenChange={setCalcModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Calculator className="w-5 h-5 text-[#5e2be2]" />
              Calculate 3-Session Outcome Milestone
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record score milestone for {client.name} and trigger automated therapist panel alerts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCalcSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">Milestone Session #</label>
                <Select value={calcMilestone} onValueChange={setCalcMilestone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Session 3</SelectItem>
                    <SelectItem value="6">Session 6</SelectItem>
                    <SelectItem value="9">Session 9</SelectItem>
                    <SelectItem value="12">Session 12</SelectItem>
                    <SelectItem value="15">Session 15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">Scale Code</label>
                <Select value={calcScale} onValueChange={setCalcScale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GAD-7">GAD-7</SelectItem>
                    <SelectItem value="PHQ-9">PHQ-9</SelectItem>
                    <SelectItem value="PCL-5">PCL-5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">Previous / Baseline Score</label>
                <Input
                  type="number"
                  value={calcPrevScore}
                  onChange={(e) => setCalcPrevScore(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">New Milestone Score</label>
                <Input
                  type="number"
                  value={calcCurrScore}
                  onChange={(e) => setCalcCurrScore(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Calculated Score Difference:</span>
              <span className="font-black text-sm text-[#5e2be2]">
                {Number(calcCurrScore) - Number(calcPrevScore) > 0 ? `+${Number(calcCurrScore) - Number(calcPrevScore)}` : `${Number(calcCurrScore) - Number(calcPrevScore)}`} pts
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCalcModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold cursor-pointer">Run Outcome Engine</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: ITEM RESPONSE BREAKDOWN */}
      <Dialog open={!!itemDetailsScale} onOpenChange={() => setItemDetailsScale(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Eye className="w-5 h-5 text-[#5e2be2]" />
              {itemDetailsScale?.type || "Assessment"} - Line Item Responses
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Item-by-item response breakdown for {client.name} (Latest completed evaluation)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{itemDetailsScale?.name}</span>
                <span className="text-slate-500">Completed: {formatDate(itemDetailsScale?.completedAt || '2026-07-20')}</span>
              </div>
              <Badge className="bg-[#5e2be2] text-white font-bold">
                Score: {itemDetailsScale?.currentScore} / {itemDetailsScale?.maxScore || 21}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Question Responses &amp; Baseline Comparison</h4>
              {((itemDetailsScale?.type && DEMO_QUESTION_BREAKDOWNS[itemDetailsScale.type]) || DEMO_QUESTION_BREAKDOWNS["GAD-7"]).map((item: any, idx: number) => (
                <div key={idx} className={cn("p-3 rounded-xl border text-xs space-y-1.5 transition-colors", item.flagged ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-100 hover:border-purple-100")}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 leading-snug">{item.q}</span>
                    {item.flagged && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] shrink-0 font-bold">
                        Clinical Concern
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Baseline: <strong className="text-slate-700">{item.baseline}</strong></span>
                    <span className="text-slate-500">Latest: <strong className="text-[#5e2be2] font-extrabold">{item.current}</strong> ({item.change})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: ASSIGN THERAPEUTIC ACTIVITY */}
      <Dialog open={assignActivityModalOpen} onOpenChange={setAssignActivityModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Gamepad2 className="w-5 h-5 text-[#5e2be2]" />
              Assign Therapeutic Activity
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign an interactive exercise or practice simulation to {client.name}'s portal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignActivitySubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Activity Title</label>
              <Input
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="e.g. Zen Breath & Focus Chamber"
                className="w-full text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">Exercise Category</label>
                <Select value={activityCategory} onValueChange={setActivityCategory}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINDFULNESS">Mindfulness &amp; Focus</SelectItem>
                    <SelectItem value="CBT">CBT Cognitive Reframe</SelectItem>
                    <SelectItem value="GRATITUDE">Gratitude Jar</SelectItem>
                    <SelectItem value="BREATHING">4-7-8 Breathing Wave</SelectItem>
                    <SelectItem value="SOMATIC">Somatic Muscle Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase">Frequency</label>
                <Select value={activityFrequency} onValueChange={setActivityFrequency}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily Practice</SelectItem>
                    <SelectItem value="3x/Week">3x Per Week</SelectItem>
                    <SelectItem value="Weekly">Weekly Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Due Date</label>
              <Input
                type="date"
                value={activityDueDate}
                onChange={(e) => setActivityDueDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase">Therapist Instructions</label>
              <Input
                value={activityInstructions}
                onChange={(e) => setActivityInstructions(e.target.value)}
                placeholder="Practice guidelines..."
                className="w-full text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignActivityModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold cursor-pointer">Assign Activity</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icon helpers for specific components
function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  )
}

function MessageSquareIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function BookOpenIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

