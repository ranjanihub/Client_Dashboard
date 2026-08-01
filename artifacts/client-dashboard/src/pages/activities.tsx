import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetActivities, useCompleteActivity, getGetActivitiesQueryKey } from '@workspace/api-client-react';
import { pageTransition, staggerContainer, staggerItem, PageHeader, safeFormatDate } from '@/components/shared';
import { Activity as ActivityIcon, CheckCircle2, Clock, Calendar, Wind, BookOpen, Brain, Moon, Heart, Sparkles, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  breathing: Wind,
  journaling: BookOpen,
  mindfulness: Brain,
  sleep: Moon,
  gratitude: Heart,
  cbt: Sparkles,
  reading: BookOpen,
};

export default function ActivitiesPage() {
  const { data: apiActivities, isLoading } = useGetActivities();

  const mockActivities = [
    {
      id: 1,
      title: "Morning Mindfulness Meditation",
      category: "mindfulness",
      description: "10-minute guided breathing session focusing on awareness of breath and physical sensation grounding.",
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
      category: "cbt",
      description: "Document recent anxiety trigger and write a balanced, rational reframe using the 5-column technique.",
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
      category: "gratitude",
      description: "Write down 3 things you felt grateful for today and reflect on why they mattered.",
      dueDate: "Today",
      estimatedMinutes: 8,
      completionPercent: 0,
      difficulty: "Easy",
      status: "pending",
      reflection: null,
      completedAt: null
    },
    {
      id: 4,
      title: "Diaphragmatic Breathing Exercise",
      category: "breathing",
      description: "Practice box breathing (4s in, 4s hold, 4s out, 4s hold) for 5 cycles.",
      dueDate: "Tomorrow",
      estimatedMinutes: 5,
      completionPercent: 100,
      difficulty: "Easy",
      status: "completed",
      reflection: "Felt significantly calmer afterwards.",
      completedAt: new Date().toISOString()
    }
  ];

  const activities = (Array.isArray(apiActivities) && apiActivities.length > 0) ? apiActivities : mockActivities;
  const completeMutation = useCompleteActivity();
  const queryClient = useQueryClient();
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');

  const handleComplete = (id: number) => {
    completeMutation.mutate({ id, data: { reflection } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetActivitiesQueryKey() });
        setActiveActivityId(null);
        setReflection('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <PageHeader title="Activities" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted rounded-[24px]"></div>)}
        </div>
      </div>
    );
  }

  const pendingActivities = activities?.filter(a => a.status !== 'completed') || [];
  const completedActivities = activities?.filter(a => a.status === 'completed') || [];

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto space-y-12 pb-12">
      <PageHeader title="Activities" description="Daily exercises tailored to your wellness goals." />

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary" /> Pending Activities
        </h2>
        
        {pendingActivities.length === 0 ? (
          <div className="hex-card !py-12 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-4" />
            <h3 className="text-xl font-bold">All caught up!</h3>
            <p className="text-muted-foreground mt-2">You have completed all your pending activities.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingActivities.map((activity) => {
              const Icon = CATEGORY_ICONS[activity.category] || ActivityIcon;
              const isCompleting = activeActivityId === activity.id;
              
              return (
                <motion.div key={activity.id} variants={staggerItem} className="hex-card flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-2">
                    {activity.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4" /> {activity.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4" /> Due {safeFormatDate(activity.dueDate, 'MMM d')}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {isCompleting ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-accent rounded-xl p-4 mt-2 overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-sm text-primary">Quick Reflection (Optional)</h4>
                          <button onClick={() => setActiveActivityId(null)} className="text-muted-foreground hover:text-primary">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={reflection}
                          onChange={(e) => setReflection(e.target.value)}
                          placeholder="How did this activity make you feel?"
                          className="w-full bg-white border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px] mb-3"
                        />
                        <button
                          onClick={() => handleComplete(activity.id)}
                          disabled={completeMutation.isPending}
                          className="w-full hex-button-primary h-10 text-sm gap-2"
                        >
                          <Send className="w-4 h-4" /> Complete Activity
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveActivityId(activity.id)}
                        className="hex-button-secondary w-full"
                      >
                        Start Activity
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {completedActivities.length > 0 && (
        <section className="pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-success" /> Completed Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedActivities.map((activity) => (
              <div key={activity.id} className="hex-card !p-5 bg-muted/30 border border-transparent hover:border-border shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-foreground truncate">{activity.title}</h3>
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 ml-2" />
                </div>
                {activity.completedAt && (
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Completed on {safeFormatDate(activity.completedAt, 'MMM d, yyyy')}
                  </p>
                )}
                {activity.reflection && (
                  <div className="bg-white rounded-lg p-3 text-sm text-muted-foreground italic border border-border/50">
                    "{activity.reflection}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
