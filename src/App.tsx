import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import ParentChildrenPage from './pages/ParentChildrenPage';
import ChildDetailPage from './pages/ChildDetailPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import PatientsPage from './pages/PatientsPage';
import ParentMedicalHistoryPage from './pages/ParentMedicalHistoryPage';
import NotFound from './pages/NotFound';

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
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <ParentChildrenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:childId"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <ChildDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:childId"
            element={
              <ProtectedRoute requiredRole="ROLE_DOCTOR">
                <PatientHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-history"
            element={
              <ProtectedRoute requiredRole="ROLE_PARENT">
                <ParentMedicalHistoryPage />
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
