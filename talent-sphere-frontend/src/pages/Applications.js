import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCandidate } from '../contexts/CandidateContext';
import axios from 'axios';

const getStatusIcon = (status) => {
  switch (status) {
    case 'submitted':
      return <HourglassEmptyIcon color="warning" />;
    case 'under_review':
      return <HourglassEmptyIcon color="info" />;
    case 'shortlisted':
      return <CheckCircleIcon color="success" />;
    case 'interview_scheduled':
      return <ScheduleIcon color="primary" />;
    case 'interviewed':
      return <ScheduleIcon color="secondary" />;
    case 'offered':
      return <CheckCircleIcon color="success" />;
    case 'hired':
      return <CheckCircleIcon color="success" />;
    case 'rejected':
      return <CancelIcon color="error" />;
    case 'withdrawn':
      return <CancelIcon color="error" />;
    default:
      return <HourglassEmptyIcon color="default" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'submitted':
      return 'warning';
    case 'under_review':
      return 'info';
    case 'shortlisted':
      return 'success';
    case 'interview_scheduled':
      return 'primary';
    case 'interviewed':
      return 'secondary';
    case 'offered':
      return 'success';
    case 'hired':
      return 'success';
    case 'rejected':
      return 'error';
    case 'withdrawn':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ApplicationCard = ({ application, onViewDetails }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => onViewDetails(application)}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {application.job?.company?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {application.job?.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {application.job?.company} • {application.job?.location}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {getStatusIcon(application.status)}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {getStatusLabel(application.status)}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(application.status)}
              color={getStatusColor(application.status)}
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Applied on {new Date(application.createdAt).toLocaleDateString()}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(application);
            }}
          >
            View Details
          </Button>
        </Box>

        {application.lastUpdated && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Applications = () => {
  const { isAuthenticated } = useCandidate();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/candidate/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedApplication(null);
  };

  const getStatusCounts = () => {
    const counts = {};
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your applications.
        </Alert>
      </Container>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Track the status of all your job applications
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      </motion.div>

      {/* Application Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Overview
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(status)}
                      <Typography variant="body2">
                        {getStatusLabel(status)}: {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Applications List */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {applications.length === 0 ? (
            <Alert severity="info">
              You haven't applied to any jobs yet. Start exploring jobs and submit your first application!
              <Button
                sx={{ mt: 1 }}
                onClick={() => navigate('/candidate/jobs')}
              >
                Browse Jobs
              </Button>
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Your Applications ({applications.length})
              </Typography>

              {applications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          )}
        </motion.div>
      )}

      {/* Application Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Application Details
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedApplication.job.title}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                        {selectedApplication.job.company} • {selectedApplication.job.location}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {getStatusIcon(selectedApplication.status)}
                        <Chip
                          label={getStatusLabel(selectedApplication.status)}
                          color={getStatusColor(selectedApplication.status)}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Applied:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Last Updated:</strong> {new Date(selectedApplication.lastUpdated).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Salary Range:</strong> {selectedApplication.job.salaryRange}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {selectedApplication.notes && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recruiter Notes
                        </Typography>
                        <Typography variant="body1">
                          {selectedApplication.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {selectedApplication.nextSteps && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Next Steps
                        </Typography>
                        <Typography variant="body1">
                          {selectedApplication.nextSteps}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/candidate/jobs/${selectedApplication?.job._id}`)}
          >
            View Job Details
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;