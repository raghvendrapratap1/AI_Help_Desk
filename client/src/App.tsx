import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { HandoffQueuePage } from './pages/HandoffQueuePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ClinicOnboardingPage } from './pages/ClinicOnboardingPage';
import { PatientConfirmationPage } from './pages/PatientConfirmationPage';
import { LoadingState } from './components/common/LoadingState';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingState message="Authenticating admin session..." />;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Patient Landing Page with 24/7 AI Receptionist */}
            <Route path="/" element={<PublicLandingPage />} />
            <Route path="/clinic" element={<PublicLandingPage />} />

            {/* Public One-Click Patient Appointment Confirmation */}
            <Route path="/confirm-appointment/:token" element={<PatientConfirmationPage />} />

            {/* Self-Service Clinic Onboarding Wizard */}
            <Route path="/onboard" element={<ClinicOnboardingPage />} />

            {/* Admin Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected CRM Operating Desk */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />
              <Route path="/handoff" element={<HandoffQueuePage />} />
              <Route path="/conversations" element={<ConversationsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
