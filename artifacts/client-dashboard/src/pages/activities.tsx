import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  Sparkles, 
  Search, 
  Brain, 
  Heart, 
  Wind, 
  Smile, 
  Play,
  Repeat,
  BookOpen,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { ActivityGamePlayer } from "@/components/activity-game-player";
import { cn } from "@/lib/utils";
import { getUserActivities } from "@/lib/client-store";
import { getClientAuth } from "@/lib/auth";

export interface ClientAssignment {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  frequency: string;
  timeOfDay?: string;
}

export interface ActivityItem {
  id: number | string;
  title: string;
  description: string;
  category: "MINDFULNESS" | "CBT" | "GRATITUDE" | "BREATHING" | "SOMATIC" | string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  duration: string;
  dueDate: string;
  imageUrl: string;
  status: "pending" | "completed" | string;
  instructions?: string;
  completedAt?: string | null;
  assignedTo?: string[];
  clientAssignments?: ClientAssignment[];
  assignedClientName?: string;
  assignedClientEmail?: string;
  assignedTherapistName?: string;
  assignedTherapistId?: string;
  frequency?: string;
  timeOfDay?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "ACT-01",
    title: "5-4-3-2-1 Grounding Technique",
    description: "10-minute guided breathing session focusing on awareness of breath, sensory details (5 Sights, 4 Touches, 3 Sounds, 2 Scents, 1 Taste), and body sensations.",
    category: "MINDFULNESS",
    difficulty: "Easy",
    duration: "10 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Look around and name 5 things you can see.\n2. Touch and observe 4 physical textures.\n3. Tune in and listen to 3 distinct sounds.\n4. Take a slow breath and notice 2 scents.\n5. Notice 1 taste or take a refreshing sip of water.",
    assignedTo: ["Sarah Jenkins"],
    clientAssignments: [
      { clientName: "Sarah Jenkins", frequency: "Daily", timeOfDay: "Morning (8:00 AM)" }
    ],
    frequency: "Daily",
    timeOfDay: "Morning (8:00 AM)"
  },
  {
    id: "ACT-02",
    title: "CBT Automatic Thought Record",
    description: "Document recent anxiety trigger and write a balanced, rational reframe using Beck 5-column cognitive distortion analysis.",
    category: "CBT",
    difficulty: "Medium",
    duration: "15 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Record the triggering situation (Where were you? Who was there?).\n2. Catch your automatic thought and rate its emotional intensity (0-100%).\n3. Identify cognitive distortions (catastrophizing, all-or-nothing, mind reading).\n4. Challenge the thought with objective evidence.\n5. Formulate a realistic replacement thought.",
    assignedTo: ["Emily Rodriguez"],
    clientAssignments: [
      { clientName: "Emily Rodriguez", frequency: "2-3 Times / Week", timeOfDay: "Evening (7:00 PM)" }
    ],
    frequency: "2-3 Times / Week",
    timeOfDay: "Evening (7:00 PM)"
  },
  {
    id: "ACT-03",
    title: "Progressive Muscle Relaxation (PMR)",
    description: "Systematically tense and release muscle groups from toes to head to dissolve physical anxiety and somatic stress.",
    category: "SOMATIC",
    difficulty: "Easy",
    duration: "12 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Settle into a comfortable reclining position.\n2. Tense your feet/toes firmly for 5 seconds, then release completely for 10 seconds.\n3. Progress upwards through calves, thighs, abdomen, chest, shoulders, and face.\n4. Observe the contrast between tension and deep soothing relaxation.",
    assignedTo: ["Amanda Miller"],
    clientAssignments: [
      { clientName: "Amanda Miller", frequency: "Daily", timeOfDay: "Evening (7:00 PM)" }
    ],
    frequency: "Daily",
    timeOfDay: "Evening (7:00 PM)"
  },
  {
    id: "ACT-04",
    title: "Fear Hierarchy & Exposure Ladder",
    description: "Hierarchy ladder for anxiety triggers using SUDS 0-100 graded exposure steps and habituation tracking.",
    category: "EXPOSURE",
    difficulty: "Advanced",
    duration: "25 min",
    dueDate: "Tomorrow",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Define your primary fear target.\n2. Break the situation down into 5 graded steps from mild (SUDS 20) to severe (SUDS 90).\n3. Complete repeated trials on the current rung until anxiety drops by 50% before climbing.",
    assignedTo: ["Robert Garcia"],
    clientAssignments: [
      { clientName: "Robert Garcia", frequency: "Weekly", timeOfDay: "Afternoon (1:00 PM)" }
    ],
    frequency: "Weekly",
    timeOfDay: "Afternoon (1:00 PM)"
  },
  {
    id: "ACT-05",
    title: "Behavioral Activation Tracker",
    description: "Schedule rewarding daily activities, track mood changes, and monitor Pleasure & Mastery scores.",
    category: "BEHAVIORAL",
    difficulty: "Medium",
    duration: "12 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Identify 3 small meaningful actions you can take today.\n2. Rate anticipated Pleasure (0-10) and Mastery (0-10).\n3. Log your actual mood shift immediately after finishing.",
    assignedTo: ["Michael Chen"],
    clientAssignments: [
      { clientName: "Michael Chen", frequency: "Daily", timeOfDay: "Morning (8:00 AM)" }
    ],
    frequency: "Daily",
    timeOfDay: "Morning (8:00 AM)"
  },
  {
    id: "ACT-06",
    title: "4-7-8 Parasympathetic Breathing",
    description: "Calm your nervous system using rhythmic 4-second inhale, 7-second hold, and 8-second exhale wave cycles.",
    category: "BREATHING",
    difficulty: "Easy",
    duration: "5 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Inhale silently through your nose for 4 seconds.\n2. Hold your breath gently for 7 seconds.\n3. Exhale completely through your mouth for 8 seconds. Complete 4 consecutive cycles.",
    assignedTo: ["Sarah Jenkins"],
    clientAssignments: [
      { clientName: "Sarah Jenkins", frequency: "As Needed (PRN)", timeOfDay: "Any Time" }
    ],
    frequency: "As Needed (PRN)",
    timeOfDay: "Any Time"
  },
  {
    id: "ACT-07",
    title: "Daily Gratitude Journal & Reflection",
    description: "Write down 3 things you felt grateful for today and reflect on why they brought meaning, joy, or relief.",
    category: "GRATITUDE",
    difficulty: "Easy",
    duration: "8 min",
    dueDate: "Today",
    imageUrl: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    instructions: "1. Take 2 slow abdominal breaths.\n2. Write down 3 specific moments from today that brought warmth, satisfaction, or relief.\n3. Reflect on *why* they mattered to absorb positive emotions.",
    assignedTo: ["Amanda Miller"],
    clientAssignments: [
      { clientName: "Amanda Miller", frequency: "Daily", timeOfDay: "Before Bed (10:00 PM)" }
    ],
    frequency: "Daily",
    timeOfDay: "Before Bed (10:00 PM)"
  }
];

