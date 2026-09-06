import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquarePlus,
  Send,
  CalendarPlus,
  Sparkles,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSessionsQueryKey } from '@workspace/api-client-react';
import { addUserSession } from '@/lib/client-store';

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

const INITIAL_SLOTS: TimeSlot[] = [
  { id: '1', label: '08:00 AM - 09:00 AM', available: true },
  { id: '2', label: '09:30 AM - 10:30 AM', available: true },
  { id: '3', label: '11:00 AM - 12:00 PM', available: true },
  { id: '4', label: '01:30 PM - 02:30 PM', available: false },
  { id: '5', label: '03:00 PM - 04:00 PM', available: true },
  { id: '6', label: '04:30 PM - 05:30 PM', available: true },
  { id: '7', label: '06:00 PM - 07:00 PM', available: true },
  { id: '8', label: '07:30 PM - 08:30 PM', available: false },
];

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistName?: string;
  therapistAvatar?: string;
  therapistTitle?: string;
  onBookingSuccess?: (newSession: any) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  therapistName = "Sadaf Bhimani",
  therapistAvatar = "https://res.cloudinary.com/ddgvdabyf/image/upload/v1766954534/uploads/orwxj9dw0f2bnj5cgxex.webp",
  therapistTitle = "Certified Mental Health Counsellor & Psychologist",
  onBookingSuccess
}: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // View state: 'slot-selection' | 'confirmed' | 'request-slot' | 'request-submitted'
  const [viewState, setViewState] = useState<'slot-selection' | 'confirmed' | 'request-slot' | 'request-submitted'>('slot-selection');

  // Custom Slot Request state
  const [requestCustomTime, setRequestCustomTime] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [isRequestSubmitting, setIsRequestSubmitting] = useState<boolean>(false);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  // Time slot selection
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30 AM - 10:30 AM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return isToday ? `Today (${formatted})` : formatted;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d),
      });
    }

    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let n = 1; n <= remainingSlots; n++) {
      days.push({
        day: n,
        isCurrentMonth: false,
        date: new Date(year, month + 1, n),
      });
    }

    return days;
  };

  const handleConfirmBooking = () => {
    if (!selectedTimeSlot) {
      toast({
        title: 'Select a time slot',
        description: 'Please pick an available time slot for your session.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setViewState('confirmed');
      
      // Invalidate query cache for sessions so lists update
      queryClient.invalidateQueries({ queryKey: getGetSessionsQueryKey({ status: 'upcoming' }) });

      const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const newBookedSession = addUserSession({
        therapistName,
        therapistAvatarUrl: therapistAvatar,
        therapistTitle,
        scheduledAt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 0).toISOString(),
        durationMinutes: 50,
        notes: `Virtual consultation confirmed for ${dateStr} at ${selectedTimeSlot}.`,
      });

      toast({
        title: '🎉 Session Scheduled!',
        description: `Your therapy appointment with ${therapistName} is confirmed for ${dateStr} at ${selectedTimeSlot}.`,
      });

      if (onBookingSuccess) {
        onBookingSuccess(newBookedSession);
      }
    }, 600);
  };

  const handleRequestSlot = () => {
    if (!requestCustomTime.trim()) {
      toast({
        title: 'Enter preferred timing',
        description: 'Please specify your preferred hours or custom time range.',
        variant: 'destructive',
      });
      return;
    }

    setIsRequestSubmitting(true);
    setTimeout(() => {
      setIsRequestSubmitting(false);
      setViewState('request-submitted');
      toast({
        title: '🎉 Request Sent!',
        description: `Custom slot request for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been sent to ${therapistName}.`,
      });
    }, 600);
  };

  const prevMonth = () => {
    setCurrentCalendarMonth(
      new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentCalendarMonth(
      new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1)
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-lg bg-background text-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 max-h-[92vh] flex flex-col font-sans"
        >
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-primary/20 shrink-0">
                <img 
                  src={therapistAvatar} 
                  alt={therapistName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                  {viewState === 'confirmed'
                    ? 'Booking Confirmed'
                    : viewState === 'request-slot'
                    ? 'Request Custom Time'
                    : viewState === 'request-submitted'
                    ? 'Request Submitted'
                    : 'Book Session'}
                </h2>
                <p className="text-xs text-primary font-medium">{therapistName} • Availability</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MODAL BODY */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-background">
            {/* SLOT SELECTION VIEW */}
            {viewState === 'slot-selection' && (
              <div className="space-y-6">
                {/* DATE SELECTOR & EXPANDABLE CALENDAR */}
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                        Selected Date
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span className="font-extrabold text-foreground text-base">
                          {formatDateLabel(selectedDate)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                        isCalendarOpen
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-primary border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      <span>{isCalendarOpen ? 'Close Calendar' : 'Change Date'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* EXPANDABLE MONTH CALENDAR */}
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pt-3 border-t border-primary/10"
                      >
                        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
                          <div className="flex items-center justify-between px-2">
                            <button
                              onClick={prevMonth}
                              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-foreground"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-extrabold text-foreground text-base">
                              {currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              onClick={nextMonth}
                              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-foreground"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-primary pb-1 border-b border-border">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day}>{day}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                            {renderCalendarDays().map((d, index) => {
                              const isSelectedDay =
                                d.isCurrentMonth &&
                                d.date.getDate() === selectedDate.getDate() &&
                                d.date.getMonth() === selectedDate.getMonth() &&
                                d.date.getFullYear() === selectedDate.getFullYear();

                              const isToday =
                                d.isCurrentMonth &&
                                d.date.getDate() === new Date().getDate() &&
                                d.date.getMonth() === new Date().getMonth() &&
                                d.date.getFullYear() === new Date().getFullYear();

                              return (
                                <button
                                  key={index}
                                  disabled={!d.isCurrentMonth}
                                  onClick={() => {
                                    setSelectedDate(d.date);
                                    setIsCalendarOpen(false);
                                    toast({
                                      title: 'Date Selected',
                                      description: `Showing slots for ${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                                    });
                                  }}
                                  className={`h-9 w-9 rounded-full flex items-center justify-center mx-auto transition-all font-semibold ${
                                    !d.isCurrentMonth
                                      ? 'text-muted-foreground/40 cursor-not-allowed'
                                      : isSelectedDay
                                      ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105'
                                      : isToday
                                      ? 'bg-primary/20 text-primary font-extrabold border border-primary/30'
                                      : 'text-foreground hover:bg-muted'
                                  }`}
                                >
                                  {d.day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TIME SLOTS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-foreground text-base tracking-tight">Available Time Slots</h3>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                      ● {INITIAL_SLOTS.filter(s => s.available).length} Slots Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {INITIAL_SLOTS.map((slot) => {
                      const isSelected = selectedTimeSlot === slot.label;
                      return (
                        <button
                          key={slot.id}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.label)}
                          className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition-all border text-center ${
                            !slot.available
                              ? 'bg-muted/40 text-muted-foreground/50 border-border cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-black shadow-md scale-[1.01]'
                              : 'bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CUSTOM TIME REQUEST INVITATION */}
                <div className="bg-muted/40 rounded-2xl p-3.5 sm:p-4 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <MessageSquarePlus className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Need a different timing?</p>
                      <p className="text-[11px] text-muted-foreground">Propose a custom time slot directly to {therapistName}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewState('request-slot')}
                    className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold shadow-xs transition-all whitespace-nowrap"
                  >
                    Request Slot
                  </button>
                </div>

                {/* CONFIRM BOOKING BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !selectedTimeSlot}
                    className="w-full hex-button-primary py-3.5 px-6 rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Reserving Slot...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Confirm & Schedule Session</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* BOOKING CONFIRMED */}
            {viewState === 'confirmed' && (
              <div className="space-y-6 text-center py-4 bg-card p-6 rounded-3xl border border-border">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground">Session Confirmed!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Your session with {therapistName} has been booked. Meeting link and calendar invite sent to your email.
                  </p>
                </div>

                <div className="bg-muted/40 rounded-2xl p-5 border border-border text-left space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Therapist</span>
                    <span className="font-bold text-foreground text-sm">{therapistName}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Date</span>
                    <span className="font-black text-foreground">
                      {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Time Slot</span>
                    <span className="font-black text-primary">{selectedTimeSlot}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Session Format</span>
                    <span className="font-extrabold text-foreground flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-primary" /> 50 Min Video Session
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full hex-button-primary py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>Done & View Sessions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CUSTOM SLOT REQUEST */}
            {viewState === 'request-slot' && (
              <div className="space-y-5">
                <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Flexible Scheduling Request</p>
                    <p className="leading-relaxed">
                      Propose your preferred day and time. {therapistName} will review and confirm availability.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    1. Preferred Date
                  </label>
                  <div className="bg-muted/40 rounded-xl p-3 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="font-extrabold text-sm text-foreground">
                        {formatDateLabel(selectedDate)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setViewState('slot-selection');
                        setIsCalendarOpen(true);
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Change Date
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Enter Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 07:30 PM - 08:30 PM, or Saturday afternoon"
                      value={requestCustomTime}
                      onChange={(e) => setRequestCustomTime(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background shadow-xs text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      3. Additional Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Share any details about your preferred topic or constraints..."
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      rows={2.5}
                      className="w-full text-xs font-semibold p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background shadow-xs text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRequestSlot}
                    disabled={isRequestSubmitting || !requestCustomTime.trim()}
                    className="w-full hex-button-primary py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRequestSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Custom Time Request</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState('slot-selection')}
                    className="w-full hex-button-secondary py-2.5 px-6 rounded-xl transition-all text-xs text-center"
                  >
                    Back to Available Slots
                  </button>
                </div>
              </div>
            )}

            {/* REQUEST SUBMITTED */}
            {viewState === 'request-submitted' && (
              <div className="space-y-6 text-center py-4 bg-card p-6 rounded-3xl border border-border">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CalendarPlus className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black text-foreground">Request Sent!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Your custom timing request has been submitted to {therapistName}. You will receive a notification once confirmed.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setViewState('slot-selection')}
                    className="w-full hex-button-primary py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>View Available Slots</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full hex-button-secondary py-2.5 px-6 rounded-xl transition-all text-xs text-center"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
