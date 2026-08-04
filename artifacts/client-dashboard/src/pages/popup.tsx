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
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

const SESSION_TYPES = [
  {
    id: 'quick',
    name: 'Quick Career Guidance',
    price: 599,
    duration: '30 Min',
    mode: 'G-Meet',
    description: 'Fast 1-on-1 clarity session to resolve specific career doubts or resume queries.',
  },
  {
    id: 'standard',
    name: 'Standard Career Counseling',
    price: 1199,
    duration: '60 Min',
    mode: 'G-Meet',
    description: 'In-depth evaluation, skill gap analysis, and tailored career roadmap planning.',
  },
  {
    id: 'end-to-end',
    name: 'End to End Career Guidance',
    price: 2999,
    duration: '60 Min x 3 Sessions',
    mode: 'G-Meet',
    description: 'Complete mentorship, portfolio feedback, interview prep, and follow-ups.',
  },
];

const CONSULTANTS = [
  {
    id: 'rajashree',
    name: 'Rajalakshmi A',
    title: 'Certified Career Counsellor',
    experience: '8+ Years',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: '4.9 ★',
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Jenkins',
    title: 'Licensed Clinical Psychologist',
    experience: '12+ Years',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80',
    rating: '5.0 ★',
  },
];

// Time Slots matching 2-hour duration structure
const INITIAL_SLOTS: TimeSlot[] = [
  { id: '1', label: '04:00 - 06:00', available: true },
  { id: '2', label: '06:00 - 08:00', available: true },
  { id: '3', label: '08:00 - 10:00', available: true },
  { id: '4', label: '10:00 - 12:00', available: true },
  { id: '5', label: '12:00 - 14:00', available: false },
  { id: '6', label: '14:00 - 16:00', available: true },
  { id: '7', label: '16:00 - 18:00', available: true },
  { id: '8', label: '18:00 - 20:00', available: true },
  { id: '9', label: '20:00 - 22:00', available: true },
  { id: '10', label: '22:00 - 00:00', available: false },
];

