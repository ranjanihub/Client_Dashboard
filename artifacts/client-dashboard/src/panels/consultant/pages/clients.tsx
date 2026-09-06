import { useState, useEffect } from "react";
import { useGetClients } from "@workspace/api-client-react";
import AddClientDialog from "@/components/AddClientDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Users,
  Mail,
  Phone,
  UserCheck,
  X,
  Brain,
  Award,
  Activity,
  FileText,
  Sparkles,
  Copy,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Send,
  CheckCircle2,
  Clock,
  Trash2,
  LineChart,
  ClipboardCheck,
  Layers,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Clients() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const getTabFromUrl = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "outcomes" || tab === "assessments" || tab === "directory") {
        return tab;
      }
    }
    return "directory";
  };

  const [mainTab, setMainTab] = useState<string>(getTabFromUrl);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedRecordClient, setSelectedRecordClient] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"intake" | "assessments" | "mood" | "sessions" | "documents">("intake");

  useEffect(() => {
    const tabFromUrl = getTabFromUrl();
    if (tabFromUrl !== mainTab) {
      setMainTab(tabFromUrl);
    }
  }, [location]);

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedScale, setExpandedScale] = useState<string | null>(null);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [clientGoals, setClientGoals] = useState([
    { id: 1, text: "Reduce panic episode frequency from 3x/week to 0", completed: true },
    { id: 2, text: "Master box breathing and cognitive restructuring techniques", completed: true },
    { id: 3, text: "Maintain consistent 7+ hours of restful sleep daily", completed: false },
    { id: 4, text: "Complete weekly CBT thought record entries before sessions", completed: false },
  ]);

  const [homeworkList, setHomeworkList] = useState([
    { id: 101, title: "CBT Thought Record Log", frequency: "Daily", status: "completed", dueDate: "2026-07-27" },
    { id: 102, title: "Progressive Muscle Relaxation", frequency: "2x/day", status: "pending", dueDate: "2026-08-01" },
  ]);

  const handleCopySummary = () => {
    const text = "Client presents with persistent generalized anxiety, work-related burnout, and mild insomnia over the past 6 months. Seeking CBT coping strategies and sleep hygiene guidance.";
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast({
      title: "AI Summary Copied",
      description: "Intake summary copied to your clipboard.",
    });
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGoalInput.trim()) return;
    const text = newGoalInput.trim();
    setClientGoals((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false },
    ]);
    setNewGoalInput("");
    toast({
      title: "Goal Added",
      description: `Goal "${text}" added to client plan.`,
    });
  };

  const deleteGoal = (id: number) => {
    setClientGoals((prev) => prev.filter((g) => g.id !== id));
    toast({
      title: "Goal Removed",
      description: "Therapeutic goal removed from client plan.",
    });
  };

  const toggleGoal = (id: number) => {
    setClientGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const toggleHomework = (id: number) => {
    setHomeworkList((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, status: h.status === "completed" ? "pending" : "completed" } : h
      )
    );
  };

  const { data: clients, isLoading } = useGetClients({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined
  });

  const DEMO_CLIENTS = [
    {
      id: 1,
      code: "#CL-101",
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      phone: "+1(555) 234-5678",
      therapist: "Dr. Alex Harrison",
      modality: "Individual Therapy",
      lastSession: "2026-07-28",
      nextSession: "2026-08-01",
      nextSessionTime: "(09:00 AM)",
      status: "active" as const,
      primaryGoal: "Generalized Anxiety & Workplace Stress",
    },
    {
      id: 2,
      code: "#CL-102",
      name: "Michael & Jennifer Chen",
      email: "m.chen@example.com",
      phone: "+1(555) 876-5432",
      therapist: "Dr. Elena Rostova",
      modality: "Couple Therapy",
      lastSession: "2026-07-29",
      nextSession: "2026-08-01",
      nextSessionTime: "(10:30 AM)",
      status: "active" as const,
      primaryGoal: "Marital Communication & Emotional Regulation",
    },
    {
      id: 3,
      code: "#CL-103",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1(555) 345-6789",
      therapist: "Dr. Alex Harrison",
      modality: "CBT Therapy",
      lastSession: "2026-07-26",
      nextSession: "2026-08-02",
      nextSessionTime: "(02:00 PM)",
      status: "active" as const,
      primaryGoal: "Panic Disorder & Agoraphobia Management",
    },
    {
      id: 4,
      code: "#CL-104",
      name: "David Kim",
      email: "david.kim@example.com",
      phone: "+1(555) 456-7890",
      therapist: "Dr. Alex Harrison",
      modality: "Individual Therapy",
      lastSession: "2026-07-24",
      nextSession: "2026-08-03",
      nextSessionTime: "(11:15 AM)",
      status: "active" as const,
      primaryGoal: "Social Anxiety in Executive Leadership",
    },
    {
      id: 5,
      code: "#CL-105",
      name: "Jessica Taylor",
      email: "jessica.t@example.com",
      phone: "+1(555) 567-8901",
      therapist: "Dr. Alex Harrison",
      modality: "Panic CBT",
      lastSession: "2026-07-12",
      nextSession: undefined,
      nextSessionTime: "",
      status: "completed" as const,
      primaryGoal: "Interoceptive Panic Exposure Remission",
    },
  ];

  const clientList = (Array.isArray(clients) && clients.length > 0) ? clients : DEMO_CLIENTS;

  const filteredClients = clientList.filter((c: any) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.therapist && c.therapist.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const activeCount = clientList.filter((c: any) => c.status === "active" || c.status === "new").length;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === 'new') {
      return <span className="text-xs px-3 py-1 font-bold rounded-full inline-block bg-blue-100 text-blue-700">New</span>;
    }
    if (s === 'completed') {
      return <span className="text-xs px-3 py-1 font-bold rounded-full inline-block bg-slate-100 text-slate-700">Completed</span>;
    }
    return <span className="text-xs px-3 py-1 font-bold rounded-full inline-block bg-emerald-100 text-emerald-700">Active</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOP HEADER PURPLE BANNER MATCHING HEXPERTIFY SYSTEM COLOR THEME */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#431bb5] via-[#5e2be2] to-[#361394] p-6 sm:p-8 text-white shadow-lg shadow-purple-900/10 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Client Records
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/90 max-w-2xl font-medium leading-relaxed">
            Access complete client details, AI intake surveys, assessment scores and session notes.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 px-6 rounded-2xl border border-white/20 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-purple-200 block uppercase tracking-wider">Total Registered Clients</span>
            <span className="text-xl font-extrabold text-white">{activeCount} Active Records</span>
          </div>
        </div>
      </div>

      <AddClientDialog open={addClientOpen} onOpenChange={setAddClientOpen} />

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by client name, email, phone, ID, or therapist..." 
            className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-medium focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "new", label: "New" },
            { id: "completed", label: "Completed" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-extrabold capitalize transition-all cursor-pointer whitespace-nowrap",
                statusFilter === item.id 
                  ? "bg-[#5e2be2] text-white shadow-md shadow-[#5e2be2]/20" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CLIENT ROSTER TABLE */}
      {isLoading ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No clients match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (Visible on mobile viewports < 768px) */}
          <div className="space-y-3.5 md:hidden">
            {filteredClients.map((clientItem: any) => (
              <div key={clientItem.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{clientItem.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{clientItem.modality || 'Individual Therapy'}</p>
                  </div>
                  <div>
                    {getStatusBadge(clientItem.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Session</span>
                    <span className="font-mono font-semibold text-slate-700 text-xs mt-0.5 block">{clientItem.lastSession || '2026-07-28'}</span>
                  </div>

                  <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold text-[#5e2be2] uppercase tracking-wider block">Next Session</span>
                    {clientItem.nextSession ? (
                      <span className="font-mono font-extrabold text-[#5e2be2] text-xs mt-0.5 block">
                        {clientItem.nextSession} <span className="text-[10px] font-normal text-slate-500">{clientItem.nextSessionTime}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs block">-</span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <Link href={`/consultant/clients/${clientItem.id}`} className="block w-full">
                    <Button className="w-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs h-10 rounded-xl shadow-sm cursor-pointer">
                      View Full Record
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Visible on desktop viewports >= 768px) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    <th className="py-4 px-6">Client Name</th>
                    <th className="py-4 px-6">Service Modality</th>
                    <th className="py-4 px-6">Last Session</th>
                    <th className="py-4 px-6">Next Session</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClients.map((clientItem: any) => (
                    <tr key={clientItem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {clientItem.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 whitespace-nowrap">
                        {clientItem.modality || 'Individual Therapy'}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500 font-mono whitespace-nowrap">
                        {clientItem.lastSession || '2026-07-28'}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#5e2be2] font-mono whitespace-nowrap">
                        {clientItem.nextSession ? (
                          <div>
                            <span className="block">{clientItem.nextSession}</span>
                            <span className="block text-[11px] font-normal text-slate-500">{clientItem.nextSessionTime || '(09:00 AM)'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(clientItem.status)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link href={`/consultant/clients/${clientItem.id}`}>
                          <Button className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap">
                            View Full Record
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!selectedRecordClient} onOpenChange={() => setSelectedRecordClient(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-y-auto rounded-3xl border-0 shadow-2xl">
          {selectedRecordClient && (
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#5e2be2] text-white font-black text-lg flex items-center justify-center shadow-lg shadow-[#5e2be2]/20">
                    {selectedRecordClient.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedRecordClient.name}</h2>
                      {getStatusBadge(selectedRecordClient.status)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedRecordClient.code} · {selectedRecordClient.modality} · {selectedRecordClient.therapist}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecordClient(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 hide-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("intake")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeModalTab === "intake" ? "bg-[#5e2be2] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Brain className="w-4 h-4" /> Intake
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("assessments")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeModalTab === "assessments" ? "bg-[#5e2be2] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Award className="w-4 h-4" /> Assessments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("mood")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeModalTab === "mood" ? "bg-[#5e2be2] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Activity className="w-4 h-4" /> Goals
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("sessions")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeModalTab === "sessions" ? "bg-[#5e2be2] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Calendar className="w-4 h-4" /> Sessions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("documents")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeModalTab === "documents" ? "bg-[#5e2be2] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <FileText className="w-4 h-4" /> Docs
                </button>
              </div>

              {activeModalTab === "intake" && (
                <div className="p-4 bg-purple-50 rounded-2xl text-xs text-purple-900">
                  <h4 className="font-extrabold uppercase mb-2">AI Summary</h4>
                  <p>Client presents with persistent generalized anxiety, work-related burnout, and mild insomnia over the past 6 months. Seeking CBT coping strategies and sleep hygiene guidance.</p>
                </div>
              )}

              {activeModalTab === "mood" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Therapeutic Goals</h4>
                      <span className="text-xs font-bold text-slate-500">
                        {clientGoals.filter((g) => g.completed).length} / {clientGoals.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {clientGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={goal.completed}
                              onChange={() => toggleGoal(goal.id)}
                              className="w-4 h-4 accent-[#5e2be2] rounded cursor-pointer"
                            />
                            <span className={cn("font-semibold text-slate-800", goal.completed && "line-through text-slate-400")}>
                              {goal.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteGoal(goal.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddGoal} className="flex gap-2 pt-2">
                      <Input
                        placeholder="Add new therapy goal..."
                        value={newGoalInput}
                        onChange={(e) => setNewGoalInput(e.target.value)}
                        className="text-xs rounded-xl h-9"
                      />
                      <button
                        type="submit"
                        className="bg-[#5e2be2] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#4f28d9] transition-colors cursor-pointer shrink-0"
                      >
                        Add Goal
                      </button>
                    </form>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Recent Mood & Daily Check-ins</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">8.5 / 10</span>
                          <span className="text-slate-700 font-medium">Completed thought record log with ease. Slept 7.5 hours.</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">Jul 27, 2026</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">6.0 / 10</span>
                          <span className="text-slate-700 font-medium">Slight anxiety regarding work presentation. Practiced breathing.</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">Jul 24, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SESSIONS & HOMEWORK */}
              {activeModalTab === "sessions" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Session Timeline</h4>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Session Booking", description: `Opened booking calendar for ${selectedRecordClient.name}.` })}
                        className="inline-flex items-center gap-1.5 bg-[#5e2be2] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#4f28d9] cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Session</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Session #12 · CBT Anxiety Protocol</span>
                        <span className="text-[11px] text-slate-500">Completed Jul 28, 2026 (50 min) · Notes logged</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Completed</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Session #13 · Review &amp; Sleep Hygiene</span>
                        <span className="text-[11px] text-slate-500">Upcoming Aug 01, 2026 at 09:00 AM</span>
                      </div>
                      <span className="text-xs font-bold text-[#5e2be2] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">Scheduled</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Assigned Homework Tasks</h4>
                    <div className="space-y-2">
                      {homeworkList.map((hw) => (
                        <div
                          key={hw.id}
                          className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{hw.title}</span>
                            <span className="text-[11px] text-slate-500">Frequency: {hw.frequency} · Due: {hw.dueDate}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleHomework(hw.id)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all",
                              hw.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            )}
                          >
                            {hw.status === "completed" ? "Completed" : "Mark Complete"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS & FILES */}
              {activeModalTab === "documents" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Clinical Workspace Documents</h4>
                    <label className="inline-flex items-center gap-1.5 bg-[#5e2be2] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-[#4f28d9] cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast({
                              title: "Document Uploaded",
                              description: `"${file.name}" uploaded to ${selectedRecordClient.name}'s file record.`,
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">CBT_Thought_Record_Worksheet.pdf</span>
                          <span className="text-[11px] text-slate-400">PDF · 1.4 MB · Uploaded Jul 20, 2026</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Downloading Worksheet", description: "CBT_Thought_Record_Worksheet.pdf downloaded." })}
                        className="text-xs font-bold text-[#5e2be2] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Initial_Intake_Assessment_Form.pdf</span>
                          <span className="text-[11px] text-slate-400">PDF · 2.1 MB · Uploaded Jun 15, 2026</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Downloading Intake Form", description: "Initial_Intake_Assessment_Form.pdf downloaded." })}
                        className="text-xs font-bold text-[#5e2be2] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Sleep_Hygiene_Psychoeducation_Guide.pdf</span>
                          <span className="text-[11px] text-slate-400">PDF · 890 KB · Uploaded Jul 04, 2026</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Downloading Psychoeducation Guide", description: "Sleep_Hygiene_Psychoeducation_Guide.pdf downloaded." })}
                        className="text-xs font-bold text-[#5e2be2] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
