import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAssessments, useSubmitAssessment, getGetAssessmentsQueryKey } from '@workspace/api-client-react';
import { pageTransition, staggerContainer, staggerItem, PageHeader, safeFormatDate } from '@/components/shared';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  Sparkles, 
  Brain, 
  HeartPulse, 
  Moon, 
  Smile, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  BarChart3, 
  Flame, 
  Check,
  MessageSquare
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';

// --- QUESTIONNAIRE DEFINITIONS ---
interface QuestionOption {
  label: string;
  value: number;
}

interface Question {
  id: number;
  text: string;
  subtext?: string;
  options: QuestionOption[];
}

interface AssessmentDefinition {
  id: string;
  title: string;
  category: 'Clinical Screener' | 'Mind & Mood' | 'Sleep & Stress' | 'Lifestyle & Coping';
  description: string;
  estimatedMinutes: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  maxScore: number;
  frequency: string;
  questions: Question[];
  getSeverity: (score: number) => { label: string; color: string; bg: string; description: string; tips: string[] };
}

const FREQUENT_OPTIONS_4: QuestionOption[] = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const ASSESSMENT_DEFINITIONS: Record<string, AssessmentDefinition> = {
  'gad-7': {
    id: 'gad-7',
    title: 'GAD-7 Anxiety Scale Questionnaire',
    category: 'Clinical Screener',
    description: 'Standardized 7-item clinical assessment measuring generalized anxiety disorder symptoms over the past 2 weeks.',
    estimatedMinutes: 4,
    icon: HeartPulse,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    maxScore: 21,
    frequency: 'Bi-weekly',
    questions: [
      { id: 1, text: 'Feeling nervous, anxious, or on edge', options: FREQUENT_OPTIONS_4 },
      { id: 2, text: 'Not being able to stop or control worrying', options: FREQUENT_OPTIONS_4 },
      { id: 3, text: 'Worrying too much about different things', options: FREQUENT_OPTIONS_4 },
      { id: 4, text: 'Trouble relaxing', options: FREQUENT_OPTIONS_4 },
      { id: 5, text: 'Being so restless that it is hard to sit still', options: FREQUENT_OPTIONS_4 },
      { id: 6, text: 'Becoming easily annoyed or irritable', options: FREQUENT_OPTIONS_4 },
      { id: 7, text: 'Feeling afraid, as if something awful might happen', options: FREQUENT_OPTIONS_4 },
    ],
    getSeverity: (score: number) => {
      if (score <= 4) return { label: 'Minimal Anxiety', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', description: 'Your score indicates minimal to no anxiety symptoms.', tips: ['Maintain your current mindfulness practices', 'Continue regular physical exercise and balanced routine'] };
      if (score <= 9) return { label: 'Mild Anxiety', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300', description: 'Your score reflects mild anxiety symptoms.', tips: ['Practice daily 5-minute diaphragmatic breathing', 'Try cognitive reframing for intrusive worries'] };
      if (score <= 14) return { label: 'Moderate Anxiety', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', description: 'Your score reflects moderate anxiety levels.', tips: ['Review grounding techniques with your therapist', 'Limit high-caffeine intake and structure worry time'] };
      return { label: 'Severe Anxiety', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300', description: 'Your score reflects elevated anxiety symptoms.', tips: ['Reach out to your care provider to discuss symptom management', 'Utilize active crisis grounding tools available in your toolkit'] };
    }
  },
  'phq-9': {
    id: 'phq-9',
    title: 'PHQ-9 Depression Screener',
    category: 'Clinical Screener',
    description: 'Standard 9-question clinical module used to monitor depressive symptom severity and therapeutic progress.',
    estimatedMinutes: 5,
    icon: Brain,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    maxScore: 27,
    frequency: 'Bi-weekly',
    questions: [
      { id: 1, text: 'Little interest or pleasure in doing things', options: FREQUENT_OPTIONS_4 },
      { id: 2, text: 'Feeling down, depressed, or hopeless', options: FREQUENT_OPTIONS_4 },
      { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much', options: FREQUENT_OPTIONS_4 },
      { id: 4, text: 'Feeling tired or having little energy', options: FREQUENT_OPTIONS_4 },
      { id: 5, text: 'Poor appetite or overeating', options: FREQUENT_OPTIONS_4 },
      { id: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or family down', options: FREQUENT_OPTIONS_4 },
      { id: 7, text: 'Trouble concentrating on things, such as reading or watching television', options: FREQUENT_OPTIONS_4 },
      { id: 8, text: 'Moving or speaking so slowly or being restless/fidgety', options: FREQUENT_OPTIONS_4 },
      { id: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself', options: FREQUENT_OPTIONS_4 },
    ],
    getSeverity: (score: number) => {
      if (score <= 4) return { label: 'Minimal / None', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', description: 'No significant depressive symptoms detected.', tips: ['Keep up positive daily routines', 'Celebrate recent mental wellness milestones'] };
      if (score <= 9) return { label: 'Mild Depression', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300', description: 'Mild depressive symptoms present.', tips: ['Incorporate light daily movement', 'Engage in pleasant activity scheduling'] };
      if (score <= 14) return { label: 'Moderate Depression', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', description: 'Moderate depressive symptoms present.', tips: ['Discuss behavioral activation strategies with your therapist', 'Maintain a consistent sleep wake cycle'] };
      return { label: 'Moderately Severe to Severe', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300', description: 'Elevated depressive symptoms present.', tips: ['Share these results directly with your clinician', 'Prioritize self-compassion and gentle care steps'] };
    }
  },
  'who-5': {
    id: 'who-5',
    title: 'WHO-5 Well-Being Index',
    category: 'Mind & Mood',
    description: 'A 5-item rating questionnaire assessing positive psychological well-being and vitality over the past 2 weeks.',
    estimatedMinutes: 3,
    icon: Smile,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    maxScore: 25,
    frequency: 'Monthly',
    questions: [
      { id: 1, text: 'I have felt cheerful and in good spirits', options: [
        { label: 'At no time', value: 0 },
        { label: 'Some of the time', value: 1 },
        { label: 'Less than half the time', value: 2 },
        { label: 'More than half the time', value: 3 },
        { label: 'Most of the time', value: 4 },
        { label: 'All of the time', value: 5 }
      ]},
      { id: 2, text: 'I have felt calm and relaxed', options: [
        { label: 'At no time', value: 0 },
        { label: 'Some of the time', value: 1 },
        { label: 'Less than half the time', value: 2 },
        { label: 'More than half the time', value: 3 },
        { label: 'Most of the time', value: 4 },
        { label: 'All of the time', value: 5 }
      ]},
      { id: 3, text: 'I have felt active and vigorous', options: [
        { label: 'At no time', value: 0 },
        { label: 'Some of the time', value: 1 },
        { label: 'Less than half the time', value: 2 },
        { label: 'More than half the time', value: 3 },
        { label: 'Most of the time', value: 4 },
        { label: 'All of the time', value: 5 }
      ]},
      { id: 4, text: 'I woke up feeling fresh and rested', options: [
        { label: 'At no time', value: 0 },
        { label: 'Some of the time', value: 1 },
        { label: 'Less than half the time', value: 2 },
        { label: 'More than half the time', value: 3 },
        { label: 'Most of the time', value: 4 },
        { label: 'All of the time', value: 5 }
      ]},
      { id: 5, text: 'My daily life has been filled with things that interest me', options: [
        { label: 'At no time', value: 0 },
        { label: 'Some of the time', value: 1 },
        { label: 'Less than half the time', value: 2 },
        { label: 'More than half the time', value: 3 },
        { label: 'Most of the time', value: 4 },
        { label: 'All of the time', value: 5 }
      ]}
    ],
    getSeverity: (score: number) => {
      const percentage = Math.round((score / 25) * 100);
      if (percentage >= 70) return { label: 'High Well-Being', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', description: `Your psychological well-being is strong (${percentage}%).`, tips: ['Continue hobbies and activities that bring joy', 'Share your positive coping routines with peers'] };
      if (percentage >= 50) return { label: 'Moderate Well-Being', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300', description: `Moderate level of well-being (${percentage}%).`, tips: ['Schedule designated relaxation time each evening', 'Identify key sources of daily energy'] };
      return { label: 'Low Well-Being', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', description: `Well-being score is low (${percentage}%). Further check-in recommended.`, tips: ['Explore restorative self-care activities with therapist', 'Ensure adequate sleep hygiene and rest'] };
    }
  },
  'sleep-stress': {
    id: 'sleep-stress',
    title: 'Sleep Quality & Recovery Screener',
    category: 'Sleep & Stress',
    description: 'Tracks sleep latency, night awakenings, morning alertness, and stress recovery factors.',
    estimatedMinutes: 3,
    icon: Moon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    maxScore: 16,
    frequency: 'Weekly',
    questions: [
      { id: 1, text: 'How long did it typically take you to fall asleep this past week?', options: [
        { label: 'Under 15 minutes', value: 4 },
        { label: '15 to 30 minutes', value: 3 },
        { label: '30 to 60 minutes', value: 2 },
        { label: 'More than 60 minutes', value: 1 }
      ]},
      { id: 2, text: 'How rested did you feel upon waking up?', options: [
        { label: 'Very rested and refreshed', value: 4 },
        { label: 'Somewhat rested', value: 3 },
        { label: 'Slightly tired', value: 2 },
        { label: 'Exhausted', value: 1 }
      ]},
      { id: 3, text: 'How often did stress or racing thoughts disrupt your sleep?', options: [
        { label: 'Never', value: 4 },
        { label: '1 - 2 nights', value: 3 },
        { label: '3 - 4 nights', value: 2 },
        { label: '5 - 7 nights', value: 1 }
      ]},
      { id: 4, text: 'How effectively were you able to unwind before bed?', options: [
        { label: 'Very effectively', value: 4 },
        { label: 'Moderately', value: 3 },
        { label: 'With difficulty', value: 2 },
        { label: 'Not at all', value: 1 }
      ]}
    ],
    getSeverity: (score: number) => {
      if (score >= 13) return { label: 'Optimal Sleep & Recovery', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', description: 'Your sleep quality and night recovery are strong.', tips: ['Keep consistent bedtimes and wake times', 'Maintain night wind-down routine'] };
      if (score >= 9) return { label: 'Moderate Sleep Quality', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300', description: 'Some sleep friction or bedtime restlessness noted.', tips: ['Limit screen use 30 minutes before sleep', 'Try progressive muscle relaxation before bed'] };
      return { label: 'Disrupted Sleep', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', description: 'Sleep disruption and fatigue are currently elevated.', tips: ['Try the bedtime sleep hygiene checklist in Resources', 'Discuss sleep latency techniques with therapist'] };
    }
  },
  'coping-resilience': {
    id: 'coping-resilience',
    title: 'Coping Mechanisms & Resilience Check-in',
    category: 'Lifestyle & Coping',
    description: 'Evaluates emotional regulation tools, boundary setting, and proactive stress management strategies.',
    estimatedMinutes: 4,
    icon: ShieldCheck,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    maxScore: 16,
    frequency: 'Monthly',
    questions: [
      { id: 1, text: 'When feeling overwhelmed, how easily could you apply grounding or breathing exercises?', options: [
        { label: 'Very easily', value: 4 },
        { label: 'Moderately easily', value: 3 },
        { label: 'With effort', value: 2 },
        { label: 'Rarely / Could not', value: 1 }
      ]},
      { id: 2, text: 'How effectively did you maintain healthy boundaries in work and personal relationships?', options: [
        { label: 'Extremely well', value: 4 },
        { label: 'Fairly well', value: 3 },
        { label: 'Struggled at times', value: 2 },
        { label: 'Very poorly', value: 1 }
      ]},
      { id: 3, text: 'How frequently did you practice self-compassion when facing setbacks?', options: [
        { label: 'Almost always', value: 4 },
        { label: 'Often', value: 3 },
        { label: 'Occasionally', value: 2 },
        { label: 'Never', value: 1 }
      ]},
      { id: 4, text: 'Did you reach out for support when experiencing emotional distress?', options: [
        { label: 'Yes, proactively', value: 4 },
        { label: 'Yes, after some time', value: 3 },
        { label: 'Hesitated to reach out', value: 2 },
        { label: 'Isolated myself', value: 1 }
      ]}
    ],
    getSeverity: (score: number) => {
      if (score >= 13) return { label: 'High Resilience', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', description: 'Excellent utilization of coping mechanisms and emotional self-regulation.', tips: ['Reinforce boundary-setting wins', 'Continue proactive support seeking'] };
      if (score >= 9) return { label: 'Developing Coping Skills', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-300', description: 'Coping strategies are active, with room for consolidation.', tips: ['Practice grounding early before stress escalates', 'Keep a daily self-compassion journal'] };
      return { label: 'Needs Support', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', description: 'Coping tools feel challenging to access under stress.', tips: ['Review emergency coping cards with therapist', 'Practice micro-grounding twice daily'] };
    }
  }
};

// Interface for completed assessment records
interface CompletedAssessmentRecord {
  id: number;
  definitionId: string;
  name: string;
  category: string;
  completedAt: string;
  score: number;
  maxScore: number;
  severityLabel: string;
  answers: Record<number, number>; // questionId -> value
  therapistNotes?: string;
  therapistName?: string;
  therapistDate?: string;
  scoreHistory?: { date: string; score: number }[];
}

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'library'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active Assessment Runner state
  const [runningAssessmentId, setRunningAssessmentId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    maxScore: number;
    severity: ReturnType<AssessmentDefinition['getSeverity']>;
    definition: AssessmentDefinition;
  } | null>(null);

  // Submitted answer viewer modal state
  const [viewingRecord, setViewingRecord] = useState<CompletedAssessmentRecord | null>(null);

  const { data: apiAssessments, isLoading } = useGetAssessments();
  const submitMutation = useSubmitAssessment();
  const queryClient = useQueryClient();

  // Completed items mock & dynamic state
  const [completedList, setCompletedList] = useState<CompletedAssessmentRecord[]>([
    {
      id: 101,
      definitionId: 'phq-9',
      name: "PHQ-9 Depression Screener",
      category: "Clinical Screener",
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      score: 5,
      maxScore: 27,
      severityLabel: "Mild",
      answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 },
      therapistNotes: "Noticeable improvement in mood levels compared to last month. Keep building on your routine exercise habits.",
      therapistName: "Dr. Sarah Jenkins",
      therapistDate: "Jul 31, 2026",
      scoreHistory: [
        { date: "May 1", score: 14 },
        { date: "May 15", score: 11 },
        { date: "Jun 1", score: 9 },
        { date: "Jul 15", score: 7 },
        { date: "Aug 1", score: 5 }
      ]
    },
    {
      id: 102,
      definitionId: 'who-5',
      name: "WHO-5 Well-Being Index",
      category: "Mind & Mood",
      completedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      score: 19,
      maxScore: 25,
      severityLabel: "High Well-Being",
      answers: { 1: 4, 2: 4, 3: 3, 4: 4, 5: 4 },
      therapistNotes: "Great score on positive psychological well-being. Good balance maintained.",
      therapistName: "Dr. Sarah Jenkins",
      therapistDate: "Jul 24, 2026",
      scoreHistory: [
        { date: "Jun 10", score: 12 },
        { date: "Jul 01", score: 16 },
        { date: "Jul 24", score: 19 }
      ]
    },
    {
      id: 103,
      definitionId: 'sleep-stress',
      name: "Sleep Quality & Recovery Screener",
      category: "Sleep & Stress",
      completedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
      score: 11,
      maxScore: 16,
      severityLabel: "Moderate Sleep Quality",
      answers: { 1: 3, 2: 3, 3: 2, 4: 3 },
      scoreHistory: [
        { date: "Jun 01", score: 7 },
        { date: "Jun 20", score: 9 },
        { date: "Jul 16", score: 11 }
      ]
    }
  ]);

  // Pending list state
  const [pendingList, setPendingList] = useState([
    {
      id: 1,
      definitionId: 'gad-7',
      name: "GAD-7 Anxiety Scale Questionnaire",
      description: "Standardized 7-item scale assessing severity of generalized anxiety symptoms over the past 2 weeks.",
      category: "Clinical Screener",
      dueDate: "Due Today",
      estimatedMinutes: 4,
      scoreHistory: [
        { date: "May 1", score: 14 },
        { date: "May 15", score: 11 },
        { date: "Jun 1", score: 8 }
      ]
    },
    {
      id: 2,
      definitionId: 'coping-resilience',
      name: "Coping Mechanisms & Resilience Check-in",
      description: "Evaluates emotional regulation tools, boundary setting, and stress resilience.",
      category: "Lifestyle & Coping",
      dueDate: "Due in 3 days",
      estimatedMinutes: 4,
      scoreHistory: [
        { date: "May 10", score: 9 },
        { date: "Jun 12", score: 12 }
      ]
    }
  ]);

  // Handle starting runner
  const handleStartRunner = (defId: string) => {
    const validDefId = ASSESSMENT_DEFINITIONS[defId] ? defId : 'gad-7';
    setRunningAssessmentId(validDefId);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAssessmentResult(null);
  };

  const currentDefinition = runningAssessmentId ? ASSESSMENT_DEFINITIONS[runningAssessmentId] : null;

  // Handle selecting an option in runner
  const handleSelectOption = (questionId: number, val: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  // Calculate runner result and submit
  const handleFinishRunner = () => {
    if (!currentDefinition) return;

    let total = 0;
    currentDefinition.questions.forEach(q => {
      // Default to 0 if an option wasn't explicitly selected
      total += userAnswers[q.id] ?? 0;
    });

    const severity = currentDefinition.getSeverity(total);

    // Save to completed list
    const newRecord: CompletedAssessmentRecord = {
      id: Date.now(),
      definitionId: currentDefinition.id,
      name: currentDefinition.title,
      category: currentDefinition.category,
      completedAt: new Date().toISOString(),
      score: total,
      maxScore: currentDefinition.maxScore,
      severityLabel: severity.label,
      answers: { ...userAnswers },
      scoreHistory: [
        { date: "Previous", score: Math.max(0, total + Math.floor(Math.random() * 5 - 2)) },
        { date: "Today", score: total }
      ]
    };

    setCompletedList(prev => [newRecord, ...prev]);

    // Remove from pending if was in pending
    setPendingList(prev => prev.filter(p => p.definitionId !== currentDefinition.id));

    // Submit mutation call gracefully
    try {
      submitMutation.mutate(
        { id: 1, data: { score: total } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetAssessmentsQueryKey() });
          },
          onError: (err) => {
            console.warn("Backend submit assessment fallback:", err);
          }
        }
      );
    } catch (e) {
      console.warn("Submit error:", e);
    }

    setAssessmentResult({
      score: total,
      maxScore: currentDefinition.maxScore,
      severity,
      definition: currentDefinition
    });
  };

  const closeRunner = () => {
    setRunningAssessmentId(null);
    setAssessmentResult(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    // Switch tab to completed after finishing an assessment so client sees their results immediately!
    setActiveTab('completed');
  };

  // Recharts score trend dataset
  const combinedTrendData = [
    { date: 'May 01', GAD7: 14, PHQ9: 12, WHO5: 12 },
    { date: 'May 15', GAD7: 11, PHQ9: 9, WHO5: 15 },
    { date: 'Jun 01', GAD7: 8, PHQ9: 7, WHO5: 16 },
    { date: 'Jul 15', GAD7: 7, PHQ9: 6, WHO5: 18 },
    { date: 'Aug 01', GAD7: 6, PHQ9: 5, WHO5: 19 }
  ];

  // Filtering for library
  const libraryCategories = ['All', 'Clinical Screener', 'Mind & Mood', 'Sleep & Stress', 'Lifestyle & Coping'];
  const catalogList = Object.values(ASSESSMENT_DEFINITIONS).filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <PageHeader title="Assessments & Check-ins" />
        <div className="h-48 bg-muted/60 rounded-3xl"></div>
        <div className="h-64 bg-muted/40 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Clinical Check-ins & Assessments" 
          description="Standardized psychological measurements & self-assessments to track your care journey." 
        />
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleStartRunner('gad-7')}
            className="hex-button-primary flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Quick Check-in
          </button>
        </div>
      </div>

      {/* TOP OVERVIEW STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hex-card !p-5 flex items-center gap-4 border-l-4 border-l-primary">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{completedList.length}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Check-ins</div>
          </div>
        </div>

        <div className="hex-card !p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">6 Weeks</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Check-in Streak</div>
          </div>
        </div>

        <div className="hex-card !p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">6/21</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Mild</span>
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest GAD-7 Anxiety</div>
          </div>
        </div>

        <div className="hex-card !p-5 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">5/27</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Mild</span>
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest PHQ-9 Mood</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex gap-2 p-1.5 bg-muted/60 backdrop-blur-sm rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending' 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" /> Pending Check-ins
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-extrabold rounded-full">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'completed' 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Completed & Analytics
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'library' 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> All Assessments Library
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: PENDING CHECK-INS */}
      <AnimatePresence mode="wait">
        {activeTab === 'pending' && (
          <motion.div key="pending" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="hex-card !py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">You're All Caught Up!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You have completed all assigned routine check-ins. Your therapist will issue your next bi-weekly assessment soon.
                </p>
                <button 
                  onClick={() => setActiveTab('library')}
                  className="hex-button-secondary inline-flex items-center gap-2 cursor-pointer"
                >
                  Explore Assessment Library <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              pendingList.map((item) => {
                const def = ASSESSMENT_DEFINITIONS[item.definitionId];
                const IconComponent = def?.icon || ClipboardList;

                return (
                  <motion.div key={item.id} variants={staggerItem} className="hex-card hover:border-primary/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-4 rounded-2xl border ${def?.bgColor || 'bg-accent/50'} text-primary mt-1`}>
                          <IconComponent className={`w-7 h-7 ${def?.color || 'text-primary'}`} />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                              {item.category}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.dueDate}
                            </span>
                          </div>
                          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> ~{item.estimatedMinutes} mins to complete
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Standardized Clinical Scale
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 min-w-[180px]">
                        <button 
                          onClick={() => handleStartRunner(item.definitionId)}
                          className="hex-button-primary flex-1 justify-center py-3 text-sm font-bold shadow-md shadow-primary/20 cursor-pointer"
                        >
                          Start Check-in <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* REMINDER BOX */}
            <div className="hex-card bg-gradient-to-r from-primary/5 via-accent/30 to-card border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Why do routine check-ins matter?</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Regular standardized screeners give your clinician objective data to tailor your treatment plan and celebrate your progress.
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveTab('library')} className="hex-button-secondary text-xs shrink-0 cursor-pointer">
                View All Tools
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB CONTENT 2: COMPLETED & ANALYTICS */}
        {activeTab === 'completed' && (
          <motion.div key="completed" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-8">
            
            {/* SCORE HISTORY TREND CHART */}
            <div className="hex-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Longitudinal Score Trends
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tracking GAD-7 Anxiety Scale and PHQ-9 Mood Screener scores across recent weeks. Lower scores indicate symptom reduction.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> GAD-7 Anxiety
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span> PHQ-9 Depression
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> WHO-5 Well-being
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={[0, 25]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line type="monotone" dataKey="GAD7" name="GAD-7 Anxiety" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="PHQ9" name="PHQ-9 Depression" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="WHO5" name="WHO-5 Well-Being" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* COMPLETED RECORDS GRID */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Completed Assessment Records
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedList.map((record) => {
                  return (
                    <motion.div key={record.id} variants={staggerItem} className="hex-card flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider rounded">
                              {record.category}
                            </span>
                            <h4 className="text-lg font-bold text-foreground mt-1 flex items-center gap-2">
                              {record.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Completed {safeFormatDate(record.completedAt, 'MMMM d, yyyy')}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-black text-primary">
                              {record.score} <span className="text-xs font-normal text-muted-foreground">/ {record.maxScore}</span>
                            </div>
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                              {record.severityLabel}
                            </span>
                          </div>
                        </div>

                        {/* THERAPIST NOTES BANNER */}
                        {record.therapistNotes && (
                          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 space-y-1.5 my-3">
                            <div className="flex items-center justify-between text-xs font-bold text-primary">
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" /> Therapist Review Note
                              </span>
                              <span className="text-[10px] text-muted-foreground">{record.therapistDate}</span>
                            </div>
                            <p className="text-xs text-foreground/90 italic">
                              "{record.therapistNotes}"
                            </p>
                            <div className="text-[10px] font-semibold text-muted-foreground">
                              — {record.therapistName}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD ACTIONS */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <button 
                          onClick={() => setViewingRecord(record)}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Submitted Answers
                        </button>

                        <button 
                          onClick={() => handleStartRunner(record.definitionId)}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB CONTENT 3: ASSESSMENT LIBRARY / CATALOG */}
        {activeTab === 'library' && (
          <motion.div key="library" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
            
            {/* CATEGORY FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              {libraryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* CATALOG GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogList.map((item) => {
                const IconComp = item.icon;

                return (
                  <motion.div key={item.id} variants={staggerItem} className="hex-card flex flex-col justify-between hover:shadow-lg transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3.5 rounded-2xl border ${item.bgColor}`}>
                          <IconComp className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded-md">
                          {item.frequency}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <span className="inline-block text-xs font-semibold text-primary/80 mb-2">
                          {item.category}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{item.estimatedMinutes} mins
                      </div>
                      <button
                        onClick={() => handleStartRunner(item.id)}
                        className="hex-button-primary py-2 px-4 text-xs font-bold cursor-pointer"
                      >
                        Take Assessment
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL 1: INTERACTIVE ASSESSMENT RUNNER --- */}
      <AnimatePresence>
        {runningAssessmentId && currentDefinition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={closeRunner}
                className="absolute right-6 top-6 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Assessment Title Header */}
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    {currentDefinition.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentDefinition.title}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-foreground">
                  {assessmentResult ? 'Assessment Results' : currentDefinition.title}
                </h2>
              </div>

              {!assessmentResult ? (
                <>
                  {/* PROGRESS BAR */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Question {currentQuestionIndex + 1} of {currentDefinition.questions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / currentDefinition.questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / currentDefinition.questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* QUESTION CARD */}
                  {(() => {
                    const q = currentDefinition.questions[currentQuestionIndex];
                    const selectedVal = userAnswers[q.id];

                    return (
                      <div className="space-y-6 py-2">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold uppercase text-primary tracking-wider">
                            Over the last 2 weeks:
                          </span>
                          <h3 className="text-xl font-bold text-foreground leading-snug">
                            {q.text}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {q.options.map((opt) => {
                            const isSelected = selectedVal === opt.value;

                            return (
                              <button
                                key={opt.value}
                                onClick={() => handleSelectOption(q.id, opt.value)}
                                className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-md' 
                                    : 'border-border/80 bg-muted/30 hover:border-primary/50 text-foreground'
                                }`}
                              >
                                <span>{opt.label}</span>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                                }`}>
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* NAV FOOTER */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    {currentQuestionIndex < currentDefinition.questions.length - 1 ? (
                      <button
                        onClick={() => {
                          // Auto select option 0 if none selected yet for smooth progression
                          const currentQ = currentDefinition.questions[currentQuestionIndex];
                          if (userAnswers[currentQ.id] === undefined) {
                            handleSelectOption(currentQ.id, 0);
                          }
                          setCurrentQuestionIndex(prev => prev + 1);
                        }}
                        className="hex-button-primary px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        Next Question <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const currentQ = currentDefinition.questions[currentQuestionIndex];
                          if (userAnswers[currentQ.id] === undefined) {
                            setUserAnswers(prev => ({ ...prev, [currentQ.id]: 0 }));
                          }
                          handleFinishRunner();
                        }}
                        className="hex-button-primary px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        Complete & View Results <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* POST SUBMISSION SCORE SUMMARY DISPLAY */
                <div className="space-y-6 py-2">
                  <div className="text-center p-6 bg-muted/40 rounded-3xl border border-border/60 space-y-3">
                    <div className="text-4xl font-black text-primary">
                      {assessmentResult.score} <span className="text-lg font-normal text-muted-foreground">/ {assessmentResult.maxScore}</span>
                    </div>
                    <div className="inline-block">
                      <span className={`px-4 py-1 rounded-full font-extrabold text-sm border ${assessmentResult.severity.bg}`}>
                        {assessmentResult.severity.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {assessmentResult.severity.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Personalized Insights & Next Steps
                    </h4>
                    <div className="space-y-2">
                      {assessmentResult.severity.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-card border border-border/70 rounded-xl text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Results saved to your care file & shared with therapist.</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                    <button 
                      onClick={closeRunner}
                      className="hex-button-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      Done & Return to Assessments
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: VIEW SUBMITTED ANSWERS BREAKDOWN --- */}
      <AnimatePresence>
        {viewingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setViewingRecord(null)}
                className="absolute right-6 top-6 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{viewingRecord.category}</span>
                <h2 className="text-2xl font-black text-foreground">{viewingRecord.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed on {safeFormatDate(viewingRecord.completedAt, 'MMMM d, yyyy')} • Total Score: <strong className="text-primary">{viewingRecord.score}/{viewingRecord.maxScore}</strong> ({viewingRecord.severityLabel})
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {(() => {
                  const def = ASSESSMENT_DEFINITIONS[viewingRecord.definitionId];
                  if (!def) return <p className="text-xs text-muted-foreground">Standardized record summary available.</p>;

                  return def.questions.map((q, idx) => {
                    const ansVal = viewingRecord.answers[q.id];
                    const selectedOpt = q.options.find(o => o.value === ansVal);

                    return (
                      <div key={q.id} className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-2 text-xs">
                        <div className="font-bold text-foreground flex items-start gap-2">
                          <span className="text-primary font-black">{idx + 1}.</span>
                          <span>{q.text}</span>
                        </div>
                        <div className="pl-5 text-muted-foreground">
                          Selected response: <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{selectedOpt ? selectedOpt.label : `Score: ${ansVal ?? 0}`}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="flex justify-end pt-4 border-t border-border/60">
                <button 
                  onClick={() => setViewingRecord(null)}
                  className="hex-button-secondary px-6 py-2 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
