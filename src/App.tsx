import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Forests from './pages/Forests';
import Planting from './pages/Planting';
import Incidents from './pages/Incidents';
import Permits from './pages/Permits';
import Villages from './pages/Villages';
import Education from './pages/Education';
import Reports from './pages/Reports';
import Work from './pages/Work';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={auth?.profile ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="forests" element={<Forests />} />
        <Route path="planting" element={<Planting />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="permits" element={<Permits />} />
        <Route path="villages" element={<Villages />} />
        <Route path="education" element={<Education />} />
        <Route path="reports" element={<Reports />} />
        <Route path="work" element={<Work />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
