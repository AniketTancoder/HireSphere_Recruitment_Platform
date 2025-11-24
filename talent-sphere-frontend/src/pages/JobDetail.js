import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useCandidate } from '../contexts/CandidateContext';
import axios from 'axios';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useCandidate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/candidate/jobs/${jobId}`);
      setJob(response.data);

      // Check if user has already applied (this would need to be implemented in the backend)
      // For now, we'll simulate this
      setAlreadyApplied(false);
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/candidate/login');
      return;
    }

    setApplying(true);
    setError('');

    try {
      // This would be the actual application API call
      const response = await axios.post(`http://localhost:5000/api/candidate/jobs/${jobId}/apply`, {
        candidateId: profile._id,
        coverLetter: '', // Could add cover letter functionality
      });

      setApplicationSuccess(true);
      setAlreadyApplied(true);
    } catch (error) {
      console.error('Application error:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = () => {
    // Bookmark functionality would be implemented here
    alert('Bookmark functionality coming soon!');
  };

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading job details...</Typography>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/candidate/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {job.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="h6" color="primary">
                      {job.company}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {job.location}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {job.salary && job.salary.amount
                        ? `${job.salary.currency || 'USD'} ${job.salary.amount.toLocaleString()}${job.salary.period ? `/${job.salary.period.replace('ly', '')}` : ''}`
                        : job.salaryMin && job.salaryMax
                        ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} USD/yearly`
                        : 'Salary not specified'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<BookmarkIcon />}
                  onClick={handleBookmark}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                >
                  Share
                </Button>
              </Box>
            </Box>

            {/* Application Status */}
            {applicationSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎉 Application submitted successfully! The employer will be notified.
                </Typography>
              </Alert>
            )}

            {alreadyApplied && !applicationSuccess && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You have already applied for this position. Check your applications for status updates.
                </Typography>
              </Alert>
            )}

            {/* Apply Button */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={alreadyApplied ? <CheckCircleIcon /> : <SendIcon />}
                onClick={handleApply}
                disabled={alreadyApplied || applying}
                sx={{ minWidth: 200 }}
              >
                {applying ? 'Applying...' : alreadyApplied ? 'Applied' : 'Apply Now'}
              </Button>

              {!isAuthenticated && (
                <Typography variant="body2" color="textSecondary">
                  <Button
                    variant="text"
                    onClick={() => navigate('/candidate/login')}
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                  >
                    Sign in
                  </Button>
                  {' '}to apply
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Job Description */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {job.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Requirements
                </Typography>
                <List>
                  {job.requiredSkills?.map((skill, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={skill} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Nice to Have */}
            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Nice to Have
                  </Typography>
                  <List>
                    {job.niceToHaveSkills.map((skill, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText primary={skill} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Job Details */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Job Type</Typography>
                    <Typography variant="body1">
                      {job.jobType ? job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Full-time'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Experience Level</Typography>
                    <Typography variant="body1">
                      {job.experienceLevel && job.experienceLevel !== 'not-specified'
                        ? job.experienceLevel.replace(/\b\w/g, l => l.toUpperCase())
                        : job.experience
                        ? `${job.experience}+ years`
                        : 'Not specified'
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Industry</Typography>
                    <Typography variant="body1">{job.industry || 'Not specified'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Remote Work</Typography>
                    <Typography variant="body1">{job.remote ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About {job.company}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {job.companyDescription || 'Company information not available.'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {job.company?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {job.company}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {job.companySize || 'Company size not specified'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Skills Match */}
            {isAuthenticated && profile?.skills && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills Match
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    How well your skills match this job
                  </Typography>

                  {(() => {
                    const userSkills = profile.skills.map(s => {
                      // Handle different skill data structures
                      if (typeof s.skill === 'string') {
                        return s.skill.toLowerCase();
                      } else if (s.skill && typeof s.skill === 'object') {
                        return (s.skill.name || s.skill.displayName || '').toLowerCase();
                      }
                      return '';
                    }).filter(skill => skill); // Filter out empty skills

                    const jobSkills = [...(job.requiredSkills || []), ...(job.niceToHaveSkills || [])]
                      .map(s => s.toLowerCase());

                    const matchingSkills = userSkills.filter(skill =>
                      jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
                    );

                    const matchPercentage = jobSkills.length > 0
                      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
                      : 0;

                    return (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Match Score</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {matchPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={matchPercentage}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2">
                          {matchingSkills.length} of {jobSkills.length} skills match
                        </Typography>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Back Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/candidate/jobs')}
        >
          Back to Job Search
        </Button>
      </Box>
    </Container>
  );
};

export default JobDetail;