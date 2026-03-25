import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PublishBottles } from './components/PublishBottles';
import { BottlesList } from './components/BottlesList';
import { UserProfile } from './components/UserProfile';
import { Layout } from './components/Layout';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userType = localStorage.getItem('userType');
  
  if (!userType) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publish"
            element={
              <ProtectedRoute>
                <PublishBottles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bottles"
            element={
              <ProtectedRoute>
                <BottlesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}