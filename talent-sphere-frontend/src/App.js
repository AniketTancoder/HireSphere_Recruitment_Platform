import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CandidateProvider, useCandidate } from './contexts/CandidateContext';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Candidates = lazy(() => import('./pages/Candidates'));
const AddCandidate = lazy(() => import('./pages/AddCandidate'));
const Jobs = lazy(() => import('./pages/Jobs'));
const AddJob = lazy(() => import('./pages/AddJob'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PipelineAnalytics = lazy(() => import('./pages/PipelineAnalytics'));
const Landing = lazy(() => import('./pages/Landing'));
const CandidateLogin = lazy(() => import('./pages/CandidateLogin'));
const CandidateRegister = lazy(() => import('./pages/CandidateRegister'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const JobBoard = lazy(() => import('./pages/JobBoard'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const Applications = lazy(() => import('./pages/Applications'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const CandidateDatabase = lazy(() => import('./pages/CandidateDatabase'));
const MatchingEngine = lazy(() => import('./pages/MatchingEngine'));
const JobApplications = lazy(() => import('./pages/JobApplications'));
const Layout = lazy(() => import('./components/Layout'));
const CandidateLayout = lazy(() => import('./components/CandidateLayout'));
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}
  >
    <CircularProgress />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: '#f8fafc',
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return user ? children : <Navigate to="/login" />;
}

function CandidateProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useCandidate();

  if (loading) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? children : <Navigate to="/candidate/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              <CandidateProvider>
                <Login />
              </CandidateProvider>
            } />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/candidates" element={
              <ProtectedRoute>
                <Layout>
                  <Candidates />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/add-candidate" element={
              <ProtectedRoute>
                <Layout>
                  <AddCandidate />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute>
                <Layout>
                  <Jobs />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pipeline-analytics" element={
              <ProtectedRoute>
                <Layout>
                  <PipelineAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/candidate-database" element={
              <ProtectedRoute>
                <Layout>
                  <CandidateDatabase />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/matching-engine" element={
              <ProtectedRoute>
                <Layout>
                  <MatchingEngine />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/job-applications" element={
              <ProtectedRoute>
                <Layout>
                  <JobApplications />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/candidate/login" element={
              <CandidateProvider>
                <CandidateLogin />
              </CandidateProvider>
            } />
            <Route path="/candidate/register" element={
              <CandidateProvider>
                <CandidateRegister />
              </CandidateProvider>
            } />
            <Route path="/candidate/forgot-password" element={
              <CandidateProvider>
                <ForgotPassword />
              </CandidateProvider>
            } />
            <Route path="/candidate/reset-password" element={
              <CandidateProvider>
                <ResetPassword />
              </CandidateProvider>
            } />
            <Route path="/candidate/verify-email" element={
              <CandidateProvider>
                <VerifyEmail />
              </CandidateProvider>
            } />
            <Route path="/candidate/dashboard" element={
              <CandidateProvider>
                <CandidateProtectedRoute>
                  <CandidateLayout>
                    <CandidateDashboard />
                  </CandidateLayout>
                </CandidateProtectedRoute>
              </CandidateProvider>
            } />
            <Route path="/candidate/jobs" element={
              <CandidateProvider>
                <CandidateProtectedRoute>
                  <CandidateLayout>
                    <JobBoard />
                  </CandidateLayout>
                </CandidateProtectedRoute>
              </CandidateProvider>
            } />
            <Route path="/candidate/jobs/:jobId" element={
              <CandidateProvider>
                <CandidateProtectedRoute>
                  <CandidateLayout>
                    <JobDetail />
                  </CandidateLayout>
                </CandidateProtectedRoute>
              </CandidateProvider>
            } />
            <Route path="/candidate/profile" element={
              <CandidateProvider>
                <CandidateProtectedRoute>
                  <CandidateLayout>
                    <CandidateProfile />
                  </CandidateLayout>
                </CandidateProtectedRoute>
              </CandidateProvider>
            } />
            <Route path="/candidate/applications" element={
              <CandidateProvider>
                <CandidateProtectedRoute>
                  <CandidateLayout>
                    <Applications />
                  </CandidateLayout>
                </CandidateProtectedRoute>
              </CandidateProvider>
            } />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;