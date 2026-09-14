import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

import Layout from '@/components/layout';
import Dashboard from '@/pages/dashboard';
import TherapistPage from '@/pages/therapist';
import SessionsPage from '@/pages/sessions';
import ActivitiesPage from '@/pages/activities';
import AssessmentsPage from '@/pages/assessments';
import ProgressPage from '@/pages/progress';
import ResourcesPage from '@/pages/resources';
import MessagesPage from '@/pages/messages';
import ProfilePage from '@/pages/profile';
import Login from '@/pages/login';

import { ConsultantPanel } from '@/panels/consultant/ConsultantPanel';
import { AdminPanel } from '@/panels/admin/AdminPanel';
import { 
  isClientAuthenticated, 
  getClientAuth,
  setClientAuth,
  isAuthenticated as isConsultantAuthenticated, 
  isAdminAuthenticated 
} from '@/lib/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<'loading' | 'allowed' | 'denied' | 'unauthenticated'>('loading');
  const [deniedMessage, setDeniedMessage] = useState<string>('');
  const [redirectTarget, setRedirectTarget] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      if (!isClientAuthenticated()) {
        if (isMounted) {
          setState('unauthenticated');
          setLocation('/login');
        }
        return;
      }

      const client = getClientAuth();
      const emailParam = client?.email ? `?email=${encodeURIComponent(client.email)}` : '';

      try {
        const res = await fetch(`/api/client-data${emailParam}`);
        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.status === 403 || data.hasConfirmedBooking === false) {
          setState('denied');
          setDeniedMessage(
            data.error || 
            "Access denied: You do not have a confirmed consultation booking. Please schedule and confirm a consultation session on the live site to access your Client Dashboard."
          );

          // Determine the proper target URL:
          // In production: stay on the current origin or data.redirectUrl (never fallback to localhost on live site)
          const liveUrl = (data.redirectUrl && !data.redirectUrl.includes('localhost'))
            ? data.redirectUrl
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? (data.redirectUrl || 'http://localhost:3000')
                : '/');

          setRedirectTarget(liveUrl);

          // Keep user on the live site
          setTimeout(() => {
            window.location.href = liveUrl;
          }, 3000);
          return;
        }

        if (res.ok && data.hasConfirmedBooking) {
          if (data.client && client) {
            setClientAuth({
              ...client,
              ...data.client,
            });
          }
          setState('allowed');
        } else {
          setState('allowed');
        }
      } catch (err) {
        if (isMounted) setState('allowed');
      }
    };

    verifyAccess();
    window.addEventListener('auth_state_change', verifyAccess);
    return () => {
      isMounted = false;
      window.removeEventListener('auth_state_change', verifyAccess);
    };
  }, [setLocation]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Verifying consultation booking status...</p>
      </div>
    );
  }

  if (state === 'denied') {
    const liveHref = redirectTarget || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '/');
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl text-red-400">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Confirmed Consultation Required</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {deniedMessage}
          </p>
          <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3 text-xs text-red-300 mb-6">
            Status: <strong>403 Forbidden</strong> • Keeping you on the Hexpertify Live Site until your session is confirmed.
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={liveHref}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-600/25 transition-all text-sm cursor-pointer"
            >
              Return to Live Site Now
            </a>
            <a
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition-all cursor-pointer border border-slate-700"
            >
              Back to Login
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-4">Redirecting automatically to the Live Site in 3 seconds...</p>
        </div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();

  // Route 1: Unified Single-Port Login
  if (location === '/login') {
    return <Login />;
  }

  // Smart Root Route: If logged in as Admin or Consultant (and NOT logged in as a Client), route accordingly
  if (location === '/') {
    if (!isClientAuthenticated()) {
      if (isAdminAuthenticated()) {
        return <AdminPanel />;
      }
      if (isConsultantAuthenticated()) {
        return <ConsultantPanel />;
      }
    }
  }

  // Route 2: Super Admin Panel (Nested React-Router under /admin/*)
  if (location.startsWith('/admin')) {
    return <AdminPanel />;
  }

  // Route 3: Consultant Suite (Under /consultant/*)
  if (location.startsWith('/consultant')) {
    return <ConsultantPanel />;
  }

  // Route 4: Client Care Portal
  return (
    <ClientAuthGuard>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/client" component={Dashboard} />
          <Route path="/client/therapist" component={TherapistPage} />
          <Route path="/therapist" component={TherapistPage} />
          <Route path="/client/sessions" component={SessionsPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/client/activities" component={ActivitiesPage} />
          <Route path="/activities" component={ActivitiesPage} />
          <Route path="/client/assessments" component={AssessmentsPage} />
          <Route path="/assessments" component={AssessmentsPage} />
          <Route path="/client/progress" component={ProgressPage} />
          <Route path="/progress" component={ProgressPage} />
          <Route path="/client/resources" component={ResourcesPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/client/messages" component={MessagesPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/client/profile" component={ProfilePage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </ClientAuthGuard>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
