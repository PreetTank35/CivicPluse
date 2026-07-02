import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';

// Citizen pages
import IssueFeed from './pages/IssueFeed';
import IssueDetail from './pages/IssueDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import EquityDashboard from './pages/EquityDashboard';

/**
 * Protected route that redirects to /auth if not authenticated.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the correct dashboard based on actual role
    switch (role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'sub_admin': return <Navigate to="/subadmin" replace />;
      default: return <Navigate to="/citizen" replace />;
    }
  }

  return children;
}

/**
 * Redirect authenticated users away from public pages.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (isAuthenticated) {
    switch (role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'sub_admin': return <Navigate to="/subadmin" replace />;
      default: return <Navigate to="/citizen" replace />;
    }
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

      {/* Citizen routes */}
      <Route path="/citizen" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route index element={<IssueFeed />} />
        <Route path="issue/:id" element={<IssueDetail />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Sub-Admin routes */}
      <Route path="/subadmin" element={
        <ProtectedRoute allowedRoles={['sub_admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="issues" element={<IssueFeed />} />
        <Route path="issue/:id" element={<IssueDetail />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="issues" element={<IssueFeed />} />
        <Route path="issue/:id" element={<IssueDetail />} />
        <Route path="equity" element={<EquityDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
