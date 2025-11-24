import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useCandidate } from '../contexts/CandidateContext';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { candidate, updateProfile } = useCandidate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/candidate/auth/verify-email', {
        token
      });

      setStatus('success');
      setMessage(response.data.message);

      // Update local candidate data if logged in
      if (candidate) {
        updateProfile({ ...candidate, emailVerified: true });
      }

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to verify email');
    }
  };

  const handleResendVerification = async () => {
    if (!candidate) {
      navigate('/candidate/login');
      return;
    }

    setResending(true);
    try {
      const response = await axios.post('http://localhost:5000/api/candidate/auth/resend-verification');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
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
          <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {status === 'verifying' && <EmailIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />}
              {status === 'success' && <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 40 }} />}
              {status === 'error' && <ErrorIcon sx={{ mr: 1, color: 'error.main', fontSize: 40 }} />}
              <Typography component="h1" variant="h4" color="primary">
                Email Verification
              </Typography>
            </Box>

            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              {status === 'verifying' && 'Verifying your email address...'}
              {status === 'success' && 'Your email has been successfully verified!'}
              {status === 'error' && 'Email verification failed.'}
            </Typography>

            {message && (
              <Alert
                severity={status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}
                sx={{ width: '100%', mb: 3 }}
              >
                {message}
              </Alert>
            )}

            {status === 'success' && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Redirecting to your dashboard...
              </Typography>
            )}

            {status === 'error' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleResendVerification}
                  disabled={resending || !candidate}
                  fullWidth
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/candidate/dashboard"
                  fullWidth
                >
                  Continue to Dashboard
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <Link component={RouterLink} to="/candidate/login" variant="body2">
                  Back to Login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default VerifyEmail;