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

const CATEGORY_IMAGES: Record<string, string> = {
  breathing: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80",
  journaling: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
  mindfulness: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
  sleep: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=600&auto=format&fit=crop&q=80",
  gratitude: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80",
  cbt: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80",
  reading: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-muted rounded-[24px]"></div>)}
        </div>
      </div>
    );
  }

  const pendingActivities = activities?.filter(a => a.status !== 'completed') || [];
  const completedActivities = activities?.filter(a => a.status === 'completed') || [];

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-10 pb-12">
      <PageHeader title="Activities" description="Daily exercises tailored to your wellness goals." />

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary" /> Pending Activities
        </h2>
        
        {pendingActivities.length === 0 ? (
          <div className="hex-card !py-16 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-4" />
            <h3 className="text-xl font-bold">All caught up!</h3>
            <p className="text-muted-foreground mt-2">You have completed all your pending activities.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingActivities.map((activity) => {
              const Icon = CATEGORY_ICONS[activity.category] || ActivityIcon;
              const isCompleting = activeActivityId === activity.id;
              const thumbnail = (activity as any).thumbnailUrl || CATEGORY_IMAGES[activity.category] || CATEGORY_IMAGES.mindfulness;
              
              return (
                <motion.div key={activity.id} variants={staggerItem} className="hex-card !p-0 overflow-hidden flex flex-col group">
                  {/* Image header matching Resources page */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img src={thumbnail} alt={activity.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    
                    {/* Top category badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-foreground rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Icon className="w-3.5 h-3.5 text-primary" /> {activity.category}
                      </span>
                    </div>

                    {/* Top right difficulty badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-foreground rounded-full text-xs font-bold shadow-sm">
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                      {activity.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-4 pt-3 border-t border-border">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" /> {activity.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" /> {safeFormatDate(activity.dueDate, 'MMM d')}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      {isCompleting ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-accent rounded-xl p-4 overflow-hidden"
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
                  </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedActivities.map((activity) => {
              const Icon = CATEGORY_ICONS[activity.category] || ActivityIcon;
              const thumbnail = (activity as any).thumbnailUrl || CATEGORY_IMAGES[activity.category] || CATEGORY_IMAGES.mindfulness;

              return (
                <div key={activity.id} className="hex-card !p-0 overflow-hidden flex flex-col group opacity-85 hover:opacity-100 transition-opacity">
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <img src={thumbnail} alt={activity.title} className="w-full h-full object-cover filter grayscale-[30%]" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-foreground rounded-full text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm">
                        <Icon className="w-3.5 h-3.5 text-primary" /> {activity.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-foreground mb-1">{activity.title}</h3>
                    {activity.completedAt && (
                      <p className="text-xs font-medium text-muted-foreground mb-3">
                        Completed on {safeFormatDate(activity.completedAt, 'MMM d, yyyy')}
                      </p>
                    )}
                    {activity.reflection && (
                      <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground italic border border-border/50">
                        "{activity.reflection}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