const CATEGORIES = ["All", "MINDFULNESS", "CBT", "GRATITUDE", "BREATHING", "SOMATIC", "EXPOSURE", "BEHAVIORAL"];

export default function ActivitiesPage() {
  const { toast } = useToast();
  const authUser = getClientAuth();
  const myName = authUser?.name || "Client User";
  const myEmail = (authUser?.email || "").toLowerCase().trim();
  const myTherapistName = authUser?.assignedTherapistName || "Assigned Therapist";

  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [assignedNotifs, setAssignedNotifs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Preview / Game Modal State
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [previewTab, setPreviewTab] = useState<"game" | "instructions">("game");

  // Load activities from MongoDB Atlas API & Notifications & localStorage
  useEffect(() => {
    let isMounted = true;
    async function loadActivities() {
      try {
        const [actRes, notifRes] = await Promise.all([
          fetch("/api/activities").catch(() => null),
          fetch(`/api/notifications?role=CLIENT&recipientEmail=${encodeURIComponent(myEmail)}`).catch(() => null)
        ]);

        let notifList: any[] = [];
        if (notifRes && notifRes.ok) {
          const notifData = await notifRes.json().catch(() => null);
          if (Array.isArray(notifData?.notifications)) {
            notifList = notifData.notifications.filter((n: any) => {
              const isAssignedType = n.type === 'ACTIVITY_ASSIGNED' || n.type === 'activity';
              const rEmail = String(n.recipientEmail || n.clientEmail || '').toLowerCase().trim();
              const rName = String(n.clientName || n.recipientName || '').toLowerCase().trim();
              const matchesMe = !rEmail || rEmail === myEmail || (myName && (rName.includes(myName.toLowerCase()) || myName.toLowerCase().includes(rName)));
              return isAssignedType && matchesMe;
            });
          }
        }

        if (notifList.length === 0) {
          try {
            const raw = localStorage.getItem('notifications') || localStorage.getItem('user_notifications');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                notifList = parsed.filter((n: any) => n.type === 'ACTIVITY_ASSIGNED');
              }
            }
          } catch {}
        }

        if (isMounted) {
          setAssignedNotifs(notifList);
        }

        let rawActivities: any[] = [];
        if (actRes && actRes.ok) {
          const data = await actRes.json().catch(() => null);
          rawActivities = Array.isArray(data?.activities) ? data.activities : [];
        }

        const formatted: ActivityItem[] = (rawActivities.length > 0 ? rawActivities : INITIAL_ACTIVITIES).map((a: any, idx: number) => ({
          id: a.id || a._id || idx + 1,
          title: a.title || a.name || "Clinical Activity",
          description: a.description || "Guided therapeutic session.",
          category: (a.categoryTag || a.category || "MINDFULNESS").toUpperCase(),
          difficulty: a.difficulty || "Easy",
          duration: a.duration || "10 min",
          dueDate: a.dueDate || "Today",
          imageUrl: a.imageUrl || a.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
          status: a.status || "pending",
          instructions: a.instructions || a.description || "",
          assignedTo: Array.isArray(a.assignedTo) ? a.assignedTo : a.assignedTo ? [a.assignedTo] : [],
          clientAssignments: Array.isArray(a.clientAssignments) ? a.clientAssignments : [],
          assignedClientName: a.assignedClientName,
          assignedClientEmail: a.assignedClientEmail,
          assignedTherapistName: a.assignedTherapistName || myTherapistName,
          assignedTherapistId: a.assignedTherapistId,
          frequency: a.repeat || a.frequency || "Daily",
          timeOfDay: a.timeOfDay || "Morning (8:00 AM)"
        }));

        const titleMap = new Map<string, ActivityItem>();
        INITIAL_ACTIVITIES.forEach(init => {
          titleMap.set(init.title.toLowerCase().trim(), { ...init });
        });
        formatted.forEach(item => {
          titleMap.set(item.title.toLowerCase().trim(), { ...titleMap.get(item.title.toLowerCase().trim()), ...item });
        });

        // Merge and mark activities from assignment notifications
        notifList.forEach(notif => {
          const nTitle = String(notif.activityTitle || notif.title || '')
            .replace(/⚡/g, '')
            .replace(/New Activity Assigned:\s*/i, '')
            .trim();
          const nId = String(notif.activityId || notif.id || '');
          const lowerNTitle = nTitle.toLowerCase();

          let matchedItem: ActivityItem | undefined;
          for (const [key, item] of titleMap.entries()) {
            if (String(item.id) === nId || key === lowerNTitle || (lowerNTitle && (key.includes(lowerNTitle) || lowerNTitle.includes(key)))) {
              matchedItem = item;
              break;
            }
          }

          if (matchedItem) {
            matchedItem.assignedTo = Array.from(new Set([...(matchedItem.assignedTo || []), myName]));
            matchedItem.clientAssignments = [
              ...(matchedItem.clientAssignments || []).filter((ca: any) => String(ca.clientEmail || '').toLowerCase() !== myEmail),
              {
                clientName: myName,
                clientEmail: myEmail,
                frequency: notif.frequency || matchedItem.frequency || 'Daily',
                timeOfDay: notif.timeOfDay || matchedItem.timeOfDay || 'Morning (8:00 AM)'
              }
            ];
            matchedItem.frequency = notif.frequency || matchedItem.frequency || 'Daily';
            matchedItem.timeOfDay = notif.timeOfDay || matchedItem.timeOfDay || 'Morning (8:00 AM)';
            if (notif.consultantName) {
              matchedItem.assignedTherapistName = notif.consultantName;
            }
          } else if (nTitle) {
            const newAct: ActivityItem = {
              id: notif.activityId || `ACT-${Date.now()}`,
              title: nTitle,
              description: notif.message || 'Guided therapeutic exercise assigned by your consultant.',
              category: (notif.category || 'MINDFULNESS').toUpperCase(),
              difficulty: 'Easy',
              duration: notif.duration || '10 min',
              dueDate: 'Today',
              imageUrl: notif.imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
              status: 'pending',
              assignedTo: [myName],
              clientAssignments: [{
                clientName: myName,
                clientEmail: myEmail,
                frequency: notif.frequency || 'Daily',
                timeOfDay: notif.timeOfDay || 'Morning (8:00 AM)'
              }],
              assignedTherapistName: notif.consultantName || myTherapistName,
              frequency: notif.frequency || 'Daily',
              timeOfDay: notif.timeOfDay || 'Morning (8:00 AM)'
            };
            titleMap.set(nTitle.toLowerCase(), newAct);
          }
        });

        if (isMounted) {
          setActivities(Array.from(titleMap.values()));
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      }
    }

    loadActivities();
    const interval = setInterval(loadActivities, 10000);
    window.addEventListener('notification_created', loadActivities);
    window.addEventListener('client_data_updated', loadActivities);
    window.addEventListener('auth_state_change', loadActivities);
    window.addEventListener('storage', loadActivities);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('notification_created', loadActivities);
      window.removeEventListener('client_data_updated', loadActivities);
      window.removeEventListener('auth_state_change', loadActivities);
      window.removeEventListener('storage', loadActivities);
    };
  }, [myName, myEmail, myTherapistName]);

  const handlePreviewActivity = (act: ActivityItem) => {
    setActiveActivity(act);
    setPreviewTab("game");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MINDFULNESS":
        return <Brain className="w-3.5 h-3.5" />;
      case "CBT":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "GRATITUDE":
        return <Heart className="w-3.5 h-3.5" />;
      case "BREATHING":
        return <Wind className="w-3.5 h-3.5" />;
      case "SOMATIC":
        return <Smile className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  // Determine if activity is assigned to this client
  const isAssignedToMe = (act: ActivityItem): boolean => {
    // 1. Check clientAssignments
    if (Array.isArray(act.clientAssignments) && act.clientAssignments.length > 0) {
      const found = act.clientAssignments.some((ca: any) => {
        const caName = String(ca.clientName || ca.name || "").toLowerCase().trim();
        const caEmail = String(ca.clientEmail || ca.email || "").toLowerCase().trim();
        const caId = String(ca.clientId || ca.id || "").trim();
        return (
          (myEmail && caEmail === myEmail) ||
          (myName && (caName.includes(myName.toLowerCase()) || myName.toLowerCase().includes(caName))) ||
          (authUser?.id && caId === authUser.id)
        );
      });
      if (found) return true;
    }

    // 2. Check assignedTo
    if (Array.isArray(act.assignedTo) && act.assignedTo.length > 0) {
      const found = act.assignedTo.some((name: string) => {
        const clean = String(name).toLowerCase().trim();
        return (
          (myName && (clean.includes(myName.toLowerCase()) || myName.toLowerCase().includes(clean))) ||
          (myEmail && clean === myEmail)
        );
      });
      if (found) return true;
    }

    // 3. Check direct assignedClientName / Email
    const directName = String(act.assignedClientName || "").toLowerCase().trim();
    const directEmail = String(act.assignedClientEmail || "").toLowerCase().trim();
    if ((myName && directName.includes(myName.toLowerCase())) || (myEmail && directEmail === myEmail)) {
      return true;
    }

    // 4. Check assigned notifications list
    if (assignedNotifs.length > 0) {
      const actTitle = act.title.toLowerCase().trim();
      const actId = String(act.id);
      const foundInNotif = assignedNotifs.some((n: any) => {
        const nTitle = String(n.activityTitle || n.title || '')
          .replace(/⚡/g, '')
          .replace(/New Activity Assigned:\s*/i, '')
          .trim()
          .toLowerCase();
        const nId = String(n.activityId || n.id || '');
        return (nId && nId === actId) || (nTitle && (nTitle === actTitle || nTitle.includes(actTitle) || actTitle.includes(nTitle)));
      });
      if (foundInNotif) return true;
    }

    return false;
  };

  const assignedActivities = activities.filter(isAssignedToMe);

  const filteredAllActivities = activities.filter((act) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : act.category === selectedCategory;

    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16 font-['Plus_Jakarta_Sans']">
      <PageHeader
        title="Activities Library"
        description="Explore therapeutic exercises, guided meditations, and interactive mental health activities."
        badge="MY ACTIVITIES"
        icon={<Activity className="w-4 h-4 text-purple-200" />}
      />

      {/* ─────────────────────────────────────────────────────────────
          1st: THERAPIST RECOMMENDATION / ASSIGNED BY THERAPIST
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5e2be2]/10 text-[#5e2be2] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#5e2be2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Therapist Recommendations
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Clinical exercises prescribed specifically for you by <span className="text-[#5e2be2] font-semibold">{myTherapistName}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-[#5e2be2] border border-purple-100">
            {assignedActivities.length} Prescribed
          </span>
        </div>

        {assignedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedActivities.map((act) => (
              <div
                key={act.id}
                className="group bg-white rounded-3xl border border-purple-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ring-1 ring-[#5e2be2]/10"
              >
                {/* Top Image Container */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={act.imageUrl}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Category Tag (Top Left) */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/40">
                    {getCategoryIcon(act.category)}
                    <span>{act.category}</span>
                  </div>

                  {/* Assigned Tag (Top Right) */}
                  <div className="absolute top-4 right-4 bg-[#5e2be2] text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Therapist Recommendation</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors leading-snug mb-2">
                      {act.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">
                      {act.description}
                    </p>
                  </div>

                  {/* Meta info & Action */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{act.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-4 h-4 text-slate-400" />
                        <span>{act.frequency || "Daily"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePreviewActivity(act)}
                        className="w-full h-11 rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-purple-500/20 gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Prescribed Activity</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center">
            <p className="text-slate-500 font-medium text-sm">No therapist activities currently assigned. Explore the full library below!</p>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2nd: ALL ACTIVITIES (FULL LIBRARY)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5 pt-4 border-t border-slate-100 dark:border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              All Activities
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explore and practice guided therapeutic exercises from the clinical library
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border-slate-200 text-xs focus:ring-2 focus:ring-[#5e2be2]/20"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={
                  isActive
                    ? "bg-[#5e2be2] text-white shadow-md shadow-purple-500/20 rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                }
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* All Activities Cards Grid */}
        {filteredAllActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllActivities.map((act) => {
              const isRecommended = isAssignedToMe(act);
              return (
                <div
                  key={act.id}
                  className={cn(
                    "group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between",
                    isRecommended ? "border-purple-200/90 ring-1 ring-purple-100" : "border-slate-200/80"
                  )}
                >
                  {/* Top Image Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Category Tag (Top Left) */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/40">
                      {getCategoryIcon(act.category)}
                      <span>{act.category}</span>
                    </div>

                    {/* Recommended Tag (Top Right if assigned) */}
                    {isRecommended && (
                      <div className="absolute top-4 right-4 bg-[#5e2be2] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors leading-snug mb-2">
                        {act.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">
                        {act.description}
                      </p>
                    </div>

                    {/* Meta info & Action */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{act.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Repeat className="w-4 h-4 text-slate-400" />
                          <span>{act.frequency || "Daily"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePreviewActivity(act)}
                          className="w-full h-11 rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-purple-500/20 gap-2"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start Activity</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-500 font-medium text-sm">No activities found matching your search.</p>
          </div>
        )}
      </section>

      {/* ── Preview Activity Modal with Interactive Game Player ──────── */}
      <Dialog open={!!activeActivity} onOpenChange={() => setActiveActivity(null)}>
        {activeActivity && (
          <DialogContent className="max-w-2xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-slate-950 text-white max-h-[90dvh] overflow-y-auto w-[calc(100vw-24px)] sm:w-full">
            {/* Header Banner */}
            <div className="relative min-h-[160px] sm:h-40 w-full overflow-hidden bg-slate-900 shrink-0">
              <img
                src={activeActivity.imageUrl}
                alt={activeActivity.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    {getCategoryIcon(activeActivity.category)}
                    <span>{activeActivity.category} • {activeActivity.duration}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                    {activeActivity.title}
                  </h2>
                </div>

                {/* Tab Switcher: Game vs Guidelines */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-white/20 rounded-full p-1 backdrop-blur-md shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("game")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      previewTab === "game"
                        ? "bg-[#5e2be2] text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <span>🎮 Play Game</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("instructions")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      previewTab === "instructions"
                        ? "bg-[#5e2be2] text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <span>📋 Guidelines</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body: Render Interactive Game or Instructions */}
            <div className="p-6 sm:p-7 space-y-6 bg-slate-950">
              {previewTab === "game" ? (
                <ActivityGamePlayer activity={activeActivity} />
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Clinical Guidelines & Exercise Protocol
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {activeActivity.instructions || activeActivity.description}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveActivity(null)}
                  className="rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold text-xs h-11 px-5 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
