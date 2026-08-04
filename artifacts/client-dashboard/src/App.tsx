import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

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
import BookingPopupPage from '@/pages/popup';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/therapist" component={TherapistPage} />
        <Route path="/sessions" component={SessionsPage} />
        <Route path="/popup" component={BookingPopupPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/assessments" component={AssessmentsPage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
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
