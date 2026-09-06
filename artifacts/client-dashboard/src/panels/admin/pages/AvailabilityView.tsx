import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Zap,
  Lock,
  Unlock,
  Users,
  Sparkles,
  UserCheck,
  Search,
  Loader2,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { TherapistSlot } from '../types';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AvailabilityView: React.FC = () => {
  const { therapists: liveTherapists } = useAppContext();
  const [slotsList, setSlotsList] = useState<TherapistSlot[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [therapistSearch, setTherapistSearch] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);

  // Filtering state
  const [activeDayFilter, setActiveDayFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [isBatchGeneratorOpen, setIsBatchGeneratorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TherapistSlot | null>(null);

  // Form State for Add/Edit Single Slot
  const [slotFormData, setSlotFormData] = useState<{
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    sessionType: 'Google Meet';
    status: 'Available' | 'Blocked' | 'Inactive';
    isRecurring: boolean;
    priceOverride?: number;
    meetUrl?: string;
    notes?: string;
  }>({
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    durationMinutes: 60,
    sessionType: 'Google Meet',
    status: 'Available',
    isRecurring: true,
    meetUrl: 'https://meet.google.com/hex-session',
    notes: ''
  });

  // Batch Generator Form State
  const [batchData, setBatchData] = useState<{
    selectedDays: DayOfWeek[];
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    bufferMinutes: number;
    sessionType: 'Google Meet';
  }>({
    selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    slotDurationMinutes: 60,
    bufferMinutes: 15,
    sessionType: 'Google Meet'
  });

  // Set initial selected therapist when live therapists load
  useEffect(() => {
    if (liveTherapists.length > 0 && !selectedTherapistId) {
      setSelectedTherapistId(liveTherapists[0].id);
    }
  }, [liveTherapists, selectedTherapistId]);

  // Fetch slots from MongoDB Atlas API
  const fetchSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const res = await fetch('http://localhost:3000/api/admin/availability');
      const data = await res.json();
      if (data?.slots && Array.isArray(data.slots)) {
        setSlotsList(data.slots);
      }
    } catch (err) {
      console.error('Failed to load slots from API:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const selectedTherapist = liveTherapists.find((t) => t.id === selectedTherapistId) || liveTherapists[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Therapists by Search
  const filteredTherapists = liveTherapists.filter((t) =>
    (t.name || '').toLowerCase().includes(therapistSearch.toLowerCase()) ||
    (t.profession || '').toLowerCase().includes(therapistSearch.toLowerCase())
  );

  // Filtered Slots for the selected therapist
  const therapistSlots = slotsList.filter((s) => s.therapistId === selectedTherapist?.id);

  const filteredSlots = therapistSlots.filter((slot) => {
    const matchesDay = activeDayFilter === 'All' || slot.dayOfWeek === activeDayFilter;
    const matchesStatus = statusFilter === 'All' || slot.status === statusFilter;
    return matchesDay && matchesStatus;
  });

  // Quick Stats
  const totalSlotsCount = therapistSlots.length;
  const availableSlotsCount = therapistSlots.filter((s) => s.status === 'Available').length;
  const bookedSlotsCount = therapistSlots.filter((s) => s.status === 'Booked').length;
  const blockedSlotsCount = therapistSlots.filter((s) => s.status === 'Blocked').length;

  // Toggle single slot status (PUT to MongoDB)
  const handleToggleSlotStatus = async (slotId: string) => {
    const target = slotsList.find((s) => s.id === slotId);
    if (!target) return;

    if (target.status === 'Booked') {
      showToast(`Cannot toggle status for a slot booked by ${target.bookedByClientName || 'a client'}`);
      return;
    }

    const nextStatus = target.status === 'Available' ? 'Blocked' : 'Available';

    // Optimistic UI update
    setSlotsList((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, status: nextStatus } : slot))
    );

    try {
      await fetch('http://localhost:3000/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slotId, status: nextStatus })
      });
      showToast(`Slot status updated to ${nextStatus} in MongoDB Atlas`);
    } catch {
      showToast('Error updating slot status');
    }
  };

  // Delete single slot (DELETE to MongoDB)
  const handleDeleteSlot = async (slotId: string) => {
    const target = slotsList.find((s) => s.id === slotId);
    if (target?.status === 'Booked') {
      if (!window.confirm(`Warning: Slot is currently booked. Are you sure you want to cancel and delete this slot?`)) {
        return;
      }
    }

    setSlotsList((prev) => prev.filter((s) => s.id !== slotId));

    try {
      await fetch(`http://localhost:3000/api/admin/availability?id=${encodeURIComponent(slotId)}`, {
        method: 'DELETE'
      });
      showToast('Slot deleted from database');
    } catch {
      showToast('Error deleting slot');
    }
  };

  // Open Edit Slot Modal
  const handleOpenEditSlot = (slot: TherapistSlot) => {
    setEditingSlot(slot);
    setSlotFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: slot.durationMinutes,
      sessionType: slot.sessionType,
      status: slot.status === 'Booked' ? 'Available' : slot.status,
      isRecurring: slot.isRecurring,
      priceOverride: slot.priceOverride,
      meetUrl: slot.meetUrl || 'https://meet.google.com/hex-session',
      notes: slot.notes || ''
    });
    setIsAddSlotModalOpen(true);
  };

  // Open Create Slot Modal
  const handleOpenCreateSlot = () => {
    setEditingSlot(null);
    setSlotFormData({
      dayOfWeek: activeDayFilter !== 'All' ? (activeDayFilter as DayOfWeek) : 'Monday',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      durationMinutes: 60,
      sessionType: 'Google Meet',
      status: 'Available',
      isRecurring: true,
      meetUrl: 'https://meet.google.com/hex-session',
      notes: ''
    });
    setIsAddSlotModalOpen(true);
  };

  // Save Single Slot (Create or Edit in MongoDB)
  const handleSaveSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist) return;

    if (editingSlot) {
      const updatedSlot: TherapistSlot = {
        ...editingSlot,
        dayOfWeek: slotFormData.dayOfWeek,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        durationMinutes: slotFormData.durationMinutes,
        sessionType: slotFormData.sessionType,
        status: (editingSlot.status === 'Booked' ? 'Booked' : slotFormData.status) as TherapistSlot['status'],
        isRecurring: slotFormData.isRecurring,
        priceOverride: slotFormData.priceOverride,
        meetUrl: slotFormData.meetUrl,
        notes: slotFormData.notes
      };

      setSlotsList((prev) => prev.map((s) => (s.id === editingSlot.id ? updatedSlot : s)));

      try {
        await fetch('http://localhost:3000/api/admin/availability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSlot)
        });
        showToast(`Slot on ${slotFormData.dayOfWeek} updated in database`);
      } catch {
        showToast('Error saving slot update');
      }
    } else {
      const newSlot: TherapistSlot = {
        id: `SLOT-${Date.now()}`,
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        dayOfWeek: slotFormData.dayOfWeek,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        durationMinutes: slotFormData.durationMinutes,
        sessionType: slotFormData.sessionType,
        status: slotFormData.status,
        isRecurring: slotFormData.isRecurring,
        priceOverride: slotFormData.priceOverride,
        meetUrl: slotFormData.meetUrl || 'https://meet.google.com/hex-session',
        notes: slotFormData.notes
      };

      setSlotsList((prev) => [...prev, newSlot]);

      try {
        await fetch('http://localhost:3000/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSlot)
        });
        showToast(`New slot created in database for ${selectedTherapist.name}`);
      } catch {
        showToast('Error creating slot');
      }
    }

    setIsAddSlotModalOpen(false);
  };

  // Run Batch Slot Generator (POST batch to MongoDB)
  const handleRunBatchGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist) return;

    const newGeneratedSlots: TherapistSlot[] = [];
    const times = ['09:00 AM', '10:15 AM', '11:30 AM', '02:00 PM', '03:15 PM', '04:30 PM'];

    batchData.selectedDays.forEach((day) => {
      times.forEach((startTime, idx) => {
        const [timePart, ampm] = startTime.split(' ');
        const [hours, mins] = timePart.split(':').map(Number);
        let endHours = hours + 1;
        let endAmpm = ampm;
        if (endHours === 12 && ampm === 'AM') endAmpm = 'PM';
        if (endHours > 12) endHours -= 12;
        const formattedEnd = `${endHours < 10 ? '0' + endHours : endHours}:${mins < 10 ? '0' + mins : mins} ${endAmpm}`;

        newGeneratedSlots.push({
          id: `SLOT-GEN-${day.substring(0, 3)}-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          therapistId: selectedTherapist.id,
          therapistName: selectedTherapist.name,
          dayOfWeek: day,
          startTime: startTime,
          endTime: formattedEnd,
          durationMinutes: batchData.slotDurationMinutes,
          sessionType: batchData.sessionType,
          status: 'Available',
          isRecurring: true
        });
      });
    });

    setSlotsList((prev) => [...prev, ...newGeneratedSlots]);

    try {
      await fetch('http://localhost:3000/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: newGeneratedSlots })
      });
      showToast(`Generated ${newGeneratedSlots.length} availability slots in MongoDB Atlas!`);
    } catch {
      showToast('Error saving batch slots to database');
    }

    setIsBatchGeneratorOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800 font-['Plus_Jakarta_Sans']">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#4f28d9] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-purple-300">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-bold text-xs tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Modern Compact Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-50 text-[#5e2be2] font-extrabold text-[10px] sm:text-[11px] rounded-full uppercase tracking-wider border border-purple-200/60">
              Schedule Manager
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">• Live MongoDB Availability Control</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultant Availability & Slots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure therapist recurring weekly slots, view client bookings, and block time-off break windows in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsBatchGeneratorOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Auto Generator</span>
          </button>

          <button
            onClick={handleOpenCreateSlot}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs rounded-xl sm:rounded-2xl shadow-md shadow-[#5e2be2]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Therapist Selector Ribbon with Live Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#5e2be2]" /> Select Therapist to Manage Schedule:
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={therapistSearch}
                onChange={(e) => setTherapistSearch(e.target.value)}
                placeholder="Search 63 consultants..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#5e2be2]"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {liveTherapists.length} Consultants Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
          {filteredTherapists.map((t) => {
            const isSelected = t.id === selectedTherapist?.id;
            const tSlots = slotsList.filter((s) => s.therapistId === t.id);
            const openCount = tSlots.filter((s) => s.status === 'Available').length;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTherapistId(t.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-white border-[#5e2be2] shadow-md ring-2 ring-[#5e2be2]/10'
                    : 'bg-white border-slate-100 hover:border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={t.photo || 'https://images.unsplash.com/photo-1534528741775?w=100'}
                    alt={t.name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate leading-tight">{t.name}</h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5e2be2] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.profession || 'Practitioner'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {openCount} Open Slots
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Therapist Summary & Metrics Row */}
      {selectedTherapist && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-purple-100 shrink-0">
              <img
                src={selectedTherapist.photo || 'https://images.unsplash.com/photo-1534528741775?w=100'}
                alt={selectedTherapist.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{selectedTherapist.name}</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200/60">
                  {selectedTherapist.accountStatus || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {selectedTherapist.profession || 'Specialist'} • Base Fee: ₹{selectedTherapist.platformFeePerSession || 1499}/session
              </p>
            </div>
          </div>

          {/* Metrics Horizontal Strip */}
          <div className="flex items-center gap-3 sm:gap-6 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-150 text-xs font-bold w-full md:w-auto justify-around">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Total</span>
              <span className="text-sm font-extrabold text-slate-800">{totalSlotsCount}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-emerald-600 block uppercase font-mono">Available</span>
              <span className="text-sm font-extrabold text-emerald-600">{availableSlotsCount}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-blue-600 block uppercase font-mono">Booked</span>
              <span className="text-sm font-extrabold text-blue-600">{bookedSlotsCount}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-amber-600 block uppercase font-mono">Blocked</span>
              <span className="text-sm font-extrabold text-amber-600">{blockedSlotsCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Day Pills Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveDayFilter('All')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeDayFilter === 'All'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Days ({therapistSlots.length})
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = therapistSlots.filter((s) => s.dayOfWeek === day).length;
            return (
              <button
                key={day}
                onClick={() => setActiveDayFilter(day)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeDayFilter === day
                    ? 'bg-white text-[#5e2be2] shadow-xs border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded-md font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-8 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#5e2be2] appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Blocked">Blocked</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Weekly Timeline Grid or Empty State */}
      {isLoadingSlots ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-3">
          <Loader2 className="w-8 h-8 text-[#5e2be2] animate-spin mx-auto" />
          <h4 className="font-extrabold text-slate-700 text-base">Loading Availability Slots...</h4>
          <p className="text-xs text-slate-400">Fetching live schedule from MongoDB Atlas database</p>
        </div>
      ) : therapistSlots.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 text-lg">No Availability Slots Configured</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No time slots have been created for <strong>{selectedTherapist?.name}</strong> yet. Use the buttons below to create single slots or generate a weekly recurring schedule.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsBatchGeneratorOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" /> Auto Generate Weekly Slots
            </button>
            <button
              onClick={handleOpenCreateSlot}
              className="px-5 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Single Slot
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {(activeDayFilter === 'All' ? DAYS_OF_WEEK : [activeDayFilter as DayOfWeek]).map((day) => {
            const daySlots = filteredSlots.filter((s) => s.dayOfWeek === day);

            if (daySlots.length === 0 && activeDayFilter !== 'All') {
              return (
                <div key={day} className="bg-white rounded-3xl p-10 text-center border border-slate-100 space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-extrabold text-slate-700 text-base">No slots scheduled for {day}</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click "Add Time Slot" or use the Auto Generator to create available slots for {day}.
                  </p>
                  <button
                    onClick={handleOpenCreateSlot}
                    className="px-4 py-2 bg-[#5e2be2] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Create Slot for {day}
                  </button>
                </div>
              );
            }

            if (daySlots.length === 0) return null;

            return (
              <div key={day} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-purple-50 text-[#5e2be2] flex items-center justify-center font-extrabold text-xs">
                      {day.substring(0, 3)}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{day} Schedule</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{daySlots.length} time slots configured</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingSlot(null);
                      setSlotFormData({
                        dayOfWeek: day,
                        startTime: '09:00 AM',
                        endTime: '10:00 AM',
                        durationMinutes: 60,
                        sessionType: 'Google Meet',
                        status: 'Available',
                        isRecurring: true,
                        notes: ''
                      });
                      setIsAddSlotModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5e2be2] rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {/* Slot Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {daySlots.map((slot) => {
                    const isAvailable = slot.status === 'Available';
                    const isBooked = slot.status === 'Booked';
                    const isBlocked = slot.status === 'Blocked';

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          isAvailable
                            ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                            : isBooked
                            ? 'bg-blue-50/50 border-blue-200/80 hover:border-blue-300'
                            : isBlocked
                            ? 'bg-amber-50/50 border-amber-200/80 hover:border-amber-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Top Row: Time */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-extrabold text-slate-900 text-xs">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Middle Details: Status badge & client info */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium text-[11px]">Status:</span>
                            {isAvailable && (
                              <span className="px-2 py-0.5 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Available
                              </span>
                            )}
                            {isBooked && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1">
                                <UserCheck className="w-3 h-3" /> Booked
                              </span>
                            )}
                            {isBlocked && (
                              <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Blocked Break
                              </span>
                            )}
                          </div>

                          {isBooked && slot.bookedByClientName && (
                            <div className="p-2 bg-white rounded-xl border border-blue-100 text-blue-900 text-[11px] font-semibold flex items-center justify-between">
                              <span className="text-slate-400">Client:</span>
                              <span className="font-extrabold text-blue-700">{slot.bookedByClientName}</span>
                            </div>
                          )}

                          {slot.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-white/70 p-1.5 rounded-lg border border-slate-100">
                              "{slot.notes}"
                            </p>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleSlotStatus(slot.id)}
                              disabled={isBooked}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all disabled:opacity-40 ${
                                isAvailable
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                              title={isAvailable ? 'Block this slot' : 'Make slot available'}
                            >
                              {isAvailable ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              <span>{isAvailable ? 'Block' : 'Unblock'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditSlot(slot)}
                              className="p-1 text-slate-500 hover:text-[#5e2be2] hover:bg-white rounded-lg transition-colors"
                              title="Edit Slot Settings"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT TIME SLOT */}
      {isAddSlotModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5e2be2] flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {editingSlot ? 'Edit Time Slot' : 'Add Available Slot'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure consultation window for {selectedTherapist?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlotSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700">Day of Week</label>
                <select
                  value={slotFormData.dayOfWeek}
                  onChange={(e) => setSlotFormData({ ...slotFormData, dayOfWeek: e.target.value as DayOfWeek })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#5e2be2]"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={slotFormData.startTime}
                    onChange={(e) => setSlotFormData({ ...slotFormData, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#5e2be2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={slotFormData.endTime}
                    onChange={(e) => setSlotFormData({ ...slotFormData, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#5e2be2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={slotFormData.durationMinutes}
                    onChange={(e) => setSlotFormData({ ...slotFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#5e2be2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Slot Status</label>
                  <select
                    value={slotFormData.status}
                    onChange={(e) => setSlotFormData({ ...slotFormData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#5e2be2]"
                  >
                    <option value="Available">Available (Open for booking)</option>
                    <option value="Blocked">Blocked (Break / Reserved)</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700">Notes / Break Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Case Supervision / Lunch Break"
                  value={slotFormData.notes}
                  onChange={(e) => setSlotFormData({ ...slotFormData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-[#5e2be2]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5e2be2] text-white font-extrabold rounded-xl shadow-md hover:bg-[#4f28d9]"
                >
                  {editingSlot ? 'Save Changes' : 'Create Time Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: AUTO BATCH SLOT GENERATOR */}
      {isBatchGeneratorOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Auto-Batch Slot Generator</h3>
                  <p className="text-xs text-slate-500">Populate weekly recurring schedule for {selectedTherapist?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchGeneratorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunBatchGenerator} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-extrabold text-slate-700">Select Working Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const isChecked = batchData.selectedDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setBatchData({ ...batchData, selectedDays: batchData.selectedDays.filter((item) => item !== d) });
                          } else {
                            setBatchData({ ...batchData, selectedDays: [...batchData.selectedDays, d] });
                          }
                        }}
                        className={`p-2.5 rounded-xl font-extrabold text-[11px] border transition-all ${
                          isChecked
                            ? 'bg-[#5e2be2] text-white border-[#5e2be2]'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {d.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Shift Start Time</label>
                  <input
                    type="text"
                    value={batchData.startTime}
                    onChange={(e) => setBatchData({ ...batchData, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#5e2be2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Shift End Time</label>
                  <input
                    type="text"
                    value={batchData.endTime}
                    onChange={(e) => setBatchData({ ...batchData, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#5e2be2]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700">Slot Duration (Mins)</label>
                <select
                  value={batchData.slotDurationMinutes}
                  onChange={(e) => setBatchData({ ...batchData, slotDurationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#5e2be2]"
                >
                  <option value={45}>45 Mins</option>
                  <option value={60}>60 Mins (1 Hour)</option>
                  <option value={90}>90 Mins</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchGeneratorOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-md"
                >
                  Generate Slots
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
