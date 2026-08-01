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
} from 'lucide-react';
import { useGetClientProfile } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertifyLogo } from './logo';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New message from Dr. Sarah Jenkins',
    description: "That's fantastic news! Great work applying the techniques...",
    time: '10m ago',
    read: false,
    link: '/messages',
  },
  {
    id: 2,
    title: 'Upcoming Session Reminder',
    description: 'Your therapy session is scheduled for tomorrow at 10:00 AM.',
    time: '2h ago',
    read: false,
    link: '/sessions',
  },
  {
    id: 3,
    title: 'New Activity Assigned',
    description: 'Morning Mindfulness Meditation has been added to your plan.',
    time: '1d ago',
    read: true,
    link: '/activities',
  },
];

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/therapist', label: 'My Therapist', icon: User },
      { path: '/sessions', label: 'Sessions', icon: Video },
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
      { path: '/messages', label: 'Messages', icon: MessageSquare },
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
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-40">
        {/* Logo */}
        <div className="px-4 py-4 flex items-center">
          <Link href="/dashboard" className="block w-full">
            <ExpertifyLogo className="h-12 w-auto" />
          </Link>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[9px] font-bold tracking-widest text-muted-foreground/50 uppercase select-none">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path} className="block">
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer text-[13px] font-medium
                          ${isActive
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
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
    <header className="h-[60px] bg-card border-b border-border sticky top-0 z-30 flex items-center justify-between px-5 gap-4">
      {/* Mobile menu */}
      <button className="md:hidden text-muted-foreground">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-background text-muted-foreground px-3 py-2 rounded-lg border border-border w-full focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search sessions, activities, notes..."
            className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Icon buttons */}
        <Link href="/sessions" className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Sessions">
          <Calendar className="w-4 h-4" />
        </Link>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative" title="Notifications">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-[1.5px] ring-card" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-xl border-border">
            <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => markAsRead(item.id)}
                    className={`block p-3 hover:bg-muted/50 transition-colors ${!item.read ? 'bg-accent/30' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground leading-tight">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.description}</p>
                        <span className="text-[10px] text-muted-foreground/70 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Message button */}
        <Link href="/messages" className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:brightness-110 transition-all">
          <MessageSquare className="w-3.5 h-3.5" />
          Messages
        </Link>

        {/* User avatar */}
        <Link href="/profile" className="block ml-1">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <RedHairAvatar className="w-8 h-8 rounded-full" />
          )}
        </Link>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-[220px] flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-5 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
