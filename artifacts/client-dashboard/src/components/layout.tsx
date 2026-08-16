import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  User,
  Video,
  Activity as ActivityIcon,
  ClipboardList,
  LineChart,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Calendar,
  Flag,
  Plus,
  Check,
  Brain,
  ArrowRight
} from 'lucide-react';
import { useGetClientProfile } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertifyLogo } from './logo';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'outcome',
    title: 'Outcome Updated',
    clientName: 'Sarah Jenkins',
    description: "Sarah Jenkins's assessment outcome has been updated.",
    metricName: 'Anxiety & Worry:',
    scoreChange: '16 → 11',
    pointsLabel: '-5 points',
    sessionTag: 'Assessment completed after Session 12.',
    time: '25m ago',
    read: false,
    link: '/progress',
  },
  {
    id: 2,
    type: 'outcome',
    title: 'Outcome Updated',
    clientName: 'Michael Chen',
    description: "Michael Chen's assessment outcome has been updated.",
    metricName: 'Mood & Wellbeing:',
    scoreChange: '18 → 12',
    pointsLabel: '-6 points',
    sessionTag: 'Assessment completed after Session 8.',
    time: '1h ago',
    read: false,
    link: '/progress',
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message from Dr. Sarah Jenkins',
    description: "Great work applying the mindfulness exercises during your daily routine!",
    time: '3h ago',
    read: true,
    link: '/messages',
  },
];

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/therapist', label: 'My Therapist', icon: User },
      { path: '/sessions', label: 'Sessions', icon: Video },
      { path: '/messages', label: 'Messages', icon: MessageSquare },
      { path: '/popup', label: 'Slot Booking Popup', icon: Calendar },
    ],
  },
  {
    label: 'MY CARE',
    items: [
      { path: '/activities', label: 'Activities', icon: ActivityIcon },
      { path: '/assessments', label: 'Assessments', icon: ClipboardList },
      { path: '/progress', label: 'Progress', icon: LineChart },
    ],
  },
  {
    label: 'RESOURCES',
    items: [
      { path: '/resources', label: 'Resources', icon: BookOpen },
    ],
  },
];

function initials(name: string) {
  return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AM';
}

