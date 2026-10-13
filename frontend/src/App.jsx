import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import ProgressReports from './pages/ProgressReports';
import ExtensionRequests from './pages/ExtensionRequests';
import LeaveManagement from './pages/LeaveManagement';
import WorkHistory from './pages/WorkHistory';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* HR Only Routes */}
                <Route
                  path="employees"
                  element={
                    <ProtectedRoute allowedRoles={['HR']}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="employees/:id"
                  element={
                    <ProtectedRoute allowedRoles={['HR']}>
                      <EmployeeProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="progress-reports"
                  element={
                    <ProtectedRoute allowedRoles={['HR']}>
                      <ProgressReports />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Routes (Role-aware within components) */}
                <Route path="projects" element={<Projects />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="extension-requests" element={<ExtensionRequests />} />
                <Route path="leaves" element={<LeaveManagement />} />

                {/* Employee Only Routes */}
                <Route
                  path="work-history"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                      <WorkHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Profile, Settings & Notifications */}
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />

                {/* Catch-all Not Found inside dashboard layout */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