export default function BookingPopupPage() {
  const { toast } = useToast();

  // Popup open by default without needing any button click
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Popup view state: 'slot-selection' | 'confirmed' | 'request-slot' | 'request-submitted'
  const [viewState, setViewState] = useState<'slot-selection' | 'confirmed' | 'request-slot' | 'request-submitted'>('slot-selection');

  // Custom Slot Request Form state
  const [requestCustomTime, setRequestCustomTime] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [isRequestSubmitting, setIsRequestSubmitting] = useState<boolean>(false);

  // Booking selections
  const [selectedSession, setSelectedSession] = useState(SESSION_TYPES[0]);
  const [selectedConsultant, setSelectedConsultant] = useState(CONSULTANTS[0]);

  // DATE STATE: Defaults to Today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // CALENDAR EXPANDED STATE: Appears ONLY when clicked!
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Calendar month state navigation
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  // Time slot selection
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('16:00 - 18:00');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to format date nicely
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

  // Calendar generation helpers
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

    // Previous month padding days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d),
      });
    }

    // Next month padding days to fill 35 or 42 slots
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
        title: 'Please select a time slot',
        description: 'Choose an available time slot for your session.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setViewState('confirmed');
      toast({
        title: '🎉 Booking Confirmed!',
        description: `Your session with ${selectedConsultant.name} is scheduled for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedTimeSlot}.`,
      });
    }, 600);
  };

  const handleRequestSlot = () => {
    if (!requestCustomTime.trim()) {
      toast({
        title: 'Enter preferred time',
        description: 'Please specify your preferred time range or hours.',
        variant: 'destructive',
      });
      return;
    }

    setIsRequestSubmitting(true);
    setTimeout(() => {
      setIsRequestSubmitting(false);
      setViewState('request-submitted');
      toast({
        title: '🎉 Custom Slot Request Sent!',
        description: `Your request for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been submitted to our team.`,
      });
    }, 600);
  };

  const resetBooking = () => {
    setViewState('slot-selection');
    setSelectedDate(new Date());
    setIsCalendarOpen(false);
    setSelectedTimeSlot('16:00 - 18:00');
    setRequestCustomTime('');
    setRequestNotes('');
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

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-purple-200">
      {/* BACKGROUND PAGE CONTENT */}
      <div className={`transition-all duration-300 ${isOpen ? 'filter blur-[2px] opacity-75 pointer-events-none select-none' : ''}`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
              M
            </div>
            <div>
              <span className="text-purple-800 font-black tracking-wider text-xl uppercase">EXPERTIFY</span>
              <span className="block text-[10px] tracking-widest text-slate-400 font-semibold uppercase -mt-1">ANYTIME ANYWHERE</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#services" className="hover:text-purple-700 transition-colors">Services</a>
            <a href="#about" className="hover:text-purple-700 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-purple-700 transition-colors">Contact Us</a>
            <button className="px-4 py-1.5 border border-red-400 text-red-500 rounded-md font-semibold text-xs hover:bg-red-50">
              Logout
            </button>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <img
              src={selectedConsultant.avatar}
              alt={selectedConsultant.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-md"
            />
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">
                <ShieldCheck className="w-4 h-4" /> Verified Consultant
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">{selectedConsultant.name}</h1>
              <p className="text-slate-600 font-medium">{selectedConsultant.title} • {selectedConsultant.experience} Experience</p>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                I believe in building long-term relationships and continuous support to empower your career growth and personal clarity.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all text-sm shrink-0"
            >
              Book Session
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">My Offerings</h2>
            <div className="space-y-4">
              {SESSION_TYPES.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-purple-300 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                    <p className="text-slate-600 font-semibold text-sm">
                      ₹ {service.price} • {service.mode} • For {service.duration}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xl">{service.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSession(service);
                      setViewState('slot-selection');
                      setIsOpen(true);
                    }}
                    className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-all self-end md:self-center"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* RE-OPEN CONTROL FLOATING BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-purple-700 text-white font-bold px-6 py-3.5 rounded-full shadow-2xl hover:bg-purple-800 transition-all"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Open Slot Booking</span>
          </motion.button>
        </div>
      )}

      {/* MODAL POPUP OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            {/* Modal Dialog Container - Clean White & Purple Aesthetic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col font-sans"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {viewState === 'confirmed'
                      ? 'Booking Confirmed'
                      : viewState === 'request-slot'
                      ? 'Request Custom Slot'
                      : viewState === 'request-submitted'
                      ? 'Request Submitted'
                      : 'Book Your Slot'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-xl font-bold leading-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
                {/* ----------------- DIRECT SLOT SELECTION VIEW ----------------- */}
                {viewState === 'slot-selection' && (
                  <div className="space-y-6">
                    {/* DATE DISPLAY CARD & CLICK-TO-EXPAND CALENDAR TOGGLE */}
                    <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
                            Selected Date
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <CalendarIcon className="w-4 h-4 text-purple-800" />
                            <span className="font-extrabold text-slate-900 text-base">
                              {formatDateLabel(selectedDate)}
                            </span>
                          </div>
                        </div>

                        {/* Calendar Click Trigger Button */}
                        <button
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                            isCalendarOpen
                              ? 'bg-purple-700 text-white border-purple-700'
                              : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100/60'
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
                            className="overflow-hidden pt-3 border-t border-purple-200/80"
                          >
                            <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs space-y-3">
                              {/* Month Header Navigation */}
                              <div className="flex items-center justify-between px-2">
                                <button
                                  onClick={prevMonth}
                                  className="w-8 h-8 rounded-full hover:bg-purple-50 flex items-center justify-center text-purple-700"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-black text-slate-900 text-base">
                                  {currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                  onClick={nextMonth}
                                  className="w-8 h-8 rounded-full hover:bg-purple-50 flex items-center justify-center text-purple-700"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Days of Week Header */}
                              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-purple-700 pb-1 border-b border-purple-100">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <div key={day}>{day}</div>
                                ))}
                              </div>

                              {/* Calendar Dates Grid */}
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
                                          ? 'text-slate-300 cursor-not-allowed'
                                          : isSelectedDay
                                          ? 'bg-purple-700 text-white font-bold shadow-md scale-105'
                                          : isToday
                                          ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300'
                                          : 'text-slate-800 hover:bg-purple-50'
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

                    {/* TIME SLOTS GRID */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Time Slot</h3>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          ● {INITIAL_SLOTS.filter(s => s.available).length} Remaining Slots Today
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {INITIAL_SLOTS.map((slot) => {
                          const isSelected = selectedTimeSlot === slot.label;
                          return (
                            <button
                              key={slot.id}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.label)}
                              className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition-all border text-center shadow-2xs ${
                                !slot.available
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-[#4C1D95] text-white border-[#4C1D95] font-black shadow-md scale-[1.01]'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-purple-400 hover:bg-purple-50/50'
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CUSTOM SLOT REQUEST INVITATION */}
                    <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/80 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <MessageSquarePlus className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-950">Slot not working for you?</p>
                          <p className="text-[11px] text-slate-500">Request a custom time slot that fits your schedule.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewState('request-slot')}
                        className="px-3.5 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B1475] text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap"
                      >
                        Request Slot
                      </button>
                    </div>

                    {/* CONFIRM BOOKING BUTTON */}
                    <div className="pt-2">
                      <button
                        onClick={handleConfirmBooking}
                        disabled={isSubmitting || !selectedTimeSlot}
                        className="w-full bg-[#4C1D95] hover:bg-[#3B1475] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Reserving Slot...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Proceed to Pay</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------- BOOKING CONFIRMED SUMMARY ----------------- */}
                {viewState === 'confirmed' && (
                  <div className="space-y-6 text-center py-4 bg-white p-6 rounded-3xl border border-slate-200">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900">Slot Reserved Successfully!</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your appointment has been booked for today's session. Google Meet link sent to your email.
                      </p>
                    </div>

                    <div className="bg-purple-50/80 rounded-2xl p-5 border border-purple-200 text-left space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Consultant</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedConsultant.name}</span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date</span>
                        <span className="font-black text-slate-900">
                          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Time Slot</span>
                        <span className="font-black text-purple-900">{selectedTimeSlot}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Price</span>
                        <span className="font-extrabold text-purple-700 text-sm">₹{selectedSession.price}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/sessions"
                        className="w-full bg-[#4C1D95] hover:bg-[#3B1475] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs inline-flex items-center justify-center gap-2"
                      >
                        <span>View My Sessions Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* ----------------- CUSTOM SLOT REQUEST FORM ----------------- */}
                {viewState === 'request-slot' && (
                  <div className="space-y-5">
                    {/* Header Alert / Intro */}
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <Sparkles className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-bold">Flexible Scheduling</p>
                        <p className="text-amber-800 leading-relaxed">
                          Can't find a time that works? Propose your timing below and our team will coordinate with {selectedConsultant.name} to confirm.
                        </p>
                      </div>
                    </div>

                    {/* Preferred Date Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        1. Preferred Date
                      </label>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-purple-700" />
                          <span className="font-extrabold text-sm text-slate-800">
                            {formatDateLabel(selectedDate)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setViewState('slot-selection');
                            setIsCalendarOpen(true);
                          }}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                        >
                          Change Date
                        </button>
                      </div>
                    </div>

                    {/* Preferred Time Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Enter Preferred Time Slot
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. 07:30 PM - 08:30 PM, or Saturday afternoon"
                          value={requestCustomTime}
                          onChange={(e) => setRequestCustomTime(e.target.value)}
                          className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Message/Notes */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          3. Any specific note or reason? (Optional)
                        </label>
                        <textarea
                          placeholder="Tell us about your availability constraints or what you want to focus on..."
                          value={requestNotes}
                          onChange={(e) => setRequestNotes(e.target.value)}
                          rows={2.5}
                          className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent bg-white shadow-2xs resize-none"
                        />
                      </div>
                    </div>

                    {/* DISCLAIMER NOTE */}
                    <p className="text-[11px] text-slate-500 text-center leading-relaxed italic bg-slate-50 rounded-xl py-2 px-3 border border-slate-100">
                      ℹ️ Note: We can't guarantee confirmation for the time slot you choose. It depends on availability.
                    </p>

                    {/* Submit & Back Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleRequestSlot}
                        disabled={isRequestSubmitting || !requestCustomTime.trim()}
                        className="w-full bg-[#4C1D95] hover:bg-[#3B1475] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isRequestSubmitting ? (
                          <span>Submitting Request...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Custom Slot Request</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewState('slot-selection')}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all text-xs text-center"
                      >
                        Back to Available Slots
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------- SLOT REQUEST SUBMITTED ----------------- */}
                {viewState === 'request-submitted' && (
                  <div className="space-y-6 text-center py-4 bg-white p-6 rounded-3xl border border-slate-200">
                    <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                      <CalendarPlus className="w-9 h-9" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-black text-slate-900">Request Sent Successfully!</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        We've received your request for a custom slot. Our team is coordinating with {selectedConsultant.name} and will get back to you shortly.
                      </p>
                    </div>

                    <div className="bg-purple-50/80 rounded-2xl p-5 border border-purple-200 text-left space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Consultant</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedConsultant.name}</span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Requested Date</span>
                        <span className="font-black text-slate-900">
                          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Requested Time</span>
                        <span className="font-black text-purple-900 uppercase">
                          {requestCustomTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 animate-pulse">
                          Pending Response
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => setViewState('slot-selection')}
                        className="w-full bg-[#4C1D95] hover:bg-[#3B1475] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs inline-flex items-center justify-center gap-2"
                      >
                        <span>View Available Slots Instead</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all text-xs text-center"
                      >
                        Close Window
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
