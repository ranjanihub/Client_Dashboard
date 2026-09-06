import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGetSessions, useCancelSession } from '@workspace/api-client-react';
import { pageTransition, staggerContainer, staggerItem, PageHeader, safeFormatDate } from '@/components/shared';
import { Calendar, Clock, Video, XCircle, RefreshCw, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSessionsQueryKey } from '@workspace/api-client-react';
import { BookingModal } from '@/components/booking-modal';

import { getUserSessions, cancelUserSession, SessionItem } from '@/lib/client-store';

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [storeSessions, setStoreSessions] = useState<SessionItem[]>(() => getUserSessions());
  const { data: apiSessions, isLoading } = useGetSessions({ status: activeTab });
  const cancelMutation = useCancelSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      setStoreSessions(getUserSessions());
    };
    window.addEventListener('client_data_updated', handleUpdate);
    return () => window.removeEventListener('client_data_updated', handleUpdate);
  }, []);

  const allSessions = (Array.isArray(apiSessions) && apiSessions.length > 0) ? apiSessions : storeSessions;
  const sessions = allSessions.filter((s: any) => s.status === activeTab);

  const canReschedule = (scheduledAtStr?: string): boolean => {
    if (!scheduledAtStr) return true;
    const sessionTime = new Date(scheduledAtStr).getTime();
    const diffHours = (sessionTime - Date.now()) / (1000 * 60 * 60);
    return diffHours >= 3;
  };

  const handleCancel = (id: number | string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      cancelUserSession(id);
      setStoreSessions(getUserSessions());
      cancelMutation.mutate({ id: Number(id) || 1 }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSessionsQueryKey({ status: 'upcoming' }) });
          queryClient.invalidateQueries({ queryKey: getGetSessionsQueryKey({ status: 'cancelled' }) });
        }
      });
    }
  };

  return (
    <motion.div {...pageTransition} className="w-full space-y-8 pb-12">
      <PageHeader 
        title="Sessions" 
        description="Manage your therapy appointments and view upcoming schedule."
      >
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="px-5 py-2.5 rounded-full font-bold text-sm bg-white text-[#431bb5] hover:bg-white/90 shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Book New Session
        </button>
      </PageHeader>

      <div className="flex gap-1.5 sm:gap-2 p-1 bg-muted/50 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm capitalize transition-all shrink-0 cursor-pointer ${
              activeTab === tab 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-48 bg-muted rounded-[24px]"></div>)}
        </div>
      ) : sessions?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-[24px] border border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No {activeTab} sessions</h3>
          <p className="text-sm text-muted-foreground mt-1">Your {activeTab} therapy appointments will appear here.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
          {sessions.map((session) => (
            <motion.div key={session.id} variants={staggerItem} className="hex-card !p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Calendar className="w-4 h-4" />
                    <span>{safeFormatDate(session.scheduledAt, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{safeFormatDate(session.scheduledAt, 'h:mm a')} ({session.durationMinutes} mins)</span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50">
                    <img 
                      src={
                        session.therapistAvatarUrl && !session.therapistAvatarUrl.includes('photo-1559839734')
                          ? session.therapistAvatarUrl 
                          : "https://res.cloudinary.com/ddgvdabyf/image/upload/v1766954534/uploads/orwxj9dw0f2bnj5cgxex.webp"
                      } 
                      alt={session.therapistName} 
                      className="w-8 h-8 rounded-full object-cover border border-primary/20" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://res.cloudinary.com/ddgvdabyf/image/upload/v1766954534/uploads/orwxj9dw0f2bnj5cgxex.webp";
                      }}
                    />
                    <span className="font-semibold text-sm text-foreground">
                      {session.therapistName?.includes(' - By ') 
                        ? session.therapistName.split(' - By ').pop()?.trim() 
                        : session.therapistName || 'Assigned Therapist'}
                    </span>
                  </div>
                  
                  {activeTab === 'upcoming' && !canReschedule(session.scheduledAt) && (
                    <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Reschedule locked (&lt; 3h to session)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border mt-auto">
                  {activeTab === 'upcoming' && (
                    <>
                      {session.joinUrl ? (
                        <a href={session.joinUrl} target="_blank" rel="noreferrer" className="hex-button-primary flex-1 sm:flex-none gap-2">
                          <Video className="w-5 h-5" /> Join Session
                        </a>
                      ) : (
                        <button disabled className="h-[48px] px-6 rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center flex-1 sm:flex-none cursor-not-allowed">
                          Link available soon
                        </button>
                      )}
                      <div className="flex gap-3 w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto">
                        {canReschedule(session.scheduledAt) ? (
                          <button 
                            onClick={() => setIsBookingOpen(true)}
                            className="hex-button-outline flex-1 sm:flex-none gap-2 text-sm cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" /> Reschedule
                          </button>
                        ) : (
                          <div className="relative group flex-1 sm:flex-none">
                            <button 
                              type="button"
                              disabled
                              className="h-[48px] px-5 rounded-full bg-slate-100 dark:bg-muted/40 text-slate-400 dark:text-muted-foreground font-semibold flex items-center justify-center w-full text-sm gap-2 cursor-not-allowed border border-slate-200/80 dark:border-border/50 opacity-70"
                            >
                              <RefreshCw className="w-4 h-4 opacity-40" /> Reschedule
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-20">
                              Reschedule option is only available 3 hrs before session
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={() => handleCancel(session.id)}
                          disabled={cancelMutation.isPending}
                          className="h-[48px] px-6 rounded-full bg-red-50 text-destructive font-semibold flex items-center justify-center flex-1 sm:flex-none hover:bg-red-100 transition-colors text-sm gap-2 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </>
                  )}
                  {activeTab === 'past' && (
                    <div className="flex items-center gap-2 text-success font-medium bg-success-bg px-4 py-2 rounded-lg text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </div>
                  )}
                  {activeTab === 'cancelled' && (
                    <div className="flex items-center gap-2 text-destructive font-medium bg-red-50 px-4 py-2 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" /> Cancelled
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Therapist Availability Popup Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        therapistName={sessions[0]?.therapistName || "Sadaf Bhimani"}
        therapistAvatar={sessions[0]?.therapistAvatarUrl || "https://res.cloudinary.com/ddgvdabyf/image/upload/v1766954534/uploads/orwxj9dw0f2bnj5cgxex.webp"}
      />
    </motion.div>
  );
}
