import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCandidate } from '../contexts/CandidateContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for Admin, 1 for Candidate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { candidateLogin } = useCandidate();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (activeTab === 0) {
      // Admin login
      result = await login(email, password);
      if (result.success) {
        navigate('/admin/dashboard');
      }
    } else {
      // Candidate login
      result = await candidateLogin(email, password);
      if (result.success) {
        navigate('/candidate/dashboard');
      }
    }

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(''); // Clear any errors when switching tabs
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ color: 'text.secondary' }}
              >
                Back to Home
              </Button>
            </Box>

            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              HireSphere
            </Typography>

            {/* User Type Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              variant="fullWidth"
            >
              <Tab
                icon={<AdminIcon />}
                label="Admin Portal"
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
              <Tab
                icon={<PersonIcon />}
                label="Job Seeker"
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            </Tabs>

            {/* Admin Login */}
            {activeTab === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
                  Admin Sign In
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Access the recruitment management portal
                </Typography>
              </Box>
            )}

            {/* Candidate Login */}
            {activeTab === 1 && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <WorkIcon sx={{ color: 'secondary.main' }} />
                </Box>
                <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Sign in to continue your job search journey
                </Typography>
              </Box>
            )}

            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Footer Links */}
              {activeTab === 0 ? (
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Admin access only - contact system administrator for credentials
                  </Typography>
                </Box>
              ) : (
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/candidate/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;