import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { isStaff } from './lib/permissions';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';
import ControlPanelLayout from './layouts/ControlPanelLayout';

// Public pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';

// Citizen pages
import IssueFeed from './pages/IssueFeed';
import PostCreate from './pages/PostCreate';
import ReportIssue from './pages/ReportIssue';
import ProblemDetail from './pages/ProblemDetail';
import IssueDetail from './pages/IssueDetail';
import MapPage from './pages/MapPage';
import ReelsPage from './pages/ReelsPage';
import Leaderboard from './pages/Leaderboard';
import MyIssues from './pages/MyIssues';
import CommunityChat from './pages/CommunityChat';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Control Panel pages
import CPOverview from './pages/control-panel/CPOverview';
import CPCaseQueue from './pages/control-panel/CPCaseQueue';
import CPDepartments from './pages/control-panel/CPDepartments';
import CPModerators from './pages/control-panel/CPModerators';

/**
 * ProtectedRoute — redirects to /auth if not authenticated.
 * Uses permissions.js for role-based route access.
 */
function ProtectedRoute({ children, requireStaff = false }) {
  const { isAuthenticated, role, loading, authDisabled } = useAuth();

  if (authDisabled) return children;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (requireStaff && !isStaff(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * PublicRoute — redirects authenticated users to their default page.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, role, loading, authDisabled } = useAuth();

  if (authDisabled) return children;
  if (loading) return null;

  if (isAuthenticated) {
    if (isStaff(role)) return <Navigate to="/control-panel" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

      {/* ── Citizen App Routes (/ and /citizen aliases) ── */}
      <Route path="/" element={
        <ProtectedRoute>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route index element={<IssueFeed />} />
        <Route path="map" element={<MapPage />} />
        <Route path="reels" element={<ReelsPage />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="post/new" element={<PostCreate />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="my-issues" element={<MyIssues />} />
        <Route path="community" element={<CommunityChat />} />
        <Route path="chat" element={<CommunityChat />} />
        <Route path="problem/:id" element={<IssueDetail />} />
        <Route path="issue/:id" element={<IssueDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
      </Route>

      <Route path="/citizen" element={
        <ProtectedRoute>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route index element={<IssueFeed />} />
        <Route path="map" element={<MapPage />} />
        <Route path="reels" element={<ReelsPage />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="post/new" element={<PostCreate />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="my-issues" element={<MyIssues />} />
        <Route path="community" element={<CommunityChat />} />
        <Route path="chat" element={<CommunityChat />} />
        <Route path="problem/:id" element={<IssueDetail />} />
        <Route path="issue/:id" element={<IssueDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
      </Route>

      {/* ── Unified Control Panel ── */}
      <Route path="/control-panel" element={
        <ProtectedRoute requireStaff>
          <ControlPanelLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CPOverview />} />
        <Route path="queue" element={<CPCaseQueue />} />
        <Route path="departments" element={<CPDepartments />} />
        <Route path="moderators" element={<CPModerators />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
