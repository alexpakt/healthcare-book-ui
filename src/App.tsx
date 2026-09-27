import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Center, Loader } from '@mantine/core';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import NotFound from './pages/NotFound';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ParentChildrenPage = lazy(() => import('./pages/ParentChildrenPage'));
const ChildDetailPage = lazy(() => import('./pages/ChildDetailPage'));
const PatientHistoryPage = lazy(() => import('./pages/PatientHistoryPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const ParentMedicalHistoryPage = lazy(() => import('./pages/ParentMedicalHistoryPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const ProfilePage = lazy(() => import('./pages/./ProfilePage'));

const PageLoader = () => (
  <Center py="xl">
    <Loader />
  </Center>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AppointmentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PatientsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <Suspense fallback={<PageLoader />}>
                  <ParentChildrenPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:childId"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <Suspense fallback={<PageLoader />}>
                  <ChildDetailPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:childId"
            element={
              <ProtectedRoute requiredRole="ROLE_DOCTOR">
                <Suspense fallback={<PageLoader />}>
                  <PatientHistoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-history"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <Suspense fallback={<PageLoader />}>
                  <ParentMedicalHistoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <Suspense fallback={<PageLoader />}>
                  <DoctorsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