function RedHairAvatar({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#FFF0ED" />
      {/* Hair back */}
      <path d="M18 45C16 30 24 12 40 12C56 12 64 30 62 45C62 55 60 62 58 66H22C20 62 18 55 18 45Z" fill="#E24D28" />
      {/* Neck */}
      <path d="M34 50H46V60H34V50Z" fill="#FAD1C0" />
      {/* Shoulders / Shirt */}
      <path d="M20 72C20 60 29 56 40 56C51 56 60 60 60 72V80H20V72Z" fill="#74C0FC" />
      <path d="M35 56L40 66L45 56H35Z" fill="#FFFFFF" />
      {/* Face */}
      <path d="M25 38C25 28 32 23 40 23C48 23 55 28 55 38C55 48 48 53 40 53C32 53 25 48 25 38Z" fill="#FAD1C0" />
      {/* Hair front */}
      <path d="M23 34C23 23 31 15 40 15C49 15 57 23 57 34C54 26 47 22 40 22C33 22 26 26 23 34Z" fill="#E24D28" />
      <path d="M24 30C28 22 35 18 40 23C45 18 52 22 56 30C52 23 45 19 40 21C35 19 28 23 24 30Z" fill="#C93B18" />
      {/* Eyes */}
      <circle cx="34" cy="38" r="2" fill="#3A2521" />
      <circle cx="46" cy="38" r="2" fill="#3A2521" />
      {/* Cheeks */}
      <circle cx="31" cy="42" r="2.5" fill="#FFB0A0" opacity="0.6" />
      <circle cx="49" cy="42" r="2.5" fill="#FFB0A0" opacity="0.6" />
      {/* Mouth */}
      <path d="M37 44C38.5 45.5 41.5 45.5 43 44" stroke="#C95B53" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { data: profile } = useGetClientProfile();
  const [showLogout, setShowLogout] = useState(false);

  const displayName = profile?.name || 'Alex Morgan';

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-30 hidden md:flex">
        {/* Top Logo Header */}
        <div className="p-6 pb-4 border-b border-sidebar-border/50">
          <Link href="/">
            <ExpertifyLogo />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <span className="px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {section.label}
              </span>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const isActive = location === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                          <span>{item.label}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-2">
          {/* User profile card acting as Profile button */}
          <Link href="/profile" className="block group">
            <div className="p-3 rounded-2xl bg-[#F5F6F9] dark:bg-muted/50 border border-slate-200/50 dark:border-border/40 shadow-xs hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <RedHairAvatar className="w-full h-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-bold text-slate-800 dark:text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                    {displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-muted-foreground truncate leading-tight mt-0.5 font-normal">
                    Client
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Sign out */}
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-muted-foreground hover:bg-red-50 hover:text-destructive text-[13px] font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Logout dialog */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              onClick={e => e.stopPropagation()}
              className="bg-card w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-border"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 text-destructive flex items-center justify-center mb-4">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-1.5">Sign out</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogout(false)} className="flex-1 hex-button-outline">
                  Cancel
                </button>
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 h-[40px] sm:h-[44px] px-5 rounded-lg bg-destructive text-white text-sm font-semibold flex items-center justify-center transition-all hover:brightness-110"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TopNav() {
  const { data: profile } = useGetClientProfile();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="sticky top-0 z-20 h-24 bg-white/95 backdrop-blur-md border-b border-[#eef1f6] px-4 md:px-8 flex items-center justify-between shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative group z-30">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#5e2be2] transition-colors" aria-hidden="true" />
          <input
            placeholder="Search sessions, activities, notes... (⌘K)"
            className="w-full bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/10 rounded-full pl-10 pr-20 py-2.5 text-sm transition-all outline-none"
            type="text"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/sessions">
          <button type="button" className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer" title="View Schedule Calendar">
            <Calendar className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
        </Link>

        {/* Notifications Popover matching Consultant Panel UI */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <button type="button" className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer focus:outline-none" title="Notifications">
                <Bell className="w-5 h-5 text-slate-600" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#5e2be2] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[410px] max-w-[92vw] p-0 shadow-2xl rounded-3xl border border-slate-200 overflow-hidden font-sans">
            {/* Popover Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-purple-100 text-[#5e2be2]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-xs font-bold text-[#5e2be2] hover:underline transition-colors cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100 bg-white">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No new notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-slate-50/70 transition-colors ${!item.read ? 'bg-purple-50/20' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Circle Icon Avatar */}
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5e2be2] flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-4.5 h-4.5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">🔔</span>
                            <span className="text-xs font-extrabold text-slate-900">{item.title}</span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-[#5e2be2] shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">{item.time}</span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-normal">
                          {item.description}
                        </p>

                        {/* Rich Embedded Assessment Outcome Card */}
                        {item.type === 'outcome' && (
                          <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs my-2">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-700">{item.metricName}</span>
                              <span className="font-mono text-slate-900 font-extrabold">{item.scoreChange}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-[11px]">Change:</span>
                              <span className="bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                                {item.pointsLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-normal border-t border-slate-200/60 pt-1.5 mt-1">
                              {item.sessionTag}
                            </p>
                          </div>
                        )}

                        <Link
                          href={item.link}
                          onClick={() => markAsRead(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5e2be2] hover:underline pt-0.5"
                        >
                          <span>{item.type === 'outcome' ? 'View Outcome' : 'View Message'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link 
                href="/progress" 
                className="text-xs font-extrabold text-[#5e2be2] hover:underline inline-flex items-center gap-1.5"
              >
                <span>View All Clinical Outcomes Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Message button */}
        <Link href="/messages">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-sm h-10 px-5 shadow-md shadow-[#5e2be2]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Messages</span>
          </button>
        </Link>

        {/* User profile link */}
        <Link href="/profile" className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="relative cursor-pointer">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5e2be2]/30"
              />
            ) : (
              <RedHairAvatar className="w-10 h-10 rounded-full ring-2 ring-[#5e2be2]/30" />
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </Link>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-5 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
