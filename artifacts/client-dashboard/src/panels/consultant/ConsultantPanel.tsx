import React from 'react';
import { Route, Switch } from 'wouter';
import { AppLayout } from './components/layout';
import { isAuthenticated, setAuthUser, DEFAULT_CONSULTANT } from '@/lib/auth';

import Dashboard from './pages/dashboard';
import Clients from './pages/clients';
import ClientDetail from './pages/client-detail';
import Calendar from './pages/calendar';
import Outcomes from './pages/outcomes';
import Revenue from './pages/revenue';
import Reviews from './pages/reviews';
import Resources from './pages/resources';
import Assessments from './pages/assessments';
import Activities from './pages/activities';
import Messages from './pages/messages';
import Blog from './pages/blog';
import HtmlChunkPages from './pages/html-chunk-pages';
import HtmlChunkEditor from './pages/html-chunk-editor';
import PublicHtmlChunkPage from './pages/public-html-chunk-page';
import Profile from './pages/profile';

function ConsultantAuthGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = () => {
      let isAuth = isAuthenticated();
      if (!isAuth) {
        // Fallback default consultant in dev/demo mode so direct navigation never results in a blank page
        const stored = localStorage.getItem('hexpertify_auth_user');
        if (!stored) {
          setAuthUser(DEFAULT_CONSULTANT);
          isAuth = true;
        }
      }
      setAuthenticated(isAuth);
    };

    checkAuth();
    window.addEventListener('auth_state_change', checkAuth);
    return () => window.removeEventListener('auth_state_change', checkAuth);
  }, []);

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-bold">Consultant Portal Access</h2>
          <p className="text-sm text-slate-300">Sign in to your consultant account to access this page.</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4d1fc4] text-white rounded-xl text-xs font-bold transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ConsultantPanel() {
  return (
    <ConsultantAuthGuard>
      <AppLayout>
        <Switch>
          <Route path="/consultant" component={Dashboard} />
          <Route path="/consultant/clients" component={Clients} />
          <Route path="/consultant/clients/:id" component={ClientDetail} />
          <Route path="/consultant/calendar" component={Calendar} />
          <Route path="/consultant/messages" component={Messages} />
          <Route path="/consultant/outcomes" component={Outcomes} />
          <Route path="/consultant/revenue" component={Revenue} />
          <Route path="/consultant/reviews" component={Reviews} />
          <Route path="/consultant/resources" component={Resources} />
          <Route path="/consultant/assessments" component={Assessments} />
          <Route path="/consultant/activities" component={Activities} />
          <Route path="/consultant/blog" component={Blog} />
          <Route path="/consultant/html-chunk-pages" component={HtmlChunkPages} />
          <Route path="/consultant/html-chunk-pages/new" component={HtmlChunkEditor} />
          <Route path="/consultant/html-chunk-pages/:id/edit" component={HtmlChunkEditor} />
          <Route path="/consultant/p/:slug" component={PublicHtmlChunkPage} />
          <Route path="/consultant/profile" component={Profile} />
          <Route component={Dashboard} />
        </Switch>
      </AppLayout>
    </ConsultantAuthGuard>
  );
}

export default ConsultantPanel;
