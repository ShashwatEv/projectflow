import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { MeetingProvider } from '../context/MeetingContext';
import { OnboardingSandboxProvider } from '../context/OnboardingSandboxContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { isSuperAdmin } from '../lib/constants';
import { SlidingLoader } from './components/SlidingLoader';
// Core component imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth';
import CommandMenu from './components/CommandMenu';
import OnboardingTour from './components/OnboardingTour';
import { ErrorBoundary } from '../components/ErrorBoundary';
import DesktopOnlyGuard from './components/DesktopOnlyGuard';
import NetworkStatusPill from './components/NetworkStatusPill';
import MobileBottomNav from './components/MobileBottomNav';

// Core authentication and layout pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import TwoFactorVerify from './pages/TwoFactorVerify';
import SettingsLayout from './pages/settings/SettingsLayout';

// Feature pages (lazy-loaded to trim the initial bundle)
const Projects = lazy(() => import('./pages/Projects'));
const MyTasks = lazy(() => import('./pages/MyTasks'));
const Team = lazy(() => import('./pages/Team'));
const Profile = lazy(() => import('./pages/Profile'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Automations = lazy(() => import('./pages/Automations'));
const Timesheets = lazy(() => import('./pages/Timesheets'));
const Messages = lazy(() => import('./pages/Messages'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const CodeStudio = lazy(() => import('./pages/CodeStudio'));
const SprintPlanner = lazy(() => import('./pages/SprintPlanner'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const Retrospectives = lazy(() => import('./pages/Retrospectives'));
const TeamVelocity = lazy(() => import('./pages/TeamVelocity'));
const ProjectFlowAbout = lazy(() => import('./pages/ProjectFlowAbout'));
const MobileProjectsOverview = lazy(() => import('./pages/MobileProjectsOverview'));
const MobileUnifiedInbox = lazy(() => import('./pages/MobileUnifiedInbox'));
const MobilePeopleDirectory = lazy(() => import('./pages/MobilePeopleDirectory'));
const AvatarStudio = lazy(() => import('./pages/AvatarStudio'));

// Mobile-specific and meetings/downloads workflow pages (lazy-loaded)
const MobileTriageDeck = lazy(() => import('./pages/MobileTriageDeck'));
const DailyStandupStories = lazy(() => import('./pages/DailyStandupStories'));
const QuickCaptureSheet = lazy(() => import('./pages/QuickCaptureSheet'));
const ProjectMeetings = lazy(() => import('./pages/ProjectMeetings'));
const MeetingsHub = lazy(() => import('./pages/MeetingsHub'));
const Downloads = lazy(() => import('./pages/Downloads'));

const ApiPlayground = lazy(() =>
  import('./pages/ApiPlayground').catch(() => ({
    default: () => (
      <div className="mx-auto max-w-4xl space-y-3 p-8 animate-in fade-in duration-200">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          API Console & Webhook Tester
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Interactive API playground module.
        </p>
      </div>
    ),
  }))
);

function PageLoader() {
  return <SlidingLoader intervalMs={2000} />;
}

// Redirects desktop displays to dashboard to prevent stretched mobile UI layouts
function MobileOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (isDesktop) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const isDesktopLayout = useRef(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const isAdmin = isSuperAdmin(user?.email, user?.role);

  const isVerified = Boolean(
    user?.is_verified ||
      user?.email_verified ||
      session?.user?.email_confirmed_at ||
      isAdmin
  );

  useEffect(() => {
    const syncSidebarToViewport = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop !== isDesktopLayout.current) {
        isDesktopLayout.current = isDesktop;
        setIsSidebarOpen(isDesktop);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', syncSidebarToViewport);
    return () => window.removeEventListener('resize', syncSidebarToViewport);
  }, []);

  useEffect(() => {
    if (!session?.user?.email_confirmed_at || !user?.id || user?.is_verified) {
      return;
    }

    let cancelled = false;
    void (supabase as any)
      .from('users')
      .update({ is_verified: true })
      .eq('id', user.id)
      .then(() => {
        if (!cancelled) {
          window.dispatchEvent(new CustomEvent('user-profile-updated'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email_confirmed_at, user?.id, user?.is_verified]);

  return (
    <div className="flex h-[100dvh] flex-col bg-gray-50/90 transition-colors duration-200 dark:bg-[#0b0f17]">
      <CommandMenu />
      <OnboardingTour />
      <NetworkStatusPill />

      {!isVerified && (
        <div
          role="status"
          className="z-30 flex items-center justify-between border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-700 backdrop-blur-xs dark:text-amber-300"
        >
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert size={15} className="shrink-0 text-amber-500" />
            <span className="truncate">
              Your account is unverified. Advanced features are locked.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="ml-4 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-bold underline transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-200"
          >
            <span>Verify Email</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      <ModernHeader
        onMenuClick={() => setIsMobileMenuOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ModernSidebar
          isOpen={isSidebarOpen || isMobileMenuOpen}
          onClose={() => {
            setIsMobileMenuOpen(false);
            setIsSidebarOpen(false);
          }}
        />

        <main className="app-main custom-scrollbar min-h-0 w-full flex-1 overflow-y-auto bg-gray-50/80 text-gray-900 transition-all duration-300 ease-in-out dark:bg-[#0b0f17] dark:text-gray-100">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  const AppRouter = window.projectFlowDesktop?.isDesktop ? HashRouter : BrowserRouter;
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('pf_splash_shown');
  });

  const handleFinishSplash = () => {
    sessionStorage.setItem('pf_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SlidingLoader
          intervalMs={2000}
          autoDismissMs={8000}
          onComplete={handleFinishSplash}
        />
      )}

      <AuthProvider>
        <ThemeProvider>
          <WorkspaceProvider>
            <OnboardingSandboxProvider>
              <Toaster richColors position="top-right" />
              <AppRouter>
                <MeetingProvider>
                  <ErrorBoundary>
                    <Suspense fallback={<SlidingLoader intervalMs={2000} />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/downloads" element={<Downloads />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/2fa" element={<TwoFactorVerify />} />

                        {/* Protected workspace routes */}
                        <Route element={<RequireAuth />}>
                          <Route element={<Layout />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/about" element={<ProjectFlowAbout />} />
                            <Route path="/mobile/projects" element={<MobileProjectsOverview />} />
                            <Route path="/mobile/inbox" element={<MobileUnifiedInbox />} />
                            <Route path="/mobile/people" element={<MobilePeopleDirectory />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/avatar-studio" element={<AvatarStudio />} />

                            {/* Work routes */}
                            <Route path="/tasks" element={<MyTasks />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/projects/:id" element={<ProjectDetail />} />
                            <Route path="/projects/:id/meetings" element={<Navigate to="/meetings" replace />} />
                            <Route path="/meetings" element={<MeetingsHub />} />
                            <Route path="/meetings/guest/:id" element={<ProjectMeetings guestMode />} />
                            <Route
                              path="/sprint-planner"
                              element={
                                <DesktopOnlyGuard featureName="Sprint Planner">
                                  <SprintPlanner />
                                </DesktopOnlyGuard>
                              }
                            />
                            <Route
                              path="/code"
                              element={
                                <DesktopOnlyGuard featureName="Code Studio">
                                  <CodeStudio />
                                </DesktopOnlyGuard>
                              }
                            />
                            <Route
                              path="/api-playground"
                              element={
                                <DesktopOnlyGuard featureName="API Console">
                                  <ApiPlayground />
                                </DesktopOnlyGuard>
                              }
                            />
                            <Route
                              path="/docs"
                              element={<ApiDocs />}
                            />
                            <Route
                              path="/timesheets"
                              element={<Timesheets />}
                            />
                            <Route
                              path="/automations"
                              element={<Automations />}
                            />

                            {/* Team and collaboration */}
                            <Route
                              path="/messages"
                              element={<Navigate to="/messages/room_1" replace />}
                            />
                            <Route path="/messages/:roomId" element={<Messages />} />
                            <Route path="/team" element={<Team />} />
                            <Route
                              path="/retrospectives"
                              element={
                                <DesktopOnlyGuard featureName="Retrospectives">
                                  <Retrospectives />
                                </DesktopOnlyGuard>
                              }
                            />
                            <Route
                              path="/retrospectives/velocity"
                              element={<TeamVelocity />}
                            />
                            <Route
                              path="/calendar"
                              element={<Calendar />}
                            />

                            {/* Account and analytics */}
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/profile/:id" element={<Profile />} />
                            <Route
                              path="/analytics"
                              element={<Analytics />}
                            />

                            {/* Dedicated mobile experiences guarded against desktop screen widths */}
                            <Route
                              path="/triage"
                              element={
                                <MobileOnlyGuard>
                                  <MobileTriageDeck />
                                </MobileOnlyGuard>
                              }
                            />
                            <Route
                              path="/standup"
                              element={
                                <MobileOnlyGuard>
                                  <DailyStandupStories />
                                </MobileOnlyGuard>
                              }
                            />
                            <Route
                              path="/capture"
                              element={
                                <MobileOnlyGuard>
                                  <QuickCaptureSheet />
                                </MobileOnlyGuard>
                              }
                            />

                            {/* Settings */}
                            <Route path="/settings" element={<SettingsLayout />} />
                          </Route>
                        </Route>

                        {/* Fallback catch-all */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </MeetingProvider>
              </AppRouter>
            </OnboardingSandboxProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}