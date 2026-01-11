// 1. ADD: Import useState at the top
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Component Imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth'; // Ensure path is correct

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
import TeamChat from './pages/TeamChat';
import Automations from './pages/Automations';
import Timesheets from './pages/Timesheets';
import Messages from './pages/Messages';

// 2. REPLACE: The entire Layout function
function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Pass the toggle function to Header */}
      <ModernHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Pass the state to Sidebar */}
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
            {/* Public Routes - Accessible without login */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes - Must be logged in */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Work */}
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/timesheets" element={<Timesheets />} />
                
                {/* Communication */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat" element={<TeamChat />} />
                <Route path="/messages/:roomId" element={<Messages />} />
                
                {/* Management */}
                <Route path="/team" element={<Team />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}