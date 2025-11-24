import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const ApplicationCard = ({ application, onUpdateStatus, onScheduleInterview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'under_review': return 'warning';
      case 'shortlisted': return 'info';
      case 'interview_scheduled': return 'secondary';
      case 'interviewed': return 'primary';
      case 'offered': return 'success';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      case 'withdrawn': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {application.candidate.firstName?.[0]}{application.candidate.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {application.candidate.firstName} {application.candidate.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {application.candidate.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Applied {new Date(application.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={getStatusLabel(application.status)}
                color={getStatusColor(application.status)}
                sx={{ mb: 1 }}
              />
              {application.aiAnalysis?.matchScore && (
                <Typography variant="body2" color="textSecondary">
                  Match: {application.aiAnalysis.matchScore}%
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onUpdateStatus(application)}
              startIcon={<UpdateIcon />}
            >
              Update Status
            </Button>
            {application.status === 'shortlisted' && (
              <Button
                size="small"
                variant="contained"
                onClick={() => onScheduleInterview(application)}
                startIcon={<ScheduleIcon />}
              >
                Schedule Interview
              </Button>
            )}
          </Box>

          {application.aiAnalysis && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                AI Analysis:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption">
                  Technical: {application.aiAnalysis.technicalMatch}%
                </Typography>
                <Typography variant="caption">
                  Experience: {application.aiAnalysis.experienceFit}%
                </Typography>
                <Typography variant="caption">
                  Success: {application.aiAnalysis.successProbability}%
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const JobApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, application: null });
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId);
    if (!jobId) {
      setApplications([]);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would be an endpoint that gets applications for a specific job
      // For now, we'll simulate this by getting all applications and filtering
      const response = await axios.get('http://localhost:5000/api/candidates');
      // Mock applications data - in real app this would come from JobApplication model
      const mockApplications = response.data.slice(0, 5).map((candidate, index) => ({
        _id: `app_${index}`,
        candidate,
        status: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected'][index % 5],
        createdAt: new Date(Date.now() - index * 86400000),
        aiAnalysis: {
          matchScore: 60 + Math.random() * 35,
          technicalMatch: 55 + Math.random() * 40,
          experienceFit: 50 + Math.random() * 45,
          successProbability: 45 + Math.random() * 50
        }
      }));
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (application) => {
    setStatusDialog({ open: true, application });
    setNewStatus(application.status);
    setStatusNotes('');
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.application) return;

    try {
      // In real implementation, this would update the JobApplication model
      const updatedApplications = applications.map(app =>
        app._id === statusDialog.application._id
          ? { ...app, status: newStatus }
          : app
      );
      setApplications(updatedApplications);
      setStatusDialog({ open: false, application: null });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleScheduleInterview = (application) => {
    // This would open an interview scheduling dialog
    alert(`Interview scheduling for ${application.candidate.firstName} ${application.candidate.lastName}`);
  };

  const getStatusCounts = () => {
    const counts = {};
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Application Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track and manage job applications through the hiring pipeline
        </Typography>
      </Box>

      {/* Job Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Job Position</InputLabel>
            <Select
              value={selectedJob}
              onChange={(e) => handleJobChange(e.target.value)}
              label="Select Job Position"
            >
              <MenuItem value="">
                <em>Choose a job...</em>
              </MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.title} - {job.company} ({job.applications?.length || 0} applications)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Application Pipeline Overview */}
      {selectedJob && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Pipeline
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status.replace('_', ' ')}: ${count}`}
                      color={
                        status === 'hired' ? 'success' :
                        status === 'rejected' ? 'error' :
                        status === 'offered' ? 'success' :
                        'default'
                      }
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Applications List */}
      {selectedJob && !loading && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Applications ({applications.length})
          </Typography>

          {applications.length === 0 ? (
            <Alert severity="info">
              No applications found for this job position.
            </Alert>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onUpdateStatus={handleUpdateStatus}
                onScheduleInterview={handleScheduleInterview}
              />
            ))
          )}
        </Box>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, application: null })}>
        <DialogTitle>
          Update Application Status
        </DialogTitle>
        <DialogContent>
          {statusDialog.application && (
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom>
                Update status for {statusDialog.application.candidate.firstName} {statusDialog.application.candidate.lastName}
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                  <MenuItem value="interviewed">Interviewed</MenuItem>
                  <MenuItem value="offered">Offered</MenuItem>
                  <MenuItem value="hired">Hired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="withdrawn">Withdrawn</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (optional)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, application: null })}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobApplications;