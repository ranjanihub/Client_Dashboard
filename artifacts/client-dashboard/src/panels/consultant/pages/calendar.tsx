import { useState, useMemo } from "react";
import { useGetCalendarEvents } from "@workspace/api-client-react";
import SetAvailabilityDialog from "@/components/SetAvailabilityDialog";
import AddEventDialog from "@/components/AddEventDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  Plus,
  Globe,
  Users,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Calendar as CalendarIcon,
  Trash2,
  Lock,
  Unlock,
  Ban,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

/* ─── helpers ─────────────────────────────────────────────── */
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function startOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

function checkCanCancelSlot(key: string, timeStr: string): { canCancel: boolean; hoursLeft: number } {
  try {
    const parts = key.split("-");
    if (parts.length !== 3) return { canCancel: true, hoursLeft: 24 };

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { canCancel: true, hoursLeft: 24 };

    let h = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const slotDate = new Date(y, m, d, h, min);
    const now = new Date();

    const diffHours = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      canCancel: diffHours >= 3,
      hoursLeft: Math.max(0, Math.round(diffHours * 10) / 10),
    };
  } catch {
    return { canCancel: true, hoursLeft: 24 };
  }
}

export type SessionStatus = "booked" | "available" | "blocked";

export interface SessionSlot {
  client: string;
  initials: string;
  time: string;
  type: string;
  duration: string;
  status: SessionStatus;
}

/* Mock sessions keyed by "YYYY-M-D" */
const INITIAL_SESSION_DATA: Record<string, SessionSlot[]> = {
  "2026-7-27": [
    { client: "Sarah Jenkins", initials: "SJ", time: "09:00 AM", type: "CBT · Cognitive Restructuring", duration: "60 min", status: "booked" },
    { client: "Michael Chen", initials: "MC", time: "10:30 AM", type: "ACT · Values Clarification", duration: "60 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "12:00 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Blocked Time Slot", initials: "BLOCK", time: "01:30 PM", type: "Unavailable / Blocked by Therapist", duration: "60 min", status: "blocked" },
    { client: "David Kim", initials: "DK", time: "02:00 PM", type: "CBT · Exposure Hierarchy", duration: "60 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "03:30 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Emily Rodriguez", initials: "ER", time: "04:30 PM", type: "DBT · Distress Tolerance", duration: "60 min", status: "booked" },
  ],
  "2026-7-28": [
    { client: "Sarah Jenkins", initials: "SJ", time: "10:00 AM", type: "CBT · Session 13", duration: "50 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "11:30 AM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Blocked Time Slot", initials: "BLOCK", time: "01:00 PM", type: "Admin / Personal Block", duration: "60 min", status: "blocked" },
    { client: "Michael Chen", initials: "MC", time: "02:00 PM", type: "ACT · Session 9", duration: "50 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "04:00 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
  ],
  "2026-7-29": [
    { client: "David Kim", initials: "DK", time: "09:00 AM", type: "CBT · Session 3", duration: "50 min", status: "booked" },
    { client: "Emily Rodriguez", initials: "ER", time: "11:00 AM", type: "DBT · Session 16", duration: "50 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "01:30 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Blocked Time Slot", initials: "BLOCK", time: "03:30 PM", type: "Unavailable / Blocked by Therapist", duration: "50 min", status: "blocked" },
  ],
  "2026-7-30": [
    { client: "Sarah Jenkins", initials: "SJ", time: "10:00 AM", type: "CBT · Check-in", duration: "50 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "11:30 AM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Michael Chen", initials: "MC", time: "02:00 PM", type: "ACT · Behavioral Activation", duration: "50 min", status: "booked" },
    { client: "Open Consultation Slot", initials: "OPEN", time: "04:30 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
  ],
  "2026-7-31": [
    { client: "Open Consultation Slot", initials: "OPEN", time: "11:00 AM", type: "Available for Client Booking", duration: "50 min", status: "available" },
    { client: "Emily Rodriguez", initials: "ER", time: "01:00 PM", type: "DBT · Mindfulness", duration: "50 min", status: "booked" },
    { client: "Jessica Taylor", initials: "JT", time: "03:00 PM", type: "CBT · Graduation Check-in", duration: "50 min", status: "booked" },
    { client: "Blocked Time Slot", initials: "BLOCK", time: "05:00 PM", type: "Unavailable / Blocked by Therapist", duration: "50 min", status: "blocked" },
  ],
};

const DEFAULT_DAY_SLOTS: SessionSlot[] = [
  { client: "Open Consultation Slot", initials: "OPEN", time: "10:00 AM", type: "Available for Client Booking", duration: "50 min", status: "available" },
  { client: "Blocked Time Slot", initials: "BLOCK", time: "12:30 PM", type: "Unavailable / Blocked by Therapist", duration: "60 min", status: "blocked" },
  { client: "Open Consultation Slot", initials: "OPEN", time: "02:30 PM", type: "Available for Client Booking", duration: "50 min", status: "available" },
];

/* Session dot indicator colours */
function dotColor(count: number) {
  if (count >= 5) return "bg-[#5e2be2]";
  if (count >= 3) return "bg-[#5e2be2]/60";
  return "bg-[#5e2be2]/30";
}

/* ─── component ───────────────────────────────────────────── */
export default function Calendar() {
  const { toast } = useToast();
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // 0-indexed, 6 = July
  const [selectedDay, setSelectedDay] = useState(27); // July 27
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);

  // Dynamic session data state to support delete, reschedule, block, and available slots
  const [sessionData, setSessionData] = useState<Record<string, SessionSlot[]>>(INITIAL_SESSION_DATA);

  // Reschedule dialog state
  const [confirmRescheduleOpen, setConfirmRescheduleOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ key: string; index: number; session: SessionSlot } | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("2026-07-29");
  const [rescheduleTime, setRescheduleTime] = useState("11:00 AM");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Assign client dialog state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ key: string; index: number; slot: SessionSlot } | null>(null);
  const [assignClientName, setAssignClientName] = useState("Sarah Jenkins");
  const [assignType, setAssignType] = useState("Individual CBT Therapy");

  const { data: events } = useGetCalendarEvents();

  const sessionKey = `${year}-${month + 1}-${selectedDay}`;
  const daySessions = sessionData[sessionKey] ?? DEFAULT_DAY_SLOTS;

  const bookedCount = daySessions.filter(s => s.status === 'booked' || (s.client !== 'Open Consultation Slot' && s.status !== 'blocked' && s.client !== 'Blocked Time Slot')).length;
  const availableCount = daySessions.filter(s => s.status === 'available' || (s.client === 'Open Consultation Slot' && s.status !== 'blocked')).length;
  const blockedCount = daySessions.filter(s => s.status === 'blocked' || s.client === 'Blocked Time Slot').length;

  /* calendar grid */
  const firstDay = startOfMonth(year, month);
  const totalDays = daysInMonth(year, month);
  const cells = Array.from({ length: firstDay + totalDays }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(1);
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleToggleBlockSlot = (key: string, index: number) => {
    setSessionData((prev) => {
      const updated = { ...prev };
      const currentList = updated[key] ?? [...DEFAULT_DAY_SLOTS];
      const slot = currentList[index];
      if (!slot) return prev;

      const isBookedClient = slot.status === "booked" && slot.client !== "Open Consultation Slot" && slot.client !== "Blocked Time Slot";
      if (isBookedClient) {
        toast({
          title: "Booked Client Session",
          description: `This slot is currently booked for ${slot.client}. Please reschedule or delete the session to alter availability.`,
        });
        return prev;
      }

      const isCurrentlyBlocked = slot.status === "blocked" || slot.client === "Blocked Time Slot";
      const newStatus: SessionStatus = isCurrentlyBlocked ? "available" : "blocked";

      const updatedSlots = [...currentList];
      updatedSlots[index] = {
        ...slot,
        client: newStatus === "blocked" ? "Blocked Time Slot" : "Open Consultation Slot",
        initials: newStatus === "blocked" ? "BLOCK" : "OPEN",
        type: newStatus === "blocked" ? "Unavailable / Blocked by Therapist" : "Available for Client Booking",
        status: newStatus,
      };

      updated[key] = updatedSlots;

      toast({
        title: isCurrentlyBlocked ? "Slot Unblocked " : "Slot Blocked ",
        description: isCurrentlyBlocked
          ? `Time slot at ${slot.time} is now open and available for client bookings.`
          : `Time slot at ${slot.time} has been blocked from client bookings.`,
      });

      return updated;
    });
  };

  const handleAddSlotFromDialog = (newSlot: { date: string; time: string; title: string; client: string; type: string; duration: string; status: SessionStatus }) => {
    const parts = newSlot.date.split("-");
    const key = parts.length === 3 ? `${parseInt(parts[0])}-${parseInt(parts[1])}-${parseInt(parts[2])}` : sessionKey;

    const initials = newSlot.client === "Blocked Time Slot" ? "BLOCK" : newSlot.client === "Open Consultation Slot" ? "OPEN" : newSlot.client.split(" ").map(n => n[0]).join("").toUpperCase();

    const slotItem: SessionSlot = {
      client: newSlot.client,
      initials,
      time: newSlot.time,
      type: newSlot.type,
      duration: newSlot.duration,
      status: newSlot.status,
    };

    setSessionData((prev) => {
      const updated = { ...prev };
      const existing = updated[key] ? [...updated[key]] : [...DEFAULT_DAY_SLOTS];
      updated[key] = [...existing, slotItem];
      return updated;
    });

    toast({
      title: "Slot Added to Calendar! 📅",
      description: `Added ${newSlot.status} slot at ${newSlot.time} for ${newSlot.date}.`,
    });
  };

  const handleConfirmCancelBooking = () => {
    if (!rescheduleTarget) return;

    const { key, index, session } = rescheduleTarget;

    setSessionData((prev) => {
      const updated = { ...prev };
      const currentList = updated[key] ? [...updated[key]] : [...DEFAULT_DAY_SLOTS];
      if (currentList[index]) {
        currentList[index] = {
          ...currentList[index],
          client: "Open Consultation Slot",
          initials: "OPEN",
          type: "Available for Client Booking",
          status: "available",
        };
        updated[key] = currentList;
      }
      return updated;
    });

    setConfirmRescheduleOpen(false);
    setRescheduleTarget(null);

    toast({
      title: "Booking Cancelled",
      description: `The booking for ${session.client} at ${session.time} has been cancelled. The slot is now open.`,
    });
  };

  const handleOpenReschedule = (key: string, index: number, session: SessionSlot) => {
    const { canCancel, hoursLeft } = checkCanCancelSlot(key, session.time);

    if (!canCancel) {
      toast({
        variant: "destructive",
        title: "Cancellation Policy Restriction",
        description: `Sessions can only be cancelled at least 3 hours before start time. (Session starts in ${hoursLeft > 0 ? `${hoursLeft} hrs` : "less than 3 hrs"}).`,
      });
      return;
    }

    setRescheduleTarget({ key, index, session });
    setRescheduleTime(session.time);
    setRescheduleDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`);
    setRescheduleReason("");
    setConfirmRescheduleOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget) return;

    const { key: oldKey, index, session } = rescheduleTarget;
    const parts = rescheduleDate.split("-");
    const newKey = parts.length === 3 ? `${parseInt(parts[0])}-${parseInt(parts[1])}-${parseInt(parts[2])}` : oldKey;

    setSessionData((prev) => {
      const updated = { ...prev };

      // Remove from old key
      if (updated[oldKey]) {
        updated[oldKey] = updated[oldKey].filter((_, i) => i !== index);
      }

      // Add to new key with updated time
      const updatedSession = { ...session, time: rescheduleTime };
      if (!updated[newKey]) {
        updated[newKey] = [...DEFAULT_DAY_SLOTS];
      }
      updated[newKey] = [...updated[newKey], updatedSession];

      return updated;
    });

    setRescheduleModalOpen(false);
    setRescheduleTarget(null);

    toast({
      title: "Session Rescheduled! 📅",
      description: `Successfully rescheduled session for ${session.client} to ${rescheduleDate} at ${rescheduleTime}.`,
    });
  };

  const handleOpenAssignClient = (key: string, index: number, slot: SessionSlot) => {
    setAssignTarget({ key, index, slot });
    setAssignClientName("Sarah Jenkins");
    setAssignType("Individual CBT Therapy");
    setAssignModalOpen(true);
  };

  const handleConfirmAssignClient = () => {
    if (!assignTarget) return;
    const { key, index, slot } = assignTarget;

    const initials = assignClientName.split(" ").map(n => n[0]).join("").toUpperCase();

    setSessionData((prev) => {
      const updated = { ...prev };
      if (!updated[key]) {
        updated[key] = [...DEFAULT_DAY_SLOTS];
      }
      if (updated[key][index]) {
        updated[key][index] = {
          ...slot,
          client: assignClientName,
          initials: initials,
          type: assignType,
          status: "booked",
        };
      }
      return updated;
    });

    setAssignModalOpen(false);
    setAssignTarget(null);

    toast({
      title: "Client Booked!",
      description: `Assigned ${assignClientName} to open slot at ${slot.time}.`,
    });
  };

  const handleDeleteSlot = (key: string, index: number, clientName: string, slotTime: string) => {
    setSessionData((prev) => {
      const updated = { ...prev };
      if (!updated[key]) {
        updated[key] = [...DEFAULT_DAY_SLOTS];
      }
      if (updated[key]) {
        updated[key] = updated[key].filter((_, i) => i !== index);
      }
      return updated;
    });

    toast({
      title: "Session Slot Deleted ",
      description: `Slot for ${clientName} at ${slotTime} has been removed from calendar.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Session Schedule & Availability"
        description="View booked client therapy appointments, set your recurring weekly availability, and manage consultation slots."
        badge="CALENDAR & SCHEDULER"
        icon={<CalendarDays className="w-4 h-4 text-purple-200" />}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setAvailabilityOpen(true)}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/20 font-bold text-xs px-3.5 py-2 rounded-full cursor-pointer bg-white/10"
          >
            Set Availability
          </Button>

        </div>
      </PageHeader>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 min-h-[600px]">

        <div className="lg:col-span-5 p-5 xl:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Select Date</span>
              <span className="text-xs font-bold text-[#5e2be2] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                {MONTHS[month]} {year}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-sm text-slate-900">{MONTHS[month]} {year}</span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-[11px] font-extrabold text-slate-400 py-1 uppercase tracking-wider">
                  {d.slice(0, 2)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const key = `${year}-${month + 1}-${day}`;
                const count = (sessionData[key] ?? DEFAULT_DAY_SLOTS).length;
                const sel = day === selectedDay;
                const tod = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-2xl h-10 w-full text-xs font-bold transition-all cursor-pointer",
                      sel && "bg-[#5e2be2] text-white shadow-md shadow-[#5e2be2]/20 scale-105 z-10",
                      !sel && tod && "border-2 border-[#5e2be2] text-[#5e2be2] bg-purple-50/50 font-extrabold",
                      !sel && !tod && "text-slate-700 hover:bg-slate-100/80",
                    )}
                  >
                    <span>{day}</span>
                    {count > 0 && !sel && (
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full mt-0.5",
                        dotColor(count)
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Weekly Capacity & Status</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-slate-500 font-medium text-[11px]">Total Slots</span>
                <span className="font-extrabold text-sm text-[#5e2be2] bg-purple-100/80 text-purple-900 px-2.5 py-1 rounded-xl w-fit border border-purple-200">
                  {Object.values(sessionData).flat().length} Sessions
                </span>
              </div>
              <div className="flex flex-col justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-slate-500 font-medium text-[11px]">Selected Day</span>
                <span className="font-extrabold text-[11px] text-slate-800 bg-white p-2 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-slate-600 font-extrabold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> {bookedCount} Booked</div>
                  <div className="text-emerald-700 font-extrabold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {availableCount} Available</div>
                  <div className="text-slate-600 font-extrabold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> {blockedCount} Blocked</div>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-5 xl:p-6 bg-slate-50/30 flex flex-col overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {MONTHS[month]} {selectedDay}, {year}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {bookedCount} booked · {availableCount} available · {blockedCount} blocked
                </p>
              </div>
            </div>

            {/* ── Interactive Time Slots & Quick Block Section ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">
                    Time Slots
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Booked
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    Blocked
                  </span>
                </div>
              </div>


              <div className="flex flex-wrap gap-2 pt-1">
                {daySessions.length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium italic">No time slots available for this day.</span>
                ) : (
                  daySessions.map((slot, index) => {
                    const isBooked = slot.status === "booked" || (slot.client !== "Open Consultation Slot" && slot.status !== "blocked" && slot.client !== "Blocked Time Slot");
                    const isBlocked = slot.status === "blocked" || slot.client === "Blocked Time Slot";
                    const isAvailable = slot.status === "available" || (slot.client === "Open Consultation Slot" && !isBlocked);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleToggleBlockSlot(sessionKey, index)}
                        title={
                          isBooked
                            ? `Booked by ${slot.client} (${slot.time})`
                            : isBlocked
                              ? `Click to Unblock ${slot.time}`
                              : `Click to Block ${slot.time}`
                        }
                        className={cn(
                          "group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-2xs active:scale-95",
                          isBooked && "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/70 cursor-default",
                          isAvailable && "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300",
                          isBlocked && "bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                        )}
                      >
                        {isBlocked ? (
                          <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                        ) : isAvailable ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 group-hover:text-slate-500 transition-colors" />
                        ) : null}

                        <span>{slot.time}</span>

                        {!isBooked && (
                          <span className="hidden group-hover:inline-block text-[9px] font-black ml-0.5 underline">
                            {isBlocked ? "Unblock" : "Block"}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={() => setAddEventOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-purple-300 bg-white text-[#5e2be2] text-xs font-extrabold py-3 hover:bg-purple-50/80 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Session Slot</span>
            </button>

            {daySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center p-6 bg-white rounded-2xl border border-dashed border-slate-200">
                <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-extrabold text-slate-800">No sessions scheduled</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">This day is currently clear for client appointments or open consultation slots.</p>
                <Button
                  onClick={() => setAddEventOpen(true)}
                  size="sm"
                  className="mt-5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-[#5e2be2]/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Schedule Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {daySessions.map((s, i) => {
                  const isBooked = s.status === "booked" || (s.client !== "Open Consultation Slot" && s.status !== "blocked" && s.client !== "Blocked Time Slot");
                  const isBlocked = s.status === "blocked" || s.client === "Blocked Time Slot";
                  const isAvailable = s.status === "available" || (s.client === "Open Consultation Slot" && !isBlocked);

                  return (
                    <div
                      key={i}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all bg-white shadow-2xs hover:shadow-md",
                        isBooked && "border-slate-200/80 hover:border-slate-300",
                        isAvailable && "border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/50",
                        isBlocked && "border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/60"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "shrink-0 w-22 text-center py-2 rounded-xl text-xs font-black transition-all",
                          isBooked && "bg-slate-100 text-slate-700 border border-slate-200",
                          isAvailable && "bg-emerald-100/80 text-emerald-800 font-black border border-emerald-200",
                          isBlocked && "bg-slate-200/80 text-slate-700 font-black border border-slate-300"
                        )}>
                          {s.time}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-extrabold text-xs sm:text-sm truncate",
                              isBooked && "text-slate-900",
                              isAvailable && "text-emerald-900",
                              isBlocked && "text-slate-700 line-through decoration-slate-400"
                            )}>
                              {s.client}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{s.type} · {s.duration}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isBooked ? (
                          <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px] font-extrabold px-2.5 py-0.5">
                            Confirmed
                          </Badge>
                        ) : isBlocked ? (
                          <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px] font-extrabold px-2.5 py-0.5 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500" />
                            Blocked Slot
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-extrabold px-2.5 py-0.5">
                              Available Slot
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenAssignClient(sessionKey, i, s)}
                              className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-[11px] h-7 px-2.5 rounded-lg shadow-2xs cursor-pointer"
                            >
                              + Book Client
                            </Button>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              title="More Options"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-slate-200">
                            {isBooked && (
                              <DropdownMenuItem
                                onClick={() => handleOpenReschedule(sessionKey, i, s)}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cancel Booking</span>
                              </DropdownMenuItem>
                            )}

                            {!isBooked && (
                              <DropdownMenuItem
                                onClick={() => handleToggleBlockSlot(sessionKey, i)}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                {isBlocked ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Unblock Slot</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Block Slot</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Client to Open Slot Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl p-4 sm:p-6 border-0 shadow-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#5e2be2]" />
              Book Client into Available Slot
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Select a client to assign to the open consultation slot at {assignTarget?.slot.time}.
            </p>
          </DialogHeader>

          {assignTarget && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1 text-xs">
                <span className="text-[10px] font-extrabold text-[#5e2be2] uppercase tracking-wider block">Target Slot</span>
                <p className="font-extrabold text-slate-900 text-sm">Time: {assignTarget.slot.time}</p>
                <p className="text-slate-600 font-medium">{assignTarget.slot.duration} Session</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Select Client</label>
                <Select value={assignClientName} onValueChange={setAssignClientName}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sarah Jenkins", "Michael Chen", "Emily Rodriguez", "David Kim", "Jessica Taylor", "Marcus Vance"].map((name) => (
                      <SelectItem key={name} value={name} className="text-xs">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Treatment Modality / Notes</label>
                <Input
                  value={assignType}
                  onChange={(e) => setAssignType(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              className="rounded-xl text-xs font-bold border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAssignClient}
              className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#5e2be2]/20 cursor-pointer"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Popup (Cancel / Yes) */}
      <AlertDialog open={confirmRescheduleOpen} onOpenChange={setConfirmRescheduleOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-3xl p-4 sm:p-6 border-0 shadow-2xl bg-white max-h-[92vh] overflow-y-auto">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Cancel Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 font-medium leading-relaxed space-y-2">
              <span>
                Are you sure you want to cancel the booking for <strong className="text-slate-900">{rescheduleTarget?.session.client}</strong> scheduled at <strong className="text-[#5e2be2]">{rescheduleTarget?.session.time}</strong>? This will release the slot back as an available consultation slot.
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 mt-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Cancellation Policy: Allowed up to 3 hours before session start time.</span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <AlertDialogCancel
              onClick={() => setConfirmRescheduleOpen(false)}
              className="rounded-xl text-xs font-extrabold border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelBooking}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/20 cursor-pointer"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Session Dialog Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl p-4 sm:p-6 border-0 shadow-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#5e2be2]" />
              Reschedule Session Slot
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Select a new date and time slot for {rescheduleTarget?.session.client}'s booked session.
            </p>
          </DialogHeader>

          {rescheduleTarget && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1 text-xs">
                <span className="text-[10px] font-extrabold text-[#5e2be2] uppercase tracking-wider block">Current Booking</span>
                <p className="font-extrabold text-slate-900 text-sm">{rescheduleTarget.session.client} ({rescheduleTarget.session.initials})</p>
                <p className="text-slate-600 font-medium">{rescheduleTarget.session.type} · {rescheduleTarget.session.duration}</p>
                <p className="text-[#5e2be2] font-extrabold mt-1">Current Time: {rescheduleTarget.session.time}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Select New Date</label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Select New Time Slot</label>
                <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
                    <SelectValue placeholder="Select new time" />
                  </SelectTrigger>
                  <SelectContent>
                    {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Reschedule Reason / Note (Optional)</label>
                <Input
                  placeholder="e.g. Client requested time shift"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRescheduleModalOpen(false)}
              className="rounded-xl text-xs font-bold border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReschedule}
              className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#5e2be2]/20 cursor-pointer"
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SetAvailabilityDialog open={availabilityOpen} onOpenChange={setAvailabilityOpen} />
      <AddEventDialog
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        defaultDate={`${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`}
        onAddSlot={handleAddSlotFromDialog}
      />
    </div>
  );
}
