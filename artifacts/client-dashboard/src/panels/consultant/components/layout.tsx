import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { logoutUser, getAuthUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LineChart,
  IndianRupee,
  Star,
  FolderOpen,
  ClipboardCheck,
  MessageSquare,
  PenTool,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Activity,
  ChevronUp,
  Brain,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
  FileText,
  Menu,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOutcomeStore, OutcomeRecord } from "@/lib/outcome-store";
import { useGetDashboardStats } from "@workspace/api-client-react";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Clients" | "Pages & Modules" | "Activities" | "Documents";
  href: string;
  badge?: string;
  keywords?: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // Clients
  { id: "c1", title: "Sarah Jenkins", subtitle: "Active • CBT Anxiety Protocol • GAD-7 Score: 11", category: "Clients", href: "/consultant/clients/1", badge: "Client", keywords: ["anxiety", "cbt", "insomnia", "sarah"] },
  { id: "c2", title: "Michael Chen", subtitle: "Active • ACT Depression & Routine • PHQ-9 Score: 12", category: "Clients", href: "/consultant/clients/2", badge: "Client", keywords: ["depression", "sleep", "michael"] },
  { id: "c3", title: "Emily Rodriguez", subtitle: "Active • DBT Distress Tolerance • PCL-5 Score: 24", category: "Clients", href: "/consultant/clients/3", badge: "Client", keywords: ["dbt", "stress", "emily"] },
  { id: "c4", title: "David Kim", subtitle: "New • Social Anxiety CBT Exposure • GAD-7: 14", category: "Clients", href: "/consultant/clients/4", badge: "Client", keywords: ["social", "anxiety", "david"] },
  { id: "c5", title: "Jessica Taylor", subtitle: "Completed • Panic Disorder Remission • GAD-7: 3", category: "Clients", href: "/consultant/clients/5", badge: "Client", keywords: ["panic", "remission", "jessica"] },

  // Pages & Modules
  { id: "p1", title: "Dashboard", subtitle: "Clinical overview, active clients & metrics", category: "Pages & Modules", href: "/consultant", badge: "Module", keywords: ["home", "stats", "overview"] },
  { id: "p2", title: "Activities Library", subtitle: "Browse, assign & manage therapeutic exercises", category: "Pages & Modules", href: "/consultant/activities", badge: "Module", keywords: ["exercise", "homework", "mindfulness", "cbt"] },
  { id: "p3", title: "Client Directory", subtitle: "Full client list, intake forms & clinical details", category: "Pages & Modules", href: "/consultant/clients", badge: "Module", keywords: ["patients", "records", "intake"] },
  { id: "p4", title: "Session Calendar", subtitle: "Schedule appointments & view timeline", category: "Pages & Modules", href: "/consultant/calendar", badge: "Module", keywords: ["booking", "schedule", "events"] },
  { id: "p5", title: "Client Messages", subtitle: "Secure direct messaging & chat logs", category: "Pages & Modules", href: "/consultant/messages", badge: "Module", keywords: ["chat", "inbox", "communication"] },
  { id: "p6", title: "Clinical Outcomes", subtitle: "Track PHQ-9 & GAD-7 assessment progress", category: "Pages & Modules", href: "/consultant/outcomes", badge: "Module", keywords: ["phq9", "gad7", "scores", "progress"] },
  { id: "p7", title: "Revenue & Analytics", subtitle: "Financial reports, payouts & session billing", category: "Pages & Modules", href: "/consultant/revenue", badge: "Module", keywords: ["invoices", "income", "payments"] },
  { id: "p8", title: "Reviews & Ratings", subtitle: "Patient feedback & satisfaction metrics", category: "Pages & Modules", href: "/consultant/reviews", badge: "Module", keywords: ["feedback", "ratings", "stars"] },
  { id: "p9", title: "Clinical Resources", subtitle: "Worksheets, psychoeducation & document files", category: "Pages & Modules", href: "/consultant/resources", badge: "Module", keywords: ["pdf", "files", "materials"] },
  { id: "p10", title: "Assessments", subtitle: "Clinical evaluation questionnaires", category: "Pages & Modules", href: "/consultant/assessments", badge: "Module", keywords: ["tests", "evaluations", "forms"] },
  { id: "p11", title: "Blog & Psychoeducation", subtitle: "Articles & clinical insights for clients", category: "Pages & Modules", href: "/consultant/blog", badge: "Content", keywords: ["articles", "posts", "education"] },

  // Activities
  { id: "a1", title: "Morning Mindfulness Meditation", subtitle: "10-minute guided breathing session", category: "Activities", href: "/consultant/activities", badge: "Mindfulness", keywords: ["meditation", "breathing", "morning"] },
  { id: "a2", title: "CBT Thought Record Entry", subtitle: "5-column cognitive restructuring technique", category: "Activities", href: "/consultant/activities", badge: "CBT", keywords: ["reframe", "thoughts", "cognitive"] },
  { id: "a3", title: "Evening Gratitude Journaling", subtitle: "8-minute positive psychology practice", category: "Activities", href: "/consultant/activities", badge: "Gratitude", keywords: ["journal", "gratitude", "evening"] },
  { id: "a4", title: "4-7-8 Parasympathetic Breathing", subtitle: "Acute panic & anxiety reset breathing", category: "Activities", href: "/consultant/activities", badge: "Breathing", keywords: ["panic", "breath", "parasympathetic"] },
  { id: "a5", title: "Progressive Muscle Relaxation (PMR)", subtitle: "12-minute somatic tension release exercise", category: "Activities", href: "/consultant/activities", badge: "Somatic", keywords: ["pmr", "muscle", "relaxation", "body"] },

  // Documents
  { id: "d1", title: "GAD-7 Baseline Assessment Template", subtitle: "Clinical generalized anxiety disorder screener", category: "Documents", href: "/consultant/assessments", badge: "Form", keywords: ["gad7", "anxiety", "screener"] },
  { id: "d2", title: "PHQ-9 Depression Screener", subtitle: "Standardized depression outcome evaluation", category: "Documents", href: "/consultant/assessments", badge: "Form", keywords: ["phq9", "depression", "screener"] },
  { id: "d3", title: "PCL-5 Trauma & PTSD Questionnaire", subtitle: "DSM-5 symptom checklist for PTSD", category: "Documents", href: "/consultant/assessments", badge: "Form", keywords: ["pcl5", "trauma", "ptsd"] },
  { id: "d4", title: "Intake Consent & Boundaries Policy", subtitle: "Practice legal documents & telehealth policy", category: "Documents", href: "/consultant/resources", badge: "PDF", keywords: ["consent", "legal", "telehealth"] },
];

