import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Component Imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth';

// Page Imports
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SettingsLayout from './pages/settings/SettingsLayout';

// Feature Pages
import Projects from './pages/Projects';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Automations from './pages/Automations';
import Timesheets from './pages/Timesheets';
import Messages from './pages/Messages';
// Note: 'TeamChat' is removed because we merged it into 'Messages'

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ModernHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">
           <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                {/* Redirect root to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Work */}
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/timesheets" element={<Timesheets />} />
                
                {/* Communication */}
                <Route path="/notifications" element={<Notifications />} />
                
                {/* 🟢 FIXED: Unified Chat Route */}
                <Route path="/messages/:roomId" element={<Messages />} />
                
                {/* Management */}
                <Route path="/team" element={<Team />} />
                
                {/* 🟢 FIXED: Profile needs both routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />} />
              </Route>
            </Route>
            
            {/* Catch-all: Redirect unknown pages to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}