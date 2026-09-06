import React, { useState, useEffect } from 'react';
import { Layers, ChevronUp, ChevronDown, User, Stethoscope, ShieldCheck, LogIn, ExternalLink } from 'lucide-react';

export function GlobalPanelSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getActivePanel = () => {
    if (currentPath.startsWith('/admin')) return { name: 'Super Admin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (currentPath.startsWith('/consultant')) return { name: 'Consultant Suite', icon: Stethoscope, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (currentPath.startsWith('/client') || currentPath === '/' || currentPath === '') return { name: 'Client Portal', icon: User, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (currentPath.startsWith('/login')) return { name: 'SSO Login Hub', icon: LogIn, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { name: 'Platform Hub', icon: Layers, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  };

  const active = getActivePanel();
  const ActiveIcon = active.icon;

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <aside aria-label="Hexpertify Unified Switcher" className="fixed bottom-4 right-4 z-[9999] font-['Plus_Jakarta_Sans'] antialiased select-none">
      {isOpen && (
        <div className="mb-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 w-72 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#5e2be2] text-white flex items-center justify-center font-bold text-xs">
                H
              </div>
              <span className="text-xs font-extrabold text-slate-800">Unified Panel Switcher</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API :5000
            </span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => navigateTo('/client')}
              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                currentPath.startsWith('/client') || currentPath === '/'
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-200/70 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700 text-xs font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Client Care Portal</div>
                  <div className="text-[10px] text-slate-400 font-normal">Patient feed & therapist chat</div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/consultant')}
              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                currentPath.startsWith('/consultant')
                  ? 'bg-amber-50/80 text-amber-800 font-bold border border-amber-200/70 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700 text-xs font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Consultant Suite</div>
                  <div className="text-[10px] text-slate-400 font-normal">Therapist clinical calendar & notes</div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/admin')}
              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                currentPath.startsWith('/admin')
                  ? 'bg-purple-50/80 text-purple-700 font-bold border border-purple-200/70 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700 text-xs font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Super Admin Panel</div>
                  <div className="text-[10px] text-slate-400 font-normal">Operations, metrics & therapists</div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                currentPath.startsWith('/login')
                  ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-600 text-xs font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Unified SSO Login</div>
                  <div className="text-[10px] text-slate-400 font-normal">Switch role / accounts</div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-xl border border-slate-700 backdrop-blur-md transition-all active:scale-95 text-xs font-semibold"
      >
        <span className={`p-1 rounded-full border ${active.color}`}>
          <ActiveIcon className="w-3 h-3" />
        </span>
        <span className="hidden sm:inline">{active.name}</span>
        <span className="text-[10px] text-slate-400 px-1 py-0.2 bg-slate-800 rounded">Single Hub</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </aside>
  );
}

export default GlobalPanelSwitcher;