const CONTENT_ITEMS = [
  { name: "Blog", href: "/consultant/blog", icon: PenTool },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = getAuthUser();
  const { unreadCount } = useOutcomeStore();
  const { data: statsData } = useGetDashboardStats();

  const workspaceItems = [
    { name: "Dashboard", href: "/consultant", icon: LayoutDashboard },
    { name: "Activities", href: "/consultant/activities", icon: Activity, badge: `${statsData?.homeworkDueToday ?? 4}` },
    { name: "Clients", href: "/consultant/clients", icon: Users, badge: `${statsData?.totalClientsCount ?? 24}` },
    { name: "Calendar", href: "/consultant/calendar", icon: Calendar, badge: `${statsData?.sessionsToday ?? 4}` },
    { name: "Messages", href: "/consultant/messages", icon: MessageSquare, badge: `${unreadCount > 0 ? unreadCount : 3}` },
    { name: "Assessments", href: "/consultant/assessments", icon: ClipboardCheck },
    { name: "Revenue", href: "/consultant/revenue", icon: IndianRupee },
    { name: "Reviews", href: "/consultant/reviews", icon: Star, badge: "4.9" },
    { name: "Resources", href: "/consultant/resources", icon: FolderOpen },
  ];

  const confirmSignOut = () => {
    setShowSignOutDialog(false);
    logoutUser();
    setLocation("/login");
  };

  const isItemActive = (href: string) => {
    if (href === "/consultant") {
      return location === "/consultant" || location === "/consultant/";
    }
    const cleanHref = href.split('?')[0];
    if (href.includes('?tab=')) {
      const tabName = href.split('?tab=')[1];
      return location === cleanHref && typeof window !== "undefined" && window.location.search.includes(`tab=${tabName}`);
    }
    return location === href || location.startsWith(href + '/');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#eef1f6]">
      {/* Brand Header */}
      <div className="h-20 md:h-24 px-4 flex items-center justify-between border-b border-[#f1f5f9] overflow-hidden shrink-0">
        <Link href="/consultant" onClick={onCloseMobile} className="inline-flex items-center select-none cursor-pointer">
          <img
            src="/hexpertify-logo.png"
            alt="HEXPERTIFY ANYTIME,ANYWHERE"
            className="h-14 md:h-20 max-w-full w-auto object-contain transition-transform hover:scale-[1.02]"
          />
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Workspace Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            WORKSPACE
          </div>
          <nav className="space-y-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 group",
                    isActive
                      ? "bg-[#5e2be2] text-white shadow-md shadow-[#5e2be2]/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold",
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            CONTENT
          </div>
          <nav className="space-y-1">
            {CONTENT_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 group",
                    isActive
                      ? "bg-[#5e2be2] text-white shadow-md shadow-[#5e2be2]/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Quick Profile Footer */}
      <div className="relative border-t border-[#f1f5f9] bg-slate-50/50 shrink-0">
        {showProfileMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowProfileMenu(false)} 
            />

            {/* Options Popover Menu */}
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-40 animate-in fade-in-0 slide-in-from-bottom-2">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name || "Dr. Alex Harrison, PsyD"}</p>
                <p className="text-[11px] text-slate-500 font-medium truncate">{user?.email || "alex.harrison@hexpertify.com"}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onCloseMobile?.();
                  setLocation("/consultant/profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onCloseMobile?.();
                  setLocation("/consultant/activities");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
              >
                <Activity className="w-4 h-4 text-slate-400" />
                <span>Activity Log</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onCloseMobile?.();
                  setShowSignOutDialog(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}

        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="p-4 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
          title="Click for options"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"}
                  alt="Admin Avatar"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5e2be2]/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">{user?.name || "Dr. Alex Harrison, PsyD"}</p>
                <p className="text-[11px] text-slate-500 font-medium">{user?.title || "Licensed Clinical Psychologist"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-30 w-64 bg-white border-r border-[#eef1f6] flex-col shadow-sm hidden md:flex"
        style={{ boxShadow: '2px 0 16px rgba(0, 0, 0, 0.02)' }}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in-0"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-72 bg-white flex-col shadow-2xl transition-transform duration-300 md:hidden flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>

      {/* Sign Out Confirmation Modal */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[380px] p-5 sm:p-7 rounded-[20px] sm:rounded-[24px] bg-white border-none shadow-2xl space-y-0 gap-0 outline-none [&>button]:hidden">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 sm:mb-5">
            <LogOut className="w-5 h-5 text-red-500 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
            Sign out
          </h2>
          <p className="text-slate-500 text-sm font-medium mb-6">
            Are you sure you want to sign out?
          </p>

          <div className="flex items-center gap-3 w-full pt-1">
            <button
              type="button"
              onClick={() => setShowSignOutDialog(false)}
              className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSignOut}
              className="flex-1 h-11 rounded-2xl bg-[#ef4444] hover:bg-red-600 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Header({ onOpenMobileSidebar }: { onOpenMobileSidebar?: () => void }) {
  const user = getAuthUser();
  const [, setLocation] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeRecord | null>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { notifications, outcomes, unreadCount, markNotificationRead, markAllNotificationsRead } = useOutcomeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOutcomeClick = (outcomeId: string, notifId: string) => {
    markNotificationRead(notifId);
    setShowNotifications(false);
    const matched = outcomes.find((o) => o.id === outcomeId);
    if (matched) {
      setSelectedOutcome(matched);
    } else {
      setLocation("/consultant/outcomes");
    }
  };

  const handleSearchResultClick = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setLocation(href);
  };

  const filteredSearchResults = searchQuery.trim() === ""
    ? SEARCH_DATABASE.slice(0, 6)
    : SEARCH_DATABASE.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      });

  const categories = ["Clients", "Pages & Modules", "Activities", "Documents"] as const;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#eef1f6] shadow-sm">
      <div className="h-16 md:h-24 px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2">
        {/* Mobile Sidebar Toggle Button & Brand Logo */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors md:hidden cursor-pointer shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar - Hidden on xs to prevent crowding */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <div className="relative group z-30">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#5e2be2] transition-colors" />
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search clients, sessions, activities... (⌘K)" 
              className="w-full bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/10 rounded-full pl-10 pr-20 py-2 text-xs sm:text-sm transition-all outline-none"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Global Search Results Dropdown Popover */}
        {isSearchOpen && (
          <>
            {/* Click Outside Backdrop */}
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setIsSearchOpen(false)} 
            />

            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-40 overflow-hidden animate-in fade-in-0 slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  {searchQuery.trim() ? `Search Results (${filteredSearchResults.length})` : "Quick Suggestions"}
                </span>
                <span className="text-[10px] font-medium text-slate-400 px-2">
                  Press <kbd className="px-1 py-0.5 bg-white border rounded font-mono">ESC</kbd> to exit
                </span>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2 space-y-3 divide-y divide-slate-100">
                {filteredSearchResults.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-700">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-slate-400">Try searching for client names like "Sarah", modules like "Activities", or "CBT".</p>
                  </div>
                ) : (
                  categories.map((cat) => {
                    const catItems = filteredSearchResults.filter((item) => item.category === cat);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat} className="pt-2 first:pt-0">
                        <div className="px-3 py-1.5 text-[11px] font-extrabold text-[#5e2be2] uppercase tracking-wider flex items-center justify-between">
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{catItems.length}</span>
                        </div>

                        <div className="space-y-1 mt-1">
                          {catItems.map((item) => {
                            const ItemIcon = 
                              item.category === "Clients" ? Users :
                              item.category === "Activities" ? Activity :
                              item.category === "Documents" ? FileText :
                              LayoutDashboard;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSearchResultClick(item.href)}
                                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50/60 transition-all text-left group cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#5e2be2] text-slate-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <ItemIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors truncate">
                                      {item.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-purple-100 text-slate-600 group-hover:text-[#5e2be2] transition-colors">
                                    {item.badge}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#5e2be2] group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    <div className="flex items-center gap-3 md:gap-4">
        {/* Calendar Icon */}
        <Link href="/consultant/calendar">
          <button type="button" className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer" title="View Schedule Calendar">
            <Calendar className="w-5 h-5 text-slate-600" />
          </button>
        </Link>

        {/* Bell Icon with Interactive Outcome Notifications Popover */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#5e2be2] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)} 
              />
              
              {/* Notifications Popover Dropdown */}
              <div className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] max-w-[360px] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-[#5e2be2]/10 text-[#5e2be2] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-[#5e2be2] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-4 hover:bg-slate-50/80 transition-colors flex gap-3 items-start relative group border-b border-slate-100/80 last:border-b-0",
                          !item.read && "bg-purple-50/30"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5e2be2] flex items-center justify-center shrink-0 text-sm font-bold mt-0.5 border border-purple-200">
                          🧠
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              🔔 Outcome Updated
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5e2be2]" />
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.timestamp}</span>
                          </div>

                          <p className="text-xs font-medium text-slate-700 mt-1">
                            <strong>{item.clientName}</strong>'s assessment outcome has been updated.
                          </p>

                          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-600">{item.assessmentName}:</span>
                              <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.previousScore} → {item.currentScore}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Change:</span>
                              <span className={cn(
                                "font-bold px-1.5 py-0.5 rounded",
                                item.changeValue < 0 && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                item.changeValue > 0 && "bg-amber-50 text-amber-700 border border-amber-200",
                                item.changeValue === 0 && "bg-slate-100 text-slate-600 border border-slate-200"
                              )}>
                                {item.changeLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Assessment completed after Session {item.sessionMilestone}.
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleOutcomeClick(item.outcomeId, item.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#5e2be2] hover:text-[#4f28d9] transition-colors cursor-pointer group-hover:underline"
                            >
                              <span>View Outcome</span>
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                  <Link 
                    href="/outcomes"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-[#5e2be2] hover:underline cursor-pointer block"
                  >
                    View All Clinical Outcomes Workflow →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Outcome Details Modal */}
        <Dialog open={!!selectedOutcome} onOpenChange={(open) => !open && setSelectedOutcome(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-7 rounded-[20px] sm:rounded-[24px] bg-white border-none shadow-2xl space-y-0 gap-0 outline-none">
            {selectedOutcome && (
              <div className="space-y-5">
                <DialogHeader className="space-y-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 rounded-xl bg-purple-100 text-[#5e2be2] text-lg font-bold">🧠</span>
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900">
                        Assessment Outcome Details
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-500 font-medium">
                        3-Session Assessment Outcome Workflow Calculation
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Client</p>
                      <p className="text-sm font-bold text-slate-900">{selectedOutcome.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Milestone</p>
                      <p className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-[#5e2be2]">
                        Completed after Session {selectedOutcome.sessionMilestone}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-slate-200/60">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] font-semibold text-slate-500">Previous Score</p>
                      <p className="text-xl font-extrabold text-slate-800 mt-0.5">{selectedOutcome.previousScore}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] font-semibold text-slate-500">Current Score</p>
                      <p className="text-xl font-extrabold text-[#5e2be2] mt-0.5">{selectedOutcome.currentScore}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[11px] font-semibold text-slate-500">Score Change</p>
                      <p className={cn(
                        "text-xl font-extrabold mt-0.5",
                        selectedOutcome.changeValue < 0 && "text-emerald-600",
                        selectedOutcome.changeValue > 0 && "text-amber-600",
                        selectedOutcome.changeValue === 0 && "text-slate-600"
                      )}>
                        {selectedOutcome.changeLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">BRD Rule Enforcement:</p>
                  <p>
                    Every time the client completes their scheduled assessment after 3 sessions (Session {selectedOutcome.sessionMilestone}), 
                    the system automatically compares scores and notifies the assigned therapist without pre-judging clinical direction.
                  </p>
                </div>

                {selectedOutcome.details && selectedOutcome.details.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Itemized Breakdown</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {selectedOutcome.details.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                          <p className="font-semibold text-slate-800">{item.q}</p>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Prev: <strong className="text-slate-700">{item.prev}</strong></span>
                            <span>Curr: <strong className="text-[#5e2be2]">{item.curr}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome(null)}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome(null);
                      setLocation("/consultant/outcomes");
                    }}
                    className="h-10 px-5 rounded-xl bg-[#5e2be2] text-white font-bold text-xs hover:bg-[#4f28d9] transition-colors cursor-pointer shadow-sm"
                  >
                    Go to Outcomes Dashboard
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Messages Pill Button */}
        <Link href="/messages">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs sm:text-sm h-9 sm:h-10 px-3.5 sm:px-5 shadow-md shadow-[#5e2be2]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Messages</span>
          </button>
        </Link>

        {/* User Profile */}
        <Link href="/profile" className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="relative cursor-pointer">
            <img 
              src={user?.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5e2be2]/30"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </Link>
      </div>
    </div>

      {/* Mobile Search Bar below top header tabs */}
      <div className="px-3 pb-3 sm:hidden">
        <div className="relative group z-30">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#5e2be2] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search clients, sessions, activities..." 
            className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/10 rounded-full pl-9 pr-4 py-2 text-xs transition-all outline-none"
          />
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex text-slate-800 antialiased">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col pl-0 md:pl-64 min-w-0">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

