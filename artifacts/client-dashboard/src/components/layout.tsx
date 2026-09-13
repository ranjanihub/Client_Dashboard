import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCheck,
  Brain,
  ArrowRight,
  X
} from 'lucide-react';
import { useGetClientProfile } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertifyLogo } from './logo';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/therapist', label: 'My Therapist', icon: User },
      { path: '/sessions', label: 'Sessions', icon: Video },
      { path: '/messages', label: 'Messages', icon: MessageSquare },
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

import { logoutClient, getClientAuth } from '@/lib/auth';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { data: profile } = useGetClientProfile();
  const [showLogout, setShowLogout] = useState(false);

  const handlePerformLogout = () => {
    logoutClient();
    setShowLogout(false);
    setLocation('/login');
  };

  const authUser = getClientAuth();
  const displayName = authUser?.name || profile?.name || 'Client User';
  const displayAvatar = authUser?.avatarUrl || profile?.avatarUrl;

  const navContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Top Logo Header */}
      <div className="p-6 pb-4 border-b border-sidebar-border/50 flex items-center justify-between">
        <Link href="/" onClick={onCloseMobile}>
          <ExpertifyLogo />
        </Link>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
                  <Link key={item.path} href={item.path} onClick={onCloseMobile}>
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
        <Link href="/profile" onClick={onCloseMobile} className="block group">
          <div className="p-3 rounded-2xl bg-[#F5F6F9] dark:bg-muted/50 border border-slate-200/50 dark:border-border/40 shadow-xs hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-[#4f28d9] to-[#8b5cf6] text-white font-bold text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-primary/20 transition-all shadow-sm">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-bold text-slate-800 dark:text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                  {displayName}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-muted-foreground truncate leading-tight mt-0.5 font-normal capitalize">
                  {authUser?.role || 'Client'}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-30 hidden md:flex">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 md:hidden shadow-2xl flex flex-col"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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
                  onClick={handlePerformLogout}
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

interface TopNavProps {
  onOpenMobileSidebar?: () => void;
}

export function TopNav({ onOpenMobileSidebar }: TopNavProps) {
  const { data: profile } = useGetClientProfile();
  const authUser = getClientAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const displayName = authUser?.name || profile?.name || 'Client User';
  const displayAvatar = authUser?.avatarUrl || profile?.avatarUrl;

  const fetchClientNotifications = useCallback(() => {
    const userEmail = (authUser?.email || profile?.email || '').trim().toLowerCase();
    const userId = authUser?.id || '';
    const params = new URLSearchParams({ role: 'CLIENT' });
    if (userEmail) params.append('recipientEmail', userEmail);
    if (userId) params.append('recipientId', userId);

    fetch(`/api/notifications?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data?.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      })
      .catch(() => {
        // Leave notifications as whatever was previously fetched or empty array
      });
  }, [authUser?.email, authUser?.id, profile?.email]);

  useEffect(() => {
    fetchClientNotifications();
    const interval = setInterval(fetchClientNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchClientNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const userEmail = (authUser?.email || profile?.email || '').trim().toLowerCase();
    fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'CLIENT', recipientEmail: userEmail })
    }).catch(() => {});
  };

  const markAsRead = (id: string | number) => {
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }).catch(() => {});
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#eef1f6] shadow-xs">
      <div className="h-16 md:h-20 px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2">
        {/* Left Mobile Menu Toggle & Brand Logo */}
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

          {/* Search Input - Desktop */}
          <div className="flex-1 max-w-xs sm:max-w-md md:max-w-xl relative hidden sm:block">
            <div className="relative group z-30">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#5e2be2] transition-colors" aria-hidden="true" />
              <input
                placeholder="Search sessions, activities... (⌘K)"
                className="w-full bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/10 rounded-full pl-9 sm:pl-10 pr-12 sm:pr-20 py-1.5 sm:py-2 text-xs sm:text-sm transition-all outline-none"
                type="text"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 shrink-0">
          <Link href="/sessions">
            <button type="button" className="p-2 sm:p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer" title="View Schedule Calendar">
              <Calendar className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-slate-600" aria-hidden="true" />
            </button>
          </Link>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <button type="button" className="p-2 sm:p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer focus:outline-none" title="Notifications">
                  <Bell className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-slate-600" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#5e2be2] rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] sm:w-[410px] max-w-[calc(100vw-24px)] p-0 shadow-2xl rounded-3xl border border-slate-200 overflow-hidden font-sans">
              {/* Popover Header */}
              <div className="p-4 bg-[#5e2be2] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <h3 className="font-bold text-sm">Notifications</h3>
                </div>
                {unreadCount > 0 && (
                  <button 
                    type="button"
                    onClick={markAllRead} 
                    className="text-xs text-white/80 hover:text-white flex items-center gap-1 underline transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
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
                  notifications.map((item) => {
                    const notifId = item.id || item._id;
                    const notifLink = item.link || (item.type === 'outcome' ? '/progress' : item.type === 'message' ? '/messages' : item.type === 'SESSION_RESCHEDULED' ? '/sessions' : '/progress');
                    return (
                      <div
                        key={notifId}
                        className={`p-4 hover:bg-slate-50/70 transition-colors ${!item.read ? 'bg-purple-50/20' : ''}`}
                      >
                        <div className="flex items-start gap-3">
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
                              <span className="text-[11px] font-medium text-slate-400">
                                {item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium leading-normal">
                              {item.description || item.message}
                            </p>

                            {item.type === 'outcome' && item.metricName && (
                              <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs my-2">
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-slate-700">{item.metricName}</span>
                                  <span className="font-mono text-slate-900 font-extrabold">{item.scoreChange}</span>
                                </div>
                                {item.pointsLabel && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[11px]">Change:</span>
                                    <span className="bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                                      {item.pointsLabel}
                                    </span>
                                  </div>
                                )}
                                {item.sessionTag && (
                                  <p className="text-[11px] text-slate-400 font-normal border-t border-slate-200/60 pt-1.5 mt-1">
                                    {item.sessionTag}
                                  </p>
                                )}
                              </div>
                            )}

                            <Link
                              href={notifLink}
                              onClick={() => markAsRead(notifId)}
                              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5e2be2] hover:underline pt-0.5"
                            >
                              <span>{item.type === 'outcome' ? 'View Outcome' : item.type === 'message' ? 'View Message' : 'View Details'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
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

        {/* Message button - Circular on mobile, pill with text on desktop */}
        <Link href="/messages">
          <button 
            type="button" 
            className="w-9 h-9 sm:w-auto sm:h-10 rounded-full bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs sm:text-sm flex items-center justify-center sm:px-4 shadow-md shadow-[#5e2be2]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Messages</span>
          </button>
        </Link>

        {/* User profile link */}
        <Link href="/profile" className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
          <div className="relative cursor-pointer">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="User Avatar"
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover ring-2 ring-[#5e2be2]/30"
              />
            ) : (
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-tr from-[#4f28d9] to-[#8b5cf6] text-white font-bold text-xs sm:text-sm flex items-center justify-center ring-2 ring-[#5e2be2]/30 shadow-sm">
                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </Link>
      </div>
    </div>

      {/* Mobile Search Bar below top header tabs */}
      <div className="px-3 pb-3 sm:hidden">
        <div className="relative group z-30">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#5e2be2] transition-colors" aria-hidden="true" />
          <input
            placeholder="Search sessions, activities..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-[#5e2be2] focus:ring-2 focus:ring-[#5e2be2]/10 rounded-full pl-9 pr-4 py-2 text-xs transition-all outline-none"
            type="text"
          />
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full min-w-0">
        <TopNav onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
